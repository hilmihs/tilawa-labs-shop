"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Soft cross-fade on Next.js client-side navigation.
 *
 * Keyed on pathname so children re-mount on every route, triggering
 * the CSS animation. Uses View Transitions API when available for a
 * native cross-fade; otherwise falls back to a CSS keyframe.
 */
type ViewTransitionLike = {
  finished?: Promise<unknown>;
  ready?: Promise<unknown>;
  updateCallbackDone?: Promise<unknown>;
};

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [renderedPath, setRenderedPath] = useState(pathname);
  const [content, setContent] = useState(children);
  const isFirst = useRef(true);
  const activeVT = useRef<ViewTransitionLike | null>(null);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    const applySync = () => {
      setRenderedPath(pathname);
      setContent(children);
    };

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const startVT = (
      document as Document & {
        startViewTransition?: (cb: () => void) => ViewTransitionLike;
      }
    ).startViewTransition;

    // Skip the cross-fade when reduced motion is set, the API is missing,
    // or another transition is mid-flight (rapid nav / redirect chains).
    if (reduceMotion || typeof startVT !== "function" || activeVT.current) {
      applySync();
      return;
    }

    try {
      const vt = startVT.call(document, applySync);
      activeVT.current = vt;
      // All three VT promises can reject when a transition is skipped/aborted
      // by a rapid navigation (e.g. router.replace after login). Each one
      // needs its own catch or it surfaces as "Uncaught (in promise)".
      vt?.ready?.catch(() => {});
      vt?.updateCallbackDone?.catch(() => {});
      vt?.finished
        ?.catch(() => {})
        .finally(() => {
          if (activeVT.current === vt) activeVT.current = null;
        });
    } catch {
      // startViewTransition can throw InvalidStateError when the document is
      // in a state that can't begin a transition (HMR, detached frames, etc.).
      // Swap synchronously so the route still updates.
      activeVT.current = null;
      applySync();
    }
  }, [pathname, children]);

  return (
    <div key={renderedPath} className="tn-route-transition">
      {content}
    </div>
  );
}
