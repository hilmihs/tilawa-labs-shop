"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useSession, dashboardPath, type Role } from "@/lib/session";

/**
 * Client-side route protection.
 *
 * Returns `null` while not authorized — this is intentional: it prevents the
 * protected page frame from being painted (or SSR'd visibly) to a wrong role,
 * which would happen if we relied on `useEffect` redirect alone.
 *
 * Usage:
 *   <RouteGuard allow={["user"]}>{children}</RouteGuard>
 *   <RouteGuard allow={["guest", "user"]} fallback="/login">...</RouteGuard>
 *
 * `fallback` defaults to:
 *   - the user's own dashboard if they have one (to redirect e.g. an admin
 *     away from /cart back to /admin)
 *   - `/login` for guests when login is required
 */
export function RouteGuard({
  children,
  allow,
  fallback
}: {
  children: ReactNode;
  allow: Role[];
  fallback?: string;
}) {
  const { session, ready } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const allowed = ready && allow.includes(session.role);

  useEffect(() => {
    if (!ready || allowed) return;

    // Pick the redirect target:
    // - if caller supplied a fallback, use it
    // - else, if user is logged in to a role with a dashboard, send them there
    // - else (guest needing auth), send them to /login with ?next=
    let target = fallback;
    if (!target) {
      if (session.role === "guest") {
        target = `/login?next=${encodeURIComponent(pathname ?? "/")}`;
      } else {
        target = dashboardPath(session.role);
      }
    }
    router.replace(target);
  }, [ready, allowed, session.role, router, fallback, pathname]);

  if (!hasMounted || !ready) {
    return (
      <div
        suppressHydrationWarning
        style={{ padding: 80, color: "var(--muted)", textAlign: "center", fontSize: 14 }}
      >
        Loading…
      </div>
    );
  }

  if (!allowed) {
    return null; // page frame must not paint
  }

  return <>{children}</>;
}
