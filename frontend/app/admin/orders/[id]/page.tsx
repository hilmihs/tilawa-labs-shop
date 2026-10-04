"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminGuard, DemoModeBanner } from "@/components/AdminGuard";
import { AdminShell } from "@/components/AdminShell";
import { adminApi, formatCurrency } from "@/lib/api";
import { SumRow } from "@/components/design";
import type { AdminSession, OrderDetail } from "@/types/api";

const STATUS_COLOR: Record<string, string> = {
  pending_payment: "var(--gold)",
  paid: "var(--gold)",
  processing: "var(--terracotta)",
  shipped: "var(--olive)",
  completed: "var(--success)",
  cancelled: "var(--danger)"
};

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  processing: "Packing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled"
};

const STATUS_OPTIONS = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled"
];

function OrderDetailView({ session, id, isDemo }: { session: AdminSession; id: string; isDemo: boolean }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setError("Demo session — no backend order data available.");
      return;
    }
    adminApi
      .order(session.token, id)
      .then(setOrder)
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : "Order not found.")
      );
  }, [session.token, id, isDemo]);

  async function changeStatus(status: string) {
    if (!order || isDemo) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateOrderStatus(session.token, order.id, status);
      setOrder((current) => (current ? { ...current, ...updated } : current));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Status update failed.");
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <AdminShell subtitle="Order" title={<>Not <em style={{ fontStyle: "italic" }}>found</em>.</>}>
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
          href="/admin/orders"
          className="tn-btn-link"
          style={{ display: "inline-flex", gap: 6, marginTop: 16, fontSize: 13 }}
        >
          <ArrowLeft size={14} /> Back to orders
        </Link>
      </AdminShell>
    );
  }

  if (!order) {
    return (
      <AdminShell subtitle="Loading" title={<>Loading <em style={{ fontStyle: "italic" }}>order</em>…</>}>
        <div className="tn-skeleton" style={{ width: "100%", height: 280, marginBottom: 18 }} />
        <div className="tn-skeleton" style={{ width: "60%", height: 18 }} />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      subtitle={`Order · ${new Date(order.created_at ?? Date.now()).toLocaleDateString("en-US")}`}
      title={
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 32, letterSpacing: "0.02em" }}>
          {order.order_number}
        </span>
      }
      action={
        <Link
          href="/admin/orders"
          className="tn-btn tn-btn-ghost"
          style={{ display: "inline-flex", gap: 6 }}
        >
          <ArrowLeft size={14} /> Back to orders
        </Link>
      }
    >
      <div
        style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}
        className="detail-grid"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Status card */}
          <div className="tn-card" style={{ padding: 22 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
                flexWrap: "wrap"
              }}
            >
              <div>
                <div className="tn-label-mono" style={{ fontSize: 11, marginBottom: 8 }}>
                  ORDER STATUS
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px",
                    borderRadius: 999,
                    background: "var(--paper-soft)",
                    border: "1px solid var(--line)",
                    fontSize: 13
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: STATUS_COLOR[order.status] ?? "var(--muted)"
                    }}
                  />
                  {STATUS_LABEL[order.status] ?? order.status}
                </div>
                <div className="tn-label-mono" style={{ fontSize: 11, marginTop: 12 }}>
                  PAYMENT · {order.payment_status.toUpperCase()}
                </div>
              </div>
              <div>
                <div className="tn-eyebrow" style={{ marginBottom: 8 }}>
                  Change status
                </div>
                <select
                  className="tn-input"
                  value={order.status}
                  onChange={(e) => changeStatus(e.target.value)}
                  disabled={saving}
                  style={{ minWidth: 180 }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {STATUS_LABEL[opt] ?? opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="tn-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 12px" }}>
              <h3 className="tn-display-5">
                Order <em style={{ fontStyle: "italic" }}>items</em>
              </h3>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    color: "var(--muted)",
                    textTransform: "uppercase"
                  }}
                >
                  {["Product", "Qty", "Price", "Subtotal"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "12px 24px",
                        borderTop: "1px solid var(--ink)",
                        borderBottom: "1px solid var(--line)",
                        fontWeight: 500
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, i) => (
                  <tr
                    key={it.id}
                    style={{
                      borderBottom: i < order.items.length - 1 ? "1px solid var(--line-soft)" : "none"
                    }}
                  >
                    <td style={{ padding: "14px 24px" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontStyle: "italic",
                          fontSize: 16
                        }}
                      >
                        {it.product_name}
                      </div>
                      <div className="tn-body-sm" style={{ fontSize: 11 }}>
                        PROD-{String(it.product_id).padStart(4, "0")}
                      </div>
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <span className="tn-price">{it.quantity}×</span>
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <span className="tn-price">{formatCurrency(it.unit_price)}</span>
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <span className="tn-price">{formatCurrency(it.line_total)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment */}
          {order.payment && (
            <div className="tn-card" style={{ padding: 22 }}>
              <div className="tn-eyebrow" style={{ marginBottom: 12 }}>
                PAYMENT
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "12px 24px",
                  fontSize: 14
                }}
              >
                <Pair k="Provider" v={order.payment.provider} />
                <Pair k="Status" v={order.payment.status} />
                <Pair k="Transaction ID" v={order.payment.transaction_id ?? "—"} />
                <Pair k="Paid at" v={order.payment.paid_at ?? "—"} />
                <Pair k="Amount" v={formatCurrency(order.payment.amount)} />
              </div>
            </div>
          )}
        </div>

        {/* Side */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="tn-card" style={{ padding: 22 }}>
            <h3 className="tn-display-5" style={{ marginBottom: 14 }}>
              <em style={{ fontStyle: "italic" }}>Summary</em>
            </h3>
            <SumRow k="Subtotal" v={formatCurrency(order.subtotal)} muted />
            <SumRow
              k={`Shipping · ${(order.shipping_courier ?? "").toUpperCase()} ${order.shipping_service ?? ""}`.trim()}
              v={formatCurrency(order.shipping_cost)}
              muted
            />
            <hr className="tn-hr" style={{ margin: "10px 0" }} />
            <SumRow k="Total" v={formatCurrency(order.total)} strong />
          </div>

          <div className="tn-card" style={{ padding: 22 }}>
            <div className="tn-eyebrow" style={{ marginBottom: 12 }}>
              BUYER
            </div>
            <div style={{ display: "grid", gap: 6, fontSize: 14, lineHeight: 1.55 }}>
              <div style={{ fontWeight: 500 }}>{order.customer_name}</div>
              <div style={{ color: "var(--ink-soft)" }}>{order.customer_email}</div>
              <div style={{ color: "var(--ink-soft)" }}>{order.customer_phone}</div>
            </div>
          </div>

          {order.shipping_address && (
            <div className="tn-card" style={{ padding: 22 }}>
              <div className="tn-eyebrow" style={{ marginBottom: 12 }}>
                SHIP TO
              </div>
              <div className="tn-body-sm" style={{ lineHeight: 1.65 }}>
                {order.shipping_address.line1}
                <br />
                {order.shipping_address.line2 && (
                  <>
                    {order.shipping_address.line2}
                    <br />
                  </>
                )}
                {order.shipping_address.city}, {order.shipping_address.province}{" "}
                {order.shipping_address.postal_code}
              </div>
              {order.shipping_etd && (
                <div className="tn-label-mono" style={{ fontSize: 11, marginTop: 12 }}>
                  ETD · {order.shipping_etd}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AdminShell>
  );
}

function Pair({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="tn-label-mono" style={{ fontSize: 11, marginBottom: 2 }}>
        {k.toUpperCase()}
      </div>
      <div style={{ color: "var(--ink-soft)" }}>{v}</div>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  if (!id) return null;
  return (
    <AdminGuard>
      {(session, { isDemo }) => <OrderDetailView session={session} id={id} isDemo={isDemo} />}
    </AdminGuard>
  );
}
