"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminGuard, DemoModeBanner } from "@/components/AdminGuard";
import { AdminShell } from "@/components/AdminShell";
import { adminApi, formatCurrency } from "@/lib/api";
import type { AdminSession, ShippingZone } from "@/types/api";

function ShippingZonesView({ session, isDemo }: { session: AdminSession; isDemo: boolean }) {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) return;
    adminApi
      .shippingZones(session.token)
      .then(setZones)
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : "Gagal memuat zona.");
      });
  }, [session.token, isDemo]);

  return (
    <AdminShell
      subtitle="Shipping"
      title={
        <>
          Delivery <em style={{ fontStyle: "italic" }}>zones</em>
        </>
      }
      action={
        <Link href="/admin/shipping/new" className="tn-btn">
          + New zone
        </Link>
      }
    >
      {isDemo && <DemoModeBanner />}
      {error && (
        <div
          style={{
            padding: 12,
            marginBottom: 20,
            border: "1px solid var(--warning)",
            background: "var(--paper-soft)",
            color: "var(--warning)",
            fontSize: 14
          }}
        >
          {error}
        </div>
      )}

      <div className="tn-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 12px", display: "flex", justifyContent: "space-between" }}>
          <h3 className="tn-display-5">
            Configured <em style={{ fontStyle: "italic" }}>zones</em>
          </h3>
          <span className="tn-label-mono">{zones.length} ZONES</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 720 }}>
            <thead>
              <tr
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: "var(--muted)",
                  textTransform: "uppercase"
                }}
              >
                {["Name", "Cities", "Cost", "ETD", "Status"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 24px",
                      borderTop: "1px solid var(--ink)",
                      borderBottom: "1px solid var(--line)",
                      fontWeight: 500
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map((z, i) => (
                <tr
                  key={z.id}
                  style={{
                    borderBottom: i < zones.length - 1 ? "1px solid var(--line-soft)" : "none"
                  }}
                >
                  <td style={{ padding: "14px 24px" }}>
                    <Link href={`/admin/shipping/${z.id}`} style={{ color: "inherit" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16 }}>
                        {z.name}
                      </div>
                      {z.description && (
                        <div className="tn-body-sm" style={{ fontSize: 11 }}>
                          {z.description}
                        </div>
                      )}
                    </Link>
                  </td>
                  <td style={{ padding: "14px 24px", color: "var(--ink-soft)" }}>
                    {z.cities.slice(0, 3).join(", ")}
                    {z.cities.length > 3 && ` +${z.cities.length - 3}`}
                  </td>
                  <td style={{ padding: "14px 24px" }}>
                    <span className="tn-price">{formatCurrency(z.cost)}</span>
                  </td>
                  <td style={{ padding: "14px 24px", color: "var(--ink-soft)" }}>{z.etd ?? "—"}</td>
                  <td style={{ padding: "14px 24px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "3px 10px",
                        borderRadius: 999,
                        background: "var(--paper-soft)",
                        border: "1px solid var(--line)",
                        fontSize: 12
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 999,
                          background: z.is_active ? "var(--success)" : "var(--muted)"
                        }}
                      />
                      {z.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {zones.length === 0 && !error && (
                <tr>
                  <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
                    Belum ada zona. Klik &quot;+ New zone&quot; untuk menambah.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

export default function AdminShippingPage() {
  return (
    <AdminGuard>
      {(session, { isDemo }) => <ShippingZonesView session={session} isDemo={isDemo} />}
    </AdminGuard>
  );
}
