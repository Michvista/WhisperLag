"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/ui/RoleGate";
import { ROLES } from "@whisperlag/shared";
import { ErrorBlock, LoadingBlock } from "@/components/ui/States";
import { api, getToken } from "@/lib/api";
import { toast } from "@/lib/toast";

interface Overview {
  totalWhispers: number;
  totalEvaluations: number;
  totalDepartments: number;
  pendingInterventions: number;
  resolutionRate: number;
  averageRating: number;
  trend: { date: string; whispers: number; evaluations: number }[];
}

interface Report {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  content: { scope?: string } | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Admin command center — institutional overview, live. */
export default function AdminCommandCenterPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [ov, rep] = await Promise.all([
        api<Overview>("/stats/overview", { token: getToken(), cache: "no-store" }),
        api<Report[]>("/reports", { token: getToken(), cache: "no-store" }),
      ]);
      setOverview(ov);
      setReports(rep);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function generateReport() {
    setGenerating(true);
    setNotice(null);
    try {
      await api("/reports/generate", {
        method: "POST",
        body: JSON.stringify({ title: "Accreditation Report", type: "ACCREDITATION" }),
        token: getToken(),
      });
      setNotice("Accreditation report generated. View it in Reports.");
      toast("Accreditation report generated.");
      void loadAll();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Generation failed");
      toast(e instanceof Error ? e.message : "Generation failed", "error");
    } finally {
      setGenerating(false);
    }
  }


  return (
    <RoleGate minRole={ROLES.ADMIN}>
      <AppShell>
      <header className="mb-16 flex flex-col gap-6">
        <h1 className="font-display text-headline-lg font-semibold text-onSurface">Institutional Overview</h1>
        <div className="flex items-center gap-4">
          <span className="font-mono-label text-mono-label uppercase tracking-wider text-onSurfaceVariant">
            UNILAG Command Center
          </span>
          <div className="rule-b h-px flex-1" />
          <span className="font-mono-label text-mono-label text-onSurfaceVariant">Live data</span>
        </div>
      </header>

      {notice && (
        <div className="mb-8 border border-primary/20 bg-primary/5 p-4 font-body-md text-body-md text-onPrimaryContainer">
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
            {/* High-level metrics */}
            <section className="grid grid-cols-1 border-y border-ink/10 md:grid-cols-3">
              <div className="flex flex-col gap-2 border-b border-ink/10 p-8 md:border-b-0 md:border-r">
                <span className="font-label-caps text-label-caps text-onSurfaceVariant">Total Whispers</span>
                <span className="font-display text-5xl font-bold text-onSurface">{overview.totalWhispers.toLocaleString()}</span>
                <span className="font-mono-label text-mono-label text-primary">
                  {overview.pendingInterventions} awaiting action
                </span>
              </div>
              <div className="flex flex-col gap-2 border-b border-ink/10 p-8 md:border-b-0 md:border-r">
                <span className="font-label-caps text-label-caps text-onSurfaceVariant">Critical Alerts</span>
                <span className="font-display text-5xl font-bold text-error">{overview.pendingInterventions}</span>
                <span className="font-mono-label text-mono-label text-error">Requires immediate review</span>
              </div>
              <div className="flex flex-col gap-2 p-8">
                <span className="font-label-caps text-label-caps text-onSurfaceVariant">Resolution Rate</span>
                <span className="font-display text-5xl font-bold text-onSurface">{overview.resolutionRate}%</span>
                <span className="font-mono-label text-mono-label text-onSurfaceVariant">
                  {overview.totalEvaluations} evaluations · {overview.totalDepartments} departments
                </span>
              </div>
            </section>

            {/* Trend + resolution charts */}
            <section className="grid grid-cols-1 gap-16 pt-16 lg:grid-cols-[60%_40%]">
              <div>
                <h2 className="rule-b mb-6 font-label-caps text-label-caps uppercase tracking-widest text-onSurface">
                  Whisper &amp; Evaluation Activity — 14 days
                </h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={overview.trend.map((t) => ({
                        date: new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
                        Whispers: t.whispers,
                        Evaluations: t.evaluations,
                      }))}
                      margin={{ top: 4, right: 8, bottom: 0, left: -24 }}
                    >
                      <defs>
                        <linearGradient id="adminWhisper" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#006b2d" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#006b2d" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="adminEval" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00668a" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#00668a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(17,24,39,0.06)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#3e4a3e" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10, fill: "#3e4a3e" }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 0, borderColor: "#e5e7eb", fontSize: 12 }} />
                      <Area type="monotone" dataKey="Whispers" stroke="#006b2d" fill="url(#adminWhisper)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Evaluations" stroke="#00668a" fill="url(#adminEval)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h2 className="rule-b mb-6 font-label-caps text-label-caps uppercase tracking-widest text-onSurface">
                  Resolution Status
                </h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Resolved", value: overview.resolutionRate },
                          { name: "Remaining", value: Math.max(0, 100 - overview.resolutionRate) },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        <Cell fill="#006b2d" />
                        <Cell fill="#e5e7eb" />
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 0, borderColor: "#e5e7eb", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex items-center justify-center gap-6 font-mono-label text-mono-label text-onSurfaceVariant">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Resolved {overview.resolutionRate}%</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#e5e7eb]" /> {100 - overview.resolutionRate}%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Split: reports + actions */}
            <section className="grid grid-cols-1 gap-16 pt-16 lg:grid-cols-[60%_40%]">
              <div className="flex flex-col gap-8">
                <div className="rule-b flex items-end justify-between pb-4">
                  <h2 className="font-display text-headline-md font-semibold text-onSurface">Recent Reports</h2>
                  <Link href="/reports" className="font-label-caps text-label-caps text-primary hover:underline">
                    View All
                  </Link>
                </div>
                <div className="flex flex-col">
                  {(reports ?? []).slice(0, 4).map((report, i) => (
                    <Link
                      key={report.id}
                      href="/reports"
                      className="rule-b group flex cursor-pointer items-start gap-6 py-6"
                    >
                      <span className="font-display text-3xl font-light text-onSurfaceVariant/50">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded-sm px-2 py-1 font-label-caps text-label-caps ${
                              report.type === "ACCREDITATION"
                                ? "bg-error-container text-onErrorContainer"
                                : "bg-surface-variant text-onSurfaceVariant"
                            }`}
                          >
                            {report.type === "ACCREDITATION" ? "High Priority" : "Standard"}
                          </span>
                          <span className="font-mono-label text-mono-label text-onSurfaceVariant">
                            {formatDate(report.createdAt)}
                          </span>
                        </div>
                        <h3 className="font-body-lg font-medium text-onSurface transition-colors group-hover:text-primary">
                          {report.title}
                        </h3>
                        <p className="font-body-md text-body-md text-onSurfaceVariant">
                          {typeof report.content?.scope === "string" ? report.content.scope : "University-wide"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-12">
                <div className="whisper-lock-glow relative flex flex-col gap-6 border border-ink/10 bg-surface-container-lowest p-8">
                  <div className="absolute -top-3 right-6 flex items-center gap-1 bg-surface px-2 text-primary">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      shield
                    </span>
                    <span className="font-label-caps text-[10px]">Encrypted</span>
                  </div>
                  <h2 className="font-display text-headline-md font-semibold text-onSurface">Accreditation Reporting</h2>
                  <p className="font-body-md text-body-md text-onSurfaceVariant">
                    Compile institutional data for external review. This process
                    securely aggregates anonymized sentiment and compliance
                    metrics across all faculties.
                  </p>
                  <button
                    onClick={generateReport}
                    disabled={generating}
                    className="flex w-full items-center justify-center gap-2 bg-ink px-6 py-4 text-center font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined">summarize</span>
                    {generating ? "Generating…" : "Generate Accreditation Report"}
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="rule-b font-label-caps text-label-caps text-onSurfaceVariant">Quick Actions</h3>
                  <ul className="flex flex-col gap-2">
                    <li>
                      <Link href="/surveys" className="flex items-center justify-between font-body-md text-body-md transition-colors hover:text-primary">
                        Manage Survey Templates <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/insights" className="flex items-center justify-between font-body-md text-body-md transition-colors hover:text-primary">
                        AI Complaint Intelligence <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/reports" className="flex items-center justify-between font-body-md text-body-md transition-colors hover:text-primary">
                        Audit Logs &amp; Reports <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </>
        )
      )}
      </AppShell>
    </RoleGate>
  );
}