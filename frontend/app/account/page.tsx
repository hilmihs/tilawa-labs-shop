"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Heart, LogOut, ShoppingBag, ArrowRight, Plus, Trash2, Star, ChevronDown } from "lucide-react";
import { useSession } from "@/lib/session";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useAddresses, type AddressInput } from "@/lib/addresses";
import { Reveal } from "@/components/Reveal";
import { RouteGuard } from "@/components/RouteGuard";
import { ProductCard } from "@/components/ProductCard";
import { Stepper } from "@/components/design";
import { formatCurrency, getProducts } from "@/lib/api";
import { listMockOrders } from "@/lib/mock-checkout";
import type { OrderDetail, Product } from "@/types/api";

type OrderStatus = "Delivered" | "In transit" | "Paid" | "Awaiting payment";

type DisplayOrder = {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: number;
  carrier: string;
  trackingNumber: string;
  source: "real" | "demo";
};

const HISTORICAL_ORDERS: DisplayOrder[] = [
  {
    id: "TN-2026-0418",
    date: "May 14, 2026",
    status: "Delivered",
    total: 489_000,
    items: 2,
    carrier: "JNE REG",
    trackingNumber: "JNE1009458210",
    source: "demo"
  },
  {
    id: "TN-2026-0382",
    date: "Apr 28, 2026",
    status: "In transit",
    total: 1_245_000,
    items: 3,
    carrier: "J&T Express",
    trackingNumber: "JT9942011830",
    source: "demo"
  },
  {
    id: "TN-2026-0301",
    date: "Apr 06, 2026",
    status: "Delivered",
    total: 218_000,
    items: 1,
    carrier: "SiCepat REG",
    trackingNumber: "SC2245009100",
    source: "demo"
  }
];

const ORDER_STEPS = ["Order placed", "Paid", "Shipped", "Delivered"];

function stepForStatus(status: OrderStatus): number {
  if (status === "Delivered") return 4;
  if (status === "In transit") return 3;
  if (status === "Paid") return 2;
  return 1; // Awaiting payment
}

function toDisplayOrder(detail: OrderDetail): DisplayOrder {
  const itemCount = detail.items.reduce((sum, i) => sum + i.quantity, 0);
  const carrier = detail.shipping_courier
    ? `${detail.shipping_courier.toUpperCase()}${detail.shipping_service ? ` ${detail.shipping_service}` : ""}`
    : "—";
  const date = detail.created_at
    ? new Date(detail.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      })
    : "—";
  const status: OrderStatus =
    detail.payment_status === "paid" ? "Paid" : "Awaiting payment";
  return {
    id: detail.order_number,
    date,
    status,
    total: detail.total,
    items: itemCount,
    carrier,
    trackingNumber: detail.payment?.transaction_id ?? detail.order_number,
    source: "real"
  };
}

export default function AccountPage() {
  return (
    <RouteGuard allow={["user"]}>
      <AccountInner />
    </RouteGuard>
  );
}

function AccountInner() {
  const { session, signOut } = useSession();
  const { totalItems, subtotal } = useCart();
  const { ids: wishlistIds, count: wishlistCount } = useWishlist();
  const router = useRouter();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [realOrders, setRealOrders] = useState<DisplayOrder[]>([]);

  useEffect(() => {
    setRealOrders(listMockOrders().map(toDisplayOrder));
  }, []);

  const orders = useMemo(() => [...realOrders, ...HISTORICAL_ORDERS], [realOrders]);

  // RouteGuard guarantees session.role === "user" here.
  if (session.role !== "user") return null;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 40px 96px" }}>
      <Reveal variant="up">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <span className="tn-num">№ MEMBER</span>
          <span style={{ flex: 1, height: 1, background: "var(--ink)", maxWidth: 120 }} />
          <span className="tn-num">SINCE MAY MMXXVI</span>
        </div>
        <h1 className="tn-display-2" style={{ marginBottom: 8 }}>
          Hi, <em style={{ fontStyle: "italic" }}>{session.name.split(" ")[0]}</em>.
        </h1>
        <p className="tn-body" style={{ marginBottom: 40, maxWidth: 540 }}>
          Review your orders, manage shipping addresses, and save favorites from the studios you love.
        </p>
      </Reveal>

      {/* Stats strip */}
      <Reveal variant="up">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            borderTop: "1px solid var(--ink)",
            marginBottom: 56
          }}
          className="acct-stats"
        >
          {[
            { l: "Active cart", v: `${totalItems} items`, sub: subtotal ? formatCurrency(subtotal) : "Empty" },
            { l: "Orders", v: `${orders.length}`, sub: "Lifetime" },
            {
              l: "Wishlist",
              v: `${wishlistCount}`,
              sub: wishlistCount === 0 ? "Empty" : wishlistCount === 1 ? "Saved item" : "Saved items"
            }
          ].map((s, i) => (
            <div
              key={s.l}
              style={{
                padding: "24px 24px 24px 0",
                borderLeft: i ? "1px solid var(--line)" : "none",
                paddingLeft: i ? 24 : 0
              }}
            >
              <div className="tn-label-mono" style={{ fontSize: 11 }}>{s.l.toUpperCase()}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36, marginTop: 6 }}>{s.v}</div>
              <div className="tn-body-sm">{s.sub}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Orders */}
      <Reveal variant="up">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 18
          }}
        >
          <div>
            <div className="tn-eyebrow" style={{ marginBottom: 8 }}>№ 01 · ORDERS</div>
            <h2 className="tn-display-4">Recent purchases</h2>
          </div>
          <Link href="/cart" className="tn-btn-link" style={{ fontSize: 13 }}>
            Continue shopping <ArrowRight size={13} style={{ display: "inline" }} />
          </Link>
        </div>
        <div className="tn-card" style={{ overflow: "hidden" }}>
          {orders.map((o, i) => {
            const expanded = expandedOrderId === o.id;
            return (
              <div key={o.id} style={{ borderTop: i ? "1px solid var(--line-soft)" : "none" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1fr 1fr 1fr auto",
                    padding: "18px 22px",
                    alignItems: "center",
                    gap: 16
                  }}
                  className="order-row"
                >
                  <div>
                    <div className="tn-price" style={{ fontSize: 14 }}>{o.id}</div>
                    <div className="tn-body-sm" style={{ marginTop: 2 }}>{o.date}</div>
                  </div>
                  <div className="tn-body-sm">{o.items} items</div>
                  <div className="tn-price" style={{ fontSize: 14 }}>{formatCurrency(o.total)}</div>
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        padding: "4px 10px",
                        border: "1px solid var(--line)",
                        borderRadius: 999,
                        color: o.status === "Delivered" ? "var(--success)" : "var(--warning)"
                      }}
                    >
                      {o.status}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedOrderId(expanded ? null : o.id)}
                    aria-expanded={expanded}
                    aria-controls={`order-detail-${o.id}`}
                    className="tn-btn-link"
                    style={{
                      fontSize: 12,
                      background: "transparent",
                      border: 0,
                      padding: 0,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      color: "var(--ink)"
                    }}
                  >
                    {expanded ? "Hide" : "View"}
                    <ChevronDown
                      size={13}
                      style={{
                        transition: "transform .2s",
                        transform: expanded ? "rotate(180deg)" : "rotate(0)"
                      }}
                    />
                  </button>
                </div>
                {expanded && (
                  <div
                    id={`order-detail-${o.id}`}
                    style={{
                      padding: "20px 22px 26px",
                      background: "var(--paper-soft)",
                      borderTop: "1px solid var(--line-soft)"
                    }}
                  >
                    <div style={{ marginBottom: 18 }}>
                      <Stepper step={stepForStatus(o.status)} steps={ORDER_STEPS} />
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 18,
                        marginBottom: 18
                      }}
                      className="order-detail-grid"
                    >
                      <DetailField label="Carrier" value={o.carrier} />
                      <DetailField label="Tracking" value={o.trackingNumber} />
                      <DetailField
                        label="Items / Total"
                        value={`${o.items} · ${formatCurrency(o.total)}`}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Link href="/" className="tn-btn tn-btn-ghost">
                        Reorder similar
                      </Link>
                      {o.source === "real" && (
                        <Link href={`/payment/${o.id}`} className="tn-btn">
                          {o.status === "Awaiting payment" ? "Complete payment" : "View receipt"}
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* Saved addresses */}
      <SavedAddressesSection />

      {/* Wishlist */}
      <WishlistSection ids={wishlistIds} />

      {/* Quick actions */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 48 }}
        className="acct-actions"
      >
        {[
          {
            icon: ShoppingBag,
            h: "Active cart",
            d: `${totalItems} item${totalItems === 1 ? "" : "s"} waiting at checkout.`,
            href: "/cart"
          },
          {
            icon: MapPin,
            h: "Saved addresses",
            d: "Manage your default shipping address.",
            href: "#addresses"
          },
          {
            icon: Heart,
            h: "Wishlist",
            d:
              wishlistCount === 0
                ? "Save products for later."
                : `${wishlistCount} item${wishlistCount === 1 ? "" : "s"} saved.`,
            href: "#wishlist"
          }
        ].map((a, i) => {
          const Icon = a.icon;
          return (
            <Reveal key={a.h} variant="up" delay={i * 80}>
              <Link
                href={a.href}
                scroll={a.href.startsWith("#") ? false : undefined}
                onClick={(e) => {
                  if (a.href.startsWith("#")) {
                    e.preventDefault();
                    const id = a.href.slice(1);
                    document
                      .getElementById(id)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className="tn-card tn-card-hover"
                style={{
                  display: "block",
                  padding: 24,
                  textDecoration: "none",
                  color: "var(--ink)"
                }}
              >
                <Icon size={20} color="var(--terracotta)" strokeWidth={1.4} />
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 24,
                    fontStyle: "italic",
                    marginTop: 12,
                    marginBottom: 6
                  }}
                >
                  {a.h}
                </h3>
                <p className="tn-body-sm">{a.d}</p>
              </Link>
            </Reveal>
          );
        })}
      </div>

      {/* Sign out */}
      <div
        style={{
          marginTop: 56,
          paddingTop: 28,
          borderTop: "1px solid var(--line-soft)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div className="tn-body-sm">
          Signed in as <strong>{session.email}</strong>
        </div>
        <button
          onClick={() => {
            signOut();
            router.push("/");
          }}
          className="tn-btn tn-btn-ghost"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .acct-stats { grid-template-columns: 1fr !important; }
          .acct-actions { grid-template-columns: 1fr !important; }
          .order-row { grid-template-columns: 1fr 1fr !important; }
          .order-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="tn-label-mono" style={{ fontSize: 10, marginBottom: 4 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 13 }}>{value}</div>
    </div>
  );
}

function SavedAddressesSection() {
  const { addresses, add, remove, setDefault } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressInput>(emptyForm());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.recipient.trim() || !form.line1.trim() || !form.city.trim()) return;
    add(form);
    setForm(emptyForm());
    setShowForm(false);
  }

  return (
    <section id="addresses" style={{ marginTop: 64, scrollMarginTop: 96 }}>
      <Reveal variant="up">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 18,
            flexWrap: "wrap",
            gap: 12
          }}
        >
          <div>
            <div className="tn-eyebrow" style={{ marginBottom: 8 }}>№ 02 · ADDRESSES</div>
            <h2 className="tn-display-4">Shipping book</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="tn-btn tn-btn-ghost"
          >
            <Plus size={14} /> {showForm ? "Cancel" : "Add address"}
          </button>
        </div>

        {addresses.length === 0 && !showForm && (
          <div
            className="tn-card"
            style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}
          >
            No addresses saved yet. Add one to speed up checkout.
          </div>
        )}

        {addresses.length > 0 && (
          <div className="tn-card" style={{ overflow: "hidden" }}>
            {addresses.map((a, i) => (
              <div
                key={a.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 2fr auto",
                  gap: 16,
                  padding: "18px 22px",
                  alignItems: "center",
                  borderTop: i ? "1px solid var(--line-soft)" : "none"
                }}
                className="addr-row"
              >
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontSize: 20
                    }}
                  >
                    {a.label}
                    {a.isDefault && (
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          padding: "2px 8px",
                          border: "1px solid var(--ink)",
                          borderRadius: 999,
                          color: "var(--ink)"
                        }}
                      >
                        Default
                      </span>
                    )}
                  </div>
                  <div className="tn-body-sm" style={{ marginTop: 4 }}>
                    {a.recipient} · {a.phone}
                  </div>
                </div>
                <div className="tn-body-sm">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.province} {a.postalCode}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {!a.isDefault && (
                    <button
                      type="button"
                      onClick={() => setDefault(a.id)}
                      className="tn-btn-link"
                      style={{
                        fontSize: 12,
                        background: "transparent",
                        border: 0,
                        padding: 0,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        color: "var(--ink)"
                      }}
                    >
                      <Star size={13} /> Make default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    aria-label={`Remove ${a.label}`}
                    className="tn-btn-link"
                    style={{
                      fontSize: 12,
                      background: "transparent",
                      border: 0,
                      padding: 0,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      color: "var(--danger)"
                    }}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="tn-card"
            style={{ padding: 24, marginTop: addresses.length > 0 ? 16 : 0 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14
              }}
              className="addr-form-grid"
            >
              <FormField label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} placeholder="Home" />
              <FormField label="Recipient" value={form.recipient} onChange={(v) => setForm({ ...form, recipient: v })} placeholder="Full name" required />
              <FormField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+62 …" />
              <FormField label="Postal code" value={form.postalCode} onChange={(v) => setForm({ ...form, postalCode: v })} placeholder="12345" />
              <FormField label="Address line 1" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} placeholder="Street, number" required span={2} />
              <FormField label="Address line 2" value={form.line2 ?? ""} onChange={(v) => setForm({ ...form, line2: v })} placeholder="Apartment, suite (optional)" span={2} />
              <FormField label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Jakarta" required />
              <FormField label="Province" value={form.province} onChange={(v) => setForm({ ...form, province: v })} placeholder="DKI Jakarta" />
            </div>
            <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
              <button type="submit" className="tn-btn">Save address</button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm()); }}
                className="tn-btn tn-btn-ghost"
              >
                Cancel
              </button>
            </div>
            <style>{`
              @media (max-width: 768px) {
                .addr-form-grid { grid-template-columns: 1fr !important; }
                .addr-row { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </form>
        )}
      </Reveal>
    </section>
  );
}

function emptyForm(): AddressInput {
  return {
    label: "Home",
    recipient: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    province: "",
    postalCode: ""
  };
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  required,
  span
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  span?: number;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: span ? `span ${span}` : undefined }}>
      <span className="tn-label-mono" style={{ fontSize: 10 }}>
        {label.toUpperCase()}{required ? " *" : ""}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="tn-input"
        style={{
          height: 44,
          padding: "0 14px",
          border: "1px solid var(--line)",
          borderRadius: 6,
          background: "var(--paper)",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--ink)"
        }}
      />
    </label>
  );
}

function WishlistSection({ ids }: { ids: Set<number> }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (ids.size === 0) {
      setProducts([]);
      return;
    }
    getProducts()
      .then((all) => {
        if (!cancelled) setProducts(all);
      })
      .catch((caught) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Couldn't load wishlist.");
      });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const saved = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => ids.has(p.id));
  }, [products, ids]);

  return (
    <section id="wishlist" style={{ marginTop: 64, scrollMarginTop: 96 }}>
      <Reveal variant="up">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 18,
            flexWrap: "wrap",
            gap: 12
          }}
        >
          <div>
            <div className="tn-eyebrow" style={{ marginBottom: 8 }}>№ 03 · WISHLIST</div>
            <h2 className="tn-display-4">
              Saved <em style={{ fontStyle: "italic" }}>for later</em>
            </h2>
          </div>
          <span className="tn-label-mono">
            {ids.size} {ids.size === 1 ? "item" : "items"}
          </span>
        </div>

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
        ) : ids.size === 0 ? (
          <div
            className="tn-card"
            style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}
          >
            <div style={{ marginBottom: 12 }}>Nothing saved yet.</div>
            <Link href="/" className="tn-btn">Browse products</Link>
          </div>
        ) : products === null ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 20
            }}
            className="wishlist-grid"
          >
            {Array.from({ length: Math.min(4, ids.size) }).map((_, i) => (
              <div key={i}>
                <div className="tn-skeleton" style={{ width: "100%", aspectRatio: "4/5", marginBottom: 16 }} />
                <div className="tn-skeleton" style={{ width: "40%", height: 11, marginBottom: 10 }} />
                <div className="tn-skeleton" style={{ width: "85%", height: 22, marginBottom: 14 }} />
                <div className="tn-skeleton" style={{ width: "50%", height: 14 }} />
              </div>
            ))}
          </div>
        ) : saved.length === 0 ? (
          <div
            className="tn-card"
            style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}
          >
            Wishlist items no longer available.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 20
            }}
            className="wishlist-grid"
          >
            {saved.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <style>{`
          @media (max-width: 1024px) {
            .wishlist-grid { grid-template-columns: repeat(3, 1fr) !important; }
          }
          @media (max-width: 640px) {
            .wishlist-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          }
        `}</style>
      </Reveal>
    </section>
  );
}
