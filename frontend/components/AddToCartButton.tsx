"use client";

import { Minus, Plus, Heart } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { useToast } from "@/lib/toast";
import { useWishlist } from "@/lib/wishlist";
import type { Product } from "@/types/api";

export function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { push } = useToast();
  const { has, toggle } = useWishlist();
  const saved = has(product.id);
  const disabled = !product.stock;

  function handleAdd() {
    addItem(product, quantity);
    push({
      message: `${product.name} added to your cart.`,
      href: "/cart",
      cta: "View",
      tone: "success"
    });
  }

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          border: "1px solid var(--line)",
          height: 56,
          borderRadius: 999,
          overflow: "hidden"
        }}
      >
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          style={{
            width: 52,
            height: 56,
            background: "transparent",
            border: 0,
            cursor: "pointer",
            color: "var(--ink)"
          }}
          aria-label="Decrease"
        >
          <Minus size={16} />
        </button>
        <span className="tn-price" style={{ minWidth: 28, textAlign: "center", fontSize: 15 }}>
          {quantity}
        </span>
        <button
          onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
          style={{
            width: 52,
            height: 56,
            background: "transparent",
            border: 0,
            cursor: "pointer",
            color: "var(--ink)"
          }}
          aria-label="Increase"
        >
          <Plus size={16} />
        </button>
      </div>
      <button
        className="tn-btn tn-btn-lg"
        style={{ flex: 1, minWidth: 240 }}
        disabled={disabled}
        onClick={handleAdd}
      >
        Add to cart · {formatCurrency(product.price * quantity)}
      </button>
      <button
        type="button"
        className="tn-btn tn-btn-ghost tn-btn-lg"
        style={{
          width: 56,
          padding: 0,
          background: saved ? "var(--terracotta)" : undefined,
          color: saved ? "var(--paper)" : undefined,
          borderColor: saved ? "var(--terracotta)" : undefined
        }}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={saved}
        onClick={() => {
          toggle(product.id);
          push({
            message: saved ? "Removed from wishlist." : "Saved to wishlist.",
            tone: saved ? "default" : "success"
          });
        }}
      >
        <Heart size={18} fill={saved ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
