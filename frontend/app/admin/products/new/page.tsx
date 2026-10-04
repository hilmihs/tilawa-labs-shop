"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AdminGuard, DemoModeBanner } from "@/components/AdminGuard";
import { AdminShell } from "@/components/AdminShell";
import { adminApi } from "@/lib/api";
import { ProductForm } from "../ProductForm";
import type { AdminSession } from "@/types/api";

function NewProductView({ session, isDemo }: { session: AdminSession; isDemo: boolean }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(formData: FormData) {
    if (isDemo) {
      setError("Demo mode: tidak bisa membuat produk tanpa backend.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const product = await adminApi.createProduct(session.token, formData);
      router.push(`/admin/products/${product.id}`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Gagal membuat produk.";
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
      subtitle="Catalog"
      title={
        <>
          New <em style={{ fontStyle: "italic" }}>product</em>
        </>
      }
      action={
        <Link
          href="/admin/products"
          className="tn-btn tn-btn-ghost"
          style={{ display: "inline-flex", gap: 6 }}
        >
          <ArrowLeft size={14} /> Back
        </Link>
      }
    >
      {isDemo && <DemoModeBanner />}
      <ProductForm
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

export default function NewProductPage() {
  return (
    <AdminGuard>{(session, { isDemo }) => <NewProductView session={session} isDemo={isDemo} />}</AdminGuard>
  );
}
