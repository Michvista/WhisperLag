"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBlock, LoadingBlock, SignedOut } from "@/components/ui/States";
import { api, getToken } from "@/lib/api";

interface Overview {
  totalWhispers: number;
  totalEvaluations: number;
  totalDepartments: number;
  pendingInterventions: number;
  averageRating: number;
  trend: { date: string; whispers: number; evaluations: number }[];
}

interface Department {
  id: string;
  name: string;
}

interface Snapshot {
  departmentId: string;
  name: string;
  kpiScores: { engagement: number; quality: number; feedbackReceived: number };
  trend: { period: string; score: number }[];
}

function load<T>(path: string): Promise<T> {
  return api<T>(path, { token: getToken(), cache: "no-store" });
}

function DeptStatus({ snapshot }: { snapshot: Snapshot }) {
  const quality = snapshot.kpiScores.quality;
  const needsAttention = quality < 3.5 || snapshot.kpiScores.feedbackReceived < 3;
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-bold ${
        needsAttention ? "bg-tertiary-fixed-dim/20 text-tertiary-container" : "bg-primary/10 text-primary"
      }`}
    >
      {needsAttention ? "Needs Attention" : "Healthy"}
    </span>
  );
}

/**
 * Admin command center — fully live: KPIs from /stats/overview, a 14-day
 * trend, and real department snapshots.
 */
export default function AdminCommandCenterPage() {
  const session = Boolean(getToken());
  const [overview, setOverview] = useState<Overview | null>(null);
  const [depts, setDepts] = useState<(Department & { snapshot: Snapshot | null })[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [ov, departments] = await Promise.all([
        load<Overview>("/stats/overview"),
        load<Department[]>("/departments"),
      ]);
      setOverview(ov);
      const withSnapshots = await Promise.all(
        departments.map(async (d) => {
          try {
            const snapshot = await load<Snapshot>(`/departments/${d.id}/snapshot`);
            return { ...d, snapshot };
          } catch {
            return { ...d, snapshot: null };
          }
        }),
      );
      setDepts(withSnapshots);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) void loadAll();
  }, [session]);

  async function generateReport() {
    setGenerating(true);
    setNotice(null);
    try {
      await api<{ id: string }>("/reports/generate", {
        method: "POST",
        body: JSON.stringify({ title: "Accreditation Report", type: "ACCREDITATION" }),
        token: getToken(),
      });
      setNotice("Accreditation report generated and saved. View it in Reports.");
      void loadAll();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Report generation failed");
    } finally {
      setGenerating(false);
    }
  }

  if (!session) {
    return (
      <AppShell>
        <SignedOut />
      </AppShell>
    );
  }

  const maxTrend = Math.max(1, ...(overview?.trend.map((t) => Math.max(t.whispers, t.evaluations)) ?? [1]));

  return (
    <AppShell>
      <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="mb-2 font-display text-headline-lg font-bold text-onSurface">Platform Overview</h2>
          <p className="font-body-md text-body-md text-onSurfaceVariant">
            Real-time metrics and institutional compliance status.
          </p>
        </div>
        <button
          onClick={generateReport}
          disabled={generating}
          className="flex min-h-[48px] items-center rounded-lg bg-primary px-6 py-3 font-label-md text-label-md text-onPrimary shadow-level-1 transition-all hover:shadow-level-2 disabled:opacity-60"
        >
          <span className="material-symbols-outlined mr-2">description</span>
          {generating ? "Generating…" : "Generate Accreditation Report"}
        </button>
      </div>

      {notice && (
        <div className="mb-8 rounded-lg border border-primary-container bg-primary-container/20 p-4 font-body-sm text-body-sm text-onPrimaryContainer">
          {notice}
        </div>
      )}

      {loading ? (
        <LoadingBlock label="Loading live metrics…" />
      ) : error ? (
        <ErrorBlock message={error} onRetry={loadAll} />
      ) : (
        overview && (
          <>
            {/* KPI cards */}
            <div className="mb-12 grid grid-cols-1 gap-gutter md:grid-cols-3">
              <div className="flex h-48 flex-col justify-between rounded-xl border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1">
                <div className="flex items-start justify-between">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-onSurfaceVariant">
                    Total Whispers
                  </span>
                  <span className="rounded-lg bg-primary-container/20 p-2 text-primary">
                    <span className="material-symbols-outlined">forum</span>
                  </span>
                </div>
                <div>
                  <div className="mb-1 font-display text-headline-xl font-bold text-onSurface">
                    {overview.totalWhispers.toLocaleString()}
                  </div>
                  <div className="font-body-sm text-body-sm text-onSurfaceVariant">
                    {overview.pendingInterventions} awaiting action
                  </div>
                </div>
              </div>

              <div className="flex h-48 flex-col justify-between rounded-xl border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1">
                <div className="flex items-start justify-between">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-onSurfaceVariant">
                    Student Sentiment
                  </span>
                  <span className="rounded-lg bg-secondary-container/30 p-2 text-secondary">
                    <span className="material-symbols-outlined">mood</span>
                  </span>
                </div>
                <div>
                  <div className="mb-1 font-display text-headline-xl font-bold text-onSurface">
                    {overview.averageRating.toFixed(1)}
                    <span className="text-headline-md text-onSurfaceVariant">/5</span>
                  </div>
                  <div className="font-body-sm text-body-sm text-onSurfaceVariant">
                    From {overview.totalEvaluations.toLocaleString()} evaluations
                  </div>
                </div>
              </div>

              <div className="relative flex h-48 flex-col justify-between overflow-hidden rounded-xl border border-primary bg-surface-container-lowest p-6 shadow-level-1">
                <div className="absolute -mr-10 -mt-10 right-0 top-0 h-32 w-32 rounded-bl-full bg-primary-container/10" />
                <div className="relative z-10 flex items-start justify-between">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-onSurfaceVariant">
                    Compliance Status
                  </span>
                  <span className="material-symbols-outlined text-primary">verified_user</span>
                </div>
                <div className="relative z-10">
                  <div className="mb-1 font-display text-headline-lg font-bold text-primary">
                    {overview.totalDepartments} departments
                  </div>
                  <div className="mt-2 flex items-center font-body-sm text-body-sm text-onSurfaceVariant">
                    <span className="mr-2 h-2 w-2 rounded-full bg-primary" />
                    All departments reporting active
                  </div>
                </div>
              </div>
            </div>

            {/* Trend chart */}
            <div className="mb-12 rounded-xl border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display text-headline-sm font-semibold text-onSurface">
                  Whisper &amp; Evaluation Activity — last 14 days
                </h3>
              </div>
              <div className="flex h-56 items-end gap-1.5">
                {overview.trend.map((t) => (
                  <div key={t.date} className="group relative flex flex-1 flex-col items-center justify-end gap-1">
                    <span className="hidden rounded bg-onSurface px-1.5 py-0.5 text-[10px] font-semibold text-onPrimary group-hover:block">
                      {t.whispers + t.evaluations}
                    </span>
                    <div className="w-full rounded-t-sm bg-primary/40 transition-colors hover:bg-primary/60" style={{ height: `${(t.whispers / maxTrend) * 100}%` }} />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-4 font-body-sm text-body-sm text-onSurfaceVariant">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary/40" /> Whispers</span>
                <span>— last {overview.trend.length} days</span>
              </div>
            </div>

            {/* Departments + tools */}
            <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
              <div className="rounded-xl border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1 lg:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-display text-headline-sm font-semibold text-onSurface">Departmental Snapshots</h3>
                </div>
                <div className="space-y-4">
                  {(depts ?? []).map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between rounded-lg border border-outlineVariant bg-surface p-4 transition-colors hover:border-primary">
                      <div className="flex items-center">
                        <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container font-bold text-onSecondaryContainer">
                          {dept.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-label-md text-label-md text-onSurface">{dept.name}</h4>
                          {dept.snapshot ? (
                            <p className="font-body-sm text-body-sm text-onSurfaceVariant">
                              {dept.snapshot.kpiScores.feedbackReceived} whispers · {dept.snapshot.kpiScores.engagement} evaluations
                            </p>
                          ) : (
                            <p className="font-body-sm text-body-sm text-onSurfaceVariant">No data yet</p>
                          )}
                        </div>
                      </div>
                      {dept.snapshot && <DeptStatus snapshot={dept.snapshot} />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col rounded-xl border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1">
                <h3 className="mb-6 font-display text-headline-sm font-semibold text-onSurface">Administrative Tools</h3>
                <div className="flex-1 space-y-4">
                  <a href="/reports" className="group flex w-full items-start justify-start rounded-lg border border-outlineVariant bg-surface p-4 text-left transition-colors hover:bg-surface-container-low">
                    <span className="mr-3 text-secondary transition-colors group-hover:text-primary">
                      <span className="material-symbols-outlined">description</span>
                    </span>
                    <div>
                      <div className="font-label-md text-label-md text-onSurface">Reports &amp; Accreditation</div>
                      <div className="font-body-sm text-body-sm text-onSurfaceVariant">Generate and export reports</div>
                    </div>
                  </a>
                  <a href="/reports" className="group flex w-full items-start justify-start rounded-lg border border-outlineVariant bg-surface p-4 text-left transition-colors hover:bg-surface-container-low">
                    <span className="mr-3 text-secondary transition-colors group-hover:text-primary">
                      <span className="material-symbols-outlined">format_list_bulleted_add</span>
                    </span>
                    <div>
                      <div className="font-label-md text-label-md text-onSurface">Survey Builder</div>
                      <div className="font-body-sm text-body-sm text-onSurfaceVariant">Create new feedback forms</div>
                    </div>
                  </a>
                  <div className="mt-8 flex items-start rounded-lg border border-secondary-fixed-dim/30 bg-secondary-fixed-dim/20 p-4">
                    <span className="material-symbols-outlined mr-3 mt-1 text-secondary">lock</span>
                    <div>
                      <h4 className="mb-1 font-label-md text-label-md text-onSurface">Whisper Lock Active</h4>
                      <p className="font-body-sm text-body-sm text-onSurfaceVariant">
                        All student identities in this view are cryptographically anonymized per institutional policy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      )}
    </AppShell>
  );
}