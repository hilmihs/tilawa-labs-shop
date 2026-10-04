"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <section
      style={{
        padding: "120px 40px",
        display: "grid",
        placeItems: "center",
        textAlign: "center"
      }}
    >
      <div style={{ maxWidth: 520 }}>
        <div className="tn-eyebrow" style={{ marginBottom: 16 }}>
          № 500 · TEMPORARY HICCUP
        </div>
        <h1 className="tn-display-2" style={{ marginBottom: 18 }}>
          Something <em style={{ fontStyle: "italic" }}>tangled</em>.
        </h1>
        <p
          className="tn-body"
          style={{ maxWidth: 440, marginInline: "auto", marginBottom: 28 }}
        >
          We couldn't load this page just now. Try again, or head back to the catalog.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap"
          }}
        >
          <button className="tn-btn" onClick={reset}>
            Try again
          </button>
          <Link className="tn-btn tn-btn-ghost" href="/">
            To the catalog
          </Link>
        </div>
        {error.digest && (
          <div className="tn-label-mono" style={{ marginTop: 24, fontSize: 11 }}>
            ID · {error.digest}
          </div>
        )}
      </div>
    </section>
  );
}
