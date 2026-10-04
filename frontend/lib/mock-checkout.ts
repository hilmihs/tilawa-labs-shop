import type {
  CheckoutPayload,
  OrderDetail,
  OrderSummary,
  PaymentMethodId,
  ShippingQuote
} from "@/types/api";

export type PaymentInstructions = {
  method: PaymentMethodId;
  label: string;
  qrisPayload?: string;
  vaNumber?: string;
  bankName?: string;
  walletName?: string;
  expiresAt: string;
};

const STORAGE_KEY = "storefront.mock-orders.v1";
const ORIGIN_CITY_ID = "152"; // Jakarta Pusat — matches the storefront's stated origin

type QuotePayload = {
  destination_city_id: string;
  courier: string;
  items: Array<{ product_id: number; quantity: number }>;
};

function readStore(): Record<string, OrderDetail> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, OrderDetail>) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, OrderDetail>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota / private browsing
  }
}

function approxWeightGrams(items: QuotePayload["items"]): number {
  // We don't have product weights at quote time on the client, so estimate
  // 350g per unit — close enough for dummy ranges.
  return items.reduce((sum, i) => sum + i.quantity * 350, 0);
}

export function generateMockQuotes(payload: QuotePayload): ShippingQuote[] {
  const weight = Math.max(approxWeightGrams(payload.items), 250);
  const courier = payload.courier || "jne";

  const tiers: Array<Pick<ShippingQuote, "service" | "description" | "etd" | "cost">> = [
    {
      service: "OKE",
      description: "Ongkos Kirim Ekonomis",
      etd: "4-6",
      cost: Math.max(9_000, Math.round((weight * 9) / 1000) * 1000)
    },
    {
      service: "REG",
      description: "Layanan Reguler",
      etd: "2-3",
      cost: Math.max(15_000, Math.round((weight * 12) / 1000) * 1000)
    },
    {
      service: "YES",
      description: "Yakin Esok Sampai",
      etd: "1",
      cost: Math.max(28_000, Math.round((weight * 20) / 1000) * 1000)
    }
  ];

  return tiers.map((tier) => ({
    provider: "mock",
    courier,
    service: tier.service,
    description: tier.description,
    cost: tier.cost,
    etd: tier.etd,
    origin_city_id: ORIGIN_CITY_ID,
    destination_city_id: payload.destination_city_id,
    weight_grams: weight
  }));
}

function makeOrderNumber(): string {
  return `TN-${Date.now().toString(36).toUpperCase()}`;
}

type CartProductLookup = {
  id: number;
  name: string;
  price: number;
};

let productLookupHint: CartProductLookup[] = [];

/** Optional: the cart can register the current product snapshot so saveMockOrder
 * can include product names + unit prices in the saved order detail. */
export function registerMockProductHint(products: CartProductLookup[]) {
  productLookupHint = products;
}

function findProduct(id: number): CartProductLookup | undefined {
  return productLookupHint.find((p) => p.id === id);
}

const PAYMENT_INSTRUCTIONS_STORAGE_KEY = "storefront.mock-payment-meta.v1";

const PAYMENT_LABELS: Record<PaymentMethodId, string> = {
  qris: "QRIS · scan to pay",
  va_bca: "BCA Virtual Account",
  va_mandiri: "Mandiri Virtual Account",
  va_bni: "BNI Virtual Account",
  va_bri: "BRI Virtual Account",
  ewallet_gopay: "GoPay",
  ewallet_ovo: "OVO",
  ewallet_dana: "DANA",
  ewallet_shopeepay: "ShopeePay",
  card: "Credit / debit card"
};

const VA_BANK_BIN: Record<string, { bank: string; bin: string }> = {
  va_bca: { bank: "BCA", bin: "8808" },
  va_mandiri: { bank: "Mandiri", bin: "8950" },
  va_bni: { bank: "BNI", bin: "9881" },
  va_bri: { bank: "BRI", bin: "8262" }
};

const EWALLET_NAMES: Record<string, string> = {
  ewallet_gopay: "GoPay",
  ewallet_ovo: "OVO",
  ewallet_dana: "DANA",
  ewallet_shopeepay: "ShopeePay"
};

function readInstructionsStore(): Record<string, PaymentInstructions> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PAYMENT_INSTRUCTIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, PaymentInstructions>)
      : {};
  } catch {
    return {};
  }
}

function writeInstructionsStore(store: Record<string, PaymentInstructions>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PAYMENT_INSTRUCTIONS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

function buildPaymentInstructions(
  method: PaymentMethodId,
  orderNumber: string
): PaymentInstructions {
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  if (method === "qris") {
    return {
      method,
      label: PAYMENT_LABELS[method],
      qrisPayload: `MOCK-QRIS|${orderNumber}|TOKONUSA`,
      expiresAt
    };
  }
  if (method.startsWith("va_")) {
    const { bank, bin } = VA_BANK_BIN[method];
    const suffix = orderNumber.replace(/\D/g, "").slice(-10).padStart(10, "0");
    return {
      method,
      label: PAYMENT_LABELS[method],
      vaNumber: `${bin}${suffix}`,
      bankName: bank,
      expiresAt
    };
  }
  if (method.startsWith("ewallet_")) {
    return {
      method,
      label: PAYMENT_LABELS[method],
      walletName: EWALLET_NAMES[method] ?? "E-Wallet",
      expiresAt
    };
  }
  return {
    method,
    label: PAYMENT_LABELS[method],
    expiresAt
  };
}

export function saveMockOrder(payload: CheckoutPayload): OrderSummary {
  const orderNumber = makeOrderNumber();
  const subtotal = payload.items.reduce((sum, item) => {
    const product = findProduct(item.product_id);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const shippingCost = payload.shipping_quote.cost;
  const total = subtotal + shippingCost;
  const now = new Date().toISOString();

  const detail: OrderDetail = {
    id: Math.floor(Math.random() * 1_000_000),
    order_number: orderNumber,
    status: "pending",
    payment_status: "pending",
    subtotal,
    shipping_cost: shippingCost,
    total,
    snap_token: null,
    snap_redirect_url: null,
    customer_name: payload.customer_name,
    customer_email: payload.customer_email,
    customer_phone: payload.customer_phone,
    shipping_address: {
      line1: payload.shipping_address.line1,
      line2: payload.shipping_address.line2 ?? null,
      city: payload.shipping_address.city,
      province: payload.shipping_address.province,
      postal_code: payload.shipping_address.postal_code,
      destination_city_id: payload.shipping_address.destination_city_id
    },
    shipping_courier: payload.shipping_quote.courier,
    shipping_service: payload.shipping_quote.service,
    shipping_description: payload.shipping_quote.description ?? null,
    shipping_etd: payload.shipping_quote.etd ?? null,
    created_at: now,
    updated_at: now,
    items: payload.items.map((item, idx) => {
      const product = findProduct(item.product_id);
      const unitPrice = product?.price ?? 0;
      return {
        id: idx + 1,
        product_id: item.product_id,
        product_name: product?.name ?? `Product #${item.product_id}`,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: unitPrice * item.quantity
      };
    }),
    payment: {
      id: 1,
      provider: payload.payment_method,
      transaction_id: `MOCK-${orderNumber}`,
      status: "pending",
      amount: total,
      paid_at: null
    }
  };

  const store = readStore();
  store[orderNumber] = detail;
  writeStore(store);

  const instructionsStore = readInstructionsStore();
  instructionsStore[orderNumber] = buildPaymentInstructions(payload.payment_method, orderNumber);
  writeInstructionsStore(instructionsStore);

  return {
    id: detail.id,
    order_number: orderNumber,
    status: detail.status,
    payment_status: detail.payment_status,
    subtotal: detail.subtotal,
    shipping_cost: detail.shipping_cost,
    total: detail.total,
    snap_token: null,
    snap_redirect_url: null
  };
}

export function loadMockOrder(orderNumber: string): OrderDetail | null {
  const store = readStore();
  return store[orderNumber] ?? null;
}

export function loadPaymentInstructions(orderNumber: string): PaymentInstructions | null {
  const store = readInstructionsStore();
  return store[orderNumber] ?? null;
}

export function markMockOrderPaid(orderNumber: string): OrderDetail | null {
  const store = readStore();
  const existing = store[orderNumber];
  if (!existing) return null;
  const now = new Date().toISOString();
  const updated: OrderDetail = {
    ...existing,
    status: "paid",
    payment_status: "paid",
    updated_at: now,
    payment: existing.payment
      ? { ...existing.payment, status: "paid", paid_at: now }
      : {
          id: 1,
          provider: "mock",
          transaction_id: `MOCK-${orderNumber}`,
          status: "paid",
          amount: existing.total,
          paid_at: now
        }
  };
  store[orderNumber] = updated;
  writeStore(store);
  return updated;
}

export function listMockOrders(): OrderDetail[] {
  const store = readStore();
  return Object.values(store).sort((a, b) => {
    const da = a.created_at ?? "";
    const db = b.created_at ?? "";
    return db.localeCompare(da);
  });
}
