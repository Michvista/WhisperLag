"use client";

import { motion, useReducedMotion } from "framer-motion";

interface WhisperLockProps {
  /** Small inline badge (default) vs. a larger banner variant. */
  size?: "badge" | "banner";
  className?: string;
}

/**
 * The signature "Whisper Lock" — the persistent visual guarantee of
 * anonymity that appears on every student-facing screen. This is the
 * memorable detail of the WhisperLag identity, per the design brief.
 */
export function WhisperLock({ size = "badge", className = "" }: WhisperLockProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`inline-flex items-center gap-2 rounded-full border bg-secondary-fixed-dim/20 text-onSurface ${
        size === "banner" ? "px-5 py-2.5" : "px-4 py-2"
      } ${className}`}
    >
      <motion.span
        animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-secondary shadow-level-1"
      >
        <span aria-hidden className="material-symbols-outlined text-[14px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
          lock
        </span>
      </motion.span>
      <span className="font-label-md text-label-md">
        {size === "banner" ? (
          "Your whisper is hidden. Nobody knows it is you."
        ) : (
          "Your whisper is hidden. Nobody knows it is you."
        )}
      </span>
    </motion.div>
  );
}
