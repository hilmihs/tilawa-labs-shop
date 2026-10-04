"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Plus, Star, MapPin, Truck } from "lucide-react";
import { formatCurrency } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { useToast } from "@/lib/toast";
import { useWishlist } from "@/lib/wishlist";
import type { Product } from "@/types/api";
import { PlaceImg, pickTint } from "@/components/design";
import {
  getSeller,
  getRating,
  getSold,
  getOriginalPrice,
  getTag,
  isFreeShipping,
  formatSold
} from "@/lib/marketplace";

export function ProductCard({ product, tag }: { product: Product; tag?: string }) {
  const image = product.images[0]?.url ?? null;
  const tint = pickTint(product.id);
  const lowStock = product.stock > 0 && product.stock < 6;
  const { addItem } = useCart();
  const { push } = useToast();
  const { has: wishlistHas, toggle: wishlistToggle } = useWishlist();
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  // Wishlist state hydrates from localStorage post-mount. Force the heart to
  // render in its "not saved" state on the server and first client render so
  // hydration markup matches; the real state lands on the next paint.
  const saved = hasMounted && wishlistHas(product.id);

  const seller = getSeller(product);
  const rating = getRating(product);
  const sold = getSold(product);
  const original = getOriginalPrice(product);
  const computedTag = tag ?? getTag(product);
  const freeShip = isFreeShipping(product);

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.stock) return;
    addItem(product, 1);
    push({
      message: `${product.name} added to your cart.`,
      href: "/cart",
      cta: "View",
      tone: "success"
    });
  }

  return (
    <article
      className="tn-card tn-card-hover"
      style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      <div style={{ position: "relative" }}>
        <Link href={`/products/${product.slug}`} style={{ display: "block" }}>
          <div
            className="tn-img-zoom"
            style={{ aspectRatio: "4/5", position: "relative", background: "var(--paper-soft)" }}
          >
            {image ? (
              <Image
                src={image}
                alt={product.images[0]?.alt_text ?? product.name}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <PlaceImg label={product.name} tint={tint} ratio="4/5" style={{ height: "100%" }} />
            )}
          </div>
          {computedTag && (
            <span
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                background: "var(--paper)",
                color: "var(--ink)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "5px 9px",
                border: "1px solid var(--line)"
              }}
            >
              {computedTag}
            </span>
          )}
          {freeShip && (
            <span
              style={{
                position: "absolute",
                bottom: 12,
                left: 12,
                background: "var(--ink)",
                color: "var(--paper)",
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "5px 9px",
                borderRadius: 2,
                display: "inline-flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <Truck size={10} /> Free shipping
            </span>
          )}
        </Link>
        <button
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={saved}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            wishlistToggle(product.id);
            push({
              message: saved
                ? `${product.name} removed from wishlist.`
                : `${product.name} saved to wishlist.`,
              tone: saved ? "default" : "success"
            });
          }}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 34,
            height: 34,
            borderRadius: 999,
            background: saved ? "var(--terracotta)" : "rgba(250,246,238,0.85)",
            border: `1px solid ${saved ? "var(--terracotta)" : "var(--line)"}`,
            backdropFilter: "blur(6px)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: saved ? "var(--paper)" : "var(--ink)",
            transition: "background .2s ease, color .2s ease, border-color .2s ease",
            zIndex: 1
          }}
        >
          <Heart size={15} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 6 }}>
        <Link
          href={`/sellers/${seller.slug}`}
          className="tn-label-mono"
          style={{
            fontSize: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            color: "var(--muted)"
          }}
        >
          {seller.name.toUpperCase()}
          {seller.verified && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "var(--terracotta)",
                color: "var(--paper)",
                fontSize: 8,
                fontWeight: 700
              }}
              aria-label="Verified seller"
            >
              ✓
            </span>
          )}
        </Link>
        <Link href={`/products/${product.slug}`}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              lineHeight: 1.1,
              fontStyle: "italic"
            }}
          >
            {product.name}
          </h3>
        </Link>
        <div
          style={{
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
            flexWrap: "wrap"
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <Star size={11} fill="var(--terracotta)" stroke="var(--terracotta)" strokeWidth={1} />
            <span style={{ color: "var(--ink)" }}>{rating.score.toFixed(1)}</span>
          </span>
          <span>·</span>
          <span>{formatSold(sold)} sold</span>
          <span>·</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <MapPin size={10} /> {seller.city}
          </span>
        </div>
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap"
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span className="tn-price" style={{ fontSize: 15 }}>
              {formatCurrency(product.price)}
            </span>
            {original && (
              <span
                className="tn-price"
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  textDecoration: "line-through"
                }}
              >
                {formatCurrency(original)}
              </span>
            )}
          </div>
          <span className="tn-label-mono" style={{ fontSize: 11 }}>
            {product.stock === 0 ? "Out of stock" : lowStock ? `Only ${product.stock} left` : "In stock"}
          </span>
        </div>
        <button
          onClick={quickAdd}
          disabled={!product.stock}
          className="tn-btn tn-btn-sm"
          style={{ marginTop: 14, width: "100%" }}
        >
          <Plus size={14} /> {product.stock ? "Add to cart" : "Sold out"}
        </button>
      </div>
    </article>
  );
}
