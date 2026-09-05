"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ExpandableText } from "@/components/ui/ExpandableText";

interface RecentWhisper {
  id: string;
  category: string;
  content: string;
  status: "NEW" | "ACKNOWLEDGED" | "ACTIONED";
  createdAt: string;
  resolutionNote?: string | null;
}

const STATUS_META: Record<RecentWhisper["status"], { label: string; cls: string }> = {
  ACTIONED: { label: "Resolved", cls: "bg-primary/10 text-primary" },
  ACKNOWLEDGED: { label: "Under Review", cls: "bg-tertiary-fixed-dim/20 text-tertiary-container" },
  NEW: { label: "New", cls: "bg-ink/5 text-ink/60" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Public "Have I been heard?" feed — recent anonymous whispers with status. */
export function PublicRecent() {
  const [items, setItems] = useState<RecentWhisper[] | null>(null);

  useEffect(() => {
    api<RecentWhisper[]>("/feedback/public-recent", { cache: "no-store" })
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  if (!items) {
    return (
      <div>
        <h2 className="mb-2 font-display text-headline-md font-semibold text-onSurface">Recent Activity</h2>
        <div className="space-y-2">
          <div className="h-3 w-3/4 animate-pulse bg-surface-container-high" />
          <div className="h-3 w-1/2 animate-pulse bg-surface-container-high" />
        </div>
      </div>
    );
  }
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="mb-2 font-display text-headline-md font-semibold text-onSurface">
        Recent Activity
      </h2>
      <p className="mb-4 font-body-sm text-body-sm text-onSurfaceVariant">
        Recent feedback the university is acting on — no identities.
      </p>
      <div className="max-h-[420px] overflow-y-auto pr-2">
        <div className="flex flex-col">
          {items.slice(0, 5).map((w) => {
          const meta = STATUS_META[w.status];
          return (
            <div key={w.id} className="rule-b flex items-start justify-between gap-3 py-4">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-body-md text-body-md text-ink">{w.category}</h3>
                  <p className="font-mono-label text-mono-label text-ink/50">{formatDate(w.createdAt)}</p>
                </div>
                <ExpandableText text={w.content} />
                {w.status === "ACTIONED" && w.resolutionNote && (
                  <p className="font-body-sm text-body-sm leading-relaxed text-primary">
                    ✓ {w.resolutionNote}
                  </p>
                )}
              </div>
              <span className={`shrink-0 px-2 py-1 font-label-caps text-[10px] uppercase tracking-wider ${meta.cls}`}>
                {meta.label}
              </span>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}