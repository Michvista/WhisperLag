"use client";

import Link from "next/link";
import { WhisperLogo } from "./WhisperLogo";

interface WhisperBrandProps {
  href?: string;
  tag?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function WhisperBrand({
  href = "/",
  tag = "UNILAG STUDENT FEEDBACK",
  size = "md",
  className = "",
}: WhisperBrandProps) {
  const logoSize = size === "sm" ? 24 : size === "lg" ? 36 : 30;
  const titleSize = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";
  const tagSize = size === "sm" ? "text-[7.5px]" : "text-[8px]";

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white border border-border-subtle shadow-xs">
        <WhisperLogo size={logoSize} />
      </div>
      <div className="flex flex-col">
        <span className={`font-montserrat font-bold leading-none tracking-tight text-navy ${titleSize}`}>
          Whisper<span className="text-primary">Lag</span>
        </span>
        {tag && (
          <span className={`mt-0.5 font-bold tracking-[0.1em] text-text-soft uppercase ${tagSize}`}>
            {tag}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="group inline-block transition-opacity hover:opacity-90">{content}</Link>;
  }

  return content;
}
