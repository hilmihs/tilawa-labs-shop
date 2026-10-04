"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { adminApi } from "@/lib/api";
import { saveAdminSession } from "@/lib/admin-session";
import { useSession, VISIBLE_DEMO_ACCOUNTS, IS_DEV } from "@/lib/session";
import { Wordmark } from "@/components/design";
import { RouteGuard } from "@/components/RouteGuard";

export default function AdminLoginPage() {
  return (
    <RouteGuard allow={["guest"]}>
      <AdminLoginInner />
    </RouteGuard>
  );
}

function AdminLoginInner() {
  const router = useRouter();
  const { signIn, trustSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const demoAdmin = VISIBLE_DEMO_ACCOUNTS.find((a) => a.role === "admin");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Backend first — the real Laravel auth is the source of truth.
    try {
      const session = await adminApi.login(email, password);
      saveAdminSession(session);
      const trust = trustSession({
        role: "admin",
        email: session.user.email,
        name: session.user.name
      });
      if (!trust.ok) throw new Error(trust.error);
      router.push("/admin");
      return;
    } catch (caught) {
      // Backend unreachable or rejected. In dev only, allow demo fallback so
      // the prototype works offline.
      if (IS_DEV) {
        const demoResult = signIn("admin", email, password);
        if (demoResult.ok) {
          router.push("/admin");
          return;
        }
      }
      setError(caught instanceof Error ? caught.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "40px 20px",
        background: "var(--paper)"
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="tn-card"
        style={{ width: "100%", maxWidth: 440, padding: 36 }}
      >
        <Link href="/">
          <Wordmark size={24} />
        </Link>
        <div className="tn-eyebrow" style={{ marginTop: 28, marginBottom: 8 }}>
          № 01 · ACCESS
        </div>
        <h1 className="tn-display-4" style={{ marginBottom: 8 }}>
          Sign in as <em style={{ fontStyle: "italic" }}>admin</em>
        </h1>
        <p className="tn-body-sm" style={{ marginBottom: 24 }}>
          This area is restricted to Toko Nusa staff.
        </p>

        <div style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "block" }}>
            <div className="tn-eyebrow" style={{ marginBottom: 8 }}>
              Email
            </div>
            <input
              className="tn-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label style={{ display: "block" }}>
            <div className="tn-eyebrow" style={{ marginBottom: 8 }}>
              Password
            </div>
            <input
              className="tn-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              border: "1px solid var(--warning)",
              background: "var(--paper-soft)",
              color: "var(--warning)",
              fontSize: 14
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          className="tn-btn tn-btn-lg"
          style={{ width: "100%", marginTop: 20 }}
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div
          className="tn-body-sm"
          style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "flex-start" }}
        >
          <ShieldCheck size={16} strokeWidth={1.4} style={{ marginTop: 1, color: "var(--ink)" }} />
          <span>
            Tokens are stored in browser localStorage. Use HTTPS and sign out after each session in production.
          </span>
        </div>

        {demoAdmin && (
          <div
            style={{
              marginTop: 24,
              padding: 14,
              background: "var(--paper-soft)",
              border: "1px solid var(--line)",
              borderRadius: 4,
              fontSize: 12,
              lineHeight: 1.7
            }}
          >
            <div className="tn-label-mono" style={{ marginBottom: 6, fontSize: 11 }}>
              DEMO ADMIN (frontend-only)
            </div>
            <div>Email: <code style={{ fontFamily: "var(--font-mono)" }}>{demoAdmin.email}</code></div>
            <div>Password: <code style={{ fontFamily: "var(--font-mono)" }}>{demoAdmin.password}</code></div>
            <button
              type="button"
              onClick={() => { setEmail(demoAdmin.email); setPassword(demoAdmin.password); }}
              className="tn-btn-link"
              style={{ marginTop: 8, fontSize: 12 }}
            >
              Fill demo credentials <ArrowRight size={11} style={{ display: "inline" }} />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
