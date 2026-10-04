"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { getAdminSession } from "@/lib/admin-session";
import type { AdminSession } from "@/types/api";

/**
 * Auth guard for the /admin/* area.
 *
 * Render-prop signature so children can branch on `isDemo` — pages may want
 * to skip real backend calls (which would 401 with `token: "demo"`) and
 * render local mock data instead.
 */
export function AdminGuard({
  children
}: {
  children: (session: AdminSession, ctx: { isDemo: boolean }) => React.ReactNode;
}) {
  const { session, ready } = useSession();
  const [backendSession, setBackendSession] = useState<AdminSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer localStorage read to after mount so SSR & first client render match.
    setMounted(true);
    setBackendSession(getAdminSession());
  }, []);

  if (!mounted || !ready) {
    return (
      <div style={{ padding: 40, color: "var(--muted)", textAlign: "center" }}>
        Checking admin session…
      </div>
    );
  }

  if (session.role !== "admin") {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          padding: 40
        }}
      >
        <div className="tn-card" style={{ padding: 32, textAlign: "center", maxWidth: 420 }}>
          <h1 className="tn-display-4" style={{ marginBottom: 12 }}>
            <em style={{ fontStyle: "italic" }}>Admin</em> session required
          </h1>
          <p className="tn-body-sm" style={{ marginBottom: 20 }}>
            This area is restricted to Toko Nusa staff.
          </p>
          <Link className="tn-btn" href="/admin/login">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const isDemo = backendSession === null;
  const effective: AdminSession =
    backendSession ?? {
      token: "demo",
      user: { id: 0, name: session.name, email: session.email, role: "admin" }
    };

  return <>{children(effective, { isDemo })}</>;
}

/** Small banner admin pages can render at the top when isDemo is true. */
export function DemoModeBanner() {
  return (
    <div
      style={{
        margin: "16px 0",
        padding: "10px 16px",
        background: "var(--paper-soft)",
        border: "1px solid var(--warning)",
        borderRadius: 4,
        color: "var(--warning)",
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        gap: 10
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "2px 8px",
          background: "var(--warning)",
          color: "var(--paper)",
          borderRadius: 999
        }}
      >
        Demo
      </span>
      <span>
        Logged in with frontend-only demo credentials. Real backend data unavailable; showing local mock fixtures.
      </span>
    </div>
  );
}
