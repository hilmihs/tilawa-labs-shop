"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useSession } from "@/lib/session";
import { SellerShell } from "@/components/SellerShell";
import { formatCurrency } from "@/lib/api";
import {
  deleteSellerProduct,
  getSellerProducts,
  slugify,
  updateSellerProduct,
  type SellerProduct
} from "@/lib/seller";

export default function EditSellerProductPage() {
  return (
    <SellerShell
      title={<>Edit <em style={{ fontStyle: "italic" }}>product</em></>}
      subtitle="№ Catalog · Edit product"
      action={
        <Link href="/seller/products" className="tn-btn-link" style={{ fontSize: 13 }}>
          ← Back to products
        </Link>
      }
    >
      <EditProductInner />
    </SellerShell>
  );
}

function EditProductInner() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const { session } = useSession();

  const [product, setProduct] = useState<SellerProduct | null | undefined>(undefined);

  useEffect(() => {
    if (session.role !== "seller" || !Number.isFinite(id)) return;
    getSellerProducts(session.shopSlug).then((list) => {
      setProduct(list.find((p) => p.id === id) ?? null);
    });
  }, [session, id]);

  if (session.role !== "seller") return null;
  if (product === undefined) {
    return <div className="tn-body-sm" style={{ padding: 24 }}>Loading…</div>;
  }
  if (product === null) {
    return (
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="tn-card" style={{ padding: 28 }}>
          <h2 className="tn-display-4" style={{ marginBottom: 8 }}>Product not found</h2>
          <p className="tn-body-sm" style={{ marginBottom: 16 }}>
            This product no longer exists or was deleted.
          </p>
          <Link href="/seller/products" className="tn-btn-link">← Back to products</Link>
        </div>
      </div>
    );
  }

  const isCustom = product.id < 0;

  if (!isCustom) {
    return <ReadonlyView product={product} />;
  }

  return (
    <EditForm
      product={product}
      onSave={(patch) => {
        updateSellerProduct(session.shopSlug, product.id, patch);
        router.push("/seller/products");
      }}
      onDelete={() => {
        if (!confirm("Delete this product? This cannot be undone.")) return;
        deleteSellerProduct(session.shopSlug, product.id);
        router.push("/seller/products");
      }}
    />
  );
}

function ReadonlyView({ product }: { product: SellerProduct }) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <p className="tn-body" style={{ marginBottom: 32, color: "var(--muted)", maxWidth: 580 }}>
        This product is sourced from the public catalog. Catalog products are read-only in the seller portal
        for now — custom products you create yourself are fully editable.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
        <Block num="№ 01" title="Identity" italic="& copy">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <ReadField label="Product name" value={product.name} full />
            <ReadField label="URL slug" value={`/${product.slug}`} full />
            <ReadField label="Description" value={product.description || "—"} full multi />
          </div>
        </Block>

        <Block num="№ 02" title="Pricing" italic="& inventory">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <ReadField label="Price" value={formatCurrency(product.price)} />
            <ReadField label="Stock on hand" value={String(product.stock)} />
            <ReadField label="Weight (grams)" value={String(product.weight_grams)} />
          </div>
        </Block>

        <Block num="№ 03" title="Visibility">
          <ReadField label="Status" value={product.is_active ? "Active" : "Hidden"} />
        </Block>
      </div>

      <hr className="tn-hr" style={{ margin: "40px 0 24px" }} />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Link href="/seller/products" className="tn-btn tn-btn-ghost">
          Back to products
        </Link>
      </div>
    </div>
  );
}

function EditForm({
  product,
  onSave,
  onDelete
}: {
  product: SellerProduct;
  onSave: (patch: {
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    weight_grams: number;
    is_active: boolean;
    primary_image_url?: string;
  }) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [weight, setWeight] = useState(String(product.weight_grams));
  const [imageUrl, setImageUrl] = useState(product.images[0]?.url ?? "");
  const [isActive, setIsActive] = useState(product.is_active);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const priceN = Number(price);
    const stockN = Number(stock);
    const weightN = Number(weight);
    if (!name.trim()) return setError("Product name is required.");
    if (!Number.isFinite(priceN) || priceN < 0) return setError("Price must be a non-negative number.");
    if (!Number.isFinite(stockN) || stockN < 0) return setError("Stock must be a non-negative number.");
    if (!Number.isFinite(weightN) || weightN <= 0) return setError("Weight (grams) must be greater than 0.");

    onSave({
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim(),
      price: Math.round(priceN),
      stock: Math.round(stockN),
      weight_grams: Math.round(weightN),
      is_active: isActive,
      primary_image_url: imageUrl.trim() || undefined
    });
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 760, margin: "0 auto" }}>
      <p className="tn-body" style={{ marginBottom: 40, color: "var(--muted)", maxWidth: 580 }}>
        Update this custom product. Changes are saved to your seller portal immediately when you click Save.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
        <Block num="№ 01" title="Identity" italic="& copy">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Product name" full>
              <input className="tn-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label="URL slug" full hint="Used for the public product URL.">
              <input
                className="tn-input"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                required
              />
            </Field>
            <Field label="Description" full>
              <textarea
                className="tn-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                style={{ height: "auto", padding: "12px 14px", resize: "vertical", lineHeight: 1.55 }}
              />
            </Field>
          </div>
        </Block>

        <Block num="№ 02" title="Pricing" italic="& inventory">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <Field label="Price (IDR)">
              <input
                className="tn-input"
                type="number"
                min={0}
                step={1000}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </Field>
            <Field label="Stock on hand">
              <input
                className="tn-input"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </Field>
            <Field label="Weight (grams)" hint="Used for shipping quotes.">
              <input
                className="tn-input"
                type="number"
                min={1}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </Field>
          </div>
        </Block>

        <Block num="№ 03" title="Media">
          <Field label="Primary image URL" hint="Optional. Paste a full URL — leave empty to show a placeholder.">
            <input
              className="tn-input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </Block>

        <Block num="№ 04" title="Visibility">
          <label
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              padding: 16,
              border: "1px solid var(--line)",
              borderRadius: 6,
              background: "var(--paper)",
              cursor: "pointer"
            }}
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ marginTop: 3, width: 16, height: 16, accentColor: "var(--terracotta)" }}
            />
            <span>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Active</div>
              <div className="tn-body-sm" style={{ fontSize: 12, marginTop: 2 }}>
                When enabled, this product is visible on your storefront and in catalog listings.
              </div>
            </span>
          </label>
        </Block>
      </div>

      {error && (
        <div
          style={{
            marginTop: 32,
            padding: 14,
            border: "1px solid var(--danger)",
            background: "var(--paper-soft)",
            color: "var(--danger)",
            fontSize: 13,
            borderRadius: 4
          }}
        >
          {error}
        </div>
      )}

      <hr className="tn-hr" style={{ margin: "40px 0 24px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={onDelete}
          className="tn-btn-link"
          style={{ fontSize: 13, color: "var(--danger)" }}
        >
          Delete product
        </button>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/seller/products" className="tn-btn tn-btn-ghost">
            Cancel
          </Link>
          <button type="submit" className="tn-btn tn-btn-lg">
            Save changes
          </button>
        </div>
      </div>
    </form>
  );
}

function Block({
  num,
  title,
  italic,
  children
}: {
  num: string;
  title: string;
  italic?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          marginBottom: 18,
          flexWrap: "wrap"
        }}
      >
        <span className="tn-num">{num}</span>
        <h2 className="tn-display-5">
          {title}
          {italic && (
            <>
              {" "}
              <em style={{ fontStyle: "italic" }}>{italic}</em>
            </>
          )}
        </h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  full,
  children
}: {
  label: string;
  hint?: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <label style={{ display: "block", gridColumn: full ? "1 / -1" : "auto" }}>
      <div className="tn-eyebrow" style={{ marginBottom: 8 }}>
        {label}
      </div>
      {children}
      {hint && (
        <div className="tn-body-sm" style={{ fontSize: 11, marginTop: 6 }}>
          {hint}
        </div>
      )}
    </label>
  );
}

function ReadField({
  label,
  value,
  full,
  multi
}: {
  label: string;
  value: string;
  full?: boolean;
  multi?: boolean;
}) {
  return (
    <div style={{ display: "block", gridColumn: full ? "1 / -1" : "auto" }}>
      <div className="tn-eyebrow" style={{ marginBottom: 8 }}>
        {label}
      </div>
      <div
        className="tn-input"
        style={{
          display: "flex",
          alignItems: multi ? "flex-start" : "center",
          height: multi ? "auto" : undefined,
          minHeight: multi ? 96 : undefined,
          padding: multi ? "12px 14px" : undefined,
          color: "var(--muted)",
          whiteSpace: multi ? "pre-wrap" : "normal",
          lineHeight: multi ? 1.55 : undefined,
          background: "var(--paper-soft)",
          cursor: "default"
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}
