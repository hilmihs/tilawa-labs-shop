import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, Leaf, Package } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { PlaceImg, SectionHead } from "@/components/design";
import { Reveal } from "@/components/Reveal";
import { IMG } from "@/lib/images";
import { getProducts } from "@/lib/api";
import type { Product } from "@/types/api";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { slug: "textiles", name: "Textiles", hint: "Weaves & fabrics" },
  { slug: "home", name: "Home", hint: "Furniture & decor" },
  { slug: "kitchen", name: "Kitchen", hint: "Ceramics & utensils" },
  { slug: "pantry", name: "Pantry", hint: "Coffee, honey, spices" },
  { slug: "personal-care", name: "Personal Care", hint: "Soaps & oils" },
  { slug: "craft", name: "Craft", hint: "Weavings & carvings" }
];

const PROMISES = [
  { icon: Truck, h: "Live shipping rates", d: "Real-time JNE, J&T, SiCepat quotes from Jakarta." },
  { icon: ShieldCheck, h: "Secure checkout", d: "Midtrans Snap · QRIS, VA, card, e-wallet." },
  { icon: Leaf, h: "Recycled packaging", d: "Kraft cartons and paper-fiber fill — no plastic." },
  { icon: Package, h: "Maker guarantee", d: "Defects beyond fair use replaced within 14 days." }
];

export const metadata = {
  title: "Toko Nusa · Indonesian craft, curated",
  description:
    "Independent curator of craft and food from across the Indonesian archipelago. Direct from makers, with fast checkout and transparent shipping."
};

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    products = await getProducts();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Products could not be loaded.";
  }

  const { c: activeCategory } = await searchParams;
  const filtered = activeCategory
    ? products.filter((_, i) => {
        const cats = CATEGORIES.map((c) => c.slug);
        const idx = cats.indexOf(activeCategory);
        return idx < 0 ? true : i % cats.length === idx;
      })
    : products;
  const featured = filtered.slice(0, 8);
  const activeCat = CATEGORIES.find((c) => c.slug === activeCategory);

  return (
    <>
      {/* HERO */}
      <section style={{ padding: "64px 40px 80px", position: "relative" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 48,
            alignItems: "end"
          }}
          className="hero-grid"
        >
          <div style={{ paddingBottom: 24 }}>
            <Reveal variant="up">
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                <span className="tn-num">№ 01 — HARVEST CATALOG</span>
                <span style={{ flex: 1, height: 1, background: "var(--ink)", maxWidth: 120 }} />
                <span className="tn-num">MAY · MMXXVI</span>
              </div>
            </Reveal>
            <h1 className="tn-display-1 tn-stagger" style={{ marginBottom: 32 }}>
              <span style={{ animationDelay: "0.05s" }}>Indonesian</span>
              <br />
              <em style={{ fontStyle: "italic", animationDelay: "0.18s" }}>craft</em>
              <span style={{ animationDelay: "0.22s" }}>,</span>
              <br />
              <span style={{ animationDelay: "0.32s" }}>made&nbsp;to&nbsp;</span>
              <em style={{ fontStyle: "italic", color: "var(--terracotta)", animationDelay: "0.42s" }}>
                last
              </em>
              <span style={{ animationDelay: "0.5s" }}>.</span>
            </h1>
            <Reveal variant="up" delay={400}>
              <p style={{ maxWidth: 480, fontSize: 17, lineHeight: 1.55, color: "var(--ink-soft)" }}>
                Twelve islands, forty-seven makers, one basket. Shop curated craft straight from
                studios and villages — with fast checkout and transparent shipping.
              </p>
            </Reveal>
            <Reveal variant="up" delay={550}>
              <div style={{ marginTop: 36, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                <Link href="#catalog" className="tn-btn tn-btn-lg">
                  Browse the catalog <ArrowRight size={16} />
                </Link>
                <Link href="/jurnal" className="tn-btn tn-btn-ghost tn-btn-lg">
                  Maker stories
                </Link>
              </div>
            </Reveal>
            <div
              style={{
                marginTop: 56,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 0,
                borderTop: "1px solid var(--line)"
              }}
            >
              {[
                { k: "47", l: "curated makers" },
                { k: "12", l: "islands" },
                { k: "< 2h", l: "to ship" }
              ].map((s, i) => (
                <div
                  key={s.l}
                  style={{
                    padding: "20px 0",
                    borderLeft: i ? "1px solid var(--line)" : "none",
                    paddingLeft: i ? 24 : 0
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 48,
                      lineHeight: 1,
                      fontStyle: i === 1 ? "italic" : "normal"
                    }}
                  >
                    {s.k}
                  </div>
                  <div className="tn-body-sm" style={{ marginTop: 6 }}>
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "1fr 0.45fr",
              gap: 12,
              minHeight: 560
            }}
          >
            <PlaceImg
              label="Hero · Sumba ikat weave"
              tint={3}
              ratio="auto"
              src={IMG.heroTextile}
              alt="Detail of a hand-woven Sumba ikat textile"
              kenburns
              eager
              style={{ height: "100%" }}
            />
            <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 12 }}>
              <PlaceImg
                label="rattan lamp"
                tint={5}
                ratio="auto"
                src={IMG.heroRattan}
                alt="Hand-woven rattan basket"
                eager
                style={{ height: "100%" }}
              />
              <PlaceImg
                label="forest honey"
                tint="dark"
                ratio="auto"
                src={IMG.heroHoney}
                alt="Forest honey in glass jars"
                eager
                style={{ height: "100%" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY INDEX */}
      <section
        style={{
          padding: "64px 40px",
          background: "var(--page)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)"
        }}
      >
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
            <div className="tn-eyebrow" style={{ marginBottom: 10 }}>№ 02 · INDEX</div>
            <h2 className="tn-display-4">
              Browse by <em style={{ fontStyle: "italic" }}>category</em>
            </h2>
          </div>
          <Link href="#catalog" className="tn-btn-link" style={{ fontSize: 13 }}>
            All categories <ArrowRight size={13} style={{ display: "inline" }} />
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            borderTop: "1px solid var(--ink)"
          }}
          className="cat-grid"
        >
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} variant="up" delay={i * 70}>
              <Link
                href={`/?c=${c.slug}#catalog`}
                className="tn-cat-card"
                style={{
                  padding: "20px 16px 20px 18px",
                  borderRight: i < CATEGORIES.length - 1 ? "1px solid var(--line)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  minHeight: 140
                }}
              >
                <span className="tn-num">№ 0{i + 1}</span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 34,
                    lineHeight: 1.02,
                    marginTop: 6
                  }}
                >
                  {c.name}
                </span>
                <span className="tn-body-sm" style={{ marginTop: "auto" }}>
                  {c.hint}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  Explore <ArrowRight size={12} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED GRID */}
      <section id="catalog" style={{ padding: "96px 40px 32px" }}>
        <SectionHead
          num="№ 03"
          eyebrow={activeCat ? `CATEGORY · ${activeCat.name.toUpperCase()}` : "PICKED THIS WEEK"}
          title={activeCat ? `Picks from` : "Nine pieces worth"}
          italic={activeCat ? activeCat.name.toLowerCase() : "a second look."}
          action={
            activeCategory ? (
              <Link href="/" scroll={false} className="tn-btn-link" style={{ fontSize: 13 }}>
                Clear filter <ArrowRight size={13} style={{ display: "inline" }} />
              </Link>
            ) : (
              <Link href="/search" className="tn-btn-link" style={{ fontSize: 13 }}>
                See all products <ArrowRight size={13} style={{ display: "inline" }} />
              </Link>
            )
          }
        />
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          <Link
            href="/"
            scroll={false}
            className={!activeCategory ? "tn-chip tn-chip-active" : "tn-chip"}
            style={{ textDecoration: "none" }}
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/?c=${c.slug}#catalog`}
              scroll={false}
              className={activeCategory === c.slug ? "tn-chip tn-chip-active" : "tn-chip"}
              style={{ textDecoration: "none" }}
            >
              {c.name}
            </Link>
          ))}
        </div>
        {error ? (
          <div
            style={{
              padding: 16,
              border: "1px solid var(--warning)",
              background: "var(--paper-soft)",
              color: "var(--warning)",
              fontSize: 14
            }}
          >
            {error}
          </div>
        ) : featured.length === 0 ? (
          <div
            className="tn-card"
            style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}
          >
            No products yet. Add some from the admin panel or run the seeder.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 20
            }}
            className="product-grid"
          >
            {featured.map((p, i) => (
              <Reveal key={p.id} variant="up" delay={(i % 4) * 80}>
                <ProductCard product={p} tag={i === 0 ? "Limited" : undefined} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* EDITORIAL BAND */}
      <section id="story" style={{ padding: "120px 40px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.7fr 1.3fr",
            gap: 64,
            alignItems: "center"
          }}
          className="story-grid"
        >
          <PlaceImg
            label="Loom · ikat in progress"
            tint={1}
            ratio="3/4"
            src={IMG.makerStory}
            alt="Detail of an ikat textile on a wooden hand loom"
            kenburns
          />
          <Reveal variant="right">
            <div>
              <div className="tn-eyebrow" style={{ marginBottom: 18 }}>№ 04 · MAKER STORY</div>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(32px, 4vw, 56px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.01em",
                  marginBottom: 32,
                  color: "var(--ink)"
                }}
              >
                “Every ikat takes forty days on the loom.{" "}
                <em style={{ fontStyle: "italic", color: "var(--terracotta)" }}>Not cheap goods</em> — but fair ones.”
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ width: 1, height: 36, background: "var(--ink)" }} />
                <div>
                  <div style={{ fontWeight: 500 }}>Studio Waingapu</div>
                  <div className="tn-body-sm">East Sumba · NTT</div>
                </div>
                <span style={{ flex: 1 }} />
                <Link href="/jurnal" className="tn-btn tn-btn-ghost">
                  Read the journal <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROMISES */}
      <section style={{ padding: "40px 40px 88px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            borderTop: "1px solid var(--ink)"
          }}
          className="promise-grid"
        >
          {PROMISES.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.h} variant="up" delay={i * 110}>
                <div
                  style={{
                    padding: "28px 24px 0 0",
                    borderRight: i < 3 ? "1px solid var(--line)" : "none",
                    paddingLeft: i ? 24 : 0
                  }}
                >
                  <div style={{ color: "var(--terracotta)", marginBottom: 14 }}>
                    <Icon size={22} strokeWidth={1.4} />
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 26,
                      fontStyle: "italic",
                      marginBottom: 8
                    }}
                  >
                    {p.h}
                  </div>
                  <div className="tn-body-sm">{p.d}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .product-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .cat-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .promise-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .story-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .promise-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
