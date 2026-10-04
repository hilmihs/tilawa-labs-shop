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

const STORAGE_KEY = "storefront.addresses.v1";

export type Address = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault?: boolean;
};

export type AddressInput = Omit<Address, "id" | "isDefault">;

type AddressesContextValue = {
  addresses: Address[];
  add: (input: AddressInput) => Address;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
  count: number;
};

const AddressesContext = createContext<AddressesContextValue | null>(null);

function isAddress(value: unknown): value is Address {
  if (!value || typeof value !== "object") return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.id === "string" &&
    typeof a.label === "string" &&
    typeof a.recipient === "string" &&
    typeof a.phone === "string" &&
    typeof a.line1 === "string" &&
    typeof a.city === "string" &&
    typeof a.province === "string" &&
    typeof a.postalCode === "string"
  );
}

function load(): Address[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isAddress) : [];
  } catch {
    return [];
  }
}

function persist(list: Address[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota / private browsing
  }
}

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function AddressesProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    setAddresses(load());
  }, []);

  useEffect(() => {
    const onCleared = () => {
      setAddresses([]);
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

  const add = useCallback<AddressesContextValue["add"]>((input) => {
    const created: Address = { id: makeId(), ...input };
    let saved = created;
    setAddresses((prev) => {
      const next = [...prev, created];
      if (next.length === 1) {
        next[0] = { ...next[0], isDefault: true };
        saved = next[0];
      }
      persist(next);
      return next;
    });
    return saved;
  }, []);

  const remove = useCallback<AddressesContextValue["remove"]>((id) => {
    setAddresses((prev) => {
      const removed = prev.find((a) => a.id === id);
      let next = prev.filter((a) => a.id !== id);
      if (removed?.isDefault && next.length > 0) {
        next = next.map((a, i) => ({ ...a, isDefault: i === 0 }));
      }
      persist(next);
      return next;
    });
  }, []);

  const setDefault = useCallback<AddressesContextValue["setDefault"]>((id) => {
    setAddresses((prev) => {
      const next = prev.map((a) => ({ ...a, isDefault: a.id === id }));
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo<AddressesContextValue>(
    () => ({ addresses, add, remove, setDefault, count: addresses.length }),
    [addresses, add, remove, setDefault]
  );

  return (
    <AddressesContext.Provider value={value}>{children}</AddressesContext.Provider>
  );
}

export function useAddresses(): AddressesContextValue {
  const ctx = useContext(AddressesContext);
  if (!ctx) throw new Error("useAddresses must be used inside AddressesProvider");
  return ctx;
}
