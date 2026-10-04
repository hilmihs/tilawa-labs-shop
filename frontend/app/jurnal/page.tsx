import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PlaceImg, SectionHead } from "@/components/design";
import type { Tint } from "@/components/design";
import { Reveal } from "@/components/Reveal";
import { NewsletterForm } from "@/components/NewsletterForm";
import { IMG } from "@/lib/images";

const JURNAL_IMG: Record<string, string> = {
  "studio-waingapu": IMG.jurnalIkat,
  "kopi-gayo": IMG.jurnalCoffee,
  "rotan-yang-belajar": IMG.jurnalRattan,
  "ekonomi-kriya": IMG.jurnalDye,
  "kemasan-ulang": IMG.jurnalKitchen,
  "tongkonan-weave": IMG.jurnalCeramic
};

type Article = {
  slug: string;
  num: string;
  category: string;
  title: string;
  italic?: string;
  excerpt: string;
  author: string;
  read: string;
  date: string;
  tint: Tint;
};

const ARTICLES: Article[] = [
  {
    slug: "studio-waingapu",
    num: "№ 01",
    category: "PORTRAIT",
    title: "Forty days at",
    italic: "Studio Waingapu",
    excerpt:
      "How Ratna Hidayah and seven women in East Sumba keep ikat weaving alive with mengkudu dye, even as they turn down bulk export orders that would kill the craft.",
    author: "Toko Nusa team",
    read: "8 min",
    date: "May 12, 2026",
    tint: 3
  },
  {
    slug: "kopi-gayo",
    num: "№ 02",
    category: "PANTRY",
    title: "Gayo, the coffee that",
    italic: "walks slowly",
    excerpt:
      "On family coffee farms in highland Aceh, the natural process that demands patience, and why “clean” beans sometimes lose their soul.",
    author: "Tanoh Roastery",
    read: "5 min",
    date: "May 8, 2026",
    tint: "dark"
  },
  {
    slug: "rotan-yang-belajar",
    num: "№ 03",
    category: "MATERIAL",
    title: "Rattan that",
    italic: "learns to bend",
    excerpt:
      "A note from Kayuh Studio: building a rattan lamp is a long negotiation between hand, steam, and patience.",
    author: "Kayuh Studio",
    read: "6 min",
    date: "May 2, 2026",
    tint: 5
  },
  {
    slug: "ekonomi-kriya",
    num: "№ 04",
    category: "ESSAY",
    title: "What is",
    italic: "fair, in rupiah?",
    excerpt:
      "An open discussion about maker margins, retail prices, and why Toko Nusa never runs deep discounts on craft.",
    author: "Toko Nusa team",
    read: "10 min",
    date: "April 28, 2026",
    tint: 1
  },
  {
    slug: "kemasan-ulang",
    num: "№ 05",
    category: "OPERATIONS",
    title: "Packaging that",
    italic: "knows shame",
    excerpt:
      "Why we use recycled kraft cartons and paper-fibre fill — and the math behind that small decision.",
    author: "Toko Nusa team",
    read: "4 min",
    date: "April 21, 2026",
    tint: 4
  },
  {
    slug: "tongkonan-weave",
    num: "№ 06",
    category: "PORTRAIT",
    title: "Tongkonan, and the",
    italic: "weave that remains",
    excerpt:
      "A trip to Toraja to meet Ibu Bertha — a weaver who learned from her grandmother and refuses factory yarn.",
    author: "Toko Nusa team",
    read: "7 min",
    date: "April 14, 2026",
    tint: 2
  }
];

export const metadata = {
  title: "Journal · Toko Nusa",
  description: "Stories from the studios, farms, and kitchens of the makers behind Toko Nusa."
};

export default function JurnalPage() {
  const [hero, ...rest] = ARTICLES;

  return (
    <>
      <section style={{ padding: "64px 40px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <span className="tn-num">№ 01 — JOURNAL</span>
          <span style={{ flex: 1, height: 1, background: "var(--ink)", maxWidth: 120 }} />
          <span className="tn-num">MAY ISSUE · MMXXVI</span>
        </div>
        <Link
          href={`/jurnal/${hero.slug}`}
          style={{
            display: "grid",
            gridTemplateColumns: "0.9fr 1.1fr",
            gap: 56,
            alignItems: "center"
          }}
          className="hero-grid"
        >
          <PlaceImg
            label={hero.title}
            tint={hero.tint}
            ratio="4/5"
            src={JURNAL_IMG[hero.slug]}
            alt={hero.title}
            kenburns
          />
          <div>
            <div className="tn-eyebrow" style={{ marginBottom: 14 }}>
              {hero.num} · {hero.category}
            </div>
            <h1 className="tn-display-2" style={{ marginBottom: 22 }}>
              {hero.title}{" "}
              {hero.italic && <em style={{ fontStyle: "italic" }}>{hero.italic}</em>}
            </h1>
            <p
              className="tn-body"
              style={{ fontSize: 17, lineHeight: 1.55, marginBottom: 24, maxWidth: 540 }}
            >
              {hero.excerpt}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--muted)",
                letterSpacing: "0.08em",
                textTransform: "uppercase"
              }}
            >
              <span>{hero.author}</span>
              <span>·</span>
              <span>{hero.date}</span>
              <span>·</span>
              <span>{hero.read} read</span>
            </div>
            <div style={{ marginTop: 24 }}>
              <span className="tn-btn-link" style={{ fontSize: 14 }}>
                Read more <ArrowRight size={14} style={{ display: "inline" }} />
              </span>
            </div>
          </div>
        </Link>
      </section>

      <section style={{ padding: "56px 40px 96px", background: "var(--page)", borderTop: "1px solid var(--line)" }}>
        <SectionHead
          num="№ 02"
          eyebrow="MORE FROM THE JOURNAL"
          title="Notes & stories,"
          italic="recent."
        />
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}
          className="grid-3"
        >
          {rest.map((a, i) => (
            <Reveal key={a.slug} variant="up" delay={i * 90}>
              <Link
                href={`/jurnal/${a.slug}`}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
                className="article-card"
              >
                <div className="tn-img-zoom" style={{ aspectRatio: "4/5" }}>
                  <PlaceImg
                    label={a.title}
                    tint={a.tint}
                    ratio="4/5"
                    src={JURNAL_IMG[a.slug]}
                    alt={a.title}
                    style={{ height: "100%" }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--muted)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase"
                  }}
                >
                  <span>{a.num}</span>
                  <span>·</span>
                  <span>{a.category}</span>
                  <span>·</span>
                  <span>{a.read}</span>
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    lineHeight: 1.05,
                    letterSpacing: "-0.01em"
                  }}
                >
                  {a.title}{" "}
                  {a.italic && <em style={{ fontStyle: "italic" }}>{a.italic}</em>}
                </h3>
                <p className="tn-body-sm" style={{ lineHeight: 1.6 }}>
                  {a.excerpt}
                </p>
                <div className="tn-label-mono" style={{ fontSize: 11 }}>
                  {a.author.toUpperCase()} · {a.date}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section style={{ padding: "96px 40px" }}>
        <div
          className="tn-card"
          style={{
            padding: "56px 40px",
            background: "var(--ink)",
            color: "var(--paper)",
            border: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 56,
            alignItems: "center"
          }}
        >
          <div>
            <div
              className="tn-eyebrow"
              style={{ color: "rgba(245,239,228,0.55)", marginBottom: 14 }}
            >
              MONTHLY · TWICE A MONTH
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 56, lineHeight: 1.02 }}>
              Short stories,{" "}
              <em style={{ fontStyle: "italic", color: "var(--terracotta)" }}>in your inbox</em>
              .
            </h2>
          </div>
          <NewsletterForm />
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
