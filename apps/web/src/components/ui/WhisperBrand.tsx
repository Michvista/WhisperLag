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
  const logoSize = size === "sm" ? 20 : size === "lg" ? 34 : 26;
  const titleSize = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";
  const tagSize = size === "sm" ? "text-[7px]" : "text-[7.5px]";

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white border border-border-subtle shadow-xs">
        <WhisperLogo size={logoSize} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className={`font-montserrat font-bold leading-none tracking-tight text-navy truncate ${titleSize}`}>
          Whisper<span className="text-primary">Lag</span>
        </span>
        {tag && (
          <span className={`mt-0.5 font-bold tracking-wider text-text-soft uppercase truncate ${tagSize}`}>
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
