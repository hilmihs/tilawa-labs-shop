"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useSession } from "@/lib/session";
import { SellerShell } from "@/components/SellerShell";
import { createSellerProduct, slugify } from "@/lib/seller";

export default function NewSellerProductPage() {
  return (
    <SellerShell
      title={<>Add a <em style={{ fontStyle: "italic" }}>product</em></>}
      subtitle="№ Catalog · New product"
      action={
        <Link href="/seller/products" className="tn-btn-link" style={{ fontSize: 13 }}>
          ← Back to products
        </Link>
      }
    >
      <NewProductForm />
    </SellerShell>
  );
}

function NewProductForm() {
  const router = useRouter();
  const { session } = useSession();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [weight, setWeight] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (session.role !== "seller") return null;
  const shop = session.shopSlug;

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

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

    setSaving(true);
    createSellerProduct(shop, {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim(),
      price: Math.round(priceN),
      stock: Math.round(stockN),
      weight_grams: Math.round(weightN),
      is_active: isActive,
      primary_image_url: imageUrl.trim() || undefined
    });
    router.push("/seller/products");
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 760, margin: "0 auto" }}>
      <p className="tn-body" style={{ marginBottom: 40, color: "var(--muted)", maxWidth: 580 }}>
        Add a custom product to your storefront. Saved locally to your seller portal —
        you can edit or remove it any time from <Link href="/seller/products" className="tn-btn-link" style={{ fontSize: "inherit" }}>My products</Link>.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
        <Block num="№ 01" title="Identity" italic="& copy">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Product name" full>
              <input
                className="tn-input"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="e.g. Tenun Ikat Sumba"
                required
              />
            </Field>
            <Field label="URL slug" full hint="Used for the public product URL. Edit to override the auto-generated value.">
              <input
                className="tn-input"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="tenun-ikat-sumba"
                required
              />
            </Field>
            <Field label="Description" full>
              <textarea
                className="tn-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell buyers about the materials, story, and care of this piece…"
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
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", alignItems: "center" }}>
        <Link href="/seller/products" className="tn-btn tn-btn-ghost">
          Cancel
        </Link>
        <button type="submit" className="tn-btn tn-btn-lg" disabled={saving}>
          {saving ? "Saving…" : "Save product"}
        </button>
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
