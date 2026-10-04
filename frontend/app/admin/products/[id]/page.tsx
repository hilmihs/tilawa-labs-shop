"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { AdminGuard, DemoModeBanner } from "@/components/AdminGuard";
import { AdminShell } from "@/components/AdminShell";
import { adminApi, formatCurrency } from "@/lib/api";
import { ProductForm } from "../ProductForm";
import type { AdminSession, Product } from "@/types/api";

function ProductEditView({ session, id, isDemo }: { session: AdminSession; id: string; isDemo: boolean }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setError("Demo session — produk tidak bisa dimuat tanpa backend.");
      return;
    }
    adminApi
      .product(session.token, id)
      .then(setProduct)
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : "Produk tidak ditemukan.")
      );
  }, [session.token, id, isDemo]);

  async function handleSubmit(formData: FormData) {
    if (!product || isDemo) return;
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const updated = await adminApi.updateProduct(session.token, product.id, formData);
      setProduct(updated);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Gagal menyimpan perubahan.";
      setError(message);
      try {
        const parsed = JSON.parse(message);
        if (parsed?.errors) setFieldErrors(parsed.errors);
      } catch {
        /* not JSON */
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!product || isDemo) return;
    if (!window.confirm(`Hapus produk "${product.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setDeleting(true);
    try {
      await adminApi.deleteProduct(session.token, product.id);
      router.push("/admin/products");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menghapus produk.");
      setDeleting(false);
    }
  }

  if (error && !product) {
    return (
      <AdminShell
        subtitle="Product"
        title={<>Not <em style={{ fontStyle: "italic" }}>found</em>.</>}
      >
        {isDemo && <DemoModeBanner />}
        <div
          style={{
            padding: 20,
            border: "1px solid var(--warning)",
            background: "var(--paper-soft)",
            color: "var(--warning)",
            fontSize: 14
          }}
        >
          {error}
        </div>
        <Link
          href="/admin/products"
          className="tn-btn-link"
          style={{ display: "inline-flex", gap: 6, marginTop: 16, fontSize: 13 }}
        >
          <ArrowLeft size={14} /> Back to products
        </Link>
      </AdminShell>
    );
  }

  if (!product) {
    return (
      <AdminShell subtitle="Loading" title={<>Loading <em style={{ fontStyle: "italic" }}>product</em>…</>}>
        <div className="tn-skeleton" style={{ width: "100%", height: 280, marginBottom: 18 }} />
        <div className="tn-skeleton" style={{ width: "60%", height: 18 }} />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      subtitle="Catalog"
      title={
        <>
          Edit <em style={{ fontStyle: "italic" }}>{product.name}</em>
        </>
      }
      action={
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/admin/products"
            className="tn-btn tn-btn-ghost"
            style={{ display: "inline-flex", gap: 6 }}
          >
            <ArrowLeft size={14} /> Back
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || isDemo}
            className="tn-btn tn-btn-ghost"
            style={{ display: "inline-flex", gap: 6, color: "var(--danger)", borderColor: "var(--danger)" }}
          >
            <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      }
    >
      {isDemo && <DemoModeBanner />}

      <div
        className="tn-card"
        style={{ padding: 20, marginBottom: 20, display: "grid", gap: 14 }}
      >
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Pair k="Price" v={formatCurrency(product.price)} />
          <Pair k="Stock" v={product.stock.toString()} />
          <Pair k="Weight" v={`${product.weight_grams} g`} />
          <Pair k="Status" v={product.is_active ? "Active" : "Draft"} />
          <Pair k="Slug" v={product.slug} />
        </div>
        {product.images.length > 0 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {product.images.map((img) => (
              <div
                key={img.id}
                style={{
                  position: "relative",
                  width: 80,
                  height: 80,
                  background: "var(--paper-soft)",
                  border: "1px solid var(--line)"
                }}
              >
                <Image src={img.url} alt={img.alt_text ?? ""} fill style={{ objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductForm
        mode="edit"
        initial={product}
        submitting={submitting}
        error={error}
        fieldErrors={fieldErrors}
        disabled={isDemo}
        onSubmit={handleSubmit}
      />
    </AdminShell>
  );
}

function Pair({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="tn-label-mono" style={{ fontSize: 11, marginBottom: 2 }}>
        {k.toUpperCase()}
      </div>
      <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>{v}</div>
    </div>
  );
}

export default function AdminProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  if (!id) return null;
  return (
    <AdminGuard>
      {(session, { isDemo }) => <ProductEditView session={session} id={id} isDemo={isDemo} />}
    </AdminGuard>
  );
}
