"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/ui/RoleGate";
import { ROLES } from "@whisperlag/shared";
import { ErrorBlock, LoadingBlock } from "@/components/ui/States";
import { api, getToken } from "@/lib/api";
import { downloadCsv } from "@/lib/download";
import { toast } from "@/lib/toast";
import { useAuth } from "@/lib/useAuth";
import { Icon } from "@/components/ui/Icon";

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
  DEPARTMENT_SNAPSHOT: "Department Snapshot",
  TREND: "Trend Report",
};


function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ReportsPage() {
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";
  const [reports, setReports] = useState<Report[] | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [typeFilter, setTypeFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const rep = await api<Report[]>("/reports", { token: getToken(), cache: "no-store" });
      const ov = await api<Overview>("/stats/overview", { token: getToken(), cache: "no-store" });
      const deps = await api<Department[]>("/departments", { token: getToken(), cache: "no-store" });
      setReports(rep);
      setOverview(ov);
      setDepartments(deps);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    setGenerating(true);
    try {
      const stamp = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
      await api("/reports/generate", {
        method: "POST",
        body: JSON.stringify({ title: `Accreditation Report: ${stamp}`, type: "ACCREDITATION" }),
        token: getToken(),
      });
      toast("Report generated.");
      await loadData();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Generation failed", "error");
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = (reports ?? []).filter(
    (r) =>
      (typeFilter === "All" || TYPE_LABELS[r.type] === typeFilter || r.type === typeFilter) &&
      (deptFilter === "All" ||
        (typeof r.content?.scope === "string" && r.content.scope.toLowerCase().includes(deptFilter.toLowerCase()))),
  );

  return (
    <RoleGate minRole={ROLES.FACULTY}>
      <AppShell>
        <div className="py-6 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border-subtle pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Quality Assurance &amp; Compliance
              </span>
              <h1 className="mt-1 font-montserrat text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Institutional Reports
              </h1>
              <p className="mt-1 text-xs text-text-secondary">
                Verified whisper &amp; evaluation summaries for accreditation review. All anonymous.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={generate}
                disabled={generating}
                className="btn-primary-green px-4 py-2 text-xs font-semibold disabled:opacity-60"
              >
                <Icon name="add" size={16} />
                {generating ? "Generating…" : "Generate New Report"}
              </button>
            )}
          </div>

          {/* Filter Bar with generous spacing */}
          <div className="rounded-xl border border-border-subtle bg-white p-4 shadow-card">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-end">
              <div className="sm:col-span-5 space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-soft">
                  Department
                </label>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="wl-input text-xs cursor-pointer"
                >
                  <option>All</option>
                  {departments.map((d) => (
                    <option key={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-soft">
                  Report Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="wl-input text-xs cursor-pointer"
                >
                  <option>All</option>
                  {Object.values(TYPE_LABELS).map((label) => (
                    <option key={label}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  onClick={() => {
                    setTypeFilter("All");
                    setDeptFilter("All");
                  }}
                  className="w-full rounded-lg border border-border-subtle bg-white py-2 px-3 text-xs font-semibold text-text-secondary hover:bg-slate-50 hover:text-navy"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingBlock label="Loading reports…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={loadData} />
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left: key indicators (5 cols) */}
              <div className="space-y-6 lg:col-span-5">
                <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card space-y-4">
                  <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                    Key Accreditation Indicators
                  </h2>

                  <div className="divide-y divide-border-subtle">
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-xs text-text-secondary">Verified Reports</span>
                      <span className="font-montserrat text-sm font-bold text-navy">
                        {reports?.length ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-xs text-text-secondary">Pending Interventions</span>
                      <span className="font-montserrat text-sm font-bold text-amber-800">
                        {overview?.pendingInterventions ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-xs text-text-secondary">Resolution / Compliance Rate</span>
                      <span className="font-montserrat text-sm font-bold text-primary">
                        {overview?.resolutionRate ?? 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card">
                  <h2 className="mb-3 font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                    Reports by Type
                  </h2>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(
                          (reports ?? []).reduce<Record<string, number>>((acc, r) => {
                            const label = TYPE_LABELS[r.type] ?? r.type;
                            acc[label] = (acc[label] ?? 0) + 1;
                            return acc;
                          }, {}),
                        ).map(([name, count]) => ({ name, count }))}
                        margin={{ top: 8, right: 8, bottom: 0, left: -24 }}
                      >
                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 12 }} />
                        <Bar dataKey="count" fill="#166534" radius={[4, 4, 0, 0]} maxBarSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Right: Datasets (7 cols) */}
              <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card lg:col-span-7 space-y-4">
                <div className="border-b border-border-subtle pb-3">
                  <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                    Available Datasets ({filtered.length})
                  </h2>
                </div>

                <div className="divide-y divide-border-subtle">
                  {filtered.length === 0 && (
                    <p className="py-6 text-center text-xs text-text-secondary">
                      No reports match these filters yet.
                    </p>
                  )}

                  {filtered.map((report, i) => (
                    <div key={report.id} className="flex items-start justify-between gap-4 py-3.5">
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-xs font-bold text-slate-400 w-6 mt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <span className="rounded bg-green-tint px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                            {TYPE_LABELS[report.type] ?? report.type}
                          </span>
                          <h3 className="mt-1 text-xs font-bold text-navy">
                            {report.title}
                          </h3>
                          <p className="text-[11px] text-text-secondary">
                            {typeof report.content?.scope === "string" ? report.content.scope : "University-wide"} · {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          downloadCsv(report.id, report.title)
                            .then(() => toast("Report exported as CSV."))
                            .catch(() => toast("Export failed", "error"));
                        }}
                        title="Download CSV"
                        className="rounded-md border border-border-subtle bg-white p-2 text-text-secondary hover:bg-slate-50 hover:text-primary transition-colors shrink-0"
                      >
                        <Icon name="download" size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </RoleGate>
  );
}