"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, MapPin } from "lucide-react";
import { checkout, formatCurrency, quoteShipping } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { useAddresses, type Address } from "@/lib/addresses";
import type { PaymentMethodId, ShippingQuote } from "@/types/api";
import { PlaceImg, Stepper, SumRow, Wordmark, pickTint } from "@/components/design";
import { RouteGuard } from "@/components/RouteGuard";
import { getSeller } from "@/lib/marketplace";

type FormState = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  line1: string;
  line2: string;
  city: string;
  province: string;
  postal_code: string;
  destination_city_id: string;
  courier: string;
};

const COURIER_OPTIONS = [
  { value: "jne", label: "JNE" },
  { value: "pos", label: "POS Indonesia" },
  { value: "tiki", label: "TIKI" }
];

type PaymentGroup = {
  key: string;
  title: string;
  badge: string;
  hint: string;
  options: { id: PaymentMethodId; label: string }[];
};

const PAYMENT_GROUPS: PaymentGroup[] = [
  {
    key: "qris",
    title: "QRIS",
    badge: "QR",
    hint: "Scan with GoPay, OVO, DANA, ShopeePay, mobile banking",
    options: [{ id: "qris", label: "QRIS" }]
  },
  {
    key: "va",
    title: "Virtual Account",
    badge: "VA",
    hint: "Pay from your bank's mobile or internet banking",
    options: [
      { id: "va_bca", label: "BCA" },
      { id: "va_mandiri", label: "Mandiri" },
      { id: "va_bni", label: "BNI" },
      { id: "va_bri", label: "BRI" }
    ]
  },
  {
    key: "ewallet",
    title: "E-Wallet",
    badge: "EW",
    hint: "Open the app and approve the payment",
    options: [
      { id: "ewallet_gopay", label: "GoPay" },
      { id: "ewallet_ovo", label: "OVO" },
      { id: "ewallet_dana", label: "DANA" },
      { id: "ewallet_shopeepay", label: "ShopeePay" }
    ]
  },
  {
    key: "card",
    title: "Credit / Debit Card",
    badge: "CC",
    hint: "Visa, Mastercard, JCB · processed via Midtrans",
    options: [{ id: "card", label: "Card" }]
  }
];

export default function CheckoutPage() {
  return (
    <RouteGuard allow={["guest", "user"]}>
      <CheckoutInner />
    </RouteGuard>
  );
}

function CheckoutInner() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { session } = useSession();
  const { addresses } = useAddresses();
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<ShippingQuote | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("qris");
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    line1: "",
    line2: "",
    city: "",
    province: "",
    postal_code: "",
    // Demo mode: any non-empty value satisfies the (now-mocked) shipping API.
    destination_city_id: "152",
    courier: "jne"
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [formTouched, setFormTouched] = useState(false);

  const defaultAddress = useMemo<Address | null>(
    () => addresses.find((a) => a.isDefault) ?? addresses[0] ?? null,
    [addresses]
  );

  // Prefill from the user's saved default address (and session email) the
  // first time those become available — but never overwrite edits the user
  // has already made by hand. We read `form` via setForm's functional updater
  // so the effect's deps stay primitive-stable and don't loop.
  const sessionEmail = session.role === "user" ? session.email : "";
  useEffect(() => {
    if (formTouched) return;
    if (!defaultAddress && !sessionEmail) return;

    setForm((current) => {
      const next = { ...current };
      let changed = false;
      if (sessionEmail && !current.customer_email) {
        next.customer_email = sessionEmail;
        changed = true;
      }
      if (defaultAddress) {
        const pairs: Array<[keyof FormState, string]> = [
          ["customer_name", defaultAddress.recipient],
          ["customer_phone", defaultAddress.phone],
          ["line1", defaultAddress.line1],
          ["line2", defaultAddress.line2 ?? ""],
          ["city", defaultAddress.city],
          ["province", defaultAddress.province],
          ["postal_code", defaultAddress.postalCode]
        ];
        for (const [key, value] of pairs) {
          if (!current[key] && value) {
            next[key] = value;
            changed = true;
          }
        }
      }
      return changed ? next : current;
    });

    if (defaultAddress && !selectedAddressId) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [defaultAddress, sessionEmail, selectedAddressId, formTouched]);

  function applyAddress(address: Address) {
    setSelectedAddressId(address.id);
    setForm((current) => ({
      ...current,
      customer_name: address.recipient,
      customer_phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      province: address.province,
      postal_code: address.postalCode
    }));
    setFormTouched(true);
    // Reset quotes since destination changed.
    setQuotes([]);
    setSelectedQuote(null);
  }

  const totalWeight = useMemo(
    () => items.reduce((s, i) => s + (i.product.weight_grams ?? 0) * i.quantity, 0),
    [items]
  );
  const total = useMemo(() => subtotal + (selectedQuote?.cost ?? 0), [selectedQuote, subtotal]);
  const itemPayload = items.map((item) => ({ product_id: item.product.id, quantity: item.quantity }));

  const currentStep = selectedQuote ? 3 : quotes.length > 0 ? 2 : 1;

  async function handleQuote() {
    setLoading(true);
    setError(null);
    try {
      const data = await quoteShipping({
        destination_city_id: form.destination_city_id,
        courier: form.courier,
        city: form.city,
        items: itemPayload
      });
      setQuotes(data);
      setSelectedQuote(data[0] ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not calculate shipping.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedQuote) {
      setError("Please pick a shipping option first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const order = await checkout({
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        shipping_address: {
          line1: form.line1,
          line2: form.line2,
          city: form.city,
          province: form.province,
          postal_code: form.postal_code,
          destination_city_id: form.destination_city_id
        },
        shipping_quote: selectedQuote,
        payment_method: paymentMethod,
        items: itemPayload
      });
      // Switch to the full-page transition screen FIRST so the user never sees
      // the "Your cart is empty" branch as we clear and navigate.
      setTransitioning(true);
      clearCart();
      if (order.snap_redirect_url) {
        window.location.href = order.snap_redirect_url;
      } else {
        router.push(`/payment/${order.order_number}`);
      }
      // Do not reset transitioning — this page unmounts when the new route lands.
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Checkout failed.");
      setLoading(false);
    }
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFormTouched(true);
  }

  if (transitioning) {
    return <CheckoutTransition />;
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
        <Stepper step={currentStep} steps={["Address", "Shipping", "Pay"]} />
        <span className="tn-label-mono" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ShieldCheck size={14} /> SECURE CHECKOUT
        </span>
      </header>

      <section style={{ padding: "40px 40px 80px" }}>
        {items.length === 0 ? (
          <div
            className="tn-card"
            style={{ padding: 40, textAlign: "center", color: "var(--muted)", maxWidth: 600, margin: "0 auto" }}
          >
            Your cart is empty. Pick something from the{" "}
            <Link className="tn-btn-link" href="/">
              catalog
            </Link>{" "}
            first.
          </div>
        ) : (
          <form
            onSubmit={handleCheckout}
            style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 56 }}
            className="checkout-grid"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
              <Block num="№ 01" title="Contact" italic="& buyer">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="form-grid">
                  <Field label="Full name" value={form.customer_name} onChange={(v) => set("customer_name", v)} required />
                  <Field label="Phone" value={form.customer_phone} onChange={(v) => set("customer_phone", v)} required />
                  <Field label="Email" value={form.customer_email} onChange={(v) => set("customer_email", v)} required full type="email" />
                </div>
              </Block>

              <Block
                num="№ 02"
                title="Shipping"
                italic="address"
                hint={
                  addresses.length === 0 ? (
                    <Link href="/account#addresses" className="tn-btn-link" style={{ fontSize: 13 }}>
                      Save an address in your account →
                    </Link>
                  ) : undefined
                }
              >
                {addresses.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      marginBottom: 16
                    }}
                  >
                    {addresses.map((a) => {
                      const active = selectedAddressId === a.id;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => applyAddress(a)}
                          className={active ? "tn-chip tn-chip-active" : "tn-chip"}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 13
                          }}
                        >
                          <MapPin size={12} />
                          {a.label}
                          {a.isDefault && (
                            <span
                              style={{
                                fontSize: 9,
                                fontFamily: "var(--font-mono)",
                                letterSpacing: "0.1em",
                                marginLeft: 4,
                                opacity: 0.7
                              }}
                            >
                              · DEFAULT
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }} className="form-grid">
                  <Field label="Address line (street, no., neighbourhood)" value={form.line1} onChange={(v) => set("line1", v)} required full />
                  <Field label="Landmark / unit (optional)" value={form.line2} onChange={(v) => set("line2", v)} />
                  <Field label="Postal code" value={form.postal_code} onChange={(v) => set("postal_code", v)} required />
                  <Field label="City / regency" value={form.city} onChange={(v) => set("city", v)} required />
                  <Field label="Province" value={form.province} onChange={(v) => set("province", v)} required />
                </div>
              </Block>

              <Block
                num="№ 03"
                title="Shipping"
                italic="method"
                hint={`Calculated via RajaOngkir · ${new Intl.NumberFormat("en-US").format(totalWeight)} g`}
              >
                <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                  {COURIER_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      className={form.courier === c.value ? "tn-chip tn-chip-active" : "tn-chip"}
                      onClick={() => set("courier", c.value)}
                    >
                      {c.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="tn-btn tn-btn-ghost tn-btn-sm"
                    style={{ marginLeft: "auto" }}
                    onClick={handleQuote}
                    disabled={loading || !form.destination_city_id}
                  >
                    Get rates
                  </button>
                </div>

                {quotes.length > 0 && (
                  <div style={{ border: "1px solid var(--line)", borderRadius: 4, overflow: "hidden" }}>
                    {quotes.map((o, i) => {
                      const sel = selectedQuote?.service === o.service && selectedQuote?.courier === o.courier;
                      return (
                        <label
                          key={`${o.courier}-${o.service}-${i}`}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "24px 1fr auto",
                            gap: 16,
                            padding: "16px 18px",
                            alignItems: "center",
                            borderTop: i ? "1px solid var(--line)" : "none",
                            background: sel ? "var(--paper-soft)" : "var(--page)",
                            cursor: "pointer"
                          }}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            checked={!!sel}
                            onChange={() => setSelectedQuote(o)}
                            style={{ accentColor: "var(--ink)" }}
                          />
                          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 500, minWidth: 88 }}>{o.courier.toUpperCase()}</span>
                            <span className="tn-label-mono">{o.service}</span>
                            <span className="tn-body-sm">· arrives {o.etd ?? "—"} {o.etd && "days"}</span>
                          </div>
                          <span className="tn-price" style={{ fontSize: 15 }}>
                            {formatCurrency(o.cost)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </Block>

              <Block num="№ 04" title="Payment" italic="method">
                <div
                  style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}
                  className="pay-grid"
                >
                  {PAYMENT_GROUPS.map((group) => {
                    const selectedInGroup = group.options.find((o) => o.id === paymentMethod);
                    const active = !!selectedInGroup;
                    return (
                      <div
                        key={group.key}
                        style={{
                          padding: "18px 18px",
                          border: "1px solid " + (active ? "var(--ink)" : "var(--line)"),
                          background: active ? "var(--paper-soft)" : "var(--page)",
                          borderRadius: 4,
                          cursor: "pointer"
                        }}
                        onClick={() => {
                          // Picking the group selects its first option.
                          if (!active) setPaymentMethod(group.options[0].id);
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 24,
                              background: "var(--ink)",
                              color: "var(--paper)",
                              fontFamily: "var(--font-mono)",
                              fontSize: 9,
                              letterSpacing: "0.1em",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 2
                            }}
                          >
                            {group.badge}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{group.title}</div>
                          <input
                            type="radio"
                            name="payment_group"
                            checked={active}
                            onChange={() => setPaymentMethod(group.options[0].id)}
                            style={{ marginLeft: "auto", accentColor: "var(--ink)" }}
                          />
                        </div>
                        <div className="tn-body-sm" style={{ marginTop: 8 }}>
                          {group.hint}
                        </div>
                        {active && group.options.length > 1 && (
                          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                            {group.options.map((option) => (
                              <button
                                key={option.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPaymentMethod(option.id);
                                }}
                                className={
                                  paymentMethod === option.id
                                    ? "tn-chip tn-chip-active"
                                    : "tn-chip"
                                }
                                style={{ fontSize: 12 }}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="tn-body-sm" style={{ marginTop: 14 }}>
                  You'll see payment instructions on the next screen after placing your order.
                </p>
              </Block>

              {error && (
                <div
                  style={{
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
            </div>

            <aside style={{ position: "sticky", top: 24, alignSelf: "start" }}>
              <div className="tn-card" style={{ padding: 24 }}>
                <h3 className="tn-display-5" style={{ marginBottom: 16 }}>
                  Your <em style={{ fontStyle: "italic" }}>order</em>
                </h3>
                {items.map(({ product, quantity }) => {
                  const image = product.images[0]?.url;
                  const tint = pickTint(product.id);
                  const seller = getSeller(product);
                  return (
                    <div
                      key={product.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "56px 1fr auto",
                        gap: 14,
                        padding: "12px 0",
                        borderBottom: "1px solid var(--line-soft)"
                      }}
                    >
                      <div style={{ width: 56, height: 56, position: "relative", background: "var(--paper-soft)" }}>
                        {image ? (
                          <Image src={image} alt={product.name} fill style={{ objectFit: "cover" }} />
                        ) : (
                          <PlaceImg tint={tint} ratio="1/1" style={{ height: "100%" }} />
                        )}
                        <span
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 20,
                            height: 20,
                            borderRadius: 999,
                            background: "var(--ink)",
                            color: "var(--paper)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          {quantity}
                        </span>
                      </div>
                      <div>
                        <div className="tn-label-mono" style={{ fontSize: 10 }}>
                          {seller.name.toUpperCase()}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontStyle: "italic",
                            fontSize: 16,
                            lineHeight: 1.15
                          }}
                        >
                          {product.name}
                        </div>
                      </div>
                      <span className="tn-price" style={{ fontSize: 13, alignSelf: "center" }}>
                        {formatCurrency(product.price * quantity)}
                      </span>
                    </div>
                  );
                })}
                <div style={{ marginTop: 16 }}>
                  <SumRow k="Subtotal" v={formatCurrency(subtotal)} />
                  <SumRow
                    k={`Shipping${selectedQuote ? ` · ${selectedQuote.courier.toUpperCase()} ${selectedQuote.service}` : ""}`}
                    v={selectedQuote ? formatCurrency(selectedQuote.cost) : "—"}
                    muted
                  />
                  <SumRow k="VAT included" v="—" muted />
                  <hr className="tn-hr" style={{ margin: "12px 0" }} />
                  <SumRow k="Total" v={formatCurrency(total)} strong />
                </div>
                <button
                  type="submit"
                  className="tn-btn tn-btn-lg"
                  style={{ width: "100%", marginTop: 18 }}
                  disabled={loading || !selectedQuote}
                >
                  {loading ? "Processing…" : `Pay now · ${formatCurrency(total)}`}
                </button>
                <p className="tn-body-sm" style={{ marginTop: 14, textAlign: "center" }}>
                  By placing this order you agree to our{" "}
                  <a className="tn-btn-link" href="#">
                    Terms
                  </a>
                  .
                </p>
              </div>
            </aside>
          </form>
        )}
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
          .pay-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr !important; }
          .pay-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

function Block({
  num,
  title,
  italic,
  hint,
  children
}: {
  num: string;
  title: string;
  italic?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          marginBottom: 18,
          flexWrap: "wrap"
        }}
      >
        <span className="tn-num">{num}</span>
        <h2 className="tn-display-5">
          {title}
          {italic && (
            <>
              {" "}
              <em style={{ fontStyle: "italic" }}>{italic}</em>
            </>
          )}
        </h2>
        {hint && (
          <span style={{ marginLeft: "auto" }} className="tn-body-sm">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  full,
  required,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
  required?: boolean;
  type?: string;
}) {
  return (
    <label style={{ display: "block", gridColumn: full ? "1 / -1" : "auto" }}>
      <div className="tn-eyebrow" style={{ marginBottom: 8 }}>
        {label}
      </div>
      <input
        className="tn-input"
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function CheckoutTransition() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper)",
        padding: "40px 24px",
        textAlign: "center"
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <div
          aria-hidden
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            border: "2px solid var(--line)",
            borderTopColor: "var(--terracotta)",
            margin: "0 auto 28px",
            animation: "tn-spinner 1s linear infinite"
          }}
        />
        <div className="tn-eyebrow" style={{ marginBottom: 12 }}>
          PLACING YOUR ORDER
        </div>
        <h1 className="tn-display-4" style={{ marginBottom: 14 }}>
          Just <em style={{ fontStyle: "italic" }}>a moment</em>…
        </h1>
        <p className="tn-body-sm" style={{ color: "var(--ink-soft)" }}>
          Generating your order number and payment instructions.
        </p>
      </div>
      <style>{`
        @keyframes tn-spinner {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-hidden] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
