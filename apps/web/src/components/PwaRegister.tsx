"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production so WhisperLag is installable
 * as a PWA (offline shell, standalone display). Registration is silent and
 * never blocks rendering.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-fatal — the app still works without a service worker.
    });
  }, []);

  return null;
}