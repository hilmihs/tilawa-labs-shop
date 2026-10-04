import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

export type Tint = 1 | 2 | 3 | 4 | 5 | "dark";

export function pickTint(seed: number): Tint {
  const tints: Tint[] = [1, 2, 3, 4, 5, "dark"];
  return tints[Math.abs(seed) % tints.length];
}

export function Wordmark({ size = 22, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.01em",
        color: dark ? "var(--paper)" : "var(--ink)",
        display: "inline-flex",
        alignItems: "baseline",
        gap: 4
      }}
    >
      Toko <em style={{ fontStyle: "italic" }}>Nusa</em>
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: 999,
          background: "var(--terracotta)",
          display: "inline-block",
          alignSelf: "center"
        }}
      />
    </span>
  );
}

export function PlaceImg({
  label,
  tint = 1,
  ratio = "4/5",
  style,
  children,
  src,
  alt,
  kenburns,
  eager,
  sizes = "(min-width: 1024px) 50vw, 100vw"
}: {
  label?: string;
  tint?: Tint;
  ratio?: string;
  style?: CSSProperties;
  children?: ReactNode;
  src?: string;
  alt?: string;
  kenburns?: boolean;
  eager?: boolean;
  /** Override responsive sizes hint for next/image. */
  sizes?: string;
}) {
  const tintClass = tint === "dark" ? "tn-placeholder-tint-dark" : `tn-placeholder-tint-${tint}`;
  return (
    <div
      className={`tn-placeholder ${tintClass} ${kenburns ? "tn-kenburns" : ""}`}
      style={{ aspectRatio: ratio, position: "relative", overflow: "hidden", ...style }}
    >
      {src && (
        <Image
          src={src}
          alt={alt ?? label ?? ""}
          fill
          sizes={sizes}
          priority={eager}
          loading={eager ? "eager" : "lazy"}
          style={{ objectFit: "cover" }}
        />
      )}
      {!src && label && <span style={{ opacity: 0.7, position: "relative", zIndex: 1 }}>{label}</span>}
      {children}
    </div>
  );
}

export function SectionHead({
  num,
  eyebrow,
  title,
  italic,
  action
}: {
  num?: string;
  eyebrow?: string;
  title: string;
  italic?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 28,
        gap: 16,
        flexWrap: "wrap"
      }}
    >
      <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
        {num && <span className="tn-num" style={{ paddingBottom: 8 }}>{num}</span>}
        <div>
          {eyebrow && <div className="tn-eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>}
          <h2 className="tn-display-3">
            {title}
            {italic && (
              <>
                {" "}
                <em style={{ fontStyle: "italic" }}>{italic}</em>
              </>
            )}
          </h2>
        </div>
      </div>
      {action}
    </div>
  );
}

export function SumRow({
  k,
  v,
  strong,
  muted
}: {
  k: string;
  v: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "8px 0",
        fontSize: strong ? 16 : 14,
        color: muted ? "var(--muted)" : "var(--ink-soft)",
        fontWeight: strong ? 500 : 400
      }}
    >
      <span>{k}</span>
      <span className="tn-price" style={{ fontSize: strong ? 18 : 14 }}>{v}</span>
    </div>
  );
}

export function Stepper({
  step = 1,
  steps = ["Address", "Shipping", "Pay"]
}: {
  step?: number;
  steps?: string[];
}) {
  return (
    <ol
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        gap: 0,
        alignItems: "center",
        flexWrap: "wrap"
      }}
    >
      {steps.map((s, i) => (
        <li
          key={s}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingRight: i < steps.length - 1 ? 16 : 0
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              border: "1px solid " + (i + 1 <= step ? "var(--ink)" : "var(--line)"),
              background: i + 1 < step ? "var(--ink)" : "transparent",
              color:
                i + 1 < step ? "var(--paper)" : i + 1 === step ? "var(--ink)" : "var(--muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 11
            }}
          >
            {i + 1 < step ? "✓" : i + 1}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: i + 1 === step ? 500 : 400,
              color: i + 1 <= step ? "var(--ink)" : "var(--muted)"
            }}
          >
            {s}
          </span>
          {i < steps.length - 1 && (
            <span
              style={{
                width: 40,
                height: 1,
                marginLeft: 12,
                background: i + 1 < step ? "var(--ink)" : "var(--line)"
              }}
            />
          )}
        </li>
      ))}
    </ol>
  );
}
