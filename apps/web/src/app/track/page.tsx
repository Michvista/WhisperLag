"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WhisperBrand } from "@/components/ui/WhisperBrand";
import { Icon } from "@/components/ui/Icon";

interface TrackResult {
  refNumber: string;
  category: string;
  status: "NEW" | "ACKNOWLEDGED" | "ACTIONED";
  resolutionNote: string | null;
  createdAt: string;
}

const STATUS_META: Record<
  TrackResult["status"],
  { label: string; icon: string; cls: string; bg: string }
> = {
  NEW: { label: "Received", icon: "inbox", cls: "text-slate-700", bg: "bg-slate-100" },
  ACKNOWLEDGED: { label: "Under Review", icon: "schedule", cls: "text-amber-800", bg: "bg-amber-tint" },
  ACTIONED: { label: "Resolved", icon: "verified", cls: "text-primary", bg: "bg-green-tint" },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
      const res = await fetch(
        `${API_BASE}/api/v1/feedback/lookup/${encodeURIComponent(refCode)}`
      );
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        data?: TrackResult;
        error?: string | { code?: string; message?: string } | null;
      };
      if (!res.ok || !json.success) {
        let errorMsg = "No whisper found with that reference number. Please check the code and try again.";
        if (typeof json.error === "string") {
          errorMsg = json.error;
        } else if (json.error && typeof json.error === "object" && json.error.message) {
          errorMsg = json.error.message;
        }
        setError(errorMsg);
        return;
      }
      setResult(json.data ?? null);
    } catch {
      setError("Could not reach the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-lookup when arriving from the success page with ?ref= pre-filled
  useEffect(() => {
    const initialRef = searchParams.get("ref");
    if (initialRef?.startsWith("WL-")) {
      void doLookup(initialRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = ref.trim().toUpperCase();
    if (!trimmed.startsWith("WL-")) {
      setError("Reference numbers start with WL- (e.g. WL-2026-118374).");
      return;
    }
    await doLookup(trimmed);
  }

  const meta = result ? STATUS_META[result.status] : null;

  return (
    <div className="min-h-screen bg-background text-navy">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
          <WhisperBrand href="/" />
          <Link
            href="/whisper"
            className="rounded-lg border border-border-subtle bg-white px-3.5 py-1.5 text-xs font-semibold text-navy hover:bg-slate-50 transition-colors"
          >
            Give Feedback →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-tint">
            <Icon name="search" size={28} className="text-primary" />
          </div>
          <h1 className="font-montserrat text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Track Your Whisper
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Enter the reference number from your submission confirmation to check its current status.
          </p>
        </div>

        {/* Lookup Form */}
        <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-card">
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-navy">
                Feedback Reference Number
              </label>
              <input
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="WL-2026-118374"
                className="wl-input font-mono tracking-wider"
                spellCheck={false}
                autoComplete="off"
              />
              <p className="text-[11px] text-text-soft">
                Found on your submission confirmation page. Format: WL-YYYY-XXXXXX
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                <Icon name="error" size={14} className="shrink-0 text-red-600" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !ref.trim()}
              className="btn-primary-green w-full py-3 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Searching…
                </span>
              ) : (
                "Check Status →"
              )}
            </button>
          </form>

          {/* Result */}
          {result && meta && (
            <div className="mt-6 space-y-4 border-t border-border-subtle pt-6">
              {/* Status pill */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text-soft">
                  Status
                </span>
                <span
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${meta.bg} ${meta.cls}`}
                >
                  <Icon name={meta.icon} size={13} />
                  {meta.label}
                </span>
              </div>

              {/* Category + Date */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-border-subtle bg-slate-50/70 p-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-soft">
                    Category
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-navy">
                    {result.category}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-soft">
                    Submitted
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-navy">
                    {new Date(result.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-soft">
                    Reference
                  </div>
                  <div className="mt-0.5 font-mono text-xs font-bold text-primary">
                    {result.refNumber}
                  </div>
                </div>
              </div>

              {/* Resolution Note */}
              {result.status === "ACTIONED" && result.resolutionNote && (
                <div className="rounded-xl border border-green-tint bg-green-tint p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="verified" size={14} className="text-primary" />
                    <span className="text-xs font-bold text-primary">
                      Institutional Response
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-text-secondary">
                    {result.resolutionNote}
                  </p>
                </div>
              )}

              {/* Pending message */}
              {result.status !== "ACTIONED" && (
                <div className="rounded-xl border border-border-subtle bg-slate-50/70 p-4 text-center">
                  <p className="text-xs leading-relaxed text-text-secondary">
                    {result.status === "NEW"
                      ? "Your whisper has been received and is awaiting review by the relevant team."
                      : "Your whisper is currently under active review. A resolution will be published here when action is taken."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Privacy note */}
        <p className="mt-6 text-center text-[11px] leading-relaxed text-text-soft">
          Only status and resolution details are shown — no personal information is ever stored or
          displayed.{" "}
          <Link href="/listwhispers" className="text-primary font-semibold hover:underline">
            View all public whispers →
          </Link>
        </p>
      </main>
    </div>
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
