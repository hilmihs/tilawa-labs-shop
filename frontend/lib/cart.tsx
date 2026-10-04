"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { CartItem, Product } from "@/types/api";
import { SESSION_CLEARED_EVENT } from "@/lib/session";
import { registerMockProductHint } from "@/lib/mock-checkout";

type CartState = {
  items: CartItem[];
  hydrated: boolean;
};

type CartAction =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; product: Product; quantity?: number }
  | { type: "setQuantity"; productId: number; quantity: number }
  | { type: "remove"; productId: number }
  | { type: "clear" };

type CartContextValue = CartState & {
  addItem: (product: Product, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "storefront.cart.v1";

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items, hydrated: true };
    case "add": {
      const quantity = action.quantity ?? 1;
      const existing = state.items.find((item) => item.product.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.product.id === action.product.id
              ? { ...item, quantity: Math.min(item.quantity + quantity, item.product.stock) }
              : item
          )
        };
      }

      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: Math.min(quantity, action.product.stock) }]
      };
    }
    case "setQuantity":
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((item) => item.product.id !== action.productId) };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.productId
            ? { ...item, quantity: Math.min(action.quantity, item.product.stock) }
            : item
        )
      };
    case "remove":
      return { ...state, items: state.items.filter((item) => item.product.id !== action.productId) };
    case "clear":
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], hydrated: false });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      dispatch({ type: "hydrate", items: raw ? JSON.parse(raw) : [] });
    } catch {
      dispatch({ type: "hydrate", items: [] });
    }
  }, []);

  useEffect(() => {
    if (state.hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    }
  }, [state.hydrated, state.items]);

  // Wipe cart when the session is cleared (sign-out), regardless of role.
  useEffect(() => {
    const onCleared = () => dispatch({ type: "clear" });
    window.addEventListener(SESSION_CLEARED_EVENT, onCleared);
    return () => window.removeEventListener(SESSION_CLEARED_EVENT, onCleared);
  }, []);

  // Keep the mock-checkout module aware of current cart products so a dummy
  // checkout can record product names + prices in the saved order.
  useEffect(() => {
    registerMockProductHint(
      state.items.map((i) => ({ id: i.product.id, name: i.product.name, price: i.product.price }))
    );
  }, [state.items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      ...state,
      subtotal,
      totalItems,
      addItem: (product, quantity) => dispatch({ type: "add", product, quantity }),
      setQuantity: (productId, quantity) => dispatch({ type: "setQuantity", productId, quantity }),
      removeItem: (productId) => dispatch({ type: "remove", productId }),
      clearCart: () => dispatch({ type: "clear" })
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
