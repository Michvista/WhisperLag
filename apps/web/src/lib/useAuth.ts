"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, getToken, clearSession } from "./api";

/**
 * Client-side auth guard. Redirects unauthenticated visitors to /login and
 * returns the current role. Keep using this until real HTTP-only cookie auth
 * replaces localStorage in production.
 */
export function useAuth() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setRole(getRole());
    setReady(true);
  }, [router]);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return { role, ready, logout };
}