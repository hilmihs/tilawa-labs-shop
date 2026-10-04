/**
 * Seller portal data layer — frontend-only mock backed by localStorage.
 *
 * Why: backend has no seller endpoints yet (only admin CRUD). This module
 * provides a per-seller view scoped by `shopSlug`:
 *   - Catalog products from the backend are filtered via marketplace.getSeller
 *     and shown read-only.
 *   - Custom products created in the portal live in localStorage and are
 *     fully editable.
 *   - Orders are derived from the customer-side mock orders
 *     (lib/mock-checkout), filtered to items belonging to this seller.
 *   - Status changes are stored as seller-scoped overrides so they don't
 *     affect the customer's view of the same order.
 *   - Messages are seeded on first read for demo.
 */

import type { OrderDetail, Product, ProductImage } from "@/types/api";
import { getProducts } from "@/lib/api";
import { listMockOrders } from "@/lib/mock-checkout";
import { getSeller } from "@/lib/marketplace";

export type SellerProduct = Product & { seller_slug: string; custom?: boolean };

export type SellerMessage = {
  id: string;
  from: "customer" | "seller";
  body: string;
  at: string;
};

export type SellerMessageThread = {
  id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  last_at: string;
  unread: boolean;
  messages: SellerMessage[];
};

export type SellerOrderItem = OrderDetail["items"][number];

export type SellerOrderRef = OrderDetail & {
  seller_items: SellerOrderItem[];
  seller_subtotal: number;
};

const NS = "tn.seller";

const k = (shop: string, suffix: string) => `${NS}.${shop}.${suffix}`;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private browsing
  }
}

function nowIso() {
  return new Date().toISOString();
}

// ─── Products ─────────────────────────────────────────────────────────────

export async function getSellerProducts(shop: string): Promise<SellerProduct[]> {
  const [backend, custom] = await Promise.all([
    getProducts().catch(() => [] as Product[]),
    Promise.resolve(readJSON<SellerProduct[]>(k(shop, "products"), []))
  ]);
  const mine = backend
    .filter((p) => getSeller(p).slug === shop)
    .map((p) => ({ ...p, seller_slug: shop, custom: false }));
  return [...custom, ...mine];
}

export function listCustomProducts(shop: string): SellerProduct[] {
  return readJSON<SellerProduct[]>(k(shop, "products"), []);
}

export function getCustomProduct(shop: string, id: number): SellerProduct | null {
  return listCustomProducts(shop).find((p) => p.id === id) ?? null;
}

export type SellerProductDraft = {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  weight_grams: number;
  is_active: boolean;
  primary_image_url?: string;
};

export function createSellerProduct(shop: string, draft: SellerProductDraft): SellerProduct {
  const list = listCustomProducts(shop);
  // Negative IDs guarantee no clash with backend product IDs.
  const id = -(Math.abs((Date.now() ^ Math.floor(Math.random() * 9_999)) % 1_000_000) || 1);
  const images: ProductImage[] = draft.primary_image_url
    ? [{ id: 1, url: draft.primary_image_url, alt_text: draft.name, sort_order: 0 }]
    : [];
  const item: SellerProduct = {
    id,
    name: draft.name,
    slug: draft.slug || slugify(draft.name),
    description: draft.description,
    price: draft.price,
    stock: draft.stock,
    weight_grams: draft.weight_grams,
    is_active: draft.is_active,
    images,
    seller_slug: shop,
    custom: true
  };
  writeJSON(k(shop, "products"), [item, ...list]);
  return item;
}

export function updateSellerProduct(
  shop: string,
  id: number,
  patch: Partial<SellerProductDraft>
): SellerProduct | null {
  if (id >= 0) return null; // catalog products are read-only
  const list = listCustomProducts(shop);
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const existing = list[idx];
  const images: ProductImage[] =
    patch.primary_image_url !== undefined
      ? patch.primary_image_url
        ? [{ id: 1, url: patch.primary_image_url, alt_text: patch.name ?? existing.name, sort_order: 0 }]
        : []
      : existing.images;
  const updated: SellerProduct = {
    ...existing,
    name: patch.name ?? existing.name,
    slug: patch.slug ?? existing.slug,
    description: patch.description ?? existing.description,
    price: patch.price ?? existing.price,
    stock: patch.stock ?? existing.stock,
    weight_grams: patch.weight_grams ?? existing.weight_grams,
    is_active: patch.is_active ?? existing.is_active,
    images
  };
  const next = [...list];
  next[idx] = updated;
  writeJSON(k(shop, "products"), next);
  return updated;
}

export function deleteSellerProduct(shop: string, id: number): boolean {
  if (id >= 0) return false;
  const list = listCustomProducts(shop);
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) return false;
  writeJSON(k(shop, "products"), next);
  return true;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Orders ───────────────────────────────────────────────────────────────

type OrderOverrides = Record<string, { status?: string }>;

function readOverrides(shop: string): OrderOverrides {
  return readJSON<OrderOverrides>(k(shop, "order_overrides"), {});
}

function applyOverride(o: OrderDetail, overrides: OrderOverrides): OrderDetail {
  const ov = overrides[o.order_number];
  if (!ov) return o;
  return { ...o, status: ov.status ?? o.status };
}

export async function getSellerOrders(shop: string): Promise<SellerOrderRef[]> {
  const products = await getSellerProducts(shop);
  const myIds = new Set(products.map((p) => p.id));
  const overrides = readOverrides(shop);
  return listMockOrders()
    .map((o) => {
      const seller_items = o.items.filter((it) => myIds.has(it.product_id));
      if (seller_items.length === 0) return null;
      const seller_subtotal = seller_items.reduce((s, it) => s + it.line_total, 0);
      return { ...applyOverride(o, overrides), seller_items, seller_subtotal };
    })
    .filter((x): x is SellerOrderRef => x !== null);
}

export async function getSellerOrder(
  shop: string,
  orderNumber: string
): Promise<SellerOrderRef | null> {
  const orders = await getSellerOrders(shop);
  return orders.find((o) => o.order_number === orderNumber) ?? null;
}

export function updateSellerOrderStatus(shop: string, orderNumber: string, status: string) {
  const overrides = readOverrides(shop);
  overrides[orderNumber] = { ...overrides[orderNumber], status };
  writeJSON(k(shop, "order_overrides"), overrides);
}

export const SELLER_ORDER_STATUSES = [
  "pending",
  "paid",
  "packed",
  "shipped",
  "delivered",
  "cancelled"
] as const;
export type SellerOrderStatus = (typeof SELLER_ORDER_STATUSES)[number];

// ─── Messages ─────────────────────────────────────────────────────────────

function seedMessages(shop: string): SellerMessageThread[] {
  const t1 = new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString();
  const t2 = new Date(Date.now() - 1000 * 60 * 30).toISOString();
  return [
    {
      id: "t_001",
      customer_name: "Rina Halim",
      customer_email: "rina.h@example.com",
      subject: "Apakah produk ini ready stock?",
      last_at: t2,
      unread: true,
      messages: [
        {
          id: "m_001",
          from: "customer",
          body:
            "Halo, saya tertarik dengan tenun ikat. Apakah masih ready stock motif merahnya? " +
            "Berapa lama pengiriman ke Surabaya?",
          at: t2
        }
      ]
    },
    {
      id: "t_002",
      customer_name: "Bayu Setiawan",
      customer_email: "bayu.s@example.com",
      subject: "Custom order — bisa request motif?",
      last_at: t1,
      unread: false,
      messages: [
        {
          id: "m_002",
          from: "customer",
          body: "Min, kalau saya request motif khusus untuk event kantor (50 pcs), bisa ya?",
          at: t1
        },
        {
          id: "m_003",
          from: "seller",
          body:
            "Halo Bayu, bisa kak. Untuk pesanan custom 50 pcs, lead time biasanya 3-4 minggu. " +
            "Boleh DM detail motifnya?",
          at: t1
        }
      ]
    }
  ];
}

export function getSellerMessages(shop: string): SellerMessageThread[] {
  const existing = readJSON<SellerMessageThread[] | null>(k(shop, "messages"), null);
  if (existing && Array.isArray(existing)) return existing;
  const seeded = seedMessages(shop);
  writeJSON(k(shop, "messages"), seeded);
  return seeded;
}

export function unreadMessageCount(shop: string): number {
  return getSellerMessages(shop).filter((t) => t.unread).length;
}

export function markMessageRead(shop: string, threadId: string) {
  const list = getSellerMessages(shop);
  const next = list.map((t) => (t.id === threadId ? { ...t, unread: false } : t));
  writeJSON(k(shop, "messages"), next);
}

export function sendSellerReply(shop: string, threadId: string, body: string): SellerMessageThread | null {
  const trimmed = body.trim();
  if (!trimmed) return null;
  const list = getSellerMessages(shop);
  const idx = list.findIndex((t) => t.id === threadId);
  if (idx === -1) return null;
  const at = nowIso();
  const message: SellerMessage = {
    id: `m_${Date.now().toString(36)}`,
    from: "seller",
    body: trimmed,
    at
  };
  const updated: SellerMessageThread = {
    ...list[idx],
    last_at: at,
    unread: false,
    messages: [...list[idx].messages, message]
  };
  const next = [...list];
  next[idx] = updated;
  writeJSON(k(shop, "messages"), next);
  return updated;
}
