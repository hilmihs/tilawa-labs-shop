import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Truck, ShieldCheck, Check, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";
import { formatCurrency, getProduct, getProducts } from "@/lib/api";
import { PlaceImg, SectionHead, pickTint } from "@/components/design";
import { getSeller, getRating, getSold } from "@/lib/marketplace";
import type { Product } from "@/types/api";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProduct(slug);
    return {
      title: `${product.name} · Toko Nusa`,
      description: product.description?.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.description?.slice(0, 160),
        images: product.images[0]?.url ? [product.images[0].url] : []
      }
    };
  } catch {
    return { title: "Product · Toko Nusa" };
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product: Product;
  try {
    product = await getProduct(slug);
  } catch {
    notFound();
  }

  let related: Product[] = [];
  try {
    const all = await getProducts();
    related = all.filter((p) => p.id !== product.id).slice(0, 4);
  } catch {
    /* ignore */
  }

  const tint = pickTint(product.id);
  const images = product.images.length ? product.images : [];
  const main = images[0];
  const thumbs = images.length > 0 ? images : [null, null, null, null];
  const seller = getSeller(product);
  const rating = getRating(product);
  const sold = getSold(product);

  return (
    <>
      <div
        style={{
          padding: "20px 40px",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.08em",
          color: "var(--muted)",
          textTransform: "uppercase"
        }}
      >
        <Link href="/">Toko Nusa</Link> <span style={{ margin: "0 8px" }}>/</span>
        <Link href="/">Shop</Link> <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--ink)" }}>{product.name}</span>
      </div>

      <section style={{ padding: "24px 40px 80px" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 56 }}
          className="pdp-grid"
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 16 }}
            className="pdp-gallery"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {thumbs.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  style={{
                    width: 80,
                    height: 96,
                    border: i === 0 ? "1.5px solid var(--ink)" : "1px solid var(--line)",
                    position: "relative",
                    background: "var(--paper-soft)"
                  }}
                >
                  {img?.url ? (
                    <Image src={img.url} alt={img.alt_text ?? product.name} fill style={{ objectFit: "cover" }} />
                  ) : (
                    <PlaceImg tint={pickTint(product.id + i)} ratio="auto" style={{ height: "100%" }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ aspectRatio: "4/5", position: "relative", background: "var(--paper-soft)" }}>
              {main?.url ? (
                <Image
                  src={main.url}
                  alt={main.alt_text ?? product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <PlaceImg label={product.name} tint={tint} ratio="4/5" style={{ height: "100%" }} />
              )}
            </div>
          </div>

          <div style={{ position: "sticky", top: 24, alignSelf: "start" }}>
            <Link
              href={`/sellers/${seller.slug}`}
              className="tn-label-mono"
              style={{
                fontSize: 11,
                marginBottom: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              {seller.name.toUpperCase()} · {seller.city.toUpperCase()}
              {seller.verified && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    background: "var(--terracotta)",
                    color: "var(--paper)",
                    fontSize: 9,
                    fontWeight: 700
                  }}
                >
                  ✓
                </span>
              )}
            </Link>
            <h1 className="tn-display-3" style={{ marginBottom: 6 }}>
              {product.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
              <div style={{ display: "inline-flex", gap: 2, color: "var(--terracotta)" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.round(rating.score) ? "currentColor" : "none"}
                    strokeWidth={1.2}
                  />
                ))}
              </div>
              <span className="tn-body-sm">
                {rating.score.toFixed(1)} · {rating.count} reviews · {sold} sold
              </span>
              <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--muted)" }} />
              {product.stock > 0 ? (
                <span className="tn-body-sm" style={{ color: "var(--success)" }}>
                  ● {product.stock} left · ships ready
                </span>
              ) : (
                <span className="tn-body-sm" style={{ color: "var(--danger)" }}>● Sold out</span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 14,
                padding: "14px 0",
                borderTop: "1px solid var(--line)",
                borderBottom: "1px solid var(--line)",
                flexWrap: "wrap"
              }}
            >
              <span className="tn-price" style={{ fontSize: 36, fontWeight: 500 }}>
                {formatCurrency(product.price)}
              </span>
              <span className="tn-body-sm">VAT included · shipping calculated at checkout</span>
            </div>

            <p
              style={{
                marginTop: 24,
                fontSize: 15,
                lineHeight: 1.65,
                color: "var(--ink-soft)",
                maxWidth: 520
              }}
            >
              {product.description}
            </p>

            <dl
              style={{
                marginTop: 28,
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                rowGap: 10,
                columnGap: 16,
                fontSize: 14
              }}
            >
              {[
                ["Weight", `${product.weight_grams} g`],
                ["Maker", seller.name],
                ["Origin", seller.city],
                ["Status", product.is_active ? "Active" : "Inactive"],
                ["SKU", `TN-${String(product.id).padStart(4, "0")}`]
              ].map(([k, v]) => (
                <div key={k} style={{ display: "contents" }}>
                  <dt className="tn-label-mono" style={{ fontSize: 11 }}>
                    {k.toUpperCase()}
                  </dt>
                  <dd style={{ margin: 0, color: "var(--ink-soft)" }}>{v}</dd>
                </div>
              ))}
            </dl>

            <div style={{ marginTop: 28 }}>
              <AddToCartButton product={product} />
            </div>

            <div
              style={{
                marginTop: 28,
                padding: "16px 20px",
                border: "1px solid var(--line)",
                borderRadius: 4,
                background: "var(--page)",
                display: "flex",
                gap: 18,
                flexWrap: "wrap"
              }}
            >
              <div style={{ flex: 1, minWidth: 180, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Truck size={18} strokeWidth={1.4} style={{ marginTop: 2, color: "var(--ink)" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Ships in 24–48h</div>
                  <div className="tn-body-sm">From Jakarta · rates from RajaOngkir</div>
                </div>
              </div>
              <div style={{ width: 1, background: "var(--line)" }} />
              <div style={{ flex: 1, minWidth: 180, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <ShieldCheck size={18} strokeWidth={1.4} style={{ marginTop: 2, color: "var(--ink)" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>14-day exchange</div>
                  <div className="tn-body-sm">No extra fees</div>
                </div>
              </div>
              <div style={{ width: 1, background: "var(--line)" }} />
              <div style={{ flex: 1, minWidth: 180, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <MapPin size={18} strokeWidth={1.4} style={{ marginTop: 2, color: "var(--ink)" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Direct from {seller.city}</div>
                  <div className="tn-body-sm">Made by {seller.name}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginTop: 88, borderTop: "1px solid var(--ink)", paddingTop: 24 }}>
          <div style={{ display: "flex", gap: 36, marginBottom: 28, flexWrap: "wrap" }}>
            {["Description", "Care", `Reviews (${rating.count})`, "About the maker"].map((t, i) => (
              <button
                key={t}
                style={{
                  background: "none",
                  border: 0,
                  padding: "6px 0",
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  fontStyle: i === 0 ? "italic" : "normal",
                  color: i === 0 ? "var(--ink)" : "var(--muted)",
                  borderBottom: i === 0 ? "1.5px solid var(--ink)" : "1.5px solid transparent"
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 56 }}
            className="pdp-tabs"
          >
            <div style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink-soft)" }}>
              <p>{product.description}</p>
              <p style={{ marginTop: 14 }}>
                Each piece is unique. Small variations in fibre and weave are signs of handwork, not flaws.
              </p>
            </div>
            <aside className="tn-card" style={{ padding: 24 }}>
              <div className="tn-eyebrow" style={{ marginBottom: 12 }}>SUMMARY</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
                {[
                  "Curated direct from the maker",
                  "Packed within 2 hours",
                  "14-day craftsmanship guarantee",
                  "Gift wrap available on request"
                ].map((b) => (
                  <li key={b} style={{ display: "flex", gap: 10, fontSize: 14 }}>
                    <Check size={16} strokeWidth={1.5} color="var(--terracotta)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>

        {related.length > 0 && (
          <div style={{ marginTop: 112 }}>
            <SectionHead num="№ 05" eyebrow="MORE FROM THE CATALOG" title="You might also" italic="like." />
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}
              className="product-grid"
            >
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .pdp-grid { grid-template-columns: 1fr !important; }
          .pdp-tabs { grid-template-columns: 1fr !important; }
          .product-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .pdp-gallery { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
