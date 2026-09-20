"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { LOGO_URL } from "@/lib/brand";

interface WhisperLogoProps {
  size?: number;
  className?: string;
  variant?: "raw" | "badge" | "bubble";
}

/**
 * The signature Whisper Lock image mark from the brand assets.
 */
export function WhisperLogo({
  size = 40,
  className = "",
  variant = "raw",
}: WhisperLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-xl bg-green-tint border border-unilag-green/20 text-unilag-green ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Icon name="lock" size={Math.round(size * 0.55)} className="text-unilag-green" />
      </span>
    );
  }

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_URL}
      alt="WhisperLag Logo"
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={`block object-cover ${className}`}
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );

  if (variant === "badge") {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-white border border-border-subtle shadow-sm p-1.5 overflow-hidden"
        style={{ width: size + 12, height: size + 12 }}
      >
        {img}
      </div>
    );
  }

  return img;
}