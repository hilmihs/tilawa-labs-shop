"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight, Copy, ClipboardCheck, Wallet, QrCode, CreditCard, Building2 } from "lucide-react";
import { formatCurrency, getOrder } from "@/lib/api";
import { Stepper, SumRow, Wordmark } from "@/components/design";
import {
  loadPaymentInstructions,
  markMockOrderPaid,
  type PaymentInstructions
} from "@/lib/mock-checkout";
import type { OrderDetail } from "@/types/api";

const statusLabel: Record<string, string> = {
  paid: "Payment received",
  pending: "Awaiting payment",
  failed: "Payment failed",
  expired: "Payment expired"
};

const orderStep: Record<string, number> = {
  paid: 4,
  pending: 3,
  failed: 3,
  expired: 3
};

export default function PaymentStatusPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params?.orderNumber ?? "";
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [instructions, setInstructions] = useState<PaymentInstructions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!orderNumber) return;
    getOrder(orderNumber)
      .then((result) => {
        if (!cancelled) {
          setOrder(result as OrderDetail);
          setInstructions(loadPaymentInstructions(orderNumber));
          setLoaded(true);
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Order could not be loaded.");
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  function handleMarkPaid() {
    const updated = markMockOrderPaid(orderNumber);
    if (updated) setOrder(updated);
  }

  return (
    <>
      <header
        style={{
          borderBottom: "1px solid var(--line)",
          background: "var(--paper)",
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap"
        }}
      >
        <Link href="/">
          <Wordmark size={26} />
        </Link>
        <Stepper
          step={order ? orderStep[order.payment_status] ?? 3 : 3}
          steps={["Address", "Shipping", "Pay", "Done"]}
        />
        <Link href="/" className="tn-btn-link" style={{ fontSize: 13 }}>
          Home
        </Link>
      </header>

      <section style={{ padding: "72px 40px 64px" }}>
        {!loaded ? (
          <PaymentSkeleton />
        ) : error || !order ? (
          <NotFound orderNumber={orderNumber} message={error ?? "Order not found."} />
        ) : order.payment_status === "pending" ? (
          <PaymentPending order={order} instructions={instructions} onMarkPaid={handleMarkPaid} />
        ) : (
          <PaymentSuccess order={order} />
        )}

        <style>{`
          @media (max-width: 1024px) {
            .success-grid { grid-template-columns: 1fr !important; }
            .pay-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>
    </>
  );
}

function PaymentPending({
  order,
  instructions,
  onMarkPaid
}: {
  order: OrderDetail;
  instructions: PaymentInstructions | null;
  onMarkPaid: () => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: 64,
        alignItems: "start"
      }}
      className="pay-grid"
    >
      <div>
        <div className="tn-eyebrow" style={{ marginBottom: 12 }}>
          ORDER NO · {order.order_number}
        </div>
        <h1 className="tn-display-2" style={{ marginBottom: 18 }}>
          Awaiting <em style={{ fontStyle: "italic" }}>payment</em>.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--ink-soft)", marginBottom: 32 }}>
          {instructions?.label ?? "Complete payment to release your order to the maker."}
        </p>

        <PaymentInstructionsBlock
          instructions={instructions}
          order={order}
          onMarkPaid={onMarkPaid}
        />
      </div>

      <aside className="tn-card" style={{ padding: 28 }}>
        <div className="tn-eyebrow" style={{ marginBottom: 14 }}>SUMMARY</div>
        <SumRow k="Order status" v={order.status} muted />
        <SumRow k="Payment status" v={order.payment_status} muted />
        <hr className="tn-hr" style={{ margin: "12px 0" }} />
        {order.items.map((item) => (
          <SumRow
            key={item.id}
            k={`${item.product_name} × ${item.quantity}`}
            v={formatCurrency(item.line_total)}
            muted
          />
        ))}
        <hr className="tn-hr" style={{ margin: "10px 0" }} />
        <SumRow k="Subtotal" v={formatCurrency(order.subtotal)} muted />
        <SumRow
          k={`Shipping${order.shipping_courier ? ` · ${order.shipping_courier.toUpperCase()} ${order.shipping_service ?? ""}` : ""}`}
          v={formatCurrency(order.shipping_cost)}
          muted
        />
        <hr className="tn-hr" style={{ margin: "10px 0" }} />
        <SumRow k="Total to pay" v={formatCurrency(order.total)} strong />
        {instructions?.expiresAt && (
          <p className="tn-body-sm" style={{ marginTop: 14, color: "var(--muted)" }}>
            Instructions expire {new Date(instructions.expiresAt).toLocaleString("id-ID")}.
          </p>
        )}
      </aside>
    </div>
  );
}

function PaymentInstructionsBlock({
  instructions,
  order,
  onMarkPaid
}: {
  instructions: PaymentInstructions | null;
  order: OrderDetail;
  onMarkPaid: () => void;
}) {
  if (!instructions) {
    return (
      <div className="tn-card" style={{ padding: 24, color: "var(--muted)" }}>
        Payment instructions are unavailable for this order.
        <div style={{ marginTop: 16 }}>
          <button type="button" className="tn-btn" onClick={onMarkPaid}>
            Mark as paid (demo)
          </button>
        </div>
      </div>
    );
  }

  if (instructions.method === "qris") {
    return (
      <PaymentCard icon={<QrCode size={18} />} title="QRIS — Scan to pay">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 28,
            alignItems: "center"
          }}
        >
          <QrPattern seed={instructions.qrisPayload ?? order.order_number} />
          <div>
            <div className="tn-eyebrow" style={{ marginBottom: 10 }}>HOW TO PAY</div>
            <ol style={{ paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: "var(--ink-soft)", margin: 0 }}>
              <li>Open GoPay, OVO, DANA, ShopeePay, or any mobile banking app with QRIS.</li>
              <li>Tap "Scan" and aim at this QR code.</li>
              <li>Confirm the amount of <strong>{formatCurrency(order.total)}</strong>.</li>
              <li>You'll receive a notification once payment lands.</li>
            </ol>
          </div>
        </div>
        <MarkAsPaidRow onMarkPaid={onMarkPaid} />
      </PaymentCard>
    );
  }

  if (instructions.vaNumber) {
    return (
      <PaymentCard
        icon={<Building2 size={18} />}
        title={`${instructions.bankName ?? "Virtual"} Account`}
      >
        <div className="tn-eyebrow" style={{ marginBottom: 8 }}>
          {instructions.bankName?.toUpperCase()} VIRTUAL ACCOUNT NUMBER
        </div>
        <CopyableValue value={instructions.vaNumber} display={formatVa(instructions.vaNumber)} />
        <div style={{ marginTop: 18 }}>
          <div className="tn-eyebrow" style={{ marginBottom: 6 }}>AMOUNT</div>
          <CopyableValue value={String(order.total)} display={formatCurrency(order.total)} />
        </div>
        <p className="tn-body-sm" style={{ marginTop: 18 }}>
          Open your {instructions.bankName} mobile or internet banking, choose
          "Transfer → Virtual Account", and pay <strong>{formatCurrency(order.total)}</strong>{" "}
          to the account above before the instructions expire.
        </p>
        <MarkAsPaidRow onMarkPaid={onMarkPaid} />
      </PaymentCard>
    );
  }

  if (instructions.walletName) {
    return (
      <PaymentCard icon={<Wallet size={18} />} title={instructions.walletName}>
        <p style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 18 }}>
          A payment request for <strong>{formatCurrency(order.total)}</strong> has been sent
          to your <strong>{instructions.walletName}</strong> account registered under{" "}
          <strong>{order.customer_phone || order.customer_email}</strong>.
        </p>
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 6,
            padding: 16,
            background: "var(--page)",
            display: "flex",
            alignItems: "center",
            gap: 14
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: "var(--ink)",
              color: "var(--paper)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.1em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {instructions.walletName.slice(0, 3).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div className="tn-eyebrow" style={{ fontSize: 10 }}>OPEN YOUR APP</div>
            <div style={{ fontSize: 13 }}>
              Tap the pending request and confirm with your PIN.
            </div>
          </div>
        </div>
        <MarkAsPaidRow onMarkPaid={onMarkPaid} />
      </PaymentCard>
    );
  }

  // Card fallback
  return (
    <PaymentCard icon={<CreditCard size={18} />} title="Card payment">
      <p style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 18 }}>
        Enter your card details on the secure payment page. We'll authorise
        <strong> {formatCurrency(order.total)}</strong> against your Visa, Mastercard, or JCB.
      </p>
      <div
        style={{
          border: "1px dashed var(--line)",
          borderRadius: 8,
          padding: 18,
          background: "var(--page)"
        }}
      >
        <div className="tn-eyebrow" style={{ marginBottom: 12 }}>CARD ON FILE (DEMO)</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.18em" }}>
          •••• •••• •••• 4242
        </div>
        <div className="tn-body-sm" style={{ marginTop: 8 }}>
          Expires 12/29 · CVC ***
        </div>
      </div>
      <MarkAsPaidRow onMarkPaid={onMarkPaid} />
    </PaymentCard>
  );
}

function PaymentCard({
  icon,
  title,
  children
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="tn-card" style={{ padding: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingBottom: 18,
          marginBottom: 18,
          borderBottom: "1px solid var(--line-soft)"
        }}
      >
        <span style={{ color: "var(--terracotta)" }}>{icon}</span>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontStyle: "italic",
            margin: 0
          }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function MarkAsPaidRow({ onMarkPaid }: { onMarkPaid: () => void }) {
  return (
    <div
      style={{
        marginTop: 22,
        paddingTop: 18,
        borderTop: "1px solid var(--line-soft)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap"
      }}
    >
      <button type="button" className="tn-btn" onClick={onMarkPaid}>
        I've paid (demo) <Check size={14} />
      </button>
      <span className="tn-body-sm" style={{ color: "var(--muted)" }}>
        Demo mode — tap to simulate Midtrans webhook.
      </span>
    </div>
  );
}

function CopyableValue({ value, display }: { value: string; display: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        background: "var(--page)",
        border: "1px solid var(--line)",
        borderRadius: 6
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 18,
          letterSpacing: "0.06em",
          flex: 1
        }}
      >
        {display}
      </div>
      <button
        type="button"
        onClick={copy}
        className="tn-btn-link"
        style={{
          background: "transparent",
          border: 0,
          padding: 0,
          cursor: "pointer",
          color: copied ? "var(--success)" : "var(--ink)",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12
        }}
        aria-label={copied ? "Copied" : "Copy"}
      >
        {copied ? <ClipboardCheck size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function formatVa(value: string): string {
  return value.replace(/(.{4})/g, "$1 ").trim();
}

function QrPattern({ seed }: { seed: string }) {
  // Deterministic 21×21 cell pattern derived from `seed`. Not a scannable QR —
  // a stylised stand-in for demo screenshots that consistently renders the
  // same image for the same order number.
  const size = 21;
  const cells = useMemo(() => buildQrCells(seed, size), [seed]);
  const cellSize = 8;
  const padding = 16;
  const totalSize = size * cellSize + padding * 2;
  return (
    <div
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        padding: padding,
        width: totalSize,
        height: totalSize,
        borderRadius: 4,
        position: "relative"
      }}
    >
      <svg
        width={size * cellSize}
        height={size * cellSize}
        viewBox={`0 0 ${size * cellSize} ${size * cellSize}`}
        style={{ display: "block" }}
      >
        {cells.map((row, y) =>
          row.map((on, x) =>
            on ? (
              <rect
                key={`${x}-${y}`}
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize}
                height={cellSize}
                fill="var(--ink)"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

function buildQrCells(seed: string, size: number): boolean[][] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  function rand(): number {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 0x100000000;
  }
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => rand() > 0.55)
  );
  // Stamp the three finder patterns (top-left, top-right, bottom-left) to make
  // it look QR-shaped at a glance.
  const stamps: Array<[number, number]> = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7]
  ];
  for (const [ox, oy] of stamps) {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[oy + y][ox + x] = edge || inner;
      }
    }
    // Clear the one-cell ring around each finder.
    for (let y = -1; y <= 7; y++) {
      for (let x = -1; x <= 7; x++) {
        if ((x === -1 || x === 7 || y === -1 || y === 7) && oy + y >= 0 && oy + y < size && ox + x >= 0 && ox + x < size) {
          grid[oy + y][ox + x] = false;
        }
      }
    }
  }
  return grid;
}

function PaymentSuccess({ order }: { order: OrderDetail }) {
  const isPaid = order.payment_status === "paid";
  const isPending = order.payment_status === "pending";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: 64,
        alignItems: "start"
      }}
      className="success-grid"
    >
      <div>
        <div
          style={{
            width: 64,
            height: 64,
            border: "1.5px solid var(--ink)",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
            color: isPaid ? "var(--terracotta)" : "var(--muted)"
          }}
        >
          <Check size={28} strokeWidth={1.6} />
        </div>
        <div className="tn-eyebrow" style={{ marginBottom: 12 }}>
          ORDER NO · {order.order_number}
        </div>
        <h1 className="tn-display-2" style={{ marginBottom: 24 }}>
          {isPaid ? (
            <>
              Thank <em style={{ fontStyle: "italic" }}>you</em>.
            </>
          ) : (
            <>
              {statusLabel[order.payment_status] ?? "Order placed"}
              <em style={{ fontStyle: "italic" }}>.</em>
            </>
          )}
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--ink-soft)", maxWidth: 520 }}>
          {isPaid &&
            "Your payment was successful. A confirmation has been sent to your email. The maker has been notified and will pack your order within 24 hours."}
          {isPending &&
            "Your order is created and awaiting payment through Midtrans Snap. Once payment is complete, we'll begin processing the shipment."}
          {!isPaid &&
            !isPending &&
            "Your payment couldn't be completed. You can retry or place a new order."}
        </p>

        <div style={{ marginTop: 48 }}>
          <div className="tn-eyebrow" style={{ marginBottom: 16 }}>
            ORDER TIMELINE
          </div>
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 0 }}>
            {[
              { s: "Order placed", done: true },
              { s: "Payment received", done: isPaid },
              { s: "Packed & labelled", done: false },
              { s: "Handed to courier", done: false },
              { s: "Delivered to destination", done: false }
            ].map((t, i, arr) => (
              <li
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "20px 1fr",
                  gap: 18,
                  padding: "14px 0",
                  position: "relative"
                }}
              >
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 999,
                      background: t.done ? "var(--ink)" : "var(--page)",
                      border: "1.5px solid " + (t.done ? "var(--ink)" : "var(--line)"),
                      display: "block",
                      marginTop: 6,
                      marginLeft: 4
                    }}
                  />
                  {i < arr.length - 1 && (
                    <span
                      style={{
                        position: "absolute",
                        top: 22,
                        left: 9,
                        bottom: -14,
                        width: 1,
                        background: t.done ? "var(--ink)" : "var(--line)"
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    fontWeight: t.done ? 500 : 400,
                    color: t.done ? "var(--ink)" : "var(--muted)"
                  }}
                >
                  {t.s}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {order.snap_redirect_url && isPending ? (
            <a className="tn-btn" href={order.snap_redirect_url}>
              Continue payment <ArrowRight size={14} />
            </a>
          ) : (
            <Link className="tn-btn" href="/">
              Continue shopping <ArrowRight size={14} />
            </Link>
          )}
          <Link className="tn-btn tn-btn-ghost" href="/account">
            View account
          </Link>
        </div>
      </div>

      <aside className="tn-card" style={{ padding: 28 }}>
        <div className="tn-eyebrow" style={{ marginBottom: 14 }}>
          SUMMARY
        </div>
        <SumRow k="Order status" v={order.status} muted />
        <SumRow k="Payment status" v={order.payment_status} muted />
        <hr className="tn-hr" style={{ margin: "12px 0" }} />
        {order.items.length > 0 && (
          <>
            {order.items.map((item) => (
              <SumRow
                key={item.id}
                k={`${item.product_name} × ${item.quantity}`}
                v={formatCurrency(item.line_total)}
                muted
              />
            ))}
            <hr className="tn-hr" style={{ margin: "10px 0" }} />
          </>
        )}
        <SumRow k="Subtotal" v={formatCurrency(order.subtotal)} muted />
        <SumRow
          k={`Shipping${order.shipping_courier ? ` · ${order.shipping_courier.toUpperCase()} ${order.shipping_service ?? ""}` : ""}`}
          v={formatCurrency(order.shipping_cost)}
          muted
        />
        <hr className="tn-hr" style={{ margin: "10px 0" }} />
        <SumRow k="Total" v={formatCurrency(order.total)} strong />
        {order.shipping_address && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line-soft)" }}>
            <div className="tn-eyebrow" style={{ marginBottom: 8 }}>SHIPPING TO</div>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>
              {order.customer_name}
              <br />
              {order.shipping_address.line1}
              {order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ""}
              <br />
              {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function PaymentSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: 64,
        alignItems: "start"
      }}
      className="success-grid"
    >
      <div>
        <div className="tn-skeleton" style={{ width: 64, height: 64, borderRadius: 999, marginBottom: 28 }} />
        <div className="tn-skeleton" style={{ width: 220, height: 12, marginBottom: 16 }} />
        <div className="tn-skeleton" style={{ width: "70%", height: 56, marginBottom: 24 }} />
        <div className="tn-skeleton" style={{ width: "90%", height: 18, marginBottom: 10 }} />
        <div className="tn-skeleton" style={{ width: "80%", height: 18 }} />
      </div>
      <div className="tn-skeleton" style={{ width: "100%", height: 280 }} />
    </div>
  );
}

function NotFound({ orderNumber, message }: { orderNumber: string; message: string }) {
  return (
    <div
      className="tn-card"
      style={{ padding: 48, textAlign: "center", maxWidth: 540, margin: "40px auto" }}
    >
      <h1 className="tn-display-4" style={{ marginBottom: 12 }}>
        Order <em style={{ fontStyle: "italic" }}>not found</em>.
      </h1>
      <p className="tn-body-sm" style={{ marginBottom: 6 }}>
        We couldn't find an order matching <strong>{orderNumber || "—"}</strong>.
      </p>
      <p className="tn-body-sm" style={{ marginBottom: 24, color: "var(--muted)" }}>
        {message}
      </p>
      <Link href="/" className="tn-btn">
        Back to home <ArrowRight size={14} />
      </Link>
    </div>
  );
}
