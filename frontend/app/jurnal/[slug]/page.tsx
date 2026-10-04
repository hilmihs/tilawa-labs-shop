import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { PlaceImg } from "@/components/design";
import type { Tint } from "@/components/design";
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
  body: string[];
  author: string;
  read: string;
  date: string;
  tint: Tint;
};

const ARTICLES: Record<string, Article> = {
  "studio-waingapu": {
    slug: "studio-waingapu",
    num: "№ 01",
    category: "PORTRAIT",
    title: "Forty days at",
    italic: "Studio Waingapu",
    excerpt:
      "How Ratna Hidayah and seven women in East Sumba keep ikat weaving alive with mengkudu dye, even as they turn down bulk export orders that would kill the craft.",
    body: [
      "Ratna's house is half a kilometre off the main road in Waingapu. The roof is zinc, the walls are board, and on the verandah sit seven old looms that creak each time the sea breeze blows through.",
      "Every piece of ikat — the ones you see in the Toko Nusa storefront — is the result of forty days of work. First, hundreds of strands of hand-spun cotton are tied off with the patola technique, masking the sections that won't take the dye. Then the dyeing: mengkudu root, indigo, turmeric. Three layers. Each layer needs three days to dry.",
      "What rarely gets told is the mental part: it takes extraordinary patience to keep declining wholesale buyers who'll pay twenty percent less if you commit to two hundred pieces a month. Ratna always refuses. “If I say yes,” she says, “next year there'll be no one left who can weave.”",
      "Toko Nusa buys directly from Studio Waingapu at a price agreed at the start of each season. No clawbacks, no consignment. What you pay is the final price — most of it stays in Sumba."
    ],
    author: "Toko Nusa team",
    read: "8 min",
    date: "May 12, 2026",
    tint: 3
  },
  "kopi-gayo": {
    slug: "kopi-gayo",
    num: "№ 02",
    category: "PANTRY",
    title: "Gayo, the coffee that",
    italic: "walks slowly",
    excerpt:
      "On family coffee farms in highland Aceh, the natural process that demands patience, and why “clean” beans sometimes lose their soul.",
    body: [
      "In Bener Meriah, coffee isn't harvested — it's picked. Cherry by cherry. The deepest reds are taken, the rest left to ripen.",
      "Tanoh Roastery picks the natural process: cherries are dried whole on raised beds for 18 to 22 days. The result is complex — notes of wine, a hint of tropical fruit, an aftertaste that lingers on the palate.",
      "The process is troublesome. Slower than washed. Mould risk is high if the weather wavers. But the bean's character stays alive — and that's what they're protecting."
    ],
    author: "Tanoh Roastery",
    read: "5 min",
    date: "May 8, 2026",
    tint: "dark"
  },
  "rotan-yang-belajar": {
    slug: "rotan-yang-belajar",
    num: "№ 03",
    category: "MATERIAL",
    title: "Rattan that",
    italic: "learns to bend",
    excerpt:
      "A note from Kayuh Studio: building a rattan lamp is a long negotiation between hand, steam, and patience.",
    body: [
      "Rattan is one of the strongest materials in the world per gram. But it is stubborn. To shape it, you steam — you don't force.",
      "Each lamp in the “Tertulis” series uses 36 rattan strips. They are laid in a steel mould one by one, with steam rising from a pot beside the workbench. The hands have to be quick — once the strip cools, the rattan stiffens up.",
      "The final piece is curving lines of light that look like handwriting. No two are ever quite the same."
    ],
    author: "Kayuh Studio",
    read: "6 min",
    date: "May 2, 2026",
    tint: 5
  },
  "ekonomi-kriya": {
    slug: "ekonomi-kriya",
    num: "№ 04",
    category: "ESSAY",
    title: "What is",
    italic: "fair, in rupiah?",
    excerpt:
      "An open discussion about maker margins, retail prices, and why Toko Nusa never runs deep discounts on craft.",
    body: [
      "If you've ever seen ikat sold for Rp 350,000 at a souvenir market, do you know how much reaches the weaver? On average Rp 90,000. The rest is middleman margin, logistics, taxes.",
      "Toko Nusa runs a direct model: no broker in the middle. Our margin is thin — about 32% on average — but enough to cover operations, packaging, and a small team in Jakarta.",
      "That's why we rarely discount. Not out of stinginess — because the price already reflects what's fair for the maker."
    ],
    author: "Toko Nusa team",
    read: "10 min",
    date: "April 28, 2026",
    tint: 1
  },
  "kemasan-ulang": {
    slug: "kemasan-ulang",
    num: "№ 05",
    category: "OPERATIONS",
    title: "Packaging that",
    italic: "knows shame",
    excerpt:
      "Why we use recycled kraft cartons and paper-fibre fill — and the math behind that small decision.",
    body: [
      "Recycled kraft is 18% more expensive than virgin board. Jute twine is three times the cost of plastic tape. But they don't outlive the user by 500 years in a landfill.",
      "Toko Nusa picks a sensible compromise: fully recycled outer cartons, paper-fibre fill (no styrofoam), unlaminated labels. We send the same packaging stock to makers for free, so the standard stays consistent across the catalog."
    ],
    author: "Toko Nusa team",
    read: "4 min",
    date: "April 21, 2026",
    tint: 4
  },
  "tongkonan-weave": {
    slug: "tongkonan-weave",
    num: "№ 06",
    category: "PORTRAIT",
    title: "Tongkonan, and the",
    italic: "weave that remains",
    excerpt:
      "A trip to Toraja to meet Ibu Bertha — a weaver who learned from her grandmother and refuses factory yarn.",
    body: [
      "Bertha weaves under her Tongkonan house. Light filters in through the wooden slats, the earth floor is cool, and her loom hums like an insect.",
      "What she weaves are selendang — not for tourists, but for ceremonies. Until her daughter went to Makassar for university and “happened” to have a friend who asked about prices.",
      "Now Bertha weaves for two purposes: her family, and one small order a month for Toko Nusa. No more. Because, she says, “If I rush the weave, the pattern gets angry.”"
    ],
    author: "Toko Nusa team",
    read: "7 min",
    date: "April 14, 2026",
    tint: 2
  }
};

export async function generateStaticParams() {
  return Object.keys(ARTICLES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES[slug];
  if (!article) return { title: "Article · Toko Nusa Journal" };
  return {
    title: `${article.title} ${article.italic ?? ""} · Toko Nusa Journal`.trim(),
    description: article.excerpt
  };
}

export default async function JurnalArticlePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = ARTICLES[slug];
  if (!article) notFound();

  return (
    <article style={{ padding: "48px 40px 96px" }}>
      <div style={{ maxWidth: 760, marginInline: "auto" }}>
        <Link href="/jurnal" className="tn-btn-link" style={{ fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 32 }}>
          <ArrowLeft size={14} /> Back to the journal
        </Link>
        <div className="tn-eyebrow" style={{ marginBottom: 14 }}>
          {article.num} · {article.category}
        </div>
        <h1 className="tn-display-2" style={{ marginBottom: 24 }}>
          {article.title}{" "}
          {article.italic && <em style={{ fontStyle: "italic" }}>{article.italic}</em>}
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 40
          }}
        >
          <span>{article.author}</span>
          <span>·</span>
          <span>{article.date}</span>
          <span>·</span>
          <span>{article.read} read</span>
        </div>
      </div>

      <div style={{ maxWidth: 980, marginInline: "auto", marginBottom: 48 }}>
        <PlaceImg
          label={article.title}
          tint={article.tint}
          ratio="16/9"
          src={JURNAL_IMG[article.slug]}
          alt={article.title}
          kenburns
        />
      </div>

      <div style={{ maxWidth: 680, marginInline: "auto" }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            lineHeight: 1.3,
            color: "var(--ink)",
            marginBottom: 36,
            fontStyle: "italic"
          }}
        >
          {article.excerpt}
        </p>
        {article.body.map((paragraph, i) => (
          <p
            key={i}
            style={{
              fontSize: 17,
              lineHeight: 1.75,
              color: "var(--ink-soft)",
              marginBottom: 22
            }}
          >
            {paragraph}
          </p>
        ))}

        <hr className="tn-hr" style={{ margin: "48px 0 24px" }} />
        <div className="tn-label-mono" style={{ fontSize: 11, marginBottom: 16 }}>
          READ NEXT
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }} className="related-grid">
          {Object.values(ARTICLES)
            .filter((a) => a.slug !== article.slug)
            .slice(0, 2)
            .map((a) => (
              <Link
                key={a.slug}
                href={`/jurnal/${a.slug}`}
                className="tn-card"
                style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8 }}
              >
                <span className="tn-label-mono" style={{ fontSize: 11 }}>
                  {a.category}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 20,
                    fontStyle: "italic",
                    lineHeight: 1.15
                  }}
                >
                  {a.title}
                </span>
                <span className="tn-body-sm">{a.read} read</span>
              </Link>
            ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .related-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </article>
  );
}
