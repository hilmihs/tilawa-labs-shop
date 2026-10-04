"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Package, MessageCircle, ArrowUpRight, ShoppingBag } from "lucide-react";
import { useSession } from "@/lib/session";
import { formatCurrency } from "@/lib/api";
import { Reveal } from "@/components/Reveal";
import { SellerShell } from "@/components/SellerShell";
import {
  getSellerOrders,
  getSellerProducts,
  unreadMessageCount,
  type SellerOrderRef,
  type SellerProduct
} from "@/lib/seller";

const ACTIVE_STATUSES = new Set(["pending", "paid", "packed"]);

export default function SellerDashboard() {
  return (
    <SellerShell title={<DashboardTitle />} subtitle="№ Dashboard">
      <SellerInner />
    </SellerShell>
  );
}

function DashboardTitle() {
  const { session } = useSession();
  const name = session.role === "seller" ? session.name : "";
  return (
    <>
      Welcome back, <em style={{ fontStyle: "italic" }}>{name}</em>.
    </>
  );
}

function SellerInner() {
  const { session } = useSession();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [orders, setOrders] = useState<SellerOrderRef[]>([]);
  const [unread, setUnread] = useState(0);

  const shop = session.role === "seller" ? session.shopSlug : "";

  useEffect(() => {
    if (!shop) return;
    getSellerProducts(shop).then(setProducts).catch(() => setProducts([]));
    getSellerOrders(shop).then(setOrders).catch(() => setOrders([]));
    setUnread(unreadMessageCount(shop));
  }, [shop]);

  const pendingOrders = useMemo(
    () => orders.filter((o) => ACTIVE_STATUSES.has(o.status)).slice(0, 4),
    [orders]
  );

  const stats = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recent = orders.filter((o) => {
      if (!o.created_at) return false;
      return new Date(o.created_at).getTime() >= thirtyDaysAgo;
    });
    const sales = recent.reduce((s, o) => s + o.seller_subtotal, 0);
    return {
      sales,
      orderCount: recent.length,
      productCount: products.length,
      pendingCount: pendingOrders.length
    };
  }, [orders, products.length, pendingOrders.length]);

  const myProducts = products.slice(0, 6);

  if (!shop) return null;

  return (
    <>
      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
          borderTop: "1px solid var(--ink)",
          marginBottom: 48
        }}
        className="seller-stats"
      >
        {[
          { l: "Sales (30d)", v: stats.sales > 0 ? formatCurrency(stats.sales) : "—" },
          { l: "Orders (30d)", v: String(stats.orderCount) },
          { l: "Products", v: String(stats.productCount) },
          { l: "Pending", v: String(stats.pendingCount) }
        ].map((s, i) => (
          <Reveal key={s.l} variant="up" delay={i * 60}>
            <div
              style={{
                padding: "24px 24px 24px 0",
                borderLeft: i ? "1px solid var(--line)" : "none",
                paddingLeft: i ? 24 : 0
              }}
            >
              <div className="tn-label-mono" style={{ fontSize: 11 }}>{s.l.toUpperCase()}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36, marginTop: 6 }}>{s.v}</div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Two columns: orders + products */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32 }} className="seller-cols">
        <Reveal variant="up">
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
              <div>
                <div className="tn-eyebrow" style={{ marginBottom: 8 }}>№ 01 · ORDERS</div>
                <h2 className="tn-display-4">Pending fulfillment</h2>
              </div>
              <Link href="/seller/orders" className="tn-btn-link" style={{ fontSize: 13 }}>
                View all
              </Link>
            </div>
            <div className="tn-card" style={{ overflow: "hidden" }}>
              {pendingOrders.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
                  Nothing pending. New orders show up here.
                </div>
              ) : (
                pendingOrders.map((o, i) => (
                  <div
                    key={o.order_number}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1.4fr 1fr auto",
                      padding: "16px 20px",
                      alignItems: "center",
                      gap: 12,
                      borderTop: i ? "1px solid var(--line-soft)" : "none"
                    }}
                  >
                    <div>
                      <div className="tn-price" style={{ fontSize: 13 }}>{o.order_number}</div>
                      <div className="tn-body-sm" style={{ fontSize: 11 }}>
                        {o.created_at
                          ? new Date(o.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13 }}>{o.customer_name}</div>
                      <div className="tn-body-sm" style={{ fontSize: 11 }}>{o.status}</div>
                    </div>
                    <div className="tn-price" style={{ fontSize: 13 }}>{formatCurrency(o.seller_subtotal)}</div>
                    <Link
                      href={`/seller/orders/${o.order_number}`}
                      className="tn-btn-link"
                      style={{ fontSize: 11 }}
                    >
                      Detail →
                    </Link>
                  </div>
                ))
              )}
            </div>
          </section>
        </Reveal>

        <Reveal variant="up" delay={100}>
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
              <div>
                <div className="tn-eyebrow" style={{ marginBottom: 8 }}>№ 02 · CATALOG</div>
                <h2 className="tn-display-4">My products</h2>
              </div>
              <Link href="/seller/products/new" className="tn-btn tn-btn-sm">+ Add product</Link>
            </div>
            <div className="tn-card" style={{ overflow: "hidden" }}>
              {myProducts.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
                  No products yet.{" "}
                  <Link href="/seller/products/new" className="tn-btn-link" style={{ fontSize: 12 }}>
                    Add your first product
                  </Link>
                  .
                </div>
              ) : (
                myProducts.map((p, i) => {
                  const isCustom = p.id < 0;
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto auto",
                        padding: "14px 18px",
                        alignItems: "center",
                        gap: 14,
                        borderTop: i ? "1px solid var(--line-soft)" : "none"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13 }}>{p.name}</div>
                        <div className="tn-body-sm" style={{ fontSize: 11 }}>{p.stock} in stock</div>
                      </div>
                      <div className="tn-price" style={{ fontSize: 13 }}>{formatCurrency(p.price)}</div>
                      {isCustom ? (
                        <Link
                          href={`/seller/products/${p.id}/edit`}
                          className="tn-btn-link"
                          style={{ fontSize: 11 }}
                        >
                          Edit
                        </Link>
                      ) : (
                        <span className="tn-body-sm" style={{ fontSize: 10, color: "var(--muted)" }}>
                          Catalog
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            {products.length > myProducts.length && (
              <div style={{ marginTop: 12, textAlign: "right" }}>
                <Link href="/seller/products" className="tn-btn-link" style={{ fontSize: 12 }}>
                  View all {products.length} products →
                </Link>
              </div>
            )}
          </section>
        </Reveal>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 48 }} className="seller-actions">
        {[
          {
            icon: Package,
            h: "Inventory",
            d: `${products.length} products · ${products.filter((p) => p.id < 0).length} custom.`,
            href: "/seller/products"
          },
          {
            icon: MessageCircle,
            h: "Messages",
            d: unread > 0 ? `${unread} unread customer message${unread === 1 ? "" : "s"}.` : "All caught up.",
            href: "/seller/messages"
          },
          {
            icon: ShoppingBag,
            h: "Your storefront",
            d: `View public shop at /sellers/${shop}`,
            href: `/sellers/${shop}`
          }
        ].map((a, i) => {
          const Icon = a.icon;
          return (
            <Reveal key={a.h} variant="up" delay={i * 80}>
              <Link
                href={a.href}
                className="tn-card tn-card-hover"
                style={{ display: "block", padding: 24, textDecoration: "none", color: "var(--ink)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Icon size={20} color="var(--terracotta)" strokeWidth={1.4} />
                  <ArrowUpRight size={16} color="var(--muted)" />
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontStyle: "italic", marginTop: 12, marginBottom: 6 }}>{a.h}</h3>
                <p className="tn-body-sm">{a.d}</p>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .seller-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .seller-cols { grid-template-columns: 1fr !important; }
          .seller-actions { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
