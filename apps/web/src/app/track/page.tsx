"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { AppShell } from "@/components/layout/AppShell";

import { api } from "@/lib/api";

interface TrackResult {
  refNumber: string;
  category: string;
  status: "NEW" | "ACKNOWLEDGED" | "ACTIONED";
  resolutionNote: string | null;
  createdAt: string;
}

const STATUS_META: Record<
  "NEW" | "ACKNOWLEDGED" | "ACTIONED",
  { label: string; icon: string; cls: string; bg: string }
> = {
  NEW: { label: "Submitted", icon: "inbox", cls: "text-slate-700", bg: "bg-slate-100" },
  ACKNOWLEDGED: { label: "Under Review", icon: "schedule", cls: "text-amber-800", bg: "bg-amber-tint" },
  ACTIONED: { label: "Resolved / Action Taken", icon: "verified", cls: "text-primary", bg: "bg-green-tint" },
};

function TrackContent() {
  const searchParams = useSearchParams();
  const [ref, setRef] = useState(searchParams.get("ref") ?? "");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doLookup(refCode: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api<TrackResult>(
        `/feedback/lookup/${encodeURIComponent(refCode.trim())}`
      );
      setResult(data ?? null);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No whisper found with that reference number. Please check the code and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // Auto-lookup if arriving with ?ref=
  useEffect(() => {
    const initialRef = searchParams.get("ref");
    if (initialRef && initialRef.trim()) {
      void doLookup(initialRef.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = ref.trim();
    if (!trimmed) {
      setError("Please enter your reference number (e.g. WL-2026-372736).");
      return;
    }
    await doLookup(trimmed);
  }

  const meta = result ? STATUS_META[result.status] : null;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Anonymous Tracking
          </span>
          <h1 className="mt-1 font-montserrat text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Track Your Whisper
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Enter your unique reference number to check the investigation and resolution status of your submission.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-card space-y-4">
          <form onSubmit={handleLookup} className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-navy">
              Reference Number
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="WL-2026-118374"
                className="wl-input flex-1 font-mono tracking-wider text-sm"
                spellCheck={false}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={loading || !ref.trim()}
                className="btn-primary-green shrink-0 px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {loading ? "Checking…" : "Track Status →"}
              </button>
            </div>
            <p className="text-[11px] text-text-soft">
              Found on your confirmation screen upon submission. Format: WL-YYYY-XXXXXX
            </p>
          </form>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              <Icon name="error" size={16} className="shrink-0 text-red-600" />
              {error}
            </div>
          )}

          {/* Result and Status Timeline */}
          {result && meta && (
            <div className="mt-6 border-t border-border-subtle pt-6 space-y-5">
              {/* Summary Banner */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-soft">
                    Category
                  </span>
                  <div className="font-montserrat text-sm font-bold text-navy">
                    {result.category}
                  </div>
                </div>
                <span
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${meta.bg} ${meta.cls}`}
                >
                  <Icon name={meta.icon} size={14} />
                  {meta.label}
                </span>
              </div>

              {/* Status Timeline */}
              <div className="rounded-xl border border-border-subtle bg-slate-50/70 p-4 space-y-3">
                <div className="text-xs font-bold text-navy">Status Timeline</div>
                
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy">Feedback Received & Encrypted</div>
                      <div className="text-[11px] text-text-soft">
                        Submitted on {new Date(result.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })} · Reference: {result.refNumber}
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        result.status === "ACKNOWLEDGED" || result.status === "ACTIONED"
                          ? "bg-primary text-white"
                          : "border-2 border-slate-300 bg-white text-slate-400"
                      }`}
                    >
                      {result.status === "ACKNOWLEDGED" || result.status === "ACTIONED" ? "✓" : "2"}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy">Under Active Review</div>
                      <div className="text-[11px] text-text-secondary">
                        {result.status === "NEW"
                          ? "Awaiting departmental assignment and review."
                          : "Assigned to the relevant Quality Assurance committee."}
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        result.status === "ACTIONED"
                          ? "bg-primary text-white"
                          : "border-2 border-slate-300 bg-white text-slate-400"
                      }`}
                    >
                      {result.status === "ACTIONED" ? "✓" : "3"}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy">Resolution & Action</div>
                      <div className="text-[11px] text-text-secondary">
                        {result.status === "ACTIONED"
                          ? result.resolutionNote || "Issue addressed by the university."
                          : "Action steps will be published here once finalized."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution Note Alert */}
              {result.status === "ACTIONED" && result.resolutionNote && (
                <div className="rounded-xl border border-green-tint bg-green-tint p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="verified" size={16} className="text-primary" />
                    <span className="text-xs font-bold text-primary">
                      Official Institutional Resolution
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-text-secondary">
                    {result.resolutionNote}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Link to public whispers */}
        <div className="rounded-xl border border-border-subtle bg-white p-4 text-center">
          <span className="text-xs text-text-secondary">
            Looking for public feedback and general campus discussions?
          </span>
          <div className="mt-1">
            <Link
              href="/listwhispers"
              className="text-xs font-bold text-primary hover:underline"
            >
              Browse Student Whispers Feed →
            </Link>
          </div>
        </div>

        {/* Privacy Note */}
        <p className="text-center text-[11px] text-text-soft">
          WhisperLock Protected · No matric number, name, or student session details are ever displayed.
        </p>
      </div>
    </AppShell>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
