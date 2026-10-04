import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, ShieldCheck, Star, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { PlaceImg } from "@/components/design";
import { SELLER_IMG } from "@/lib/images";
import { getProducts } from "@/lib/api";
import { ALL_SELLERS, getSeller, getRating } from "@/lib/marketplace";
import type { Product } from "@/types/api";

const SELLER_DETAILS: Record<
  string,
  {
    description: string;
    founded: string;
    speciality: string;
    response: string;
    onTime: string;
  }
> = {
  "studio-waingapu": {
    description:
      "A small studio of seven women in East Sumba weaving ikat using traditional patola technique and mengkudu dyes. Each piece takes roughly forty days from start to finish.",
    founded: "Est. 2014",
    speciality: "Hand-woven ikat",
    response: "< 6 hours",
    onTime: "99%"
  },
  "tanoh-roastery": {
    description:
      "A specialty coffee roastery sourcing single origin beans from family farms in highland Aceh. Natural process, slow roast, no shortcuts.",
    founded: "Est. 2018",
    speciality: "Single-origin coffee",
    response: "< 2 hours",
    onTime: "98%"
  },
  "kayuh-studio": {
    description:
      "A furniture and lighting studio in Yogyakarta working with rattan, reclaimed teak, and traditional joinery. Pieces are made to order and built to last.",
    founded: "Est. 2011",
    speciality: "Rattan & teak furniture",
    response: "< 12 hours",
    onTime: "96%"
  },
  "tanah-ceramic": {
    description:
      "A two-person ceramics studio in Bandung throwing functional tableware in small batches. Stoneware glazes inspired by Indonesian soil and stone.",
    founded: "Est. 2019",
    speciality: "Stoneware ceramics",
    response: "< 4 hours",
    onTime: "97%"
  },
  "wewangi-rumah": {
    description:
      "Handcrafted soaps and natural oils made with botanicals from across Bali. Vegan, palm-oil-free, and packaged in compostable wrappers.",
    founded: "Est. 2020",
    speciality: "Natural body care",
    response: "< 8 hours",
    onTime: "94%"
  },
  "anyaman-ibu-sari": {
    description:
      "A women's cooperative in Tasikmalaya weaving baskets and totes from pandan leaves. Profits are shared directly with the makers.",
    founded: "Est. 2009",
    speciality: "Pandan basketry",
    response: "< 24 hours",
    onTime: "92%"
  },
  "hutan-lestari": {
    description:
      "Forest honey, spices, and whole foods sourced from small-scale producers on Sumbawa and Lombok. Sustainably harvested with traceable origin.",
    founded: "Est. 2016",
    speciality: "Forest pantry",
    response: "< 6 hours",
    onTime: "95%"
  },
  "tongkonan-weave": {
    description:
      "A weaving family in Toraja Utara producing ceremonial selendang and ikat blankets the way their grandmothers did. Cotton, indigo, patience.",
    founded: "Est. 2008",
    speciality: "Ceremonial weaves",
    response: "< 18 hours",
    onTime: "98%"
  }
};

export async function generateStaticParams() {
  return ALL_SELLERS.map((s) => ({ slug: s.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seller = ALL_SELLERS.find((s) => s.slug === slug);
  if (!seller) return { title: "Seller · Toko Nusa" };
  return {
    title: `${seller.name} · Toko Nusa`,
    description: SELLER_DETAILS[seller.slug]?.description?.slice(0, 160)
  };
}

export default async function SellerPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const seller = ALL_SELLERS.find((s) => s.slug === slug);
  if (!seller) notFound();
  const detail = SELLER_DETAILS[seller.slug];

  let all: Product[] = [];
  try {
    all = await getProducts();
  } catch {
    /* ignore */
  }
  const sellerProducts = all.filter((p) => getSeller(p).slug === seller.slug);

  const aggregateRating = sellerProducts.length
    ? sellerProducts.reduce((s, p) => s + getRating(p).score, 0) / sellerProducts.length
    : 4.8;
  const reviewCount = sellerProducts.reduce((s, p) => s + getRating(p).count, 0);

  return (
    <>
      <div style={{ padding: "20px 40px" }}>
        <Link
          href="/"
          className="tn-btn-link"
          style={{ fontSize: 13, display: "inline-flex", gap: 6 }}
        >
          <ArrowLeft size={14} /> Back to the catalog
        </Link>
      </div>

      {/* Hero banner */}
      <section
        style={{
          padding: "40px 40px 64px",
          borderBottom: "1px solid var(--line)"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 48,
            alignItems: "end"
          }}
          className="seller-hero"
        >
          <div>
            <div className="tn-eyebrow" style={{ marginBottom: 14 }}>
              № 01 · SELLER · {seller.city.toUpperCase()}
            </div>
            <h1 className="tn-display-2" style={{ marginBottom: 16 }}>
              {seller.name}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                flexWrap: "wrap",
                marginBottom: 24
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--terracotta)" }}>
                <Star size={16} fill="currentColor" stroke="currentColor" strokeWidth={1} />
                <span style={{ color: "var(--ink)", fontWeight: 500 }}>
                  {aggregateRating.toFixed(1)}
                </span>
                <span className="tn-body-sm">({reviewCount} reviews)</span>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }} className="tn-body-sm">
                <MapPin size={14} /> {seller.city}, Indonesia
              </span>
              {seller.verified && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 12px",
                    borderRadius: 999,
                    background: "var(--paper-soft)",
                    border: "1px solid var(--line)",
                    fontSize: 12
                  }}
                >
                  <ShieldCheck size={14} color="var(--terracotta)" /> Verified seller
                </span>
              )}
            </div>
            {detail && (
              <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink-soft)", maxWidth: 600 }}>
                {detail.description}
              </p>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
              <button className="tn-btn">
                <MessageCircle size={14} /> Message seller
              </button>
              <button className="tn-btn tn-btn-ghost">Follow shop</button>
            </div>
          </div>
          <PlaceImg
            label={seller.name}
            tint={3}
            ratio="4/3"
            src={SELLER_IMG[seller.slug]}
            alt={`${seller.name} workshop`}
            kenburns
          />
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            marginTop: 48,
            borderTop: "1px solid var(--ink)"
          }}
          className="seller-stats"
        >
          {[
            { l: "Founded", v: detail?.founded ?? "—" },
            { l: "Speciality", v: detail?.speciality ?? "Various" },
            { l: "Response time", v: detail?.response ?? "—" },
            { l: "On-time ship", v: detail?.onTime ?? "—" }
          ].map((s, i) => (
            <div
              key={s.l}
              style={{
                padding: "20px 0",
                borderLeft: i ? "1px solid var(--line)" : "none",
                paddingLeft: i ? 24 : 0
              }}
            >
              <div className="tn-label-mono" style={{ fontSize: 11, marginBottom: 6 }}>
                {s.l.toUpperCase()}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 26,
                  fontStyle: i === 1 ? "italic" : "normal",
                  lineHeight: 1.1
                }}
              >
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section style={{ padding: "56px 40px 96px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 16
          }}
        >
          <div>
            <div className="tn-eyebrow" style={{ marginBottom: 8 }}>
              № 02 · FROM THIS MAKER
            </div>
            <h2 className="tn-display-4">
              {sellerProducts.length > 0 ? (
                <>
                  {sellerProducts.length} {sellerProducts.length === 1 ? "piece" : "pieces"} on{" "}
                  <em style={{ fontStyle: "italic" }}>offer</em>
                </>
              ) : (
                <>
                  Coming <em style={{ fontStyle: "italic" }}>soon</em>
                </>
              )}
            </h2>
          </div>
          <Link href="/search" className="tn-btn-link" style={{ fontSize: 13 }}>
            Browse all sellers
          </Link>
        </div>

        {sellerProducts.length > 0 ? (
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}
            className="product-grid"
          >
            {sellerProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div
            className="tn-card"
            style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}
          >
            This maker doesn't have items listed right now. Check back soon.
          </div>
        )}
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .seller-hero { grid-template-columns: 1fr !important; }
          .seller-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .product-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .seller-stats { grid-template-columns: 1fr !important; }
          .product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
      `}</style>
    </>
  );
}
