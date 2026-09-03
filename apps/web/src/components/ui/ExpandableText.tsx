"use client";

import { useState } from "react";

/**
 * Whisper text with a preview that can expand to the full message — so a
 * truncated line never hides the actual detail.
 */
export function ExpandableText({ text, className = "" }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const hasMore = text.length > 90;

  return (
    <div className={className}>
      <p
        className={
          open
            ? "font-body-sm text-body-sm leading-relaxed text-ink/75"
            : "font-body-sm text-body-sm leading-relaxed text-ink/75 line-clamp-2"
        }
      >
        &ldquo;{text}&rdquo;
      </p>
      {hasMore && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-0.5 font-label-caps text-label-caps text-primary hover:underline"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}