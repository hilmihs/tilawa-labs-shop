"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types/api";

export type ProductFormProps = {
  mode: "create" | "edit";
  initial?: Product;
  submitting?: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string[]>;
  disabled?: boolean;
  onSubmit: (formData: FormData) => void | Promise<void>;
};

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";
const MAX_IMAGES = 8;
const MAX_FILE_BYTES = 4 * 1024 * 1024;

export function ProductForm({ mode, initial, submitting, error, fieldErrors, disabled, onSubmit }: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState<string>(initial?.price?.toString() ?? "");
  const [stock, setStock] = useState<string>(initial?.stock?.toString() ?? "");
  const [weight, setWeight] = useState<string>(initial?.weight_grams?.toString() ?? "");
  const [isActive, setIsActive] = useState<boolean>(initial?.is_active ?? true);
  const [files, setFiles] = useState<File[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);

  function handleFiles(list: FileList | null) {
    if (!list) {
      setFiles([]);
      return;
    }
    const arr = Array.from(list);
    if (arr.length > MAX_IMAGES) {
      setClientError(`Maksimal ${MAX_IMAGES} gambar.`);
      return;
    }
    const oversize = arr.find((f) => f.size > MAX_FILE_BYTES);
    if (oversize) {
      setClientError(`File "${oversize.name}" melebihi 4 MB.`);
      return;
    }
    setClientError(null);
    setFiles(arr);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled || submitting) return;

    const fd = new FormData();
    fd.append("name", name.trim());
    if (slug.trim()) fd.append("slug", slug.trim());
    fd.append("description", description.trim());
    fd.append("price", price || "0");
    fd.append("stock", stock || "0");
    fd.append("weight_grams", weight || "0");
    fd.append("is_active", isActive ? "1" : "0");

    if (files.length > 0) {
      files.forEach((file) => fd.append("images[]", file));
    }

    await onSubmit(fd);
  }

  function fieldError(name: string): string | undefined {
    return fieldErrors?.[name]?.[0];
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 20 }}>
      {(error || clientError) && (
        <div
          style={{
            padding: 12,
            border: "1px solid var(--warning)",
            background: "var(--paper-soft)",
            color: "var(--warning)",
            fontSize: 13
          }}
        >
          {clientError ?? error}
        </div>
      )}

      <div className="tn-card" style={{ padding: 24, display: "grid", gap: 16 }}>
        <h3 className="tn-display-5">
          <em style={{ fontStyle: "italic" }}>Details</em>
        </h3>

        <Field label="Name" required error={fieldError("name")}>
          <input
            className="tn-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={160}
            required
            disabled={disabled}
          />
        </Field>

        <Field
          label="Slug"
          hint="Kosongkan untuk auto-generate dari nama."
          error={fieldError("slug")}
        >
          <input
            className="tn-input"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            maxLength={180}
            disabled={disabled}
            placeholder="mis. tas-anyaman-rotan"
          />
        </Field>

        <Field label="Description" required error={fieldError("description")}>
          <textarea
            className="tn-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={5000}
            required
            rows={6}
            disabled={disabled}
            style={{ resize: "vertical", minHeight: 120 }}
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="three-col">
          <Field label="Price (IDR)" required error={fieldError("price")}>
            <input
              className="tn-input"
              type="number"
              min={0}
              step={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              disabled={disabled}
            />
          </Field>
          <Field label="Stock" required error={fieldError("stock")}>
            <input
              className="tn-input"
              type="number"
              min={0}
              step={1}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              disabled={disabled}
            />
          </Field>
          <Field label="Weight (gram)" required error={fieldError("weight_grams")}>
            <input
              className="tn-input"
              type="number"
              min={1}
              step={1}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              disabled={disabled}
            />
          </Field>
        </div>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 14 }}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={disabled}
          />
          Active (terlihat di storefront)
        </label>
      </div>

      <div className="tn-card" style={{ padding: 24, display: "grid", gap: 14 }}>
        <h3 className="tn-display-5">
          <em style={{ fontStyle: "italic" }}>Images</em>
        </h3>

        {mode === "edit" && initial?.images && initial.images.length > 0 && (
          <>
            <div className="tn-label-mono" style={{ fontSize: 11 }}>
              Existing
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {initial.images.map((img) => (
                <div
                  key={img.id}
                  style={{
                    position: "relative",
                    width: 96,
                    height: 96,
                    border: "1px solid var(--line)",
                    background: "var(--paper-soft)"
                  }}
                >
                  <Image src={img.url} alt={img.alt_text ?? ""} fill style={{ objectFit: "cover" }} />
                </div>
              ))}
            </div>
            <p className="tn-body-sm" style={{ fontSize: 12, color: "var(--muted)" }}>
              Memilih gambar baru di bawah akan <strong>mengganti seluruh gambar lama</strong>. Biarkan kosong untuk
              mempertahankan yang sekarang.
            </p>
          </>
        )}

        <Field
          label={mode === "edit" ? "Replace images (optional)" : "Upload images"}
          hint={`Maks ${MAX_IMAGES} file · format JPG / PNG / WebP · maks 4 MB per file.`}
          error={fieldError("images") ?? fieldError("images.0")}
        >
          <input
            type="file"
            accept={ACCEPT}
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            disabled={disabled}
          />
        </Field>

        {files.length > 0 && (
          <div className="tn-label-mono" style={{ fontSize: 11 }}>
            {files.length} file dipilih
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button type="submit" className="tn-btn" disabled={disabled || submitting}>
          {submitting ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </button>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .three-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span className="tn-label-mono" style={{ fontSize: 11 }}>
        {label.toUpperCase()}
        {required && <span style={{ color: "var(--danger)", marginLeft: 4 }}>*</span>}
      </span>
      {children}
      {hint && !error && (
        <span className="tn-body-sm" style={{ fontSize: 12, color: "var(--muted)" }}>
          {hint}
        </span>
      )}
      {error && (
        <span style={{ fontSize: 12, color: "var(--danger)" }}>{error}</span>
      )}
    </label>
  );
}
