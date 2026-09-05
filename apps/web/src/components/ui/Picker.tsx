"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

interface Option {
  value: string;
  label: string;
}

/**
 * Compact dropdown with a max-height scrollable list, so selecting from a
 * long list (e.g. courses) never opens a dropdown that runs off the page.
 */
export function Picker({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input-minimal flex w-full items-center justify-between gap-2 font-body-md text-body-md text-onSurface"
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <Icon name={open ? "expand_less" : "expand_more"} size={20} className="shrink-0 text-onSurfaceVariant" />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto border border-ink/10 bg-surface-container-lowest shadow-level-2">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left font-body-md text-body-md transition-colors ${
                o.value === value ? "bg-primary/10 text-primary" : "text-onSurface hover:bg-surface-container-low"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}