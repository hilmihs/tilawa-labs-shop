"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { SellerShell } from "@/components/SellerShell";
import { formatCurrency } from "@/lib/api";
import { deleteSellerProduct, getSellerProducts, type SellerProduct } from "@/lib/seller";

export default function SellerProductsPage() {
  return (
    <SellerShell
      title="My products"
      subtitle="№ Catalog"
      action={
        <Link href="/seller/products/new" className="tn-btn">
          + Add product
        </Link>
      }
    >
      <SellerProductsInner />
    </SellerShell>
  );
}

function SellerProductsInner() {
  const { session } = useSession();
  const [items, setItems] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const shop = session.role === "seller" ? session.shopSlug : "";

  function reload() {
    if (!shop) return;
    setLoading(true);
    getSellerProducts(shop)
      .then(setItems)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop]);

  if (!shop) return null;

  function onDelete(id: number) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    deleteSellerProduct(shop, id);
    reload();
  }

  if (loading) {
    return <div className="tn-body-sm" style={{ padding: 24 }}>Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="tn-card" style={{ padding: 36, textAlign: "center" }}>
        <p className="tn-body" style={{ marginBottom: 16 }}>No products yet.</p>
        <Link href="/seller/products/new" className="tn-btn">
          + Add your first product
        </Link>
      </div>
    );
  }

  return (
    <div className="tn-card" style={{ overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "56px 1.6fr 1fr 0.8fr 0.8fr 1fr",
          padding: "12px 20px",
          borderBottom: "1px solid var(--line)",
          background: "var(--paper-soft)",
          fontSize: 11,
          letterSpacing: "0.08em"
        }}
        className="tn-label-mono"
      >
        <span></span>
        <span>NAME</span>
        <span>PRICE</span>
        <span>STOCK</span>
        <span>STATUS</span>
        <span style={{ textAlign: "right" }}>ACTIONS</span>
      </div>
      {items.map((p) => {
        const img = p.images[0]?.url;
        const isCustom = p.id < 0;
        return (
          <div
            key={p.id}
            style={{
              display: "grid",
              gridTemplateColumns: "56px 1.6fr 1fr 0.8fr 0.8fr 1fr",
              padding: "14px 20px",
              alignItems: "center",
              gap: 12,
              borderTop: "1px solid var(--line-soft)"
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: "var(--paper-soft)",
                borderRadius: 4,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span className="tn-label-mono" style={{ fontSize: 9, color: "var(--muted)" }}>
                  N/A
                </span>
              )}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
              <div className="tn-body-sm" style={{ fontSize: 11 }}>/{p.slug}</div>
            </div>
            <div className="tn-price" style={{ fontSize: 13 }}>{formatCurrency(p.price)}</div>
            <div style={{ fontSize: 13 }}>{p.stock}</div>
            <div style={{ fontSize: 11 }}>
              {isCustom ? (
                <span
                  style={{
                    padding: "2px 8px",
                    border: "1px solid var(--terracotta)",
                    color: "var(--terracotta)",
                    borderRadius: 3
                  }}
                  className="tn-label-mono"
                >
                  CUSTOM
                </span>
              ) : (
                <span
                  style={{
                    padding: "2px 8px",
                    border: "1px solid var(--line)",
                    color: "var(--muted)",
                    borderRadius: 3
                  }}
                  className="tn-label-mono"
                >
                  CATALOG
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              {isCustom ? (
                <>
                  <Link href={`/seller/products/${p.id}/edit`} className="tn-btn-link" style={{ fontSize: 12 }}>
                    Edit
                  </Link>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="tn-btn-link"
                    style={{ fontSize: 12, color: "var(--danger)" }}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <span className="tn-body-sm" style={{ fontSize: 11 }}>Read-only</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
