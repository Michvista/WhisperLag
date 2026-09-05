"use client";
import { Icon } from "@/components/ui/Icon";

import { useState } from "react";
import { LOGO_URL } from "@/lib/brand";

/**
 * The Whisper Lock signature mark (from the Stitch design). Falls back to a
 * clean lock glyph if the image can't load, so the page never shows ugly
 * alt-text.
 */
export function WhisperLogo({ size = 128, className = "" }: { size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`flex items-center justify-center rounded-full border border-unilag-green/30 bg-unilag-green/10 ${className}`}
        aria-hidden
      >
        <Icon name="lock" size={24} className="text-unilag-green" />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_URL}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={`h-auto w-auto object-contain mix-blend-multiply ${className}`}
      loading="lazy"
    />
  );
}