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

export type Role = "guest" | "user" | "seller" | "admin";

export type Session =
  | { role: "guest" }
  | { role: "user"; email: string; name: string; userId: string }
  | { role: "seller"; email: string; name: string; sellerId: string; shopSlug: string }
  | { role: "admin"; email: string; name: string };

const STORAGE_KEY = "storefront.session.v2";
const CART_STORAGE_KEY = "storefront.cart.v1";

const GUEST: Session = { role: "guest" };

/** True only in non-production builds. Demo credentials are gated by this. */
export const IS_DEV = process.env.NODE_ENV !== "production";

// Demo credentials — frontend-only auth for the prototype.
// Replace with real backend integration when the API is ready.
type DemoAccount = Exclude<Session, { role: "guest" }> & { password: string };

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "user",
    email: "user@toko.id",
    password: "user123",
    name: "Andi Pratama",
    userId: "u_001"
  },
  {
    role: "seller",
    email: "seller@toko.id",
    password: "seller123",
    name: "Studio Waingapu",
    sellerId: "s_001",
    shopSlug: "studio-waingapu"
  },
  {
    role: "admin",
    email: "admin@toko.id",
    password: "admin123",
    name: "Super Admin"
  }
];

/** Demo accounts shown on login pages only when allowed. */
export const VISIBLE_DEMO_ACCOUNTS = IS_DEV ? DEMO_ACCOUNTS : [];

type SessionContextValue = {
  session: Session;
  ready: boolean;
  signIn: (role: Role, email: string, password: string) => { ok: true } | { ok: false; error: string };
  register: (email: string, password: string, name: string) => { ok: true } | { ok: false; error: string };
  /** Used after backend already validated credentials (e.g. real admin login). Shape-validated. */
  trustSession: (s: Exclude<Session, { role: "guest" }>) => { ok: true } | { ok: false; error: string };
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

// Basic but practical email check — accepts non-ASCII local parts.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidSession(s: unknown): s is Session {
  if (!s || typeof s !== "object") return false;
  const role = (s as { role?: unknown }).role;
  if (role === "guest") return true;
  const obj = s as Record<string, unknown>;
  if (typeof obj.email !== "string" || typeof obj.name !== "string") return false;
  if (role === "user") return typeof obj.userId === "string";
  if (role === "seller") return typeof obj.sellerId === "string" && typeof obj.shopSlug === "string";
  if (role === "admin") return true;
  return false;
}

function loadSession(): Session {
  if (typeof window === "undefined") return GUEST;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return GUEST;
    const parsed = JSON.parse(raw);
    return isValidSession(parsed) ? parsed : GUEST;
  } catch {
    return GUEST;
  }
}

function persistSession(session: Session) {
  if (typeof window === "undefined") return;
  if (session.role === "guest") {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
}

/** Event name CartProvider listens for to reset its in-memory state on sign-out. */
export const SESSION_CLEARED_EVENT = "tn:session-cleared";

function clearCartStorage() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // localStorage may be unavailable in private browsing
  }
  try {
    window.dispatchEvent(new CustomEvent(SESSION_CLEARED_EVENT));
  } catch {
    // CustomEvent may be unsupported in very old environments
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(GUEST);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(loadSession());
    setReady(true);

    // Cross-tab sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSession(loadSession());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signIn = useCallback<SessionContextValue["signIn"]>((role, email, password) => {
    // In production builds, demo credentials cannot be used.
    if (!IS_DEV) {
      return { ok: false, error: "Authentication backend required." };
    }
    const e = email.trim().toLowerCase();
    const match = DEMO_ACCOUNTS.find(
      (a) => a.role === role && a.email.toLowerCase() === e && a.password === password
    );
    if (!match) {
      return { ok: false, error: "Email or password incorrect." };
    }
    const { password: _pw, ...rest } = match;
    void _pw;
    setSession(rest as Session);
    persistSession(rest as Session);
    return { ok: true };
  }, []);

  const register = useCallback<SessionContextValue["register"]>((email, password, name) => {
    const e = email.trim();
    const n = name.trim();
    if (!e || !password || !n) {
      return { ok: false, error: "Name, email, and password are all required." };
    }
    if (!EMAIL_RE.test(e)) {
      return { ok: false, error: "Please enter a valid email address." };
    }
    if (password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters." };
    }
    const newUser: Session = {
      role: "user",
      email: e,
      name: n,
      userId: `u_${Date.now().toString(36)}`
    };
    setSession(newUser);
    persistSession(newUser);
    return { ok: true };
  }, []);

  const trustSession = useCallback<SessionContextValue["trustSession"]>((s) => {
    // Defensive runtime guard — types restrict guest, but callers may pass
    // backend response data that hasn't been validated yet.
    const candidate = s as unknown;
    if (!isValidSession(candidate) || candidate.role === "guest") {
      return { ok: false, error: "Invalid session payload." };
    }
    setSession(candidate);
    persistSession(candidate);
    return { ok: true };
  }, []);

  const signOut = useCallback(() => {
    setSession(GUEST);
    persistSession(GUEST);
    clearCartStorage();
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ session, ready, signIn, register, trustSession, signOut }),
    [session, ready, signIn, register, trustSession, signOut]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}

export function roleLabel(role: Role): string {
  return role === "guest" ? "Guest" : role === "user" ? "Customer" : role === "seller" ? "Seller" : "Admin";
}

export function dashboardPath(role: Role): string {
  return role === "user" ? "/account" : role === "seller" ? "/seller" : role === "admin" ? "/admin" : "/login";
}
