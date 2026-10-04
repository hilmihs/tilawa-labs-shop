"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LogIn, ArrowRight } from "lucide-react";
import { useSession, VISIBLE_DEMO_ACCOUNTS } from "@/lib/session";
import { RouteGuard } from "@/components/RouteGuard";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const demoUser = VISIBLE_DEMO_ACCOUNTS.find((a) => a.role === "user");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = signIn("user", email, password);
    setLoading(false);
    if (result.ok) {
      // Defer one microtask so React commits the session state before navigation;
      // the destination's RouteGuard then sees the new role and renders without flicker.
      queueMicrotask(() => router.replace(next));
    } else {
      setError(result.error);
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "80px 28px" }}>
      <Link href="/" className="tn-btn-link" style={{ fontSize: 13 }}>
        ← Back to shop
      </Link>
      <div className="tn-eyebrow" style={{ marginTop: 32, marginBottom: 12 }}>
        № 01 · CUSTOMER ACCESS
      </div>
      <h1 className="tn-display-3" style={{ marginBottom: 12 }}>
        Sign in to your <em style={{ fontStyle: "italic" }}>account</em>
      </h1>
      <p className="tn-body-sm" style={{ marginBottom: 32, fontSize: 14, lineHeight: 1.6 }}>
        Access your orders, wishlist, and saved shipping addresses. New here?{" "}
        <Link href="/register" className="tn-btn-link" style={{ fontSize: 14 }}>
          Create a free account
        </Link>
        .
      </p>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="tn-label-mono" style={{ fontSize: 11 }}>EMAIL</span>
          <input
            type="email"
            className="tn-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            required
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="tn-label-mono" style={{ fontSize: 11 }}>PASSWORD</span>
          <input
            type="password"
            className="tn-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <div style={{ padding: 12, border: "1px solid var(--danger)", color: "var(--danger)", fontSize: 13, borderRadius: 4 }}>
            {error}
          </div>
        )}

        <button type="submit" className="tn-btn tn-btn-lg" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? "Signing in…" : <>Sign in <LogIn size={14} /></>}
        </button>
      </form>

      {demoUser && (
        <div
          className="tn-card"
          style={{
            marginTop: 28,
            padding: 16,
            background: "var(--paper-soft)",
            fontSize: 12,
            lineHeight: 1.7
          }}
        >
          <div className="tn-label-mono" style={{ marginBottom: 6, fontSize: 11 }}>
            DEMO CREDENTIALS
          </div>
          <div>Email: <code style={{ fontFamily: "var(--font-mono)" }}>{demoUser.email}</code></div>
          <div>Password: <code style={{ fontFamily: "var(--font-mono)" }}>{demoUser.password}</code></div>
          <button
            type="button"
            onClick={() => { setEmail(demoUser.email); setPassword(demoUser.password); }}
            className="tn-btn-link"
            style={{ marginTop: 8, fontSize: 12 }}
          >
            Fill demo credentials <ArrowRight size={11} style={{ display: "inline" }} />
          </button>
        </div>
      )}

      <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--line-soft)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="tn-label-mono" style={{ fontSize: 10 }}>OTHER ACCESS</div>
        <Link href="/seller/login" className="tn-btn-link" style={{ fontSize: 13 }}>Seller portal →</Link>
        <Link href="/admin/login" className="tn-btn-link" style={{ fontSize: 13 }}>Admin panel →</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <RouteGuard allow={["guest"]}>
      <Suspense fallback={null}>
        <LoginInner />
      </Suspense>
    </RouteGuard>
  );
}
