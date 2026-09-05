"use client";
import { Icon } from "@/components/ui/Icon";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA controls: a small "Install app" button when the browser offers
 * installability (Chrome/Edge), plus a live online/offline indicator.
 */
export function PwaControls() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstallEvent(null);
  }

  return (
    <>
      {!online && (
        <div className="fixed inset-x-0 bottom-4 z-[200] flex justify-center px-4">
          <span className="whisper-lock-glow flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 font-label-caps text-label-caps text-onSurfaceVariant">
            <span className="h-2 w-2 rounded-full bg-sun-gold" />
            Offline — whispers are saved and will sync when you reconnect
          </span>
        </div>
      )}
      {installEvent && !installed && (
        <button
          onClick={install}
          className="fixed bottom-4 right-4 z-[200] flex items-center gap-2 bg-ink px-5 py-3 font-label-caps text-label-caps uppercase tracking-widest text-white shadow-level-1 transition-colors duration-300 hover:bg-primary"
        >
          <Icon name="download" size={18} />
          Install App
        </button>
      )}
    </>
  );
}