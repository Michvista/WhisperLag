"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  ACTIONED: { label: "✓ Resolved", cls: "bg-green-tint text-primary font-bold" },
  ACKNOWLEDGED: { label: "⏱ Under Review", cls: "bg-amber-tint text-amber-800 font-bold" },
  NEW: { label: "▣ New", cls: "bg-slate-100 text-slate-700 font-bold" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PublicRecent() {
  const [items, setItems] = useState<RecentWhisper[] | null>(null);

  useEffect(() => {
    // Fetch live recent whispers from database (not dummy data)
    api<RecentWhisper[]>("/feedback/public-recent?limit=25", { cache: "no-store" })
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  if (!items) {
    return (
      <div className="space-y-2 py-2">
        <div className="h-4 w-1/2 animate-pulse rounded-md bg-green-tint" />
        <div className="h-3 w-3/4 animate-pulse rounded-md bg-slate-100" />
      </div>
    );
  }
  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
        <div>
          <h3 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
            Recent Campus Feedback
          </h3>
          <p className="mt-0.5 text-xs text-text-secondary">
            Live student concerns and institutional actions taken.
          </p>
        </div>
        <Link
          href="/listwhispers"
          className="shrink-0 text-xs font-bold text-primary hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="mt-3 space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {items.map((w) => {
          const meta = STATUS_META[w.status];
          return (
            <div
              key={w.id}
              className="rounded-xl border border-border-subtle bg-slate-50/70 p-3.5 space-y-2 transition-all hover:border-slate-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {w.category}
                </span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] ${meta.cls}`}>
                  {meta.label}
                </span>
              </div>
              <div className="text-xs leading-relaxed text-navy font-medium">
                <ExpandableText text={w.content} />
              </div>
              {w.status === "ACTIONED" && w.resolutionNote && (
                <div className="rounded-lg border border-green-tint bg-green-tint p-2.5 text-xs text-primary font-medium">
                  <strong className="font-bold">✓ Action:</strong> {w.resolutionNote}
                </div>
              )}
              <div className="text-[10px] font-semibold text-text-soft">
                {formatDate(w.createdAt)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}