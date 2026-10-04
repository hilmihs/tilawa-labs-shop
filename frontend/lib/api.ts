import type { CheckoutPayload, OrderDetail, OrderSummary, Product, ShippingQuote } from "@/types/api";
import {
  generateMockQuotes,
  loadMockOrder,
  saveMockOrder
} from "@/lib/mock-checkout";
import { DEMO_CATALOGUE } from "@/lib/demo-catalogue";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

type ApiOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: options.method && options.method !== "GET" ? "no-store" : options.cache
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export async function getProducts(): Promise<Product[]> {
  // Same degradation the shipping quote already uses: prefer the API, fall back
  // to the seeded catalogue so the storefront is browsable with no backend.
  try {
    const data = await request<{ data: Product[] }>("/products", { next: { revalidate: 60 } });
    return data.data.length > 0 ? data.data : DEMO_CATALOGUE;
  } catch {
    return DEMO_CATALOGUE;
  }
}

export async function getProduct(slug: string): Promise<Product> {
  try {
    const data = await request<{ data: Product }>(`/products/${slug}`, { next: { revalidate: 60 } });
    return data.data;
  } catch {
    const local = DEMO_CATALOGUE.find((p) => p.slug === slug);
    if (local) return local;
    throw new Error(`Unknown product: ${slug}`);
  }
}

export async function quoteShipping(payload: {
  destination_city_id: string;
  courier: string;
  city?: string;
  items: Array<{ product_id: number; quantity: number }>;
}): Promise<ShippingQuote[]> {
  // Prefer admin-configured shipping zones; fall back to mock generator when
  // backend is unreachable or no zones are configured (keeps demo mode working).
  try {
    const zones = await getShippingZones();
    if (zones.length > 0) {
      const city = (payload.city ?? "").trim().toLowerCase();
      const matched = city
        ? zones.filter((z) => z.cities.some((c) => c.toLowerCase() === city))
        : [];
      const usable = matched.length > 0 ? matched : zones;
      const weight = Math.max(
        payload.items.reduce((sum, i) => sum + i.quantity * 350, 0),
        250
      );
      return usable.map((zone) => ({
        provider: "zone",
        courier: payload.courier || "internal",
        service: zone.name,
        description: zone.description ?? null,
        cost: zone.cost,
        etd: zone.etd ?? null,
        origin_city_id: "152",
        destination_city_id: payload.destination_city_id,
        weight_grams: weight
      }));
    }
  } catch {
    // Backend unavailable — drop to mock.
  }
  return generateMockQuotes(payload);
}

export async function checkout(payload: CheckoutPayload): Promise<OrderSummary> {
  if (!payload.shipping_quote) {
    throw new Error("Pick a shipping option first.");
  }
  // Demo mode: persist the order client-side instead of POSTing to the backend.
  return saveMockOrder(payload);
}

export async function getOrder(orderNumber: string): Promise<OrderDetail> {
  const mock = loadMockOrder(orderNumber);
  if (mock) return mock;
  throw new Error(`Order ${orderNumber} not found.`);
}

export const adminApi = {
  login(email: string, password: string) {
    return request<{ data: import("@/types/api").AdminSession }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }).then((response) => response.data);
  },
  logout(token: string) {
    return request<{ data: true }>("/admin/logout", {
      method: "POST",
      token
    });
  },
  me(token: string) {
    return request<{ data: import("@/types/api").AdminSession["user"] }>("/admin/me", {
      token,
      cache: "no-store"
    }).then((response) => response.data);
  },
  updateProfile(token: string, payload: { name: string; email: string }) {
    return request<{ data: import("@/types/api").AdminSession["user"] }>("/admin/me", {
      method: "PATCH",
      token,
      body: JSON.stringify(payload)
    }).then((response) => response.data);
  },
  updatePassword(
    token: string,
    payload: { current_password: string; password: string; password_confirmation: string }
  ) {
    return request<{ data: true }>("/admin/me/password", {
      method: "PATCH",
      token,
      body: JSON.stringify(payload)
    });
  },
  products(token: string) {
    return request<{ data: Product[] }>("/admin/products", { token, cache: "no-store" }).then((response) => response.data);
  },
  product(token: string, id: number | string) {
    return request<{ data: Product }>(`/admin/products/${id}`, {
      token,
      cache: "no-store"
    }).then((response) => response.data);
  },
  createProduct(token: string, formData: FormData) {
    return request<{ data: Product }>("/admin/products", {
      method: "POST",
      token,
      body: formData
    }).then((response) => response.data);
  },
  updateProduct(token: string, id: number | string, formData: FormData) {
    // Form-method spoofing: PHP can't parse multipart bodies on PATCH/PUT.
    if (!formData.has("_method")) formData.append("_method", "PATCH");
    return request<{ data: Product }>(`/admin/products/${id}`, {
      method: "POST",
      token,
      body: formData
    }).then((response) => response.data);
  },
  deleteProduct(token: string, id: number | string) {
    return request<{ data: true }>(`/admin/products/${id}`, {
      method: "DELETE",
      token
    });
  },
  orders(token: string) {
    return request<{ data: OrderSummary[] }>("/admin/orders", { token, cache: "no-store" }).then(
      (response) => response.data
    );
  },
  order(token: string, id: number | string) {
    return request<{ data: import("@/types/api").OrderDetail }>(`/admin/orders/${id}`, {
      token,
      cache: "no-store"
    }).then((response) => response.data);
  },
  updateOrderStatus(token: string, id: number, status: string) {
    return request<{ data: OrderSummary }>(`/admin/orders/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status })
    }).then((response) => response.data);
  },
  storeSettings(token: string) {
    return request<{ data: import("@/types/api").StoreSettings }>("/admin/store-settings", {
      token,
      cache: "no-store"
    }).then((response) => response.data);
  },
  updateStoreSettings(token: string, formData: FormData) {
    if (!formData.has("_method")) formData.append("_method", "PATCH");
    return request<{ data: import("@/types/api").StoreSettings }>("/admin/store-settings", {
      method: "POST",
      token,
      body: formData
    }).then((response) => response.data);
  },
  shippingZones(token: string) {
    return request<{ data: import("@/types/api").ShippingZone[] }>("/admin/shipping-zones", {
      token,
      cache: "no-store"
    }).then((response) => response.data);
  },
  shippingZone(token: string, id: number | string) {
    return request<{ data: import("@/types/api").ShippingZone }>(`/admin/shipping-zones/${id}`, {
      token,
      cache: "no-store"
    }).then((response) => response.data);
  },
  createShippingZone(token: string, payload: import("@/types/api").ShippingZoneInput) {
    return request<{ data: import("@/types/api").ShippingZone }>("/admin/shipping-zones", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    }).then((response) => response.data);
  },
  updateShippingZone(
    token: string,
    id: number | string,
    payload: import("@/types/api").ShippingZoneInput
  ) {
    return request<{ data: import("@/types/api").ShippingZone }>(`/admin/shipping-zones/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload)
    }).then((response) => response.data);
  },
  deleteShippingZone(token: string, id: number | string) {
    return request<{ data: true }>(`/admin/shipping-zones/${id}`, {
      method: "DELETE",
      token
    });
  },
  sellers(token: string) {
    return request<{ data: import("@/types/api").Seller[] }>("/admin/sellers", {
      token,
      cache: "no-store"
    }).then((response) => response.data);
  },
  createSeller(token: string, payload: import("@/types/api").SellerInput) {
    return request<{ data: import("@/types/api").Seller }>("/admin/sellers", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    }).then((response) => response.data);
  },
  updateSeller(token: string, id: number | string, payload: import("@/types/api").SellerInput) {
    return request<{ data: import("@/types/api").Seller }>(`/admin/sellers/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload)
    }).then((response) => response.data);
  },
  deleteSeller(token: string, id: number | string) {
    return request<{ data: true }>(`/admin/sellers/${id}`, {
      method: "DELETE",
      token
    });
  },
  promotions(token: string) {
    return request<{ data: import("@/types/api").Promotion[] }>("/admin/promotions", {
      token,
      cache: "no-store"
    }).then((response) => response.data.map(normalizePromotion));
  },
  createPromotion(token: string, payload: import("@/types/api").PromotionInput) {
    return request<{ data: import("@/types/api").Promotion }>("/admin/promotions", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    }).then((response) => normalizePromotion(response.data));
  },
  updatePromotion(
    token: string,
    id: number | string,
    payload: import("@/types/api").PromotionInput
  ) {
    return request<{ data: import("@/types/api").Promotion }>(`/admin/promotions/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload)
    }).then((response) => normalizePromotion(response.data));
  },
  deletePromotion(token: string, id: number | string) {
    return request<{ data: true }>(`/admin/promotions/${id}`, {
      method: "DELETE",
      token
    });
  },
  paymentMethods(token: string) {
    return request<{ data: import("@/types/api").PaymentMethod[] }>("/admin/payment-methods", {
      token,
      cache: "no-store"
    }).then((response) => response.data);
  },
  updatePaymentMethod(
    token: string,
    id: number | string,
    payload: import("@/types/api").PaymentMethodInput
  ) {
    return request<{ data: import("@/types/api").PaymentMethod }>(`/admin/payment-methods/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload)
    }).then((response) => response.data);
  }
};

function normalizePromotion(promotion: import("@/types/api").Promotion): import("@/types/api").Promotion {
  // Laravel decimal casts return strings; coerce so consumers can treat as number.
  const value = promotion.value as unknown;
  const minPurchase = promotion.min_purchase as unknown;
  return {
    ...promotion,
    value: typeof value === "string" ? Number(value) : value as number,
    min_purchase:
      minPurchase === null || minPurchase === undefined
        ? null
        : typeof minPurchase === "string"
        ? Number(minPurchase)
        : (minPurchase as number)
  };
}

export async function getShippingZones(): Promise<import("@/types/api").ShippingZone[]> {
  const data = await request<{ data: import("@/types/api").ShippingZone[] }>("/shipping-zones", {
    cache: "no-store"
  });
  return data.data;
}

export async function getStoreSettings(): Promise<import("@/types/api").StoreSettings> {
  const data = await request<{ data: import("@/types/api").StoreSettings }>("/store-settings", {
    next: { revalidate: 60 }
  });
  return data.data;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}
