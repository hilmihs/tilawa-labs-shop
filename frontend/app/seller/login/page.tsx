"use client";

import Link from "next/link";
import { useState } from "react";
import { Store, ArrowRight } from "lucide-react";
import { useSession, VISIBLE_DEMO_ACCOUNTS } from "@/lib/session";
import { RouteGuard } from "@/components/RouteGuard";

export default function SellerLoginPage() {
  return (
    <RouteGuard allow={["guest"]}>
      <SellerLoginInner />
    </RouteGuard>
  );
}

function SellerLoginInner() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const demoSeller = VISIBLE_DEMO_ACCOUNTS.find((a) => a.role === "seller");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = signIn("seller", email, password);
    setLoading(false);
    if (!result.ok) setError(result.error);
    // On success, <RouteGuard allow={["guest"]}> auto-redirects to dashboardPath("seller").
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", display: "grid", gridTemplateColumns: "1fr 1fr" }} className="seller-login">
      {/* Left side — branding */}
      <div style={{ background: "var(--ink)", color: "var(--paper)", padding: "56px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between" }} className="seller-login-side">
        <Link href="/" style={{ color: "var(--paper)", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>← Back to Toko Nusa</Link>
        <div>
          <div className="tn-eyebrow" style={{ color: "rgba(245,239,228,0.5)", marginBottom: 14 }}>SELLER PORTAL</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 56, lineHeight: 1.05 }}>
            For the <em style={{ fontStyle: "italic", color: "var(--terracotta-2)" }}>makers</em>.
          </h1>
          <p style={{ marginTop: 24, fontSize: 15, lineHeight: 1.6, color: "rgba(245,239,228,0.75)", maxWidth: 380 }}>
            Manage your catalog, fulfill orders, and track shop analytics. Direct payouts to your account, no middlemen.
          </p>
        </div>
        <div className="tn-label-mono" style={{ color: "rgba(245,239,228,0.4)", fontSize: 11 }}>© Toko Nusa MMXXVI · Seller program</div>
      </div>

      {/* Right side — form */}
      <div style={{ padding: "80px 48px", maxWidth: 480, alignSelf: "center", justifySelf: "center", width: "100%" }}>
        <Store size={28} color="var(--terracotta)" strokeWidth={1.4} />
        <h2 className="tn-display-3" style={{ marginTop: 16, marginBottom: 8 }}>
          Sign in as <em style={{ fontStyle: "italic" }}>seller</em>
        </h2>
        <p className="tn-body-sm" style={{ marginBottom: 28 }}>
          Not a seller yet?{" "}
          <a href="mailto:seller@tokonusa.id" className="tn-btn-link" style={{ fontSize: 13 }}>Contact our team</a>.
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="tn-label-mono" style={{ fontSize: 11 }}>SELLER EMAIL</span>
            <input type="email" className="tn-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="tn-label-mono" style={{ fontSize: 11 }}>PASSWORD</span>
            <input type="password" className="tn-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          {error && (
            <div style={{ padding: 12, border: "1px solid var(--danger)", color: "var(--danger)", fontSize: 13, borderRadius: 4 }}>{error}</div>
          )}

          <button type="submit" className="tn-btn tn-btn-lg" disabled={loading}>
            {loading ? "Signing in…" : "Enter seller dashboard"}
          </button>
        </form>

        {demoSeller && (
          <div className="tn-card" style={{ marginTop: 24, padding: 16, background: "var(--paper-soft)", fontSize: 12, lineHeight: 1.7 }}>
            <div className="tn-label-mono" style={{ marginBottom: 6, fontSize: 11 }}>DEMO SELLER</div>
            <div>Email: <code style={{ fontFamily: "var(--font-mono)" }}>{demoSeller.email}</code></div>
            <div>Password: <code style={{ fontFamily: "var(--font-mono)" }}>{demoSeller.password}</code></div>
            <button
              type="button"
              onClick={() => { setEmail(demoSeller.email); setPassword(demoSeller.password); }}
              className="tn-btn-link"
              style={{ marginTop: 8, fontSize: 12 }}
            >
              Fill demo credentials <ArrowRight size={11} style={{ display: "inline" }} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .seller-login { grid-template-columns: 1fr !important; }
          .seller-login-side { display: none !important; }
        }
      `}</style>
    </div>
  );
}
