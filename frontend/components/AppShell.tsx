"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag, Menu, X, User, LogIn, LogOut, Package } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useSession, dashboardPath, roleLabel } from "@/lib/session";
import { Wordmark } from "@/components/design";
import { UserMenu } from "@/components/UserMenu";
import { RouteTransition } from "@/components/RouteTransition";
import { NavigationProgress } from "@/components/NavigationProgress";

const NAV = [
  ["Shop", "/"],
  ["Textiles", "/?c=textiles#catalog"],
  ["Home", "/?c=home#catalog"],
  ["Pantry", "/?c=pantry#catalog"],
  ["Journal", "/jurnal"]
] as const;

type FooterLink = { label: string; href?: string };
type FooterCol = { h: string; items: FooterLink[] };

const FOOTER_COLS: FooterCol[] = [
  {
    h: "Shop",
    items: [
      { label: "All products", href: "/" },
      { label: "Search", href: "/search" },
      { label: "Textiles", href: "/?c=textiles" },
      { label: "Pantry", href: "/?c=pantry" }
    ]
  },
  {
    h: "Help",
    items: [
      { label: "Shipping" },
      { label: "Returns" },
      { label: "Order tracking" },
      { label: "Contact" }
    ]
  },
  {
    h: "Stories",
    items: [
      { label: "Journal", href: "/jurnal" },
      { label: "Makers" },
      { label: "About" }
    ]
  },
  {
    h: "Account",
    items: [
      { label: "Sign in", href: "/login" },
      { label: "Register", href: "/register" },
      { label: "My orders", href: "/account" },
      { label: "Seller portal", href: "/seller/login" }
    ]
  }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { totalItems } = useCart();
  const [hasMounted, setHasMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const minimal =
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/payment") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/seller");

  // Deferred scroll target — set on nav click, executed once the new URL commits
  // so the chip + filtered grid are already in the DOM before we scroll.
  const pendingScrollRef = useRef<{ id: string | null; toTop: boolean } | null>(
    null
  );
  const prevPathRef = useRef<string | null>(null);
  const searchKey = searchParams?.toString() ?? "";

  useEffect(() => {
    const job = pendingScrollRef.current;
    pendingScrollRef.current = null;
    const prev = prevPathRef.current;
    prevPathRef.current = pathname ?? null;
    if (!job) return;
    requestAnimationFrame(() => {
      if (job.id) {
        document
          .getElementById(job.id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (job.toTop && prev !== pathname) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }, [pathname, searchKey]);

  // Single source of route fade — wraps `children` once regardless of mode.
  const animatedChildren = <RouteTransition>{children}</RouteTransition>;

  if (minimal) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
        <NavigationProgress />
        {animatedChildren}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <NavigationProgress />
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onNavLinkClick={(href) => {
          const hashIdx = href.indexOf("#");
          const hasHash = hashIdx >= 0;
          pendingScrollRef.current = {
            id: hasHash ? href.slice(hashIdx + 1) : null,
            toTop: !hasHash
          };
        }}
      />
      <header style={{ borderBottom: "1px solid var(--line)", background: "var(--paper)" }}>
        {/* Marquee strip */}
        <div
          className="tn-marquee-mask"
          style={{
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "8px 0",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase"
          }}
        >
          <div className="tn-marquee">
            {Array.from({ length: 2 }).map((_, dup) => (
              <div
                key={dup}
                style={{ display: "flex", gap: 40, alignItems: "center", paddingInline: 20 }}
                aria-hidden={dup === 1}
              >
                <span>Free shipping in Jakarta on orders over Rp 350,000</span>
                <span style={{ opacity: 0.4 }}>✦</span>
                <span>Curated from 12 islands across the archipelago</span>
                <span style={{ opacity: 0.4 }}>✦</span>
                <span>Pay securely with Midtrans Snap</span>
                <span style={{ opacity: 0.4 }}>✦</span>
                <span>New drops every Friday at 19:00 WIB</span>
                <span style={{ opacity: 0.4 }}>✦</span>
                <span>Direct from 47 makers · no middlemen</span>
                <span style={{ opacity: 0.4 }}>✦</span>
              </div>
            ))}
          </div>
        </div>
        {/* Main bar */}
        <div
          className="tn-header-main"
          style={{
            padding: "20px 40px",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: 32
          }}
        >
          <div className="tn-nav-slot" style={{ display: "flex", alignItems: "center" }}>
            <button
              type="button"
              className="tn-nav-mobile-toggle"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
            <nav className="tn-nav-desktop" style={{ display: "flex", gap: 28, fontSize: 14, color: "var(--ink-soft)", flexWrap: "wrap" }}>
            {NAV.map(([n, h]) => {
              const hashIdx = h.indexOf("#");
              const hasHash = hashIdx >= 0;
              const targetPath = h.split(/[?#]/)[0];
              const targetSearch = hasHash
                ? h.slice(0, hashIdx).split("?")[1] ?? ""
                : h.split("?")[1] ?? "";
              const active = pathname === targetPath;
              const sameTarget = active && (searchParams?.toString() ?? "") === targetSearch;
              return (
                <Link
                  key={n}
                  href={h}
                  prefetch
                  scroll={!hasHash}
                  className="tn-nav-link"
                  data-active={active ? "true" : "false"}
                  onClick={() => {
                    if (sameTarget) {
                      // URL already matches — no nav round-trip. Just scroll.
                      if (hasHash) {
                        const id = h.slice(hashIdx + 1);
                        requestAnimationFrame(() => {
                          document
                            .getElementById(id)
                            ?.scrollIntoView({ behavior: "smooth", block: "start" });
                        });
                      }
                      return;
                    }
                    // Defer scroll until after the new URL commits so the chip
                    // and filtered grid are in the DOM before we glide.
                    pendingScrollRef.current = {
                      id: hasHash ? h.slice(hashIdx + 1) : null,
                      toTop: !hasHash
                    };
                  }}
                >
                  {n}
                </Link>
              );
            })}
            </nav>
          </div>
          <Link href="/" style={{ justifySelf: "center" }}>
            <Wordmark size={28} />
          </Link>
          <div
            className="tn-action-group"
            style={{
              display: "flex",
              gap: 18,
              justifyContent: "flex-end",
              alignItems: "center",
              color: "var(--ink)"
            }}
          >
            <Link href="/search" aria-label="Search" className="tn-btn-link" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
              <Search size={17} /> <span className="tn-action-label" style={{ fontSize: 13 }}>Search</span>
            </Link>
            <UserMenu />
            <Link
              href="/cart"
              aria-label="Cart"
              className="tn-btn-link"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                position: "relative"
              }}
            >
              <ShoppingBag size={18} />
              <span className="tn-action-label" style={{ fontSize: 13 }}>Cart</span>
              {hasMounted && totalItems > 0 && (
                <span
                  className="tn-price"
                  style={{
                    fontSize: 11,
                    padding: "2px 6px",
                    background: "var(--terracotta)",
                    color: "var(--paper)",
                    borderRadius: 999,
                    minWidth: 18,
                    textAlign: "center"
                  }}
                >
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main>{animatedChildren}</main>

      <footer
        style={{
          marginTop: 120,
          background: "var(--ink)",
          color: "var(--paper)",
          padding: "72px 40px 28px"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr",
            gap: 48,
            alignItems: "start"
          }}
          className="footer-grid"
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 56,
                lineHeight: 0.95,
                letterSpacing: "-0.015em"
              }}
            >
              Craft that
              <br />
              <em style={{ fontStyle: "italic" }}>lasts</em>.
            </div>
            <p
              style={{
                marginTop: 24,
                fontSize: 13,
                color: "rgba(245,239,228,0.65)",
                maxWidth: 320,
                lineHeight: 1.6
              }}
            >
              Toko Nusa is an independent curator of craft and food from across the Indonesian archipelago. Every product is sourced directly from its maker.
            </p>
          </div>
          {FOOTER_COLS.map((c) => (
            <div key={c.h}>
              <div className="tn-eyebrow" style={{ color: "rgba(245,239,228,0.5)", marginBottom: 14 }}>
                {c.h}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                {c.items.map((item) => (
                  <li key={item.label} style={{ fontSize: 14 }}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="tn-footer-link"
                        style={{ color: "var(--paper)" }}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        aria-disabled="true"
                        title="Coming soon"
                        style={{ color: "rgba(245,239,228,0.45)", cursor: "default" }}
                      >
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 56,
            paddingTop: 20,
            borderTop: "1px solid rgba(245,239,228,0.12)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(245,239,228,0.5)",
            flexWrap: "wrap",
            gap: 12
          }}
        >
          <span>© Toko Nusa MMXXVI · Jakarta, Indonesia</span>
          <span>Built with Next.js · Laravel · Supabase</span>
        </div>
      </footer>
    </div>
  );
}

function MobileDrawer({
  open,
  onClose,
  onNavLinkClick
}: {
  open: boolean;
  onClose: () => void;
  onNavLinkClick: (href: string) => void;
}) {
  const { session, signOut } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const isGuest = session.role === "guest";
  const accountHref = isGuest ? "/login" : dashboardPath(session.role);

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(20,16,12,0.42)",
          zIndex: 60,
          animation: "tn-drawer-fade .18s ease-out"
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="tn-mobile-drawer"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(86vw, 340px)",
          background: "var(--paper)",
          zIndex: 61,
          display: "flex",
          flexDirection: "column",
          boxShadow: "12px 0 40px -16px rgba(20,16,12,0.35)",
          animation: "tn-drawer-slide .22s cubic-bezier(.16,.84,.24,1) both"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid var(--line-soft)"
          }}
        >
          <Wordmark size={22} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            style={{
              background: "transparent",
              border: 0,
              padding: 6,
              cursor: "pointer",
              color: "var(--ink)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", padding: "12px 0" }}>
          {NAV.map(([n, h]) => (
            <Link
              key={n}
              href={h}
              prefetch
              scroll={!h.includes("#")}
              onClick={() => {
                onNavLinkClick(h);
                onClose();
              }}
              style={{
                padding: "14px 22px",
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: 22,
                color: "var(--ink)",
                textDecoration: "none"
              }}
            >
              {n}
            </Link>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid var(--line-soft)", padding: "8px 0" }}>
          <DrawerRow href="/search" icon={<Search size={16} />} label="Search" onClose={onClose} />
          <DrawerRow href="/cart" icon={<ShoppingBag size={16} />} label="Cart" onClose={onClose} />
          <DrawerRow
            href={accountHref}
            icon={isGuest ? <LogIn size={16} /> : <Package size={16} />}
            label={
              isGuest
                ? "Sign in"
                : session.role === "user"
                ? "My orders & profile"
                : `${roleLabel(session.role)} dashboard`
            }
            onClose={onClose}
          />
          {isGuest && (
            <DrawerRow
              href="/register"
              icon={<User size={16} />}
              label="Create account"
              onClose={onClose}
            />
          )}
          {!isGuest && (
            <button
              type="button"
              onClick={() => {
                signOut();
                onClose();
                router.push("/");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "14px 22px",
                background: "transparent",
                border: 0,
                cursor: "pointer",
                color: "var(--danger)",
                fontSize: 14,
                fontFamily: "var(--font-body)",
                textAlign: "left"
              }}
            >
              <LogOut size={16} /> Sign out
            </button>
          )}
        </div>
      </aside>
      <style>{`
        @keyframes tn-drawer-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tn-drawer-slide { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @media (prefers-reduced-motion: reduce) {
          .tn-mobile-drawer { animation: none !important; }
        }
      `}</style>
    </>
  );
}

function DrawerRow({
  href,
  icon,
  label,
  onClose
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 22px",
        textDecoration: "none",
        color: "var(--ink)",
        fontSize: 14
      }}
    >
      {icon}
      {label}
    </Link>
  );
}
