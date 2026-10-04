"use client";

import { useState } from "react";
import type { ShippingZone, ShippingZoneInput } from "@/types/api";

export type ShippingZoneFormProps = {
  mode: "create" | "edit";
  initial?: ShippingZone;
  submitting?: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string[]>;
  disabled?: boolean;
  onSubmit: (payload: ShippingZoneInput) => void | Promise<void>;
};

export function ShippingZoneForm({
  mode,
  initial,
  submitting,
  error,
  fieldErrors,
  disabled,
  onSubmit
}: ShippingZoneFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [citiesText, setCitiesText] = useState(initial?.cities?.join(", ") ?? "");
  const [cost, setCost] = useState<string>(initial?.cost?.toString() ?? "");
  const [etd, setEtd] = useState(initial?.etd ?? "");
  const [isActive, setIsActive] = useState<boolean>(initial?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState<string>(initial?.sort_order?.toString() ?? "0");
  const [clientError, setClientError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled || submitting) return;

    const cities = citiesText
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    if (cities.length === 0) {
      setClientError("Cantumkan minimal satu kota.");
      return;
    }
    setClientError(null);

    await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      cities,
      cost: Number(cost || 0),
      etd: etd.trim() || null,
      is_active: isActive,
      sort_order: Number(sortOrder || 0)
    });
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
          Zone <em style={{ fontStyle: "italic" }}>details</em>
        </h3>

        <Field label="Name" required error={fieldError("name")}>
          <input
            className="tn-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            required
            disabled={disabled}
            placeholder="mis. Jabodetabek"
          />
        </Field>

        <Field label="Description" hint="Opsional, untuk catatan internal." error={fieldError("description")}>
          <input
            className="tn-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={240}
            disabled={disabled}
          />
        </Field>

        <Field
          label="Cities"
          required
          hint="Pisahkan dengan koma. Akan dipakai untuk auto-match kota destinasi checkout."
          error={fieldError("cities") ?? fieldError("cities.0")}
        >
          <textarea
            className="tn-input"
            value={citiesText}
            onChange={(e) => setCitiesText(e.target.value)}
            rows={3}
            required
            disabled={disabled}
            placeholder="Jakarta, Bogor, Depok, Tangerang, Bekasi"
            style={{ resize: "vertical", minHeight: 64 }}
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="three-col">
          <Field label="Cost (IDR)" required error={fieldError("cost")}>
            <input
              className="tn-input"
              type="number"
              min={0}
              step={1}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
              disabled={disabled}
            />
          </Field>
          <Field label="ETD" hint='mis. "2-3"' error={fieldError("etd")}>
            <input
              className="tn-input"
              value={etd}
              onChange={(e) => setEtd(e.target.value)}
              maxLength={16}
              disabled={disabled}
            />
          </Field>
          <Field label="Sort order" error={fieldError("sort_order")}>
            <input
              className="tn-input"
              type="number"
              min={0}
              step={1}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
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
          Active (tersedia di checkout)
        </label>
      </div>

      <div>
        <button type="submit" className="tn-btn" disabled={disabled || submitting}>
          {submitting ? "Saving…" : mode === "create" ? "Create zone" : "Save changes"}
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
      {error && <span style={{ fontSize: 12, color: "var(--danger)" }}>{error}</span>}
    </label>
  );
}
