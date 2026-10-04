"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { AdminGuard, DemoModeBanner } from "@/components/AdminGuard";
import { AdminShell } from "@/components/AdminShell";
import { adminApi } from "@/lib/api";
import { ShippingZoneForm } from "../ShippingZoneForm";
import type { AdminSession, ShippingZone, ShippingZoneInput } from "@/types/api";

function ZoneEditView({ session, id, isDemo }: { session: AdminSession; id: string; isDemo: boolean }) {
  const router = useRouter();
  const [zone, setZone] = useState<ShippingZone | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setError("Demo session — zona tidak bisa dimuat tanpa backend.");
      return;
    }
    adminApi
      .shippingZone(session.token, id)
      .then(setZone)
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : "Zona tidak ditemukan.")
      );
  }, [session.token, id, isDemo]);

  async function handleSubmit(payload: ShippingZoneInput) {
    if (!zone || isDemo) return;
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const updated = await adminApi.updateShippingZone(session.token, zone.id, payload);
      setZone(updated);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Gagal menyimpan zona.";
      setError(message);
      try {
        const parsed = JSON.parse(message);
        if (parsed?.errors) setFieldErrors(parsed.errors);
      } catch {
        /* not JSON */
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!zone || isDemo) return;
    if (!window.confirm(`Hapus zona "${zone.name}"?`)) return;
    setDeleting(true);
    try {
      await adminApi.deleteShippingZone(session.token, zone.id);
      router.push("/admin/shipping");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menghapus zona.");
      setDeleting(false);
    }
  }

  if (error && !zone) {
    return (
      <AdminShell subtitle="Shipping" title={<>Not <em style={{ fontStyle: "italic" }}>found</em>.</>}>
        {isDemo && <DemoModeBanner />}
        <div
          style={{
            padding: 20,
            border: "1px solid var(--warning)",
            background: "var(--paper-soft)",
            color: "var(--warning)",
            fontSize: 14
          }}
        >
          {error}
        </div>
        <Link
          href="/admin/shipping"
          className="tn-btn-link"
          style={{ display: "inline-flex", gap: 6, marginTop: 16, fontSize: 13 }}
        >
          <ArrowLeft size={14} /> Back to zones
        </Link>
      </AdminShell>
    );
  }

  if (!zone) {
    return (
      <AdminShell subtitle="Loading" title={<>Loading <em style={{ fontStyle: "italic" }}>zone</em>…</>}>
        <div className="tn-skeleton" style={{ width: "100%", height: 280, marginBottom: 18 }} />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      subtitle="Shipping"
      title={
        <>
          Edit <em style={{ fontStyle: "italic" }}>{zone.name}</em>
        </>
      }
      action={
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/admin/shipping"
            className="tn-btn tn-btn-ghost"
            style={{ display: "inline-flex", gap: 6 }}
          >
            <ArrowLeft size={14} /> Back
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || isDemo}
            className="tn-btn tn-btn-ghost"
            style={{ display: "inline-flex", gap: 6, color: "var(--danger)", borderColor: "var(--danger)" }}
          >
            <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      }
    >
      {isDemo && <DemoModeBanner />}
      <ShippingZoneForm
        mode="edit"
        initial={zone}
        submitting={submitting}
        error={error}
        fieldErrors={fieldErrors}
        disabled={isDemo}
        onSubmit={handleSubmit}
      />
    </AdminShell>
  );
}

export default function AdminShippingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  if (!id) return null;
  return (
    <AdminGuard>
      {(session, { isDemo }) => <ZoneEditView session={session} id={id} isDemo={isDemo} />}
    </AdminGuard>
  );
}
