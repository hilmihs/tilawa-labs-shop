"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Variant = "up" | "left" | "right" | "scale" | "clip";

const VARIANT_CLASS: Record<Variant, string> = {
  up: "tn-reveal",
  left: "tn-reveal tn-reveal-left",
  right: "tn-reveal tn-reveal-right",
  scale: "tn-reveal tn-reveal-scale",
  clip: "tn-clip-reveal"
};

/**
 * Shared IntersectionObserver — one per (threshold, rootMargin) pair, looked
 * up from a module-level cache. Avoids creating dozens of observers on the
 * homepage. Each Reveal subscribes via a callback indexed by its element.
 */
type Subscriber = (visible: boolean) => void;
const subs: WeakMap<Element, Subscriber> = new WeakMap();
const observers: Map<string, IntersectionObserver> = new Map();

function getObserver(threshold: number, rootMargin: string): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  const key = `${threshold}|${rootMargin}`;
  let ob = observers.get(key);
  if (!ob) {
    ob = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const cb = subs.get(entry.target);
          if (cb) cb(entry.isIntersecting);
        }
      },
      { threshold, rootMargin }
    );
    observers.set(key, ob);
  }
  return ob;
}

export function Reveal({
  children,
  as: As = "div",
  variant = "up",
  delay = 0,
  threshold = 0.12,
  once = false,
  className = "",
  style
}: {
  children: ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  variant?: Variant;
  delay?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Defensive: if element is already in viewport at mount, show immediately.
    const rect = node.getBoundingClientRect();
    const inView =
      rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom > 0;
    if (inView) {
      setVisible(true);
      if (once) return;
    }

    const observer = getObserver(threshold, "0px 0px -8% 0px");
    if (!observer) {
      // No IntersectionObserver support → show unconditionally.
      setVisible(true);
      return;
    }

    const cb: Subscriber = (isIntersecting) => {
      if (isIntersecting) {
        setVisible(true);
        if (once) {
          observer.unobserve(node);
          subs.delete(node);
        }
      } else if (!once) {
        setVisible(false);
      }
    };
    subs.set(node, cb);
    observer.observe(node);

    // Fallback safety only when `once` — repeat reveals self-correct.
    const fallback = once ? window.setTimeout(() => setVisible(true), 1500) : 0;

    return () => {
      observer.unobserve(node);
      subs.delete(node);
      if (fallback) window.clearTimeout(fallback);
    };
  }, [threshold, once]);

  const combined = `${VARIANT_CLASS[variant]} ${visible ? "is-visible" : ""} ${className}`.trim();
  const mergedStyle: CSSProperties = {
    transitionDelay: delay ? `${delay}ms` : undefined,
    ...style
  };

  return (
    // @ts-expect-error — dynamic tag name
    <As ref={ref} className={combined} style={mergedStyle}>
      {children}
    </As>
  );
}
