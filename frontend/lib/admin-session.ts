"use client";

import type { AdminSession } from "@/types/api";

/**
 * Backend-token-keyed admin session storage.
 *
 * @deprecated Prefer the unified session in `lib/session.tsx` (`useSession()`).
 * This module is kept ONLY because the AdminGuard still uses `getAdminSession`
 * to detect "real backend session present" (token available) vs. "demo
 * frontend-only session" (no backend token). When the Laravel auth flow is
 * fully wired through `trustSession`, this file can be removed.
 */

const ADMIN_SESSION_KEY = "storefront.admin.v1";

export function saveAdminSession(session: AdminSession) {
  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}
