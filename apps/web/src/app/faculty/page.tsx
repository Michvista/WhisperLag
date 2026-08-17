"use client";

import { AppShell } from "@/components/layout/AppShell";
import { WhisperLock } from "@/components/ui/WhisperLock";
import { ErrorBlock, LoadingBlock, SignedOut } from "@/components/ui/States";
import { useFetch } from "@/lib/useFetch";
import { getToken } from "@/lib/api";

interface Me {
  id: string;
  name: string;
  role: string;
  departmentId: string | null;
}

interface Summary {
  averageRating: number;
  responseCount: number;
  pendingInterventions: number;
  breakdown: { key: string; label: string; average: number }[];
  themes: { category: string; count: number }[];
}

interface Snapshot {
  departmentId: string;
  name: string;
  kpiScores: { engagement: number; quality: number; feedbackReceived: number };
  trend: { period: string; score: number }[];
}

const THEME_ICONS = ["thumb_up", "schedule", "auto_stories", "campaign"];
const THEME_COLORS = ["text-primary", "text-[#E5A823]", "text-primary", "text-secondary"];

/**
 * Faculty performance hub — aggregate-only, live from the API. Averages and
 * distributions never include individual identities.
 */
export default function FacultyHubPage() {
  const session = Boolean(getToken());
  const me = useFetch<Me>("/auth/me");
  const summary = useFetch<Summary>("/evaluations/summary");
  const snapshot = useFetch<Snapshot>(
    me.data?.departmentId ? `/departments/${me.data.departmentId}/snapshot` : null,
  );

  if (!session) {
    return (
      <AppShell>
        <SignedOut />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-8 flex justify-center">
        <WhisperLock />
      </div>

      <div className="mb-10">
        <h1 className="mb-2 font-display text-headline-lg-mobile font-bold text-onSurface md:text-headline-lg">
          Faculty Performance Overview
        </h1>
        <p className="font-body-md text-body-md text-onSurfaceVariant">
          Aggregate anonymized data across all registered courses for the current semester.
        </p>
      </div>

      {summary.loading ? (
        <LoadingBlock label="Loading performance data…" />
      ) : summary.error ? (
        <ErrorBlock message={summary.error} onRetry={summary.refetch} />
      ) : (
        <div className="grid max-w-container grid-cols-1 gap-gutter md:grid-cols-12">
          {/* Key metrics */}
          <div className="flex flex-col justify-between rounded-lg border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1 md:col-span-4">
            <div>
              <h3 className="mb-1 font-label-md text-label-md uppercase tracking-wider text-onSurfaceVariant">
                Overall Faculty Rating
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-headline-xl font-bold text-primary">
                  {summary.data?.averageRating.toFixed(1) ?? "—"}
                </span>
                <span className="font-body-md text-body-md text-onSurfaceVariant">/ 5.0</span>
              </div>
            </div>
            {snapshot.data && (
              <div className="mt-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
                  trending_up
                </span>
                <span className="font-body-sm text-body-sm text-primary">
                  Dept avg {snapshot.data.kpiScores.quality.toFixed(1)} · {snapshot.data.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1 md:col-span-4">
            <div>
              <h3 className="mb-1 font-label-md text-label-md uppercase tracking-wider text-onSurfaceVariant">
                Total Anonymous Responses
              </h3>
              <span className="font-display text-headline-xl font-bold text-onSurface">
                {summary.data?.responseCount.toLocaleString() ?? "—"}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontSize: "20px" }}>
                groups
              </span>
              <span className="font-body-sm text-body-sm text-onSurfaceVariant">Across all departments</span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1 md:col-span-4">
            <div>
              <h3 className="mb-1 font-label-md text-label-md uppercase tracking-wider text-onSurfaceVariant">
                Pending Interventions
              </h3>
              <span className="font-display text-headline-xl font-bold text-error">
                {summary.data?.pendingInterventions ?? "—"}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#E5A823]" />
              <span className="font-body-sm text-body-sm text-onSurfaceVariant">Require administrative review</span>
            </div>
          </div>

          {/* Distribution chart */}
          <div className="rounded-lg border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1 md:col-span-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-headline-sm font-semibold text-onSurface">
                Rating Distribution by Category
              </h3>
              <span className="rounded-full border border-outlineVariant bg-surface-container-low px-3 py-1 font-label-md text-label-md text-onSurfaceVariant">
                vs. Dept Avg
              </span>
            </div>
            <div className="relative mt-8">
              {snapshot.data && (
                <>
                  <div className="absolute left-0 right-0 top-[40%] z-10 border-t border-dashed border-tertiary" />
                  <div className="absolute right-0 top-[35%] z-10 bg-surface px-1 font-label-md text-label-md text-tertiary">
                    Dept Avg ({snapshot.data.kpiScores.quality.toFixed(1)})
                  </div>
                </>
              )}
              <div className="flex h-[150px] items-end gap-4 border-b border-[#E5E7EB] pb-6">
                {(summary.data?.breakdown.length ? summary.data.breakdown : []).map((b) => {
                  const heightPct = Math.max(8, Math.round((b.average / 5) * 100));
                  return (
                    <div key={b.key} className="relative flex-1">
                      <div
                        className="rounded-t bg-primary transition-all hover:opacity-80"
                        style={{ height: `${heightPct}%` }}
                        title={`${b.label}: ${b.average}/5`}
                      />
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-body-sm text-body-sm text-onSurfaceVariant">
                        {b.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recurring themes */}
          <div className="rounded-lg border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1 md:col-span-4">
            <h3 className="mb-4 font-display text-headline-sm font-semibold text-onSurface">
              Recurring Themes
            </h3>
            <p className="mb-4 font-body-sm text-body-sm text-onSurfaceVariant">
              Derived from whisper categories across the university.
            </p>
            <ul className="space-y-4">
              {(summary.data?.themes.length ? summary.data.themes : []).map((theme, i) => (
                <li
                  key={theme.category}
                  className="flex items-start gap-3 border-b border-outlineVariant pb-3 last:border-0 last:pb-0"
                >
                  <span className={`material-symbols-outlined mt-0.5 ${THEME_COLORS[i % THEME_COLORS.length]}`}>
                    {THEME_ICONS[i % THEME_ICONS.length]}
                  </span>
                  <div>
                    <h4 className="font-label-md text-label-md text-onSurface">{theme.category}</h4>
                    <p className="font-body-sm text-body-sm text-onSurfaceVariant">
                      Mentioned {theme.count}× this semester
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </AppShell>
  );
}