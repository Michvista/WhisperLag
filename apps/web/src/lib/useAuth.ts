"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, getToken, clearSession } from "./api";

interface UseAuthOptions {
  requireAuth?: boolean;
}

/**
 * Client-side role and auth hook.
 * By default (requireAuth: false), allows anonymous visitors to freely use
 * public student features (giving feedback, tracking, browsing public whispers).
 * If requireAuth: true, redirects unauthenticated visitors to /login.
 */
export function useAuth(options: UseAuthOptions = {}) {
  const { requireAuth = false } = options;
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    const currentRole = getRole();

    if (!token && requireAuth) {
      router.replace("/login");
      return;
    }

    setRole(currentRole || (token ? "STUDENT" : null));
    setReady(true);
  }, [router, requireAuth]);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return { role, ready, logout };
}