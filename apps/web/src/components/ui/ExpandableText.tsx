"use client";

import { useState } from "react";

/**
 * Whisper text with a preview that can expand to the full message : a
 * truncated line never hides the actual detail, and a "Read more" is always
 * available when the preview is clamped.
 */
export function ExpandableText({ text, className = "" }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);
  // Preview clamps at 2 lines, so anything that might wrap needs a toggle.
  const hasMore = text.length > 60;

  return (
    <div className={className}>
      <p
        className={
          open
            ? "font-body-sm text-body-sm leading-relaxed text-ink/75"
            : "font-body-sm text-body-sm leading-relaxed text-ink/75 " +
              (hasMore ? "line-clamp-2" : "")
        }
      >
        &ldquo;{text}&rdquo;
      </p>
      {hasMore && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-1 font-label-caps text-label-caps text-primary hover:underline"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}