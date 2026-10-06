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

interface ReportContent {
  type?: string;
  scope?: string;
  departmentName?: string;
  metrics?: {
    totalWhispers?: number;
    pendingInterventions?: number;
    resolvedCount?: number;
    resolutionRate?: number;
    evaluationsCount?: number;
    averageRating?: number;
  };
  categoryBreakdown?: { category: string; count: number; percentage: number }[];
  criteriaScores?: { criterion: string; averageScore: number }[];
  executiveSummary?: string;
  keyStrengths?: string[];
  priorityConcerns?: string[];
  recommendedActions?: string[];
}

interface Report {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  content: ReportContent | null;
}

interface Department {
  id: string;
  name: string;
}

const TYPE_LABELS: Record<string, string> = {
  ACCREDITATION: "Accreditation Summary",
  DEPARTMENT_SNAPSHOT: "Department Snapshot",
  TREND: "14-Day Trend Report",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

  // Generate modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"ACCREDITATION" | "DEPARTMENT_SNAPSHOT" | "TREND">("ACCREDITATION");
  const [newDeptId, setNewDeptId] = useState("");
  const [generating, setGenerating] = useState(false);

  // View report details modal state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  async function loadData() {
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
  }

  async function handleGenerateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    const dateStr = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    const autoTitle =
      newTitle.trim() ||
      `${TYPE_LABELS[newType] || "Institutional Report"} — ${dateStr}`;

    try {
      await api("/reports/generate", {
        method: "POST",
        body: JSON.stringify({
          title: autoTitle,
          type: newType,
          departmentId: newDeptId || undefined,
        }),
        token: getToken(),
      });
      toast("Report generated successfully!");
      setShowGenerateModal(false);
      setNewTitle("");
      setNewDeptId("");
      await loadData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Generation failed", "error");
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = (reports ?? []).filter((r) => {
    const matchesType = typeFilter === "All" || TYPE_LABELS[r.type] === typeFilter || r.type === typeFilter;
    const scopeStr = typeof r.content?.scope === "string" ? r.content.scope : "";
    const matchesDept = deptFilter === "All" || scopeStr.toLowerCase().includes(deptFilter.toLowerCase());
    return matchesType && matchesDept;
  });

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
                Verified summaries of student feedback and course evaluations for accreditation and departmental review.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  const stamp = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
                  setNewTitle(`Accreditation Report — ${stamp}`);
                  setShowGenerateModal(true);
                }}
                className="btn-primary-green px-4 py-2 text-xs font-semibold"
              >
                <Icon name="add" size={16} />
                Generate New Report
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="rounded-xl border border-border-subtle bg-white p-4 shadow-card">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-end">
              <div className="sm:col-span-5 space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-soft">
                  Filter by Department
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
                  Filter by Report Type
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
                  Reset
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
              {/* Left Column: Key Indicators & Chart (5 cols) */}
              <div className="space-y-6 lg:col-span-5">
                <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card space-y-4">
                  <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                    Key Accreditation Indicators
                  </h2>

                  <div className="divide-y divide-border-subtle">
                    {/* Verified Reports */}
                    <div className="py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-navy">Verified Reports</span>
                        <span className="font-montserrat text-sm font-bold text-navy">
                          {reports?.length ?? 0}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-text-soft">
                        Total official quality assurance audit dossiers generated and stored.
                      </p>
                    </div>

                    {/* Pending Interventions */}
                    <div className="py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-800">
                          Pending Interventions
                        </span>
                        <span className="font-montserrat text-sm font-bold text-amber-800">
                          {overview?.pendingInterventions ?? 0}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-text-soft">
                        Student feedback cases currently open and awaiting administrative action.
                      </p>
                    </div>

                    {/* Resolution Rate */}
                    <div className="py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary">
                          Resolution / Compliance Rate
                        </span>
                        <span className="font-montserrat text-sm font-bold text-primary">
                          {overview?.resolutionRate ?? 0}%
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-text-soft">
                        Percentage of reported student issues that have been investigated and resolved.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reports by type chart */}
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

              {/* Right Column: Available Datasets (7 cols) */}
              <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card lg:col-span-7 space-y-4">
                <div className="border-b border-border-subtle pb-3">
                  <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                    Available Reports &amp; Dossiers ({filtered.length})
                  </h2>
                </div>

                <div className="max-h-[400px] overflow-y-auto divide-y divide-border-subtle pr-2">
                  {filtered.length === 0 && (
                    <p className="py-6 text-center text-xs text-text-secondary">
                      No reports match these filters yet.
                    </p>
                  )}

                  {filtered.map((report, i) => (
                    <div
                      key={report.id}
                      className="flex items-start justify-between gap-4 py-3.5 hover:bg-slate-50/50 rounded-lg px-2 transition-colors"
                    >
                      <div
                        onClick={() => setSelectedReport(report)}
                        className="flex items-start gap-3 cursor-pointer flex-1"
                      >
                        <span className="font-mono text-xs font-bold text-slate-400 w-6 mt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <span className="rounded bg-green-tint px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                            {TYPE_LABELS[report.type] ?? report.type}
                          </span>
                          <h3 className="mt-1 text-xs font-bold text-navy hover:text-primary transition-colors">
                            {report.title}
                          </h3>
                          <p className="text-[11px] text-text-secondary mt-0.5">
                            {typeof report.content?.scope === "string" ? report.content.scope : "University-wide"} · {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setSelectedReport(report)}
                          title="View Full Report"
                          className="rounded-md border border-border-subtle bg-white px-2.5 py-1.5 text-xs font-semibold text-navy hover:bg-slate-50 hover:text-primary transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            downloadCsv(report.id, report.title)
                              .then(() => toast("Report exported as CSV."))
                              .catch(() => toast("Export failed", "error"));
                          }}
                          title="Download CSV"
                          className="rounded-md border border-border-subtle bg-white p-1.5 text-text-secondary hover:bg-slate-50 hover:text-primary transition-colors"
                        >
                          <Icon name="download" size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GENERATE CUSTOM REPORT MODAL */}
          {showGenerateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
              <div className="w-full max-w-lg rounded-2xl border border-border-subtle bg-white p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <div>
                    <h3 className="font-montserrat text-base font-bold text-navy">
                      Generate Institutional Report
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Synthesize live student whispers, evaluations, and compliance data.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="text-text-soft hover:text-navy text-lg"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleGenerateSubmit} className="space-y-4">
                  {/* Report Type */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                      Report Type
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="wl-input text-xs"
                    >
                      <option value="ACCREDITATION">📋 Accreditation Summary (NUC QA Audit)</option>
                      <option value="DEPARTMENT_SNAPSHOT">🏛️ Department Snapshot (Specific Faculty)</option>
                      <option value="TREND">📈 14-Day Trend Report (Temporal Shifts &amp; Pacing)</option>
                    </select>
                  </div>

                  {/* Target Scope */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                      Target Scope
                    </label>
                    <select
                      value={newDeptId}
                      onChange={(e) => setNewDeptId(e.target.value)}
                      className="wl-input text-xs"
                    >
                      <option value="">🏛️ University-wide (All UNILAG)</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          🎓 {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                      Report Title
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Faculty of Engineering Quality Audit 2026"
                      className="wl-input text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-green-tint p-3 text-xs text-primary font-medium">
                    <Icon name="sparkles" size={16} className="text-primary shrink-0" />
                    <span>AI Synthesis: Automatically generates key findings, strengths, and recommended actions.</span>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowGenerateModal(false)}
                      className="rounded-lg border border-border-subtle bg-white px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={generating}
                      className="btn-primary-green px-5 py-2 text-xs font-semibold disabled:opacity-50"
                    >
                      {generating ? "Generating with AI…" : "Generate Report →"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* VIEW REPORT DETAILS MODAL */}
          {selectedReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs overflow-y-auto">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-subtle bg-white p-6 shadow-xl space-y-6 my-8">
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-border-subtle pb-4">
                  <div>
                    <span className="rounded bg-green-tint px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                      {TYPE_LABELS[selectedReport.type] ?? selectedReport.type}
                    </span>
                    <h2 className="mt-1 font-montserrat text-lg font-bold text-navy">
                      {selectedReport.title}
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Scope: {selectedReport.content?.scope || "University-wide"} · Generated {formatDate(selectedReport.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-text-soft hover:text-navy text-lg p-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Key Metric Highlights */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-border-subtle bg-slate-50 p-3 text-center">
                    <span className="text-[10px] font-bold uppercase text-text-soft">Total Whispers</span>
                    <div className="font-montserrat text-lg font-bold text-navy">
                      {selectedReport.content?.metrics?.totalWhispers ?? 0}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-subtle bg-slate-50 p-3 text-center">
                    <span className="text-[10px] font-bold uppercase text-text-soft">Pending Action</span>
                    <div className="font-montserrat text-lg font-bold text-amber-800">
                      {selectedReport.content?.metrics?.pendingInterventions ?? 0}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-subtle bg-slate-50 p-3 text-center">
                    <span className="text-[10px] font-bold uppercase text-text-soft">Resolution Rate</span>
                    <div className="font-montserrat text-lg font-bold text-primary">
                      {selectedReport.content?.metrics?.resolutionRate ?? 0}%
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-subtle bg-slate-50 p-3 text-center">
                    <span className="text-[10px] font-bold uppercase text-text-soft">Avg Course Score</span>
                    <div className="font-montserrat text-lg font-bold text-secondary">
                      {selectedReport.content?.metrics?.averageRating ?? 4.1}/5.0
                    </div>
                  </div>
                </div>

                {/* Executive Summary */}
                {selectedReport.content?.executiveSummary && (
                  <div className="rounded-xl border border-blue-tint bg-blue-tint/30 p-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon name="sparkles" size={16} className="text-secondary" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-secondary">
                        Executive Summary &amp; Findings
                      </h4>
                    </div>
                    <p className="text-xs leading-relaxed text-navy">
                      {selectedReport.content.executiveSummary}
                    </p>
                  </div>
                )}

                {/* Strengths & Commendations */}
                {selectedReport.content?.keyStrengths && selectedReport.content.keyStrengths.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Icon name="verified" size={14} className="text-primary" />
                      Key Strengths &amp; Compliance Highlights
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedReport.content.keyStrengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
                          <span className="text-primary font-bold">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Priority Concerns */}
                {selectedReport.content?.priorityConcerns && selectedReport.content.priorityConcerns.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <Icon name="error" size={14} className="text-amber-800" />
                      Priority Areas for Institutional Action
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedReport.content.priorityConcerns.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
                          <span className="text-amber-800 font-bold">!</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Interventions */}
                {selectedReport.content?.recommendedActions && selectedReport.content.recommendedActions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
                      <Icon name="lightbulb" size={14} className="text-navy" />
                      Recommended Quality Assurance Interventions
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedReport.content.recommendedActions.map((a, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
                          <span className="text-navy font-bold">→</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-white px-3.5 py-2 text-xs font-semibold text-navy hover:bg-slate-50 transition-colors"
                  >
                    <Icon name="file" size={14} />
                    Print / Save PDF
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        downloadCsv(selectedReport.id, selectedReport.title)
                          .then(() => toast("Report exported as CSV."))
                          .catch(() => toast("Export failed", "error"));
                      }}
                      className="btn-primary-green px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Icon name="download" size={14} />
                      Export Data (CSV)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </RoleGate>
  );
}