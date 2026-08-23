"use client";

export type ToastType = "success" | "error" | "info";

interface ToastMessage {
  message: string;
  type: ToastType;
}

const EVENT = "wl:toast";

/** Fire-and-forget toast. Works anywhere (client), rendered by <Toaster/>. */
export function toast(message: string, type: ToastType = "success"): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastMessage>(EVENT, { detail: { message, type } }));
}