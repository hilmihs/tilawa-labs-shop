"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/session";
import { SellerShell } from "@/components/SellerShell";
import { formatCurrency } from "@/lib/api";
import {
  getSellerOrders,
  SELLER_ORDER_STATUSES,
  type SellerOrderRef
} from "@/lib/seller";

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--muted)",
  paid: "var(--success)",
  packed: "var(--terracotta)",
  shipped: "var(--ink)",
  delivered: "var(--success)",
  cancelled: "var(--danger)"
};

const FILTERS = ["all", ...SELLER_ORDER_STATUSES] as const;
type Filter = (typeof FILTERS)[number];

export default function SellerOrdersPage() {
  return (
    <SellerShell title="Orders" subtitle="№ Fulfillment">
      <SellerOrdersInner />
    </SellerShell>
  );
}

function SellerOrdersInner() {
  const { session } = useSession();
  const [orders, setOrders] = useState<SellerOrderRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  const shop = session.role === "seller" ? session.shopSlug : "";

  useEffect(() => {
    if (!shop) return;
    setLoading(true);
    getSellerOrders(shop)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [shop]);

  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );

  if (!shop) return null;

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {FILTERS.map((f) => {
          const count = f === "all" ? orders.length : orders.filter((o) => o.status === f).length;
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="tn-label-mono"
              style={{
                padding: "6px 12px",
                fontSize: 11,
                borderRadius: 3,
                border: "1px solid var(--line)",
                background: active ? "var(--ink)" : "transparent",
                color: active ? "var(--paper)" : "var(--ink-soft)",
                cursor: "pointer"
              }}
            >
              {f.toUpperCase()} · {count}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="tn-body-sm" style={{ padding: 24 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="tn-card" style={{ padding: 36, textAlign: "center" }}>
          <p className="tn-body-sm">No orders {filter === "all" ? "yet" : `with status "${filter}"`}.</p>
        </div>
      ) : (
        <div className="tn-card" style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1.4fr 0.8fr 0.6fr 1fr 0.8fr",
              padding: "12px 20px",
              borderBottom: "1px solid var(--line)",
              background: "var(--paper-soft)",
              fontSize: 11
            }}
            className="tn-label-mono"
          >
            <span>ORDER</span>
            <span>CUSTOMER</span>
            <span>DATE</span>
            <span>ITEMS</span>
            <span>SUBTOTAL</span>
            <span>STATUS</span>
          </div>
          {filtered.map((o) => (
            <Link
              key={o.order_number}
              href={`/seller/orders/${o.order_number}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1.4fr 0.8fr 0.6fr 1fr 0.8fr",
                padding: "14px 20px",
                alignItems: "center",
                gap: 12,
                borderTop: "1px solid var(--line-soft)",
                textDecoration: "none",
                color: "var(--ink)"
              }}
            >
              <div className="tn-price" style={{ fontSize: 13 }}>{o.order_number}</div>
              <div>
                <div style={{ fontSize: 13 }}>{o.customer_name}</div>
                <div className="tn-body-sm" style={{ fontSize: 11 }}>{o.customer_email}</div>
              </div>
              <div className="tn-body-sm" style={{ fontSize: 12 }}>
                {o.created_at ? new Date(o.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "—"}
              </div>
              <div style={{ fontSize: 13 }}>{o.seller_items.length}</div>
              <div className="tn-price" style={{ fontSize: 13 }}>{formatCurrency(o.seller_subtotal)}</div>
              <div>
                <span
                  className="tn-label-mono"
                  style={{
                    fontSize: 10,
                    padding: "3px 8px",
                    borderRadius: 3,
                    color: STATUS_COLORS[o.status] ?? "var(--ink)",
                    border: `1px solid ${STATUS_COLORS[o.status] ?? "var(--line)"}`
                  }}
                >
                  {o.status.toUpperCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
