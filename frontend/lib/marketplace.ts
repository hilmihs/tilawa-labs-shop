import type { Product } from "@/types/api";

const SELLERS = [
  { slug: "studio-waingapu", name: "Studio Waingapu", city: "East Sumba", verified: true },
  { slug: "tanoh-roastery", name: "Tanoh Roastery", city: "Bener Meriah", verified: true },
  { slug: "kayuh-studio", name: "Kayuh Studio", city: "Yogyakarta", verified: true },
  { slug: "tanah-ceramic", name: "Tanah Ceramic", city: "Bandung", verified: true },
  { slug: "wewangi-rumah", name: "Wewangi Rumah", city: "Denpasar", verified: false },
  { slug: "anyaman-ibu-sari", name: "Anyaman Ibu Sari", city: "Tasikmalaya", verified: false },
  { slug: "hutan-lestari", name: "Hutan Lestari", city: "Mataram", verified: true },
  { slug: "tongkonan-weave", name: "Tongkonan Weave", city: "North Toraja", verified: true }
];

const TAGS = ["Bestseller", "New", "Limited", "Restocked", null, null, null];

export type SellerInfo = (typeof SELLERS)[number];

export function getSeller(product: Pick<Product, "id">): SellerInfo {
  return SELLERS[Math.abs(product.id) % SELLERS.length];
}

export function getRating(product: Pick<Product, "id">): {
  score: number;
  count: number;
} {
  // deterministic 4.4 - 4.9
  const score = 4.4 + ((product.id * 13) % 6) / 10;
  const count = 8 + ((product.id * 7) % 240);
  return { score: Math.round(score * 10) / 10, count };
}

export function getSold(product: Pick<Product, "id">): number {
  return 12 + ((product.id * 19) % 480);
}

export function getOriginalPrice(product: Pick<Product, "id" | "price">): number | null {
  // 1 in 3 products has a discount
  if (product.id % 3 !== 0) return null;
  return Math.round((product.price * 1.18) / 1000) * 1000;
}

export function getTag(product: Pick<Product, "id">): string | null {
  return TAGS[Math.abs(product.id) % TAGS.length];
}

export function isFreeShipping(product: Pick<Product, "id">): boolean {
  return product.id % 2 === 0;
}

export function formatSold(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export const ALL_SELLERS = SELLERS;
