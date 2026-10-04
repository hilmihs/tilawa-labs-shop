"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { PlaceImg, SumRow, pickTint } from "@/components/design";
import { RouteGuard } from "@/components/RouteGuard";
import { getSeller } from "@/lib/marketplace";

export default function CartPage() {
  return (
    <RouteGuard allow={["guest", "user"]}>
      <CartInner />
    </RouteGuard>
  );
}

function CartInner() {
  const { items, subtotal, setQuantity, removeItem, totalItems } = useCart();
  const totalWeight = items.reduce((s, i) => s + (i.product.weight_grams ?? 0) * i.quantity, 0);

  return (
    <section style={{ padding: "56px 40px 80px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 40,
          flexWrap: "wrap",
          gap: 16
        }}
      >
        <div>
          <div className="tn-eyebrow" style={{ marginBottom: 12 }}>№ 01 · CART</div>
          <h1 className="tn-display-3">
            {totalItems === 0 ? (
              <>
                Your cart is <em style={{ fontStyle: "italic" }}>empty</em>.
              </>
            ) : (
              <>
                {totalItems} {totalItems === 1 ? "piece" : "pieces"}{" "}
                <em style={{ fontStyle: "italic" }}>waiting</em>.
              </>
            )}
          </h1>
        </div>
        <Link
          href="/"
          className="tn-btn-link"
          style={{ fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <ArrowLeft size={14} /> Continue shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div
          className="tn-card"
          style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}
        >
          Your cart is empty. Start browsing the{" "}
          <Link href="/" className="tn-btn-link">
            catalog
          </Link>
          .
        </div>
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 56 }}
          className="cart-grid"
        >
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "88px 1fr auto",
                gap: 18,
                padding: "12px 0",
                borderBottom: "1px solid var(--ink)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase"
              }}
            >
              <span />
              <span>Product</span>
              <span style={{ textAlign: "right" }}>Qty · Subtotal</span>
            </div>
            {items.map(({ product, quantity }) => {
              const image = product.images[0]?.url;
              const tint = pickTint(product.id);
              const seller = getSeller(product);
              return (
                <div
                  key={product.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "88px 1fr auto",
                    gap: 18,
                    padding: "16px 0",
                    alignItems: "center",
                    borderBottom: "1px solid var(--line)"
                  }}
                  className="cart-row"
                >
                  <div style={{ width: 88, height: 88, overflow: "hidden", position: "relative", background: "var(--paper-soft)" }}>
                    {image ? (
                      <Image src={image} alt={product.name} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <PlaceImg tint={tint} ratio="1/1" style={{ height: "100%" }} />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="tn-label-mono" style={{ fontSize: 10 }}>
                      {seller.name.toUpperCase()}
                    </div>
                    <Link href={`/products/${product.slug}`}>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontStyle: "italic",
                          fontSize: 20,
                          lineHeight: 1.1,
                          marginTop: 2
                        }}
                      >
                        {product.name}
                      </div>
                    </Link>
                    <div
                      className="tn-body-sm"
                      style={{ marginTop: 6, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}
                    >
                      <span className="tn-price" style={{ fontSize: 13 }}>
                        {formatCurrency(product.price)}
                      </span>
                      <span>·</span>
                      <span>{product.weight_grams} g</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        border: "1px solid var(--line)",
                        borderRadius: 999,
                        height: 36
                      }}
                    >
                      <button
                        onClick={() => setQuantity(product.id, quantity - 1)}
                        style={{ width: 36, height: 36, background: "transparent", border: 0, cursor: "pointer", color: "var(--ink)" }}
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="tn-price" style={{ minWidth: 22, textAlign: "center", fontSize: 13 }}>
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(product.id, quantity + 1)}
                        style={{ width: 36, height: 36, background: "transparent", border: 0, cursor: "pointer", color: "var(--ink)" }}
                        aria-label="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="tn-price" style={{ fontSize: 15, minWidth: 100, textAlign: "right" }}>
                      {formatCurrency(product.price * quantity)}
                    </span>
                    <button
                      className="tn-btn-link"
                      style={{ fontSize: 12 }}
                      onClick={() => removeItem(product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 28 }}>
              <div className="tn-eyebrow" style={{ marginBottom: 10 }}>
                Note to the maker
              </div>
              <textarea
                className="tn-input"
                rows={3}
                style={{ height: 88, padding: 14, resize: "none" }}
                placeholder="Optional · e.g., request the maker's signature on the wood tag."
              />
            </div>
          </div>

          <aside style={{ position: "sticky", top: 24, alignSelf: "start" }}>
            <div className="tn-card" style={{ padding: 24 }}>
              <h3 className="tn-display-5" style={{ marginBottom: 18 }}>
                Order <em style={{ fontStyle: "italic" }}>summary</em>
              </h3>
              <SumRow k={`Subtotal (${totalItems} ${totalItems === 1 ? "item" : "items"})`} v={formatCurrency(subtotal)} />
              <SumRow k="Shipping" v="Calculated at checkout" muted />
              <hr className="tn-hr" style={{ margin: "12px 0" }} />
              <SumRow k="Subtotal" v={formatCurrency(subtotal)} strong />
              <Link
                href="/checkout"
                className="tn-btn tn-btn-lg"
                style={{ width: "100%", marginTop: 18 }}
              >
                Proceed to checkout <ArrowRight size={16} />
              </Link>
              <div
                className="tn-body-sm"
                style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "flex-start" }}
              >
                <ShieldCheck size={16} strokeWidth={1.4} style={{ marginTop: 1, color: "var(--ink)" }} />
                <span>Checkout is secured by Midtrans Snap. Card details never touch our servers.</span>
              </div>
            </div>

            <div
              className="tn-card"
              style={{ padding: 18, marginTop: 20, background: "var(--paper-soft)" }}
            >
              <div className="tn-eyebrow" style={{ marginBottom: 8 }}>
                Shipping estimate
              </div>
              <div className="tn-body-sm">
                Total weight{" "}
                <span className="tn-price">
                  {new Intl.NumberFormat("en-US").format(totalWeight)} g
                </span>
                . Actual rates depend on destination city.
              </div>
            </div>
          </aside>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .cart-row { grid-template-columns: 64px 1fr !important; }
          .cart-row > div:last-child { grid-column: 1 / -1; justify-content: space-between; }
        }
      `}</style>
    </section>
  );
}
