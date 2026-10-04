"use client";

import Link from "next/link";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useSession } from "@/lib/session";
import { RouteGuard } from "@/components/RouteGuard";

export default function RegisterPage() {
  return (
    <RouteGuard allow={["guest"]}>
      <RegisterInner />
    </RouteGuard>
  );
}

function RegisterInner() {
  const { register } = useSession();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = register(form.email, form.password, form.name);
    setLoading(false);
    if (!result.ok) setError(result.error);
    // On success, <RouteGuard allow={["guest"]}> auto-redirects to dashboardPath("user") = /account.
  }

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "80px 28px" }}>
      <Link href="/" className="tn-btn-link" style={{ fontSize: 13 }}>
        ← Back to shop
      </Link>
      <div className="tn-eyebrow" style={{ marginTop: 32, marginBottom: 12 }}>
        № 02 · NEW CUSTOMER
      </div>
      <h1 className="tn-display-3" style={{ marginBottom: 12 }}>
        Create your <em style={{ fontStyle: "italic" }}>account</em>, free forever.
      </h1>
      <p className="tn-body-sm" style={{ marginBottom: 32, fontSize: 14, lineHeight: 1.6 }}>
        Already have an account?{" "}
        <Link href="/login" className="tn-btn-link" style={{ fontSize: 14 }}>Sign in</Link>.
      </p>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="tn-label-mono" style={{ fontSize: 11 }}>FULL NAME</span>
          <input
            className="tn-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            autoComplete="name"
            required
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="tn-label-mono" style={{ fontSize: 11 }}>EMAIL</span>
          <input
            type="email"
            className="tn-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@email.com"
            autoComplete="email"
            required
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="tn-label-mono" style={{ fontSize: 11 }}>PASSWORD <span style={{ color: "var(--muted)" }}>(min 6 chars)</span></span>
          <input
            type="password"
            className="tn-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            minLength={6}
          />
        </label>

        {error && (
          <div style={{ padding: 12, border: "1px solid var(--danger)", color: "var(--danger)", fontSize: 13, borderRadius: 4 }}>
            {error}
          </div>
        )}

        <button type="submit" className="tn-btn tn-btn-lg" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? "Creating account…" : <>Create account <UserPlus size={14} /></>}
        </button>
      </form>
    </div>
  );
}
