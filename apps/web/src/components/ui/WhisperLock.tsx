import { Icon } from "@/components/ui/Icon";

/**
 * The signature "Whisper Lock" security indicator. Per the design system this
 * is the only element allowed subtle shadow weight : a safe harbor for voices.
 * (Plain markup + CSS animation; kept out of framer-motion so server-rendered
 * transactional pages stay stable.)
 */
export function WhisperLock({ compact = true, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <div
      className={`whisper-lock-glow flex items-center gap-2 rounded-full bg-surface-container-lowest ${
        compact ? "px-4 py-2" : "px-5 py-2.5"
      } ${className}`}
    >
      <Icon name="lock" size={22} className="whisper-lock-pulse text-primary" />
      <span className="font-label-caps text-label-caps text-onSurfaceVariant">
        {compact ? "Whisper Lock: Secure" : "End-to-End Encrypted via UNILAG Secure."}
      </span>
    </div>
  );
}