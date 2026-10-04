"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { SellerShell } from "@/components/SellerShell";
import { formatCurrency } from "@/lib/api";
import {
  getSellerOrder,
  SELLER_ORDER_STATUSES,
  updateSellerOrderStatus,
  type SellerOrderRef
} from "@/lib/seller";

export default function SellerOrderDetailPage() {
  return (
    <SellerShell title="Order detail" subtitle="№ Fulfillment">
      <SellerOrderDetailInner />
    </SellerShell>
  );
}

function SellerOrderDetailInner() {
  const params = useParams<{ id: string }>();
  const orderNumber = decodeURIComponent(params?.id ?? "");
  const { session } = useSession();
  const [order, setOrder] = useState<SellerOrderRef | null | undefined>(undefined);
  const [savingStatus, setSavingStatus] = useState(false);

  const shop = session.role === "seller" ? session.shopSlug : "";

  function reload() {
    if (!shop || !orderNumber) return;
    getSellerOrder(shop, orderNumber).then(setOrder);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop, orderNumber]);

  if (order === undefined) {
    return <div className="tn-body-sm" style={{ padding: 24 }}>Loading…</div>;
  }
  if (order === null) {
    return (
      <div className="tn-card" style={{ padding: 28 }}>
        <h2 className="tn-display-4" style={{ marginBottom: 8 }}>Order not found</h2>
        <p className="tn-body-sm" style={{ marginBottom: 16 }}>
          This order doesn't exist or contains no products from your shop.
        </p>
        <Link href="/seller/orders" className="tn-btn-link">← Back to orders</Link>
      </div>
    );
  }

  function changeStatus(next: string) {
    if (next === order!.status) return;
    setSavingStatus(true);
    updateSellerOrderStatus(shop, order!.order_number, next);
    setTimeout(() => {
      reload();
      setSavingStatus(false);
    }, 0);
  }

  const addr = order.shipping_address;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 28 }} className="seller-order-detail">
      <div>
        <div className="tn-card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div className="tn-label-mono" style={{ fontSize: 11, marginBottom: 4 }}>ORDER #</div>
              <div className="tn-price" style={{ fontSize: 18 }}>{order.order_number}</div>
              <div className="tn-body-sm" style={{ fontSize: 12, marginTop: 4 }}>
                Placed{" "}
                {order.created_at
                  ? new Date(order.created_at).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "—"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="tn-label-mono" style={{ fontSize: 11, marginBottom: 4 }}>STATUS</div>
              <select
                value={order.status}
                onChange={(e) => changeStatus(e.target.value)}
                disabled={savingStatus}
                className="tn-input"
                style={{ minWidth: 160 }}
              >
                {SELLER_ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.toUpperCase()}
                  </option>
                ))}
              </select>
              <div className="tn-body-sm" style={{ fontSize: 10, marginTop: 4, color: "var(--muted)" }}>
                Scoped to your shop
              </div>
            </div>
          </div>
        </div>

        <h3 className="tn-display-4" style={{ marginBottom: 12 }}>Your items</h3>
        <div className="tn-card" style={{ overflow: "hidden", marginBottom: 20 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 0.6fr 1fr 1fr",
              padding: "12px 20px",
              borderBottom: "1px solid var(--line)",
              background: "var(--paper-soft)",
              fontSize: 11
            }}
            className="tn-label-mono"
          >
            <span>PRODUCT</span>
            <span>QTY</span>
            <span>UNIT</span>
            <span style={{ textAlign: "right" }}>SUBTOTAL</span>
          </div>
          {order.seller_items.map((it) => (
            <div
              key={it.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 0.6fr 1fr 1fr",
                padding: "14px 20px",
                alignItems: "center",
                gap: 12,
                borderTop: "1px solid var(--line-soft)"
              }}
            >
              <div style={{ fontSize: 13 }}>{it.product_name}</div>
              <div style={{ fontSize: 13 }}>×{it.quantity}</div>
              <div className="tn-price" style={{ fontSize: 13 }}>{formatCurrency(it.unit_price)}</div>
              <div className="tn-price" style={{ fontSize: 13, textAlign: "right" }}>{formatCurrency(it.line_total)}</div>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderTop: "1px solid var(--line)",
              background: "var(--paper-soft)"
            }}
          >
            <span className="tn-label-mono" style={{ fontSize: 11 }}>YOUR SUBTOTAL</span>
            <span className="tn-price" style={{ fontSize: 15 }}>{formatCurrency(order.seller_subtotal)}</span>
          </div>
        </div>

        {order.payment && (
          <>
            <h3 className="tn-display-4" style={{ marginBottom: 12 }}>Payment</h3>
            <div className="tn-card" style={{ padding: 20, marginBottom: 20 }}>
              <Kv label="Method" value={order.payment.provider} />
              <Kv label="Status" value={order.payment.status} />
              <Kv label="Transaction" value={order.payment.transaction_id ?? "—"} />
              <Kv label="Amount" value={formatCurrency(order.payment.amount)} last />
            </div>
          </>
        )}
      </div>

      <div>
        <h3 className="tn-display-4" style={{ marginBottom: 12 }}>Buyer</h3>
        <div className="tn-card" style={{ padding: 20, marginBottom: 20 }}>
          <Kv label="Name" value={order.customer_name} />
          <Kv label="Email" value={order.customer_email} />
          <Kv label="Phone" value={order.customer_phone} last />
        </div>

        <h3 className="tn-display-4" style={{ marginBottom: 12 }}>Shipping</h3>
        <div className="tn-card" style={{ padding: 20, marginBottom: 20 }}>
          {addr ? (
            <>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ""}
                <br />
                {addr.city}, {addr.province} {addr.postal_code}
              </div>
              <div style={{ height: 12 }} />
              <Kv label="Courier" value={`${order.shipping_courier ?? "—"} · ${order.shipping_service ?? ""}`} />
              <Kv label="Cost" value={formatCurrency(order.shipping_cost)} />
              <Kv label="ETD" value={order.shipping_etd ? `${order.shipping_etd} days` : "—"} last />
            </>
          ) : (
            <span className="tn-body-sm">No shipping address.</span>
          )}
        </div>

        <Link href="/seller/orders" className="tn-btn-link">← Back to orders</Link>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .seller-order-detail { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Kv({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "100px 1fr",
        gap: 12,
        paddingBottom: last ? 0 : 8,
        marginBottom: last ? 0 : 8,
        borderBottom: last ? "none" : "1px solid var(--line-soft)"
      }}
    >
      <span className="tn-label-mono" style={{ fontSize: 11 }}>{label.toUpperCase()}</span>
      <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{value}</span>
    </div>
  );
}
