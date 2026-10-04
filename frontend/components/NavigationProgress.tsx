"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const TRICKLE_MS = 180;
const WATCHDOG_MS = 5000;

function isInternalNavClick(event: MouseEvent): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  const path = event.composedPath();
  const anchor = path.find(
    (node): node is HTMLAnchorElement =>
      node instanceof HTMLAnchorElement && typeof node.href === "string"
  );
  if (!anchor) return false;
  if (anchor.target && anchor.target !== "" && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.getAttribute("rel")?.includes("external")) return false;

  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }
  if (url.origin !== window.location.origin) return false;

  const samePath = url.pathname === window.location.pathname;
  const sameSearch = url.search === window.location.search;
  if (samePath && sameSearch) return false; // pure hash or no-op

  return true;
}

function isInternalGetFormSubmit(event: SubmitEvent): boolean {
  if (event.defaultPrevented) return false;
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return false;
  if ((form.method || "get").toLowerCase() !== "get") return false;
  if (form.target && form.target !== "" && form.target !== "_self") return false;

  let url: URL;
  try {
    url = new URL(form.action || window.location.href, window.location.href);
  } catch {
    return false;
  }
  if (url.origin !== window.location.origin) return false;

  const samePath = url.pathname === window.location.pathname;
  // GET form re-submit with identical values is still a navigation worth showing;
  // only skip when both path AND existing search exactly match (rare for forms).
  const fakeSearch = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
  if (samePath && `?${fakeSearch}` === window.location.search) return false;

  return true;
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeOutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (trickleRef.current) {
      clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  };

  const reduceMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const start = () => {
    if (fadeOutRef.current) {
      clearTimeout(fadeOutRef.current);
      fadeOutRef.current = null;
    }
    clearTimers();
    setPending(true);
    setVisible(true);

    if (reduceMotion()) {
      setWidth(60);
    } else {
      setWidth(8);
      trickleRef.current = setInterval(() => {
        setWidth((w) => (w >= 85 ? w : w + (90 - w) * 0.08));
      }, TRICKLE_MS);
    }

    watchdogRef.current = setTimeout(() => {
      finish();
    }, WATCHDOG_MS);
  };

  const finish = () => {
    clearTimers();
    setPending(false);
    setWidth(100);
    fadeOutRef.current = setTimeout(
      () => {
        setVisible(false);
        setWidth(0);
      },
      reduceMotion() ? 80 : 220
    );
  };

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (isInternalNavClick(event)) start();
    };
    const onSubmit = (event: SubmitEvent) => {
      if (isInternalGetFormSubmit(event)) start();
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchKey = searchParams?.toString() ?? "";
  useEffect(() => {
    if (pending) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchKey]);

  useEffect(() => {
    return () => {
      clearTimers();
      if (fadeOutRef.current) clearTimeout(fadeOutRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: reduceMotion()
          ? "opacity 80ms linear"
          : "opacity 220ms ease-out"
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: "var(--terracotta)",
          boxShadow: "0 0 8px rgba(193, 84, 50, 0.5)",
          transition: reduceMotion()
            ? "width 80ms linear"
            : "width 280ms cubic-bezier(.16,.84,.24,1)"
        }}
      />
    </div>
  );
}
