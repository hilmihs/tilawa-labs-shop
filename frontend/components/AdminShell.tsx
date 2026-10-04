"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Package, ShoppingBag, Users, Sparkles, Truck, Banknote, ShieldCheck } from "lucide-react";
import { clearAdminSession, getAdminSession } from "@/lib/admin-session";
import { adminApi } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { AdminSession } from "@/types/api";
import { Wordmark } from "@/components/design";

const NAV_OPERATIONS = [
  { href: "/admin", label: "Dashboard", Icon: BarChart3 },
  { href: "/admin/orders", label: "Orders", Icon: Package },
  { href: "/admin/products", label: "Products", Icon: ShoppingBag },
  { href: "/admin/shipping", label: "Shipping", Icon: Truck },
  { href: "/admin/settings", label: "Settings", Icon: ShieldCheck }
];

const NAV_MANAGE = [
  { href: "/admin/settings#sellers", label: "Sellers", Icon: Users },
  { href: "/admin/settings#promotions", label: "Promotions", Icon: Sparkles },
  { href: "/admin/settings#payments", label: "Payments", Icon: Banknote }
];

export function AdminShell({
  title,
  subtitle,
  action,
  children
}: {
  title: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { session: unifiedSession, signOut: signOutUnified } = useSession();
  const [backendSession, setBackendSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    setBackendSession(getAdminSession());
  }, []);

  const name =
    backendSession?.user.name ??
    (unifiedSession.role === "admin" ? unifiedSession.name : "Admin");
  const role = backendSession?.user.role ?? "ADMIN";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function logout() {
    if (backendSession?.token && backendSession.token !== "demo") {
      try {
        await adminApi.logout(backendSession.token);
      } catch {
        // Network/401 — proceed with local sign-out anyway.
      }
    }
    clearAdminSession();
    signOutUnified();
    router.push("/admin/login");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--page)",
        display: "grid",
        gridTemplateColumns: "240px 1fr"
      }}
      className="admin-shell"
    >
      <aside
        style={{
          borderRight: "1px solid var(--line)",
          padding: "24px 20px",
          background: "var(--paper)",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto"
        }}
        className="admin-sidebar"
      >
        <Link href="/admin">
          <Wordmark size={20} />
        </Link>
        <div className="tn-eyebrow" style={{ marginTop: 28, marginBottom: 10 }}>
          OPERATIONS
        </div>
        <nav style={{ display: "grid", gap: 2 }}>
          {NAV_OPERATIONS.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderRadius: 4,
                  fontSize: 13,
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "var(--paper)" : "var(--ink-soft)"
                }}
              >
                <Icon size={15} /> <span style={{ flex: 1 }}>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="tn-eyebrow" style={{ marginTop: 28, marginBottom: 10 }}>
          MANAGE
        </div>
        <nav style={{ display: "grid", gap: 2 }}>
          {NAV_MANAGE.map(({ href, label, Icon }) => {
            const active = pathname === "/admin/settings";
            return (
              <Link
                key={href}
                href={href}
                onClick={(e) => {
                  // Same-page hash navigation: Next.js App Router doesn't reliably
                  // fire `hashchange` for <Link> to same pathname, so the in-page
                  // tab listener in /admin/settings never updates. Force it by
                  // mutating window.location.hash, which always emits hashchange.
                  if (pathname === "/admin/settings") {
                    e.preventDefault();
                    const targetHash = href.split("#")[1] ?? "";
                    if (window.location.hash === `#${targetHash}`) {
                      window.dispatchEvent(new HashChangeEvent("hashchange"));
                    } else {
                      window.location.hash = targetHash;
                    }
                  }
                }}
                style={{
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderRadius: 4,
                  fontSize: 13,
                  background: "transparent",
                  color: active ? "var(--ink)" : "var(--ink-soft)"
                }}
              >
                <Icon size={15} /> <span style={{ flex: 1 }}>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div
          style={{
            marginTop: 32,
            padding: 14,
            border: "1px solid var(--line)",
            borderRadius: 4,
            background: "var(--paper-soft)"
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background: "var(--ink)",
                color: "var(--paper)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 500
              }}
            >
              {initials}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
              <div className="tn-label-mono" style={{ fontSize: 10 }}>
                {role.toUpperCase()}
              </div>
            </div>
          </div>
          <button onClick={logout} className="tn-btn-link" style={{ fontSize: 12 }}>
            Sign out
          </button>
        </div>
      </aside>

      <div style={{ padding: "28px 36px 56px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 16
          }}
        >
          <div>
            {subtitle && (
              <div className="tn-label-mono" style={{ fontSize: 11 }}>
                {subtitle.toUpperCase()}
              </div>
            )}
            <h1 className="tn-display-3" style={{ marginTop: 4 }}>
              {title}
            </h1>
          </div>
          {action}
        </div>
        {children}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-shell { grid-template-columns: 1fr !important; }
          .admin-sidebar { position: static !important; height: auto !important; }
        }
      `}</style>
    </div>
  );
}
