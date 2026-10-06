"use client";

import { useEffect } from "react";
import { flushOutbox } from "@/lib/offline";
import { toast } from "@/lib/toast";

/**
 * Registers the service worker in production so WhisperLag is installable
 * as a PWA (offline shell, standalone display) and manages background outbox sync.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Background sync on connection recovery
    const handleOnline = async () => {
      try {
        const synced = await flushOutbox();
        if (synced > 0) {
          toast(`Back online! Synced ${synced} offline whisper${synced > 1 ? "s" : ""}.`);
        }
      } catch {
        // Silent recovery retry
      }
    };

    window.addEventListener("online", handleOnline);

    // Initial check if there are pending offline whispers from previous sessions
    if (navigator.onLine) {
      handleOnline();
    }

    if (!("serviceWorker" in navigator)) {
      return () => window.removeEventListener("online", handleOnline);
    }

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
      if ("caches" in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
      return () => window.removeEventListener("online", handleOnline);
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-fatal : the app still works without a service worker.
    });

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return null;
}