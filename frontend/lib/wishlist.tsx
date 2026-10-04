"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { SESSION_CLEARED_EVENT } from "@/lib/session";

const STORAGE_KEY = "storefront.wishlist.v1";

type WishlistContextValue = {
  ids: Set<number>;
  toggle: (productId: number) => void;
  has: (productId: number) => boolean;
  count: number;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function load(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === "number") : [];
  } catch {
    return [];
  }
}

function persist(ids: Set<number>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore (private browsing, quota etc.)
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    setIds(new Set(load()));
  }, []);

  // Reset on session sign-out alongside the cart.
  useEffect(() => {
    const onCleared = () => {
      setIds(new Set());
      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener(SESSION_CLEARED_EVENT, onCleared);
    return () => window.removeEventListener(SESSION_CLEARED_EVENT, onCleared);
  }, []);

  const toggle = useCallback((productId: number) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      persist(next);
      return next;
    });
  }, []);

  const has = useCallback((productId: number) => ids.has(productId), [ids]);

  const value = useMemo<WishlistContextValue>(
    () => ({ ids, toggle, has, count: ids.size }),
    [ids, toggle, has]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
