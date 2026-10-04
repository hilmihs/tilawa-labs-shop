"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Package, ShoppingBag, MessageCircle, Store, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { useSession } from "@/lib/session";
import { Wordmark } from "@/components/design";
import { RouteGuard } from "@/components/RouteGuard";

const NAV = [
  { href: "/seller", label: "Dashboard", Icon: BarChart3, match: (p: string) => p === "/seller" },
  { href: "/seller/orders", label: "Orders", Icon: Package, match: (p: string) => p.startsWith("/seller/orders") },
  { href: "/seller/products", label: "Products", Icon: ShoppingBag, match: (p: string) => p.startsWith("/seller/products") },
  { href: "/seller/messages", label: "Messages", Icon: MessageCircle, match: (p: string) => p.startsWith("/seller/messages") }
];

export function SellerShell({
  title,
  subtitle,
  action,
  children
}: {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <RouteGuard allow={["seller"]} fallback="/seller/login">
      <SellerShellInner title={title} subtitle={subtitle} action={action}>
        {children}
      </SellerShellInner>
    </RouteGuard>
  );
}

function SellerShellInner({
  title,
  subtitle,
  action,
  children
}: {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { session, signOut } = useSession();
  if (session.role !== "seller") return null;

  const name = session.name;
  const shopSlug = session.shopSlug;
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function logout() {
    signOut();
    router.push("/");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--page)",
        display: "grid",
        gridTemplateColumns: "240px 1fr"
      }}
      className="seller-shell"
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
        className="seller-sidebar"
      >
        <Link href="/seller">
          <Wordmark size={20} />
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
            color: "var(--terracotta)"
          }}
        >
          <Store size={12} />
          <span className="tn-label-mono" style={{ fontSize: 10 }}>
            SELLER PORTAL
          </span>
        </div>

        <div className="tn-eyebrow" style={{ marginTop: 28, marginBottom: 10 }}>
          OPERATIONS
        </div>
        <nav style={{ display: "grid", gap: 2 }}>
          {NAV.map(({ href, label, Icon, match }) => {
            const active = match(pathname);
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
                  background: active ? "var(--terracotta)" : "transparent",
                  color: active ? "var(--paper)" : "var(--ink-soft)"
                }}
              >
                <Icon size={15} /> <span style={{ flex: 1 }}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="tn-eyebrow" style={{ marginTop: 28, marginBottom: 10 }}>
          PUBLIC
        </div>
        <Link
          href={`/sellers/${shopSlug}`}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "8px 10px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 4,
            fontSize: 13,
            color: "var(--ink-soft)"
          }}
        >
          <ExternalLink size={15} /> <span style={{ flex: 1 }}>Your storefront</span>
        </Link>

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
                background: "var(--terracotta)",
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
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {name}
              </div>
              <div className="tn-label-mono" style={{ fontSize: 10 }}>
                @{shopSlug}
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
          .seller-shell { grid-template-columns: 1fr !important; }
          .seller-sidebar { position: static !important; height: auto !important; }
        }
      `}</style>
    </div>
  );
}
