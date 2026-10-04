"use client";

import { useState } from "react";
import { useToast } from "@/lib/toast";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const { push } = useToast();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    push({
      message: `${email} subscribed to the next issue.`,
      tone: "success"
    });
    setEmail("");
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <input
        className="tn-input"
        type="email"
        placeholder="your@email.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          flex: 1,
          minWidth: 240,
          background: "transparent",
          borderColor: "rgba(245,239,228,0.3)",
          color: "var(--paper)"
        }}
      />
      <button
        type="submit"
        className="tn-btn"
        style={{ background: "var(--paper)", color: "var(--ink)", borderColor: "var(--paper)" }}
      >
        Subscribe
      </button>
    </form>
  );
}
