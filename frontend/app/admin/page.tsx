"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3 } from "lucide-react";
import { AdminGuard, DemoModeBanner } from "@/components/AdminGuard";
import { AdminShell } from "@/components/AdminShell";
import { adminApi, formatCurrency } from "@/lib/api";
import type { AdminSession, OrderSummary, Product } from "@/types/api";
import { PlaceImg, pickTint } from "@/components/design";

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

function Sparkline({ data, color = "var(--ink)" }: { data: number[]; color?: string }) {
  const w = 80;
  const h = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data
    .map((v, i) => {
      const x = (i / Math.max(1, data.length - 1)) * w;
      const y = h - ((v - min) / Math.max(1, max - min)) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          height: 180,
          padding: "0 4px",
          borderBottom: "1px solid var(--line)"
        }}
      >
        {data.map((v, i) => (
          <div
            key={i}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}
          >
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
              <div
                style={{
                  width: "100%",
                  height: `${(v / max) * 100}%`,
                  background: i === data.length - 1 ? "var(--terracotta)" : "var(--ink)",
                  opacity: i === data.length - 1 ? 1 : 0.85
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.06em"
        }}
      >
        <span>14 days ago</span>
        <span>1 week ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function Dashboard({ session, isDemo }: { session: AdminSession; isDemo: boolean }) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    // Defer locale-formatted date to client to avoid SSR/client timezone mismatch.
    setToday(todayLabel());
  }, []);

  useEffect(() => {
    // In demo mode the backend token is a stub; calling adminApi would 401.
    // The dashboard then renders with zero data — KPIs show 0, recent lists
    // are empty. The banner explains why.
    if (isDemo) return;
    Promise.all([adminApi.orders(session.token), adminApi.products(session.token)])
      .then(([o, p]) => {
        setOrders(o);
        setProducts(p);
      })
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : "Couldn't load the dashboard.")
      );
  }, [session.token, isDemo]);

  const kpis = useMemo(() => {
    const totalRev = orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + o.total, 0);
    const pending = orders.filter((o) => o.payment_status === "pending").length;
    const paid = orders.filter((o) => o.payment_status === "paid").length;
    const avg = orders.length ? Math.round(orders.reduce((s, o) => s + o.total, 0) / orders.length) : 0;
    const lowStock = products.filter((p) => p.stock < 6).length;
    return { totalRev, pending, paid, avg, lowStock, totalOrders: orders.length };
  }, [orders, products]);

  const sparkOrders = useMemo(() => {
    // simple deterministic spark from current orders count
    const base = Math.max(1, orders.length);
    return [base * 0.7, base * 0.5, base * 0.8, base, base * 0.9, base * 1.1, base];
  }, [orders.length]);

  const sparkRevenue = useMemo(() => [3, 5, 4, 7, 8, 6, 9], []);

  const barData = useMemo(() => {
    // distribute orders/revenue over 14 days fake distribution
    const total = kpis.totalRev || 1;
    return [4.2, 5.1, 3.8, 6.4, 4.9, 5.6, 7.8, 6.1, 5.4, 7.2, 8.4, 6.8, 7.6, 9.2].map(
      (v) => (v / 10) * (total / 1_000_000 || 1)
    );
  }, [kpis.totalRev]);

  const topProducts = products.slice(0, 5);
  const recentOrders = orders.slice(0, 6);

  return (
    <AdminShell
      subtitle={today}
      title={
        <>
          Welcome,{" "}
          <em style={{ fontStyle: "italic" }}>{session.user.name.split(" ")[0]}</em>.
        </>
      }
      action={
        <Link href="/admin/products" className="tn-btn">
          + New product
        </Link>
      }
    >
      {isDemo && <DemoModeBanner />}
      {error && (
        <div
          style={{
            padding: 12,
            marginBottom: 20,
            border: "1px solid var(--warning)",
            background: "var(--paper-soft)",
            color: "var(--warning)",
            fontSize: 14
          }}
        >
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 32
        }}
        className="kpi-grid"
      >
        {[
          {
            l: "Revenue · all-time",
            v: formatCurrency(kpis.totalRev),
            d: `from ${kpis.paid} paid orders`,
            tone: "var(--success)",
            spark: sparkRevenue
          },
          {
            l: "New orders",
            v: String(kpis.pending),
            d: "awaiting payment",
            tone: "var(--terracotta)",
            spark: sparkOrders
          },
          {
            l: "Average basket",
            v: formatCurrency(kpis.avg),
            d: "per order",
            tone: "var(--muted)",
            spark: [6, 7, 6, 7, 7, 6, 7]
          },
          {
            l: "Low stock",
            v: String(kpis.lowStock),
            d: kpis.lowStock > 0 ? "items with < 6 left" : "All stock healthy",
            tone: kpis.lowStock > 0 ? "var(--danger)" : "var(--success)",
            spark: [9, 8, 7, 6, 5, 5, 5]
          }
        ].map((k) => (
          <div key={k.l} className="tn-card" style={{ padding: 22 }}>
            <div className="tn-label-mono" style={{ fontSize: 11, marginBottom: 10 }}>
              {k.l.toUpperCase()}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 10,
                gap: 12
              }}
            >
              <span style={{ fontFamily: "var(--font-display)", fontSize: 32, lineHeight: 1 }}>
                {k.v}
              </span>
              <Sparkline data={k.spark} color={k.tone} />
            </div>
            <div className="tn-body-sm" style={{ color: k.tone }}>
              {k.d}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + top */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 32 }}
        className="chart-grid"
      >
        <div className="tn-card" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 18,
              flexWrap: "wrap",
              gap: 12
            }}
          >
            <h3 className="tn-display-5">
              Revenue <em style={{ fontStyle: "italic" }}>distribution</em>
            </h3>
            <div style={{ display: "flex", gap: 6 }}>
              <span className="tn-chip tn-chip-active">14 days</span>
              <span className="tn-chip">30 days</span>
              <span className="tn-chip">YTD</span>
            </div>
          </div>
          <BarChart data={barData} />
        </div>

        <div className="tn-card" style={{ padding: 24 }}>
          <h3 className="tn-display-5" style={{ marginBottom: 18 }}>
            Top <em style={{ fontStyle: "italic" }}>products</em>
          </h3>
          {topProducts.length === 0 && (
            <p className="tn-body-sm">No product data yet.</p>
          )}
          {topProducts.map((p, i) => {
            const image = p.images[0]?.url;
            const tint = pickTint(p.id);
            return (
              <div
                key={p.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "24px 40px 1fr auto",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: i < topProducts.length - 1 ? "1px solid var(--line-soft)" : "none",
                  alignItems: "center"
                }}
              >
                <span className="tn-num">{String(i + 1).padStart(2, "0")}</span>
                <div style={{ width: 40, height: 40, position: "relative", background: "var(--paper-soft)" }}>
                  {image ? (
                    <Image src={image} alt={p.name} fill style={{ objectFit: "cover" }} />
                  ) : (
                    <PlaceImg tint={tint} ratio="1/1" style={{ height: "100%" }} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontStyle: "italic", fontFamily: "var(--font-display)" }}>
                    {p.name}
                  </div>
                  <div className="tn-body-sm" style={{ fontSize: 11 }}>
                    Stock {p.stock}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="tn-price" style={{ fontSize: 13 }}>
                    {formatCurrency(p.price)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent orders */}
      <div className="tn-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "22px 24px 16px"
          }}
        >
          <h3 className="tn-display-5">
            Latest <em style={{ fontStyle: "italic" }}>orders</em>
          </h3>
          <Link href="/admin/orders" className="tn-btn-link" style={{ fontSize: 13 }}>
            All orders <ArrowRight size={13} style={{ display: "inline" }} />
          </Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 720 }}>
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
                {["Number", "Status", "Payment", "Total", ""].map((h, i) => (
                  <th
                    key={i}
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
              {recentOrders.map((o, i) => (
                <tr
                  key={o.id}
                  style={{
                    borderBottom: i < recentOrders.length - 1 ? "1px solid var(--line-soft)" : "none"
                  }}
                >
                  <td style={{ padding: "14px 24px" }}>
                    <span className="tn-price" style={{ fontSize: 12 }}>
                      {o.order_number}
                    </span>
                  </td>
                  <td style={{ padding: "14px 24px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "3px 10px",
                        borderRadius: 999,
                        background: "var(--paper-soft)",
                        border: "1px solid var(--line)",
                        fontSize: 12
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 999,
                          background: STATUS_COLOR[o.status] ?? "var(--muted)"
                        }}
                      />
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 24px", color: "var(--ink-soft)" }}>{o.payment_status}</td>
                  <td style={{ padding: "14px 24px" }}>
                    <span className="tn-price">{formatCurrency(o.total)}</span>
                  </td>
                  <td style={{ padding: "14px 24px", textAlign: "right" }}>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="tn-btn-link"
                      style={{ fontSize: 12 }}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && !error && (
                <tr>
                  <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
                    <BarChart3 size={20} style={{ marginBottom: 8 }} />
                    <br />
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .chart-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AdminShell>
  );
}

export default function AdminHomePage() {
  return (
    <AdminGuard>
      {(session, { isDemo }) => <Dashboard session={session} isDemo={isDemo} />}
    </AdminGuard>
  );
}
