"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AdminGuard, DemoModeBanner } from "@/components/AdminGuard";
import { AdminShell } from "@/components/AdminShell";
import { adminApi } from "@/lib/api";
import { ShippingZoneForm } from "../ShippingZoneForm";
import type { AdminSession, ShippingZoneInput } from "@/types/api";

function NewZoneView({ session, isDemo }: { session: AdminSession; isDemo: boolean }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(payload: ShippingZoneInput) {
    if (isDemo) {
      setError("Demo mode: tidak bisa membuat zona tanpa backend.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const zone = await adminApi.createShippingZone(session.token, payload);
      router.push(`/admin/shipping/${zone.id}`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Gagal membuat zona.";
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

  return (
    <AdminShell
      subtitle="Shipping"
      title={
        <>
          New <em style={{ fontStyle: "italic" }}>zone</em>
        </>
      }
      action={
        <Link href="/admin/shipping" className="tn-btn tn-btn-ghost" style={{ display: "inline-flex", gap: 6 }}>
          <ArrowLeft size={14} /> Back
        </Link>
      }
    >
      {isDemo && <DemoModeBanner />}
      <ShippingZoneForm
        mode="create"
        submitting={submitting}
        error={error}
        fieldErrors={fieldErrors}
        disabled={isDemo}
        onSubmit={handleSubmit}
      />
    </AdminShell>
  );
}

export default function NewZonePage() {
  return (
    <AdminGuard>{(session, { isDemo }) => <NewZoneView session={session} isDemo={isDemo} />}</AdminGuard>
  );
}
