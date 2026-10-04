"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AdminGuard, DemoModeBanner } from "@/components/AdminGuard";
import { AdminShell } from "@/components/AdminShell";
import { adminApi, formatCurrency } from "@/lib/api";
import { saveAdminSession, getAdminSession } from "@/lib/admin-session";
import { ALL_SELLERS } from "@/lib/marketplace";
import type {
  AdminSession,
  PaymentMethod,
  PaymentMethodInput,
  Promotion,
  PromotionInput,
  Seller,
  SellerInput,
  StoreSettings
} from "@/types/api";

type TabId = "account" | "store" | "sellers" | "promotions" | "payments";

const TABS: { id: TabId; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "store", label: "Store" },
  { id: "sellers", label: "Sellers" },
  { id: "promotions", label: "Promotions" },
  { id: "payments", label: "Payments" }
];

function readHashTab(): TabId {
  if (typeof window === "undefined") return "account";
  const raw = window.location.hash.replace(/^#/, "").toLowerCase();
  return TABS.some((t) => t.id === raw) ? (raw as TabId) : "account";
}

function SettingsView({ session, isDemo }: { session: AdminSession; isDemo: boolean }) {
  const [tab, setTab] = useState<TabId>("account");

  useEffect(() => {
    setTab(readHashTab());
    function onHash() {
      setTab(readHashTab());
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function selectTab(next: TabId) {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${next}`);
    }
    setTab(next);
  }

  return (
    <AdminShell
      subtitle="Settings"
      title={
        <>
          Store &amp; <em style={{ fontStyle: "italic" }}>account</em>
        </>
      }
    >
      {isDemo && <DemoModeBanner />}

      <div
        role="tablist"
        aria-label="Settings sections"
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--line)",
          marginBottom: 24,
          flexWrap: "wrap"
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => selectTab(t.id)}
              className="tn-label-mono"
              style={{
                padding: "10px 14px",
                fontSize: 11,
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${active ? "var(--ink)" : "transparent"}`,
                color: active ? "var(--ink)" : "var(--muted)",
                cursor: "pointer",
                letterSpacing: "0.06em"
              }}
            >
              {t.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      {tab === "account" && <AccountPanel session={session} isDemo={isDemo} />}
      {tab === "store" && <StorePanel session={session} isDemo={isDemo} />}
      {tab === "sellers" && <SellersPanel session={session} isDemo={isDemo} />}
      {tab === "promotions" && <PromotionsPanel session={session} isDemo={isDemo} />}
      {tab === "payments" && <PaymentsPanel session={session} isDemo={isDemo} />}

      <style>{`
        @media (max-width: 960px) {
          .settings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AdminShell>
  );
}

// ─── Account (Profile + Password) ──────────────────────────────────────────

function AccountPanel({ session, isDemo }: { session: AdminSession; isDemo: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="settings-grid">
      <ProfileCard session={session} isDemo={isDemo} />
      <PasswordCard session={session} isDemo={isDemo} />
    </div>
  );
}

function ProfileCard({ session, isDemo }: { session: AdminSession; isDemo: boolean }) {
  const [name, setName] = useState(session.user.name);
  const [email, setEmail] = useState(session.user.email);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isDemo) {
      setStatus({ kind: "err", msg: "Demo mode: tidak bisa menyimpan." });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const updated = await adminApi.updateProfile(session.token, { name: name.trim(), email: email.trim() });
      const current = getAdminSession();
      if (current) saveAdminSession({ ...current, user: { ...current.user, ...updated } });
      setStatus({ kind: "ok", msg: "Profil disimpan." });
    } catch (caught) {
      setStatus({ kind: "err", msg: caught instanceof Error ? caught.message : "Gagal menyimpan." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="tn-card" style={{ padding: 24, display: "grid", gap: 14 }}>
      <h3 className="tn-display-5">
        <em style={{ fontStyle: "italic" }}>Profile</em>
      </h3>
      <StatusBar status={status} />
      <Field label="Name" required>
        <input
          className="tn-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={160}
          required
          disabled={isDemo}
        />
      </Field>
      <Field label="Email" required>
        <input
          className="tn-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={180}
          required
          disabled={isDemo}
        />
      </Field>
      <div>
        <button className="tn-btn" disabled={saving || isDemo} type="submit">
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}

function PasswordCard({ session, isDemo }: { session: AdminSession; isDemo: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isDemo) {
      setStatus({ kind: "err", msg: "Demo mode: tidak bisa menyimpan." });
      return;
    }
    if (next !== confirm) {
      setStatus({ kind: "err", msg: "Konfirmasi password tidak cocok." });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await adminApi.updatePassword(session.token, {
        current_password: current,
        password: next,
        password_confirmation: confirm
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      setStatus({ kind: "ok", msg: "Password diubah." });
    } catch (caught) {
      setStatus({ kind: "err", msg: caught instanceof Error ? caught.message : "Gagal mengubah password." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="tn-card" style={{ padding: 24, display: "grid", gap: 14 }}>
      <h3 className="tn-display-5">
        <em style={{ fontStyle: "italic" }}>Security</em>
      </h3>
      <StatusBar status={status} />
      <Field label="Current password" required>
        <input
          className="tn-input"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          disabled={isDemo}
          autoComplete="current-password"
        />
      </Field>
      <Field label="New password" required hint="Minimal 8 karakter.">
        <input
          className="tn-input"
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          minLength={8}
          disabled={isDemo}
          autoComplete="new-password"
        />
      </Field>
      <Field label="Confirm password" required>
        <input
          className="tn-input"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          disabled={isDemo}
          autoComplete="new-password"
        />
      </Field>
      <div>
        <button className="tn-btn" disabled={saving || isDemo} type="submit">
          {saving ? "Saving…" : "Change password"}
        </button>
      </div>
    </form>
  );
}

// ─── Store ─────────────────────────────────────────────────────────────────

function StorePanel({ session, isDemo }: { session: AdminSession; isDemo: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
      <StoreCard session={session} isDemo={isDemo} />
    </div>
  );
}

function StoreCard({ session, isDemo }: { session: AdminSession; isDemo: boolean }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    if (isDemo) return;
    adminApi
      .storeSettings(session.token)
      .then((s) => {
        setSettings(s);
        setName(s.name ?? "");
        setEmail(s.email ?? "");
        setPhone(s.phone ?? "");
        setAddress(s.address ?? "");
      })
      .catch((caught) => {
        setStatus({ kind: "err", msg: caught instanceof Error ? caught.message : "Gagal memuat settings." });
      });
  }, [session.token, isDemo]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isDemo) {
      setStatus({ kind: "err", msg: "Demo mode: tidak bisa menyimpan." });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("email", email.trim());
      fd.append("phone", phone.trim());
      fd.append("address", address.trim());
      if (logo) fd.append("logo", logo);
      const updated = await adminApi.updateStoreSettings(session.token, fd);
      setSettings(updated);
      setLogo(null);
      setStatus({ kind: "ok", msg: "Informasi toko disimpan." });
    } catch (caught) {
      setStatus({ kind: "err", msg: caught instanceof Error ? caught.message : "Gagal menyimpan." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="tn-card" style={{ padding: 24, display: "grid", gap: 14 }}>
      <h3 className="tn-display-5">
        <em style={{ fontStyle: "italic" }}>Store</em>
      </h3>
      <StatusBar status={status} />

      {settings?.logo_url && (
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div
            style={{
              position: "relative",
              width: 72,
              height: 72,
              background: "var(--paper-soft)",
              border: "1px solid var(--line)"
            }}
          >
            <Image src={settings.logo_url} alt={settings.name} fill style={{ objectFit: "contain" }} />
          </div>
          <span className="tn-body-sm" style={{ fontSize: 12, color: "var(--muted)" }}>
            Logo saat ini. Upload baru di bawah untuk mengganti.
          </span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="store-row">
        <Field label="Store name" required>
          <input
            className="tn-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={160}
            required
            disabled={isDemo}
          />
        </Field>
        <Field label="Contact email">
          <input
            className="tn-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={180}
            disabled={isDemo}
          />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="store-row">
        <Field label="Phone">
          <input
            className="tn-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={32}
            disabled={isDemo}
          />
        </Field>
        <Field label="Logo" hint="JPG/PNG/WebP/SVG, maks 2 MB.">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
            disabled={isDemo}
          />
        </Field>
      </div>

      <Field label="Address">
        <textarea
          className="tn-input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          maxLength={500}
          rows={3}
          disabled={isDemo}
          style={{ resize: "vertical" }}
        />
      </Field>

      <div>
        <button className="tn-btn" disabled={saving || isDemo} type="submit">
          {saving ? "Saving…" : "Save store info"}
        </button>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .store-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </form>
  );
}

// ─── Sellers ───────────────────────────────────────────────────────────────

const EMPTY_SELLER_INPUT: SellerInput = {
  slug: "",
  name: "",
  city: "",
  verified: false,
  contact_email: "",
  contact_phone: "",
  description: ""
};

function SellersPanel({ session, isDemo }: { session: AdminSession; isDemo: boolean }) {
  const demoSellers = useMemo<Seller[]>(
    () =>
      ALL_SELLERS.map((s, idx) => ({
        id: idx + 1,
        slug: s.slug,
        name: s.name,
        city: s.city,
        verified: s.verified,
        contact_email: null,
        contact_phone: null,
        description: null
      })),
    []
  );

  const [sellers, setSellers] = useState<Seller[]>(isDemo ? demoSellers : []);
  const [loading, setLoading] = useState(!isDemo);
  const [editing, setEditing] = useState<Seller | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    if (isDemo) return;
    setLoading(true);
    adminApi
      .sellers(session.token)
      .then(setSellers)
      .catch((caught) => setStatus({ kind: "err", msg: caught instanceof Error ? caught.message : "Gagal memuat sellers." }))
      .finally(() => setLoading(false));
  }, [session.token, isDemo]);

  async function handleDelete(seller: Seller) {
    if (isDemo) {
      setStatus({ kind: "err", msg: "Demo mode: tidak bisa menghapus." });
      return;
    }
    if (!confirm(`Hapus seller "${seller.name}"?`)) return;
    try {
      await adminApi.deleteSeller(session.token, seller.id);
      setSellers((list) => list.filter((s) => s.id !== seller.id));
      setStatus({ kind: "ok", msg: `Seller "${seller.name}" dihapus.` });
    } catch (caught) {
      setStatus({ kind: "err", msg: caught instanceof Error ? caught.message : "Gagal menghapus." });
    }
  }

  function handleSaved(saved: Seller, mode: "create" | "update") {
    setSellers((list) => {
      if (mode === "create") return [...list, saved].sort((a, b) => a.name.localeCompare(b.name));
      return list.map((s) => (s.id === saved.id ? saved : s));
    });
    setShowForm(false);
    setEditing(null);
    setStatus({ kind: "ok", msg: `Seller "${saved.name}" disimpan.` });
  }

  return (
    <div className="tn-card" style={{ padding: 24, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h3 className="tn-display-5">
            <em style={{ fontStyle: "italic" }}>Sellers</em>
          </h3>
          <div className="tn-body-sm" style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            {sellers.length} seller terdaftar.
          </div>
        </div>
        <button
          type="button"
          className="tn-btn"
          disabled={isDemo}
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Add seller
        </button>
      </div>

      <StatusBar status={status} />

      {showForm && (
        <SellerForm
          session={session}
          isDemo={isDemo}
          initial={editing}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {loading ? (
        <div className="tn-body-sm" style={{ color: "var(--muted)" }}>Loading…</div>
      ) : sellers.length === 0 ? (
        <div className="tn-body-sm" style={{ color: "var(--muted)" }}>Belum ada seller.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
                <Th>Name</Th>
                <Th>Slug</Th>
                <Th>City</Th>
                <Th>Verified</Th>
                <Th>Contact</Th>
                <Th style={{ width: 140 }}>{""}</Th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--line-soft, var(--line))" }}>
                  <Td><strong>{s.name}</strong></Td>
                  <Td><code style={{ fontSize: 12 }}>{s.slug}</code></Td>
                  <Td>{s.city}</Td>
                  <Td>{s.verified ? "✓" : "—"}</Td>
                  <Td>{s.contact_email || s.contact_phone || <span style={{ color: "var(--muted)" }}>—</span>}</Td>
                  <Td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="tn-btn-link"
                        disabled={isDemo}
                        onClick={() => {
                          setEditing(s);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="tn-btn-link"
                        disabled={isDemo}
                        style={{ color: "var(--danger)" }}
                        onClick={() => handleDelete(s)}
                      >
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SellerForm({
  session,
  isDemo,
  initial,
  onCancel,
  onSaved
}: {
  session: AdminSession;
  isDemo: boolean;
  initial: Seller | null;
  onCancel: () => void;
  onSaved: (seller: Seller, mode: "create" | "update") => void;
}) {
  const [form, setForm] = useState<SellerInput>(
    initial
      ? {
          slug: initial.slug,
          name: initial.name,
          city: initial.city,
          verified: initial.verified,
          contact_email: initial.contact_email ?? "",
          contact_phone: initial.contact_phone ?? "",
          description: initial.description ?? ""
        }
      : EMPTY_SELLER_INPUT
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isDemo) {
      setError("Demo mode: tidak bisa menyimpan.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload: SellerInput = {
      slug: form.slug.trim().toLowerCase(),
      name: form.name.trim(),
      city: form.city.trim(),
      verified: form.verified,
      contact_email: form.contact_email?.trim() || null,
      contact_phone: form.contact_phone?.trim() || null,
      description: form.description?.trim() || null
    };
    try {
      const saved = initial
        ? await adminApi.updateSeller(session.token, initial.id, payload)
        : await adminApi.createSeller(session.token, payload);
      onSaved(saved, initial ? "update" : "create");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{
        display: "grid",
        gap: 12,
        padding: 16,
        background: "var(--paper-soft)",
        border: "1px solid var(--line)"
      }}
    >
      <div className="tn-label-mono" style={{ fontSize: 11 }}>
        {initial ? `EDIT — ${initial.name.toUpperCase()}` : "NEW SELLER"}
      </div>
      {error && <StatusBar status={{ kind: "err", msg: error }} />}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="settings-grid">
        <Field label="Slug" required hint="lowercase-with-dashes">
          <input
            className="tn-input"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
            maxLength={80}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          />
        </Field>
        <Field label="Name" required>
          <input
            className="tn-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            maxLength={160}
          />
        </Field>
        <Field label="City" required>
          <input
            className="tn-input"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
            maxLength={120}
          />
        </Field>
        <Field label="Verified">
          <label style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 0" }}>
            <input
              type="checkbox"
              checked={form.verified}
              onChange={(e) => setForm({ ...form, verified: e.target.checked })}
            />
            <span style={{ fontSize: 13 }}>Mark as verified</span>
          </label>
        </Field>
        <Field label="Contact email">
          <input
            className="tn-input"
            type="email"
            value={form.contact_email ?? ""}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            maxLength={180}
          />
        </Field>
        <Field label="Contact phone">
          <input
            className="tn-input"
            value={form.contact_phone ?? ""}
            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
            maxLength={32}
          />
        </Field>
      </div>
      <Field label="Description">
        <textarea
          className="tn-input"
          rows={3}
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          maxLength={2000}
          style={{ resize: "vertical" }}
        />
      </Field>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="tn-btn" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Create seller"}
        </button>
        <button type="button" className="tn-btn-link" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Promotions ────────────────────────────────────────────────────────────

const EMPTY_PROMOTION_INPUT: PromotionInput = {
  code: "",
  name: "",
  type: "percentage",
  value: 0,
  min_purchase: null,
  max_uses: null,
  starts_at: null,
  expires_at: null,
  active: true
};

function PromotionsPanel({ session, isDemo }: { session: AdminSession; isDemo: boolean }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(!isDemo);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    if (isDemo) return;
    setLoading(true);
    adminApi
      .promotions(session.token)
      .then(setPromotions)
      .catch((caught) =>
        setStatus({ kind: "err", msg: caught instanceof Error ? caught.message : "Gagal memuat promotions." })
      )
      .finally(() => setLoading(false));
  }, [session.token, isDemo]);

  async function handleDelete(p: Promotion) {
    if (isDemo) {
      setStatus({ kind: "err", msg: "Demo mode: tidak bisa menghapus." });
      return;
    }
    if (!confirm(`Hapus promo "${p.code}"?`)) return;
    try {
      await adminApi.deletePromotion(session.token, p.id);
      setPromotions((list) => list.filter((x) => x.id !== p.id));
      setStatus({ kind: "ok", msg: `Promo "${p.code}" dihapus.` });
    } catch (caught) {
      setStatus({ kind: "err", msg: caught instanceof Error ? caught.message : "Gagal menghapus." });
    }
  }

  function handleSaved(saved: Promotion, mode: "create" | "update") {
    setPromotions((list) => {
      if (mode === "create") return [saved, ...list];
      return list.map((p) => (p.id === saved.id ? saved : p));
    });
    setShowForm(false);
    setEditing(null);
    setStatus({ kind: "ok", msg: `Promo "${saved.code}" disimpan.` });
  }

  return (
    <div className="tn-card" style={{ padding: 24, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h3 className="tn-display-5">
            <em style={{ fontStyle: "italic" }}>Promotions</em>
          </h3>
          <div className="tn-body-sm" style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            {promotions.length} promo terdaftar.
          </div>
        </div>
        <button
          type="button"
          className="tn-btn"
          disabled={isDemo}
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Add promotion
        </button>
      </div>

      <StatusBar status={status} />

      {showForm && (
        <PromotionForm
          session={session}
          isDemo={isDemo}
          initial={editing}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {loading ? (
        <div className="tn-body-sm" style={{ color: "var(--muted)" }}>Loading…</div>
      ) : promotions.length === 0 ? (
        <div className="tn-body-sm" style={{ color: "var(--muted)" }}>
          {isDemo ? "Demo mode — promo dikelola via backend yang sesungguhnya." : "Belum ada promo."}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
                <Th>Code</Th>
                <Th>Name</Th>
                <Th>Discount</Th>
                <Th>Min. purchase</Th>
                <Th>Usage</Th>
                <Th>Window</Th>
                <Th>Active</Th>
                <Th style={{ width: 140 }}>{""}</Th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--line-soft, var(--line))" }}>
                  <Td><code style={{ fontSize: 12, fontWeight: 600 }}>{p.code}</code></Td>
                  <Td>{p.name}</Td>
                  <Td>{p.type === "percentage" ? `${p.value}%` : formatCurrency(p.value)}</Td>
                  <Td>{p.min_purchase != null ? formatCurrency(p.min_purchase) : <span style={{ color: "var(--muted)" }}>—</span>}</Td>
                  <Td>
                    {p.used_count}
                    {p.max_uses != null ? ` / ${p.max_uses}` : ""}
                  </Td>
                  <Td style={{ fontSize: 12 }}>
                    {p.starts_at || p.expires_at ? (
                      <>
                        {p.starts_at ? formatDate(p.starts_at) : "—"}
                        {" → "}
                        {p.expires_at ? formatDate(p.expires_at) : "—"}
                      </>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>Tidak ada batas</span>
                    )}
                  </Td>
                  <Td>{p.active ? "✓" : "—"}</Td>
                  <Td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="tn-btn-link"
                        disabled={isDemo}
                        onClick={() => {
                          setEditing(p);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="tn-btn-link"
                        disabled={isDemo}
                        style={{ color: "var(--danger)" }}
                        onClick={() => handleDelete(p)}
                      >
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PromotionForm({
  session,
  isDemo,
  initial,
  onCancel,
  onSaved
}: {
  session: AdminSession;
  isDemo: boolean;
  initial: Promotion | null;
  onCancel: () => void;
  onSaved: (promotion: Promotion, mode: "create" | "update") => void;
}) {
  const [form, setForm] = useState<PromotionInput>(
    initial
      ? {
          code: initial.code,
          name: initial.name,
          type: initial.type,
          value: initial.value,
          min_purchase: initial.min_purchase,
          max_uses: initial.max_uses,
          starts_at: initial.starts_at ? initial.starts_at.slice(0, 16) : null,
          expires_at: initial.expires_at ? initial.expires_at.slice(0, 16) : null,
          active: initial.active
        }
      : EMPTY_PROMOTION_INPUT
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isDemo) {
      setError("Demo mode: tidak bisa menyimpan.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload: PromotionInput = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      type: form.type,
      value: Number(form.value) || 0,
      min_purchase: form.min_purchase != null && String(form.min_purchase) !== "" ? Number(form.min_purchase) : null,
      max_uses: form.max_uses != null && String(form.max_uses) !== "" ? Number(form.max_uses) : null,
      starts_at: form.starts_at || null,
      expires_at: form.expires_at || null,
      active: form.active
    };
    try {
      const saved = initial
        ? await adminApi.updatePromotion(session.token, initial.id, payload)
        : await adminApi.createPromotion(session.token, payload);
      onSaved(saved, initial ? "update" : "create");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{
        display: "grid",
        gap: 12,
        padding: 16,
        background: "var(--paper-soft)",
        border: "1px solid var(--line)"
      }}
    >
      <div className="tn-label-mono" style={{ fontSize: 11 }}>
        {initial ? `EDIT — ${initial.code}` : "NEW PROMOTION"}
      </div>
      {error && <StatusBar status={{ kind: "err", msg: error }} />}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="settings-grid">
        <Field label="Code" required hint="UPPERCASE, contoh: SUMMER10">
          <input
            className="tn-input"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            required
            maxLength={40}
            pattern="[A-Z0-9_-]+"
          />
        </Field>
        <Field label="Name" required>
          <input
            className="tn-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            maxLength={160}
          />
        </Field>
        <Field label="Discount type" required>
          <div style={{ display: "flex", gap: 12, padding: "8px 0" }}>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
              <input
                type="radio"
                name="ptype"
                checked={form.type === "percentage"}
                onChange={() => setForm({ ...form, type: "percentage" })}
              />
              Percentage (%)
            </label>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
              <input
                type="radio"
                name="ptype"
                checked={form.type === "fixed"}
                onChange={() => setForm({ ...form, type: "fixed" })}
              />
              Fixed (Rp)
            </label>
          </div>
        </Field>
        <Field label={form.type === "percentage" ? "Value (%)" : "Value (Rp)"} required>
          <input
            className="tn-input"
            type="number"
            min={0}
            step={form.type === "percentage" ? 1 : 1000}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
            required
          />
        </Field>
        <Field label="Min. purchase (Rp)">
          <input
            className="tn-input"
            type="number"
            min={0}
            step={1000}
            value={form.min_purchase ?? ""}
            onChange={(e) =>
              setForm({ ...form, min_purchase: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Max uses">
          <input
            className="tn-input"
            type="number"
            min={1}
            step={1}
            value={form.max_uses ?? ""}
            onChange={(e) => setForm({ ...form, max_uses: e.target.value === "" ? null : Number(e.target.value) })}
          />
        </Field>
        <Field label="Starts at">
          <input
            className="tn-input"
            type="datetime-local"
            value={form.starts_at ?? ""}
            onChange={(e) => setForm({ ...form, starts_at: e.target.value || null })}
          />
        </Field>
        <Field label="Expires at">
          <input
            className="tn-input"
            type="datetime-local"
            value={form.expires_at ?? ""}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value || null })}
          />
        </Field>
      </div>
      <Field label="Active">
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          <span style={{ fontSize: 13 }}>Promo aktif untuk dipakai customer</span>
        </label>
      </Field>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="tn-btn" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Create promotion"}
        </button>
        <button type="button" className="tn-btn-link" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Payments ──────────────────────────────────────────────────────────────

const DEMO_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 1, code: "qris", label: "QRIS", type: "qris", enabled: true, sort_order: 1 },
  { id: 2, code: "va_bca", label: "Virtual Account BCA", type: "va", enabled: true, sort_order: 10 },
  { id: 3, code: "va_mandiri", label: "Virtual Account Mandiri", type: "va", enabled: true, sort_order: 11 },
  { id: 4, code: "va_bni", label: "Virtual Account BNI", type: "va", enabled: true, sort_order: 12 },
  { id: 5, code: "va_bri", label: "Virtual Account BRI", type: "va", enabled: true, sort_order: 13 },
  { id: 6, code: "ewallet_gopay", label: "GoPay", type: "ewallet", enabled: true, sort_order: 20 },
  { id: 7, code: "ewallet_ovo", label: "OVO", type: "ewallet", enabled: true, sort_order: 21 },
  { id: 8, code: "ewallet_dana", label: "DANA", type: "ewallet", enabled: true, sort_order: 22 },
  { id: 9, code: "ewallet_shopeepay", label: "ShopeePay", type: "ewallet", enabled: true, sort_order: 23 },
  { id: 10, code: "card", label: "Credit / Debit Card", type: "card", enabled: true, sort_order: 30 }
];

function PaymentsPanel({ session, isDemo }: { session: AdminSession; isDemo: boolean }) {
  const [methods, setMethods] = useState<PaymentMethod[]>(isDemo ? DEMO_PAYMENT_METHODS : []);
  const [loading, setLoading] = useState(!isDemo);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [drafts, setDrafts] = useState<Record<number, { label: string; sort_order: number }>>({});

  useEffect(() => {
    if (isDemo) return;
    setLoading(true);
    adminApi
      .paymentMethods(session.token)
      .then(setMethods)
      .catch((caught) =>
        setStatus({ kind: "err", msg: caught instanceof Error ? caught.message : "Gagal memuat payments." })
      )
      .finally(() => setLoading(false));
  }, [session.token, isDemo]);

  function draftFor(m: PaymentMethod) {
    return drafts[m.id] ?? { label: m.label, sort_order: m.sort_order };
  }

  function updateDraft(m: PaymentMethod, patch: Partial<{ label: string; sort_order: number }>) {
    setDrafts((d) => ({ ...d, [m.id]: { ...draftFor(m), ...patch } }));
  }

  async function persist(m: PaymentMethod, payload: PaymentMethodInput) {
    if (isDemo) {
      setMethods((list) => list.map((x) => (x.id === m.id ? { ...x, ...payload, sort_order: payload.sort_order ?? x.sort_order } : x)));
      setStatus({ kind: "err", msg: "Demo mode: perubahan tidak disimpan." });
      return;
    }
    setSavingId(m.id);
    setStatus(null);
    try {
      const updated = await adminApi.updatePaymentMethod(session.token, m.id, payload);
      setMethods((list) => list.map((x) => (x.id === updated.id ? updated : x)));
      setDrafts((d) => {
        const { [m.id]: _drop, ...rest } = d;
        return rest;
      });
      setStatus({ kind: "ok", msg: `${updated.label} disimpan.` });
    } catch (caught) {
      setStatus({ kind: "err", msg: caught instanceof Error ? caught.message : "Gagal menyimpan." });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="tn-card" style={{ padding: 24, display: "grid", gap: 16 }}>
      <div>
        <h3 className="tn-display-5">
          <em style={{ fontStyle: "italic" }}>Payments</em>
        </h3>
        <div className="tn-body-sm" style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
          Aktif/nonaktifkan metode pembayaran & atur urutan tampil di checkout.
        </div>
      </div>

      <StatusBar status={status} />

      {loading ? (
        <div className="tn-body-sm" style={{ color: "var(--muted)" }}>Loading…</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
                <Th>Code</Th>
                <Th>Type</Th>
                <Th>Label</Th>
                <Th style={{ width: 110 }}>Order</Th>
                <Th style={{ width: 100 }}>Enabled</Th>
                <Th style={{ width: 100 }}>{""}</Th>
              </tr>
            </thead>
            <tbody>
              {methods.map((m) => {
                const draft = draftFor(m);
                const dirty = draft.label !== m.label || draft.sort_order !== m.sort_order;
                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid var(--line-soft, var(--line))" }}>
                    <Td><code style={{ fontSize: 12 }}>{m.code}</code></Td>
                    <Td style={{ textTransform: "uppercase", fontSize: 11, color: "var(--muted)" }}>{m.type}</Td>
                    <Td>
                      <input
                        className="tn-input"
                        value={draft.label}
                        maxLength={120}
                        onChange={(e) => updateDraft(m, { label: e.target.value })}
                        disabled={isDemo}
                      />
                    </Td>
                    <Td>
                      <input
                        className="tn-input"
                        type="number"
                        min={0}
                        value={draft.sort_order}
                        onChange={(e) => updateDraft(m, { sort_order: Number(e.target.value) })}
                        disabled={isDemo}
                      />
                    </Td>
                    <Td>
                      <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                        <input
                          type="checkbox"
                          checked={m.enabled}
                          disabled={isDemo || savingId === m.id}
                          onChange={(e) =>
                            persist(m, {
                              label: draft.label,
                              enabled: e.target.checked,
                              sort_order: draft.sort_order
                            })
                          }
                        />
                      </label>
                    </Td>
                    <Td>
                      <button
                        type="button"
                        className="tn-btn-link"
                        disabled={isDemo || savingId === m.id || !dirty}
                        onClick={() =>
                          persist(m, {
                            label: draft.label,
                            enabled: m.enabled,
                            sort_order: draft.sort_order
                          })
                        }
                      >
                        {savingId === m.id ? "…" : "Save"}
                      </button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  hint,
  children
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span className="tn-label-mono" style={{ fontSize: 11 }}>
        {label.toUpperCase()}
        {required && <span style={{ color: "var(--danger)", marginLeft: 4 }}>*</span>}
      </span>
      {children}
      {hint && (
        <span className="tn-body-sm" style={{ fontSize: 12, color: "var(--muted)" }}>
          {hint}
        </span>
      )}
    </label>
  );
}

function StatusBar({ status }: { status: { kind: "ok" | "err"; msg: string } | null }) {
  if (!status) return null;
  return (
    <div
      style={{
        padding: "8px 12px",
        border: `1px solid ${status.kind === "ok" ? "var(--success)" : "var(--warning)"}`,
        background: "var(--paper-soft)",
        color: status.kind === "ok" ? "var(--success)" : "var(--warning)",
        fontSize: 13
      }}
    >
      {status.msg}
    </div>
  );
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th
      className="tn-label-mono"
      style={{ padding: "10px 8px", fontSize: 10, color: "var(--muted)", fontWeight: 500, ...style }}
    >
      {typeof children === "string" ? children.toUpperCase() : children}
    </th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: "10px 8px", verticalAlign: "middle", ...style }}>{children}</td>;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function AdminSettingsPage() {
  return (
    <AdminGuard>{(session, { isDemo }) => <SettingsView session={session} isDemo={isDemo} />}</AdminGuard>
  );
}
