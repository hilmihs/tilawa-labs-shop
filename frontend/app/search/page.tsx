import Link from "next/link";
import Form from "next/form";
import { Search as SearchIcon, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import type { Product } from "@/types/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search · Toko Nusa",
  description: "Search the Toko Nusa catalog by product name or maker."
};

function score(product: Product, q: string): number {
  if (!q) return 0;
  const ql = q.toLowerCase();
  const name = product.name.toLowerCase();
  const desc = (product.description ?? "").toLowerCase();
  let s = 0;
  if (name === ql) s += 100;
  if (name.startsWith(ql)) s += 40;
  if (name.includes(ql)) s += 20;
  if (desc.includes(ql)) s += 5;
  return s;
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q = "", sort = "relevance" } = await searchParams;
  const query = q.trim();

  let all: Product[] = [];
  let error: string | null = null;
  try {
    all = await getProducts();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Couldn't load products.";
  }

  const filtered = query
    ? all.filter((p) => score(p, query) > 0).sort((a, b) => score(b, query) - score(a, query))
    : all;

  const sorted = [...filtered];
  if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section style={{ padding: "56px 40px 80px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 28
        }}
      >
        <div>
          <Link
            href="/"
            className="tn-btn-link"
            style={{ fontSize: 13, display: "inline-flex", gap: 6, marginBottom: 18 }}
          >
            <ArrowLeft size={14} /> Back to home
          </Link>
          <div className="tn-eyebrow" style={{ marginBottom: 12 }}>
            № 01 · SEARCH
          </div>
          <h1 className="tn-display-3">
            {query ? (
              <>
                Results for <em style={{ fontStyle: "italic" }}>"{query}"</em>
              </>
            ) : (
              <>
                Search the <em style={{ fontStyle: "italic" }}>catalog</em>
              </>
            )}
          </h1>
        </div>
        <span className="tn-label-mono">
          {filtered.length} {filtered.length === 1 ? "result" : "results"}
        </span>
      </div>

      {/* Search form — Next 15 client-side navigation so NavigationProgress can track it */}
      <Form
        action="/search"
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 28,
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: 1,
            minWidth: 280,
            border: "1px solid var(--line)",
            borderRadius: 999,
            padding: "0 18px",
            height: 56,
            background: "var(--page)"
          }}
        >
          <SearchIcon size={18} style={{ color: "var(--muted)" }} />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by product, maker, or material…"
            style={{
              flex: 1,
              border: 0,
              background: "transparent",
              outline: "none",
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "var(--ink)"
            }}
          />
        </div>
        <select
          name="sort"
          defaultValue={sort}
          className="tn-input"
          style={{ width: 180, height: 56, borderRadius: 999, paddingInline: 22 }}
        >
          <option value="relevance">Relevance</option>
          <option value="price-asc">Price · low → high</option>
          <option value="price-desc">Price · high → low</option>
          <option value="name">Name · A → Z</option>
        </select>
        <button className="tn-btn tn-btn-lg" type="submit">
          Search
        </button>
      </Form>

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
      ) : sorted.length === 0 ? (
        <div
          className="tn-card"
          style={{
            padding: "56px 24px",
            textAlign: "center",
            color: "var(--muted)"
          }}
        >
          <h2 className="tn-display-4" style={{ marginBottom: 12, color: "var(--ink)" }}>
            Nothing <em style={{ fontStyle: "italic" }}>matches</em>{query ? ` "${query}"` : ""}.
          </h2>
          <p className="tn-body-sm" style={{ marginBottom: 18 }}>
            Try a different keyword or browse the full catalog.
          </p>
          <Link href="/" className="tn-btn">
            Browse all products
          </Link>
        </div>
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}
          className="product-grid"
        >
          {sorted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .product-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
      `}</style>
    </section>
  );
}
