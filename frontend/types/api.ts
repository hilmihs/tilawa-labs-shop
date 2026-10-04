export type ProductImage = {
  id: number;
  url: string;
  alt_text?: string | null;
  sort_order: number;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  weight_grams: number;
  is_active: boolean;
  images: ProductImage[];
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type ShippingQuote = {
  provider: string;
  courier: string;
  service: string;
  description?: string | null;
  cost: number;
  etd?: string | null;
  origin_city_id: string;
  destination_city_id: string;
  weight_grams: number;
};

export type PaymentMethodId =
  | "qris"
  | "va_bca"
  | "va_mandiri"
  | "va_bni"
  | "va_bri"
  | "ewallet_gopay"
  | "ewallet_ovo"
  | "ewallet_dana"
  | "ewallet_shopeepay"
  | "card";

export type CheckoutPayload = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    line1: string;
    line2?: string;
    city: string;
    province: string;
    postal_code: string;
    destination_city_id: string;
  };
  shipping_quote: ShippingQuote;
  payment_method: PaymentMethodId;
  items: Array<{ product_id: number; quantity: number }>;
};

export type OrderSummary = {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  snap_token?: string | null;
  snap_redirect_url?: string | null;
};

export type OrderDetail = OrderSummary & {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    line1: string;
    line2?: string | null;
    city: string;
    province: string;
    postal_code: string;
    destination_city_id?: string;
  } | null;
  shipping_courier?: string | null;
  shipping_service?: string | null;
  shipping_description?: string | null;
  shipping_etd?: string | null;
  created_at?: string;
  updated_at?: string;
  items: Array<{
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
  payment?: {
    id: number;
    provider: string;
    transaction_id?: string | null;
    status: string;
    amount: number;
    paid_at?: string | null;
  } | null;
};

export type AdminSession = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

export type StoreSettings = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
};

export type ShippingZone = {
  id: number;
  name: string;
  description: string | null;
  cities: string[];
  cost: number;
  etd: string | null;
  is_active: boolean;
  sort_order: number;
};

export type ShippingZoneInput = {
  name: string;
  description?: string | null;
  cities: string[];
  cost: number;
  etd?: string | null;
  is_active: boolean;
  sort_order?: number;
};

export type Seller = {
  id: number;
  slug: string;
  name: string;
  city: string;
  verified: boolean;
  contact_email: string | null;
  contact_phone: string | null;
  description: string | null;
};

export type SellerInput = {
  slug: string;
  name: string;
  city: string;
  verified: boolean;
  contact_email?: string | null;
  contact_phone?: string | null;
  description?: string | null;
};

export type Promotion = {
  id: number;
  code: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  min_purchase: number | null;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  active: boolean;
};

export type PromotionInput = {
  code: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  min_purchase?: number | null;
  max_uses?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  active: boolean;
};

export type PaymentMethod = {
  id: number;
  code: string;
  label: string;
  type: "qris" | "va" | "ewallet" | "card";
  enabled: boolean;
  sort_order: number;
};

export type PaymentMethodInput = {
  label: string;
  enabled: boolean;
  sort_order?: number;
};
