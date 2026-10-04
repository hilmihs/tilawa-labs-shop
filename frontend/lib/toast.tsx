"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Toast = {
  id: number;
  message: string;
  href?: string;
  cta?: string;
  tone?: "default" | "success" | "danger";
};

type ToastContextValue = {
  push: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((toast: Omit<Toast, "id">) => {
    setToasts((current) => [...current, { ...toast, id: Date.now() + Math.random() }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 3200);
    return () => clearTimeout(timer);
  }, [toasts]);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          left: 20,
          bottom: 20,
          zIndex: 60,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none"
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="tn-toast"
            style={{
              pointerEvents: "auto",
              background: "var(--ink)",
              color: "var(--paper)",
              padding: "14px 18px",
              borderRadius: 4,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 14,
              minWidth: 280,
              maxWidth: 420,
              boxShadow: "0 18px 50px -20px rgba(30,26,20,0.45)",
              borderLeft: `2px solid ${
                t.tone === "danger"
                  ? "var(--danger)"
                  : t.tone === "success"
                    ? "var(--success)"
                    : "var(--terracotta)"
              }`
            }}
          >
            <span style={{ flex: 1 }}>{t.message}</span>
            {t.href && t.cta && (
              <a
                href={t.href}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--paper)",
                  borderBottom: "1px solid var(--paper)",
                  paddingBottom: 1
                }}
              >
                {t.cta}
              </a>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
