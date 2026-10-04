"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  User,
  LogIn,
  LogOut,
  Package,
  Store,
  ShieldCheck,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { useSession, roleLabel, dashboardPath } from "@/lib/session";

export function UserMenu() {
  const { session, ready, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (!hasMounted || !ready) {
    // Force placeholder on both server and first client render so hydration
    // can never see the populated button before useEffect commits.
    return (
      <div
        suppressHydrationWarning
        style={{ width: 110, height: 32 }}
        aria-hidden
      />
    );
  }

  const role = session.role;
  const isGuest = role === "guest";
  const name = isGuest ? "Guest" : session.name;
  const Icon = isGuest ? User : role === "seller" ? Store : role === "admin" ? ShieldCheck : Sparkles;

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="tn-btn-link"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 999,
          border: `1px solid ${isGuest ? "var(--line)" : "var(--ink)"}`,
          background: isGuest ? "transparent" : "var(--ink)",
          color: isGuest ? "var(--ink)" : "var(--paper)",
          textDecoration: "none",
          transition: "background .2s ease, color .2s ease, border-color .2s ease"
        }}
      >
        <Icon size={14} />
        <span
          className="tn-action-label"
          style={{
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}
        >
          {isGuest ? "Guest" : roleLabel(role)}
        </span>
        {!isGuest && (
          <span
            className="tn-action-label"
            style={{ fontSize: 12, fontWeight: 500, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            · {name.split(" ")[0]}
          </span>
        )}
        <ChevronDown size={12} style={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </button>

      {open && (
        <div
          role="menu"
          className="tn-menu-pop"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 240,
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: 6,
            padding: 8,
            zIndex: 40,
            boxShadow: "0 24px 60px -28px rgba(30,26,20,0.35)"
          }}
        >
          {/* Header */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--line-soft)" }}>
            <div className="tn-eyebrow" style={{ fontSize: 10 }}>
              {isGuest ? "Not signed in" : `Signed in as ${roleLabel(role)}`}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, marginTop: 4 }}>
              {isGuest ? "Welcome, " : ""}
              <em style={{ fontStyle: "italic" }}>{isGuest ? "Guest" : name}</em>
            </div>
            {!isGuest && (
              <div className="tn-body-sm" style={{ marginTop: 2, fontSize: 11 }}>
                {session.email}
              </div>
            )}
          </div>

          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: 6 }}>
            {isGuest ? (
              <>
                <MenuItem href="/login" icon={<LogIn size={14} />} label="Sign in" onNavigate={() => setOpen(false)} />
                <MenuItem href="/register" icon={<User size={14} />} label="Create an account" sub="Free for customers" onNavigate={() => setOpen(false)} />
              </>
            ) : (
              <>
                <MenuItem href={dashboardPath(role)} icon={<Package size={14} />} label={role === "user" ? "My orders & profile" : role === "seller" ? "Seller dashboard" : "Admin panel"} onNavigate={() => setOpen(false)} />
                {role === "user" && (
                  <MenuItem href="/cart" icon={<Sparkles size={14} />} label="My cart" onNavigate={() => setOpen(false)} />
                )}
                <Divider />
                <button
                  onClick={() => {
                    signOut();
                    setOpen(false);
                    router.push("/");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    background: "transparent",
                    border: 0,
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    color: "var(--danger)",
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    borderRadius: 4,
                    transition: "background .15s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper-soft)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <LogOut size={14} /> Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  label,
  sub,
  onNavigate
}: {
  href: string;
  icon: ReactNode;
  label: string;
  sub?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        textDecoration: "none",
        color: "var(--ink)",
        borderRadius: 4,
        transition: "background .15s"
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper-soft)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {icon}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 13 }}>{label}</span>
        {sub && <span className="tn-body-sm" style={{ fontSize: 10 }}>{sub}</span>}
      </div>
    </Link>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--line-soft)", margin: "6px 8px" }} />;
}
