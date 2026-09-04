"use client";

import { useEffect, useState } from "react";
import type { ToastType } from "@/lib/toast";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const TYPE_STYLE: Record<ToastType, { ring: string; icon: string }> = {
  success: { ring: "border-primary/30", icon: "check_circle" },
  error: { ring: "border-error-container", icon: "error" },
  info: { ring: "border-secondary-fixed-dim/40", icon: "info" },
};

/** Global toast stack. Mount once in the root layout. */
export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let nextId = 1;
    const onToast = (e: Event) => {
      const { message, type } = (e as CustomEvent<{ message: string; type: ToastType }>).detail;
      const id = nextId++;
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
    };
    window.addEventListener("wl:toast", onToast);
    return () => window.removeEventListener("wl:toast", onToast);
  }, []);

  return (
    <div className="fixed right-4 top-4 z-[300] flex w-[min(94vw,380px)] flex-col gap-3">
      {toasts.map((t) => {
        const style = TYPE_STYLE[t.type];
        return (
          <div
            key={t.id}
            className={`whisper-lock-glow flex items-start gap-3 border bg-surface-container-lowest px-5 py-4 shadow-level-1 ${style.ring}`}
          >
            <span
              className={`material-symbols-outlined mt-0.5 text-[22px] ${
                t.type === "error" ? "text-error" : t.type === "info" ? "text-secondary" : "text-primary"
              }`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {style.icon}
            </span>
            <p className="flex-1 font-body-md text-body-md leading-snug text-onSurface">{t.message}</p>
          </div>
        );
      })}
    </div>
  );
}