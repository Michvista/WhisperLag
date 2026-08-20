"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBlock, LoadingBlock, SignedOut } from "@/components/ui/States";
import { api, getToken, API_BASE } from "@/lib/api";

interface Overview {
  totalWhispers: number;
  totalEvaluations: number;
  totalDepartments: number;
  pendingInterventions: number;
  resolutionRate: number;
  averageRating: number;
}

interface Report {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  content: { scope?: string } | null;
}

interface Department {
  id: string;
  name: string;
}

const TYPE_LABELS: Record<string, string> = {
  ACCREDITATION: "Accreditation Summary",
  DEPARTMENT_SNAPSHOT: "Faculty Feedback Aggregate",
  TREND: "Compliance Audit",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Reports & accreditation — editorial 40/60 presentation of live data. */
export default function ReportsPage() {
  const session = Boolean(getToken());
  const [reports, setReports] = useState<Report[] | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [typeFilter, setTypeFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [rep, ov, deps] = await Promise.all([
          api<Report[]>("/reports", { token: getToken(), cache: "no-store" }),
          api<Overview>("/stats/overview", { token: getToken(), cache: "no-store" }),
          api<Department[]>("/departments", { token: getToken(), cache: "no-store" }),
        ]);
        setReports(rep);
        setOverview(ov);
        setDepartments(deps);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load reports");
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  if (!session) {
    return (
      <AppShell>
        <SignedOut />
      </AppShell>
    );
  }

  const filtered = (reports ?? []).filter(
    (r) =>
      (typeFilter === "All" || TYPE_LABELS[r.type] === typeFilter || r.type === typeFilter) &&
      (deptFilter === "All" ||
        (typeof r.content?.scope === "string" && r.content.scope.toLowerCase().includes(deptFilter.toLowerCase()))),
  );

  return (
    <AppShell>
      <div className="mb-20">
        <h1 className="mb-6 font-display text-4xl font-bold text-onSurface md:w-2/3 md:text-display-xl">
          Institutional Reports &amp; Accreditation Data
        </h1>
        <p className="font-body-lg text-body-lg text-onSurfaceVariant md:w-1/2">
          Secure access to verified whisper data summaries designed for
          institutional review and compliance reporting. All data maintains
          strict anonymity protocols.
        </p>
      </div>

      {/* Filters */}
      <div className="rule-b mb-16 flex flex-col items-end gap-8 border-t border-ink/10 pt-8 md:flex-row">
        <div className="w-full md:w-1/4">
          <label className="mb-2 block font-label-caps text-label-caps text-onSurfaceVariant">Department</label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="input-minimal w-full font-body-md text-onSurface"
          >
            <option>All</option>
            {departments.map((d) => (
              <option key={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-1/4">
          <label className="mb-2 block font-label-caps text-label-caps text-onSurfaceVariant">Report Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-minimal w-full font-body-md text-onSurface"
          >
            <option>All</option>
            {Object.values(TYPE_LABELS).map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex w-full justify-end md:w-1/4">
          <button className="flex w-full items-center justify-center gap-2 border border-ink px-6 py-3 font-label-caps text-label-caps uppercase tracking-wider text-onSurface transition-colors hover:bg-surface-variant md:w-auto">
            <span className="material-symbols-outlined text-sm">filter_list</span> Apply Filters
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingBlock label="Loading reports…" />
      ) : error ? (
        <ErrorBlock message={error} onRetry={() => window.location.reload()} />
      ) : (
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          {/* Left: key indicators (40%) */}
          <div className="flex flex-col gap-12 lg:col-span-5">
            <div>
              <h2 className="mb-6 font-display text-headline-md font-semibold text-onSurface">
                Key Accreditation Indicators
              </h2>
              <div className="flex flex-col border-t border-ink/10">
                <div className="rule-b flex items-center justify-between py-6">
                  <span className="font-body-md text-body-md text-onSurfaceVariant">Verified Reports (YTD)</span>
                  <span className="font-display text-headline-lg font-semibold text-onSurface">{reports?.length ?? 0}</span>
                </div>
                <div className="rule-b flex items-center justify-between py-6">
                  <span className="font-body-md text-body-md text-onSurfaceVariant">Pending Interventions</span>
                  <span className="font-display text-headline-lg font-semibold text-onSurface">
                    {overview?.pendingInterventions ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between py-6">
                  <span className="font-body-md text-body-md text-onSurfaceVariant">Compliance Rate</span>
                  <span className="font-display text-headline-lg font-semibold text-primary">
                    {overview?.resolutionRate ?? 0}%
                  </span>
                </div>
              </div>
            </div>
            <div className="whisper-lock-glow bg-surface-container-low p-8">
              <div className="mb-4 flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
                <h3 className="font-label-caps text-label-caps">Data Integrity Confirmed</h3>
              </div>
              <p className="font-body-md text-body-md text-onSurfaceVariant">
                This dataset is generated live from anonymized submissions and
                is certified suitable for external accreditation review.
              </p>
            </div>
          </div>

          {/* Right: datasets (60%) */}
          <div className="lg:col-span-7">
            <div className="rule-b mb-6 flex items-end justify-between pb-4">
              <h2 className="font-display text-headline-md font-semibold text-onSurface">Available Datasets</h2>
            </div>
            <div className="flex flex-col">
              {filtered.length === 0 && (
                <p className="py-8 font-body-md text-body-md text-onSurfaceVariant">
                  No reports match these filters yet.
                </p>
              )}
              {filtered.map((report, i) => (
                <div key={report.id} className="rule-b group flex flex-col items-start gap-4 py-8 sm:flex-row sm:items-center sm:gap-8">
                  <span className="w-12 font-display text-headline-lg font-light text-onSurfaceVariant/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-grow">
                    <h3 className="mb-1 font-display text-headline-md font-semibold text-onSurface">{report.title}</h3>
                    <p className="font-body-md text-sm text-onSurfaceVariant">
                      {TYPE_LABELS[report.type] ?? report.type} · {formatDate(report.createdAt)} ·{" "}
                      {typeof report.content?.scope === "string" ? report.content.scope : "University-wide"}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <a
                      href={`${API_BASE}/reports/${report.id}/export?format=csv`}
                      title="Export CSV"
                      className="text-onSurfaceVariant transition-colors hover:text-primary"
                    >
                      <span className="material-symbols-outlined">table_view</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}