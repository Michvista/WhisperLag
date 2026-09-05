"use client";
import { Icon } from "@/components/ui/Icon";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/ui/RoleGate";
import { ErrorBlock, LoadingBlock } from "@/components/ui/States";
import { ROLES } from "@whisperlag/shared";
import { api, getToken } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/lib/toast";

interface WhisperItem {
  id: string;
  category: string;
  content: string;
  isAnonymous: boolean;
  status: "NEW" | "ACKNOWLEDGED" | "ACTIONED";
  createdAt: string;
  department: { id: string; name: string } | null;
  resolutionNote?: string | null;
  aiTag: {
    courseCode?: string;
    courseTitle?: string;
    lecturer?: string;
    department?: string;
    confidence?: number;
  } | null;
}

interface WhisperFeed {
  items: WhisperItem[];
  total: number;
}

const STATUS_META: Record<WhisperItem["status"], { label: string; cls: string }> = {
  NEW: { label: "New", cls: "bg-ink/5 text-ink/60" },
  ACKNOWLEDGED: { label: "Under Review", cls: "bg-tertiary-fixed-dim/20 text-tertiary-container" },
  ACTIONED: { label: "Resolved", cls: "bg-primary/10 text-primary" },
};

const FILTERS = ["All", "New", "Under Review", "Resolved"] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Anonymous whispers feed : for faculty & administrators. Shows every whisper
 * with NO identity, in a scrollable list, with status filtering and (for
 * admins) the ability to move items through review.
 */
export default function WhispersFeedPage() {
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";
  const [feed, setFeed] = useState<WhisperFeed | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tagging, setTagging] = useState(false);
  // inline resolution note, keyed by whisper id
  const [resolveNote, setResolveNote] = useState<Record<string, string>>({});
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<WhisperFeed>("/feedback?page=1&limit=100", {
        token: getToken(),
        cache: "no-store",
      });
      setFeed(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load whispers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function setStatus(id: string, status: WhisperItem["status"], note?: string) {
    setBusyId(id);
    try {
      await api(`/feedback/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, resolutionNote: status === "ACTIONED" ? note : undefined }),
        token: getToken(),
      });
      toast("Whisper updated.");
      setResolvingId(null);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Update failed", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function tagAll() {
    setTagging(true);
    try {
      const res = await api<{ tagged: number }>("/feedback/analyze", { method: "POST", token: getToken() });
      toast(res.tagged > 0 ? `Routed ${res.tagged} whisper${res.tagged === 1 ? "" : "s"} to courses.` : "No untagged whispers left.");
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Tagging failed", "error");
    } finally {
      setTagging(false);
    }
  }

  const items = (feed?.items ?? []).filter((w) =>
    filter === "All" ? true : STATUS_META[w.status].label === filter,
  );

  return (
    <RoleGate minRole={ROLES.FACULTY}>
      <AppShell>
        <header className="rule-b mb-10 flex flex-wrap items-end justify-between gap-6 pb-8">
          <div>
            <h1 className="mb-2 font-display text-headline-lg font-semibold text-onSurface">
              Anonymous Whispers
            </h1>
            <p className="font-body-md text-body-md text-onSurfaceVariant">
              Every submission, with no identity attached. {feed?.total ?? 0} total.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={tagAll}
              disabled={tagging}
              title="Reads each untagged whisper and tags the course / lecturer / department it is about"
              className="group relative flex items-center gap-2 border border-ink px-4 py-2 font-label-caps text-label-caps uppercase tracking-wider text-onSurface transition-colors hover:bg-surface-variant disabled:opacity-50"
            >
              <Icon name="auto_awesome" size={22} />
              {tagging ? "Routing…" : "Route with AI"}
              <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-60 -translate-x-1/2 rounded-sm border border-ink/10 bg-surface-container-lowest px-3 py-2 text-left font-body-sm text-body-sm text-onSurface opacity-0 shadow-level-2 transition-opacity group-hover:opacity-100">
                Reads each whisper and tags the course, lecturer or department
                it is about : so it reaches the right place.
              </span>
            </button>
          )}
        </header>

        {/* Status filter */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 border px-4 py-2 font-label-caps text-label-caps uppercase tracking-wider transition-colors ${
                filter === f
                  ? "border-ink bg-ink text-white"
                  : "border-ink/20 text-onSurfaceVariant hover:border-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingBlock label="Loading whispers…" />
        ) : error ? (
          <ErrorBlock message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <p className="py-10 font-body-md text-body-md text-onSurfaceVariant">
            No whispers in this view yet.
          </p>
        ) : (
          <div className="no-scrollbar max-h-[70vh] overflow-y-auto border-y border-ink/10">
            {items.map((w, i) => {
              const meta = STATUS_META[w.status];
              return (
                <div key={w.id} className="rule-b flex flex-col gap-2 py-6 md:flex-row md:items-start md:gap-8">
                  <span className="font-display w-10 text-2xl font-light text-onSurfaceVariant/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-3">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-unilag-green">
                        {w.category}
                      </span>
                      {w.department && (
                        <span className="font-mono-label text-mono-label text-onSurfaceVariant">
                          {w.department.name}
                        </span>
                      )}
                      {w.aiTag?.courseCode && (
                        <span className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 font-label-caps text-[10px] uppercase tracking-wider text-primary">
                          <Icon name="school" size={12} />
                          {w.aiTag.courseCode}
                          {w.aiTag.lecturer ? ` · ${w.aiTag.lecturer}` : ""}
                        </span>
                      )}
                      <span className="ml-auto font-mono-label text-mono-label text-onSurfaceVariant">
                        {formatDate(w.createdAt)}
                      </span>
                    </div>
                    <p className="font-body-lg text-body-lg leading-relaxed text-onSurface">
                      &ldquo;{w.content}&rdquo;
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 md:flex-col md:items-end">
                    <span className={`px-2 py-1 font-label-caps text-[10px] uppercase tracking-wider ${meta.cls}`}>
                      {meta.label}
                    </span>
                    {isAdmin && w.status !== "ACTIONED" && (
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          {w.status !== "ACKNOWLEDGED" && (
                            <button
                              onClick={() => setStatus(w.id, "ACKNOWLEDGED")}
                              disabled={busyId === w.id}
                              className="border border-ink/20 px-2 py-1 font-label-caps text-[10px] uppercase tracking-wider text-onSurfaceVariant transition-colors hover:border-ink disabled:opacity-40"
                            >
                              Under review
                            </button>
                          )}
                          <button
                            onClick={() => setResolvingId(resolvingId === w.id ? null : w.id)}
                            disabled={busyId === w.id}
                            className="bg-ink px-2 py-1 font-label-caps text-[10px] uppercase tracking-wider text-white transition-colors hover:bg-primary disabled:opacity-40"
                          >
                            Resolve
                          </button>
                        </div>
                        {resolvingId === w.id && (
                          <div className="flex w-56 flex-col gap-2">
                            <textarea
                              value={resolveNote[w.id] ?? ""}
                              onChange={(e) => setResolveNote((n) => ({ ...n, [w.id]: e.target.value }))}
                              placeholder="What was done? Students will see this note."
                              rows={2}
                              className="input-minimal w-full resize-none font-body-sm text-body-sm"
                            />
                            <button
                              onClick={() => setStatus(w.id, "ACTIONED", resolveNote[w.id]?.trim() || undefined)}
                              disabled={busyId === w.id}
                              className="bg-primary px-2 py-1 font-label-caps text-[10px] uppercase tracking-wider text-white disabled:opacity-40"
                            >
                              {busyId === w.id ? "Saving…" : "Confirm & resolve"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {w.status === "ACTIONED" && w.resolutionNote && (
                      <p className="mt-1 max-w-xs text-right font-body-sm text-body-sm text-onSurfaceVariant">
                        Resolved: {w.resolutionNote}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AppShell>
    </RoleGate>
  );
}