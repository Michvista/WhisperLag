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
import { Icon } from "@/components/ui/Icon";
import { AddCourseModal } from "@/components/admin/AddCourseModal";

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

interface Course {
  id: string;
  code: string;
  title: string;
  semester: string | null;
  credits: number | null;
  department: { id: string; name: string; faculty?: string | null } | null;
  lecturer: { id: string; name: string } | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const FACULTY_LIST = [
  "Clinical Sciences",
  "Health Professions",
  "Computing & Informatics",
  "Engineering",
  "Management Sciences",
  "Social Sciences",
  "Law",
  "Pharmacy",
  "Science",
];

export default function AdminCommandCenterPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [reports, setReports] = useState<Report[] | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Add course modal state
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [targetFaculty, setTargetFaculty] = useState<string | undefined>(undefined);
  const [facultyFilter, setFacultyFilter] = useState<string>("ALL");
  const [courseSearch, setCourseSearch] = useState<string>("");

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      // Sequential awaits to preserve connection limits
      const ov = await api<Overview>("/stats/overview", { token: getToken(), cache: "no-store" });
      const rep = await api<Report[]>("/reports", { token: getToken(), cache: "no-store" });
      const cs = await api<Course[]>("/courses", { token: getToken(), cache: "no-store" });

      setOverview(ov);
      setReports(rep);
      setCourses(cs);
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
      const stamp = new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      await api("/reports/generate", {
        method: "POST",
        body: JSON.stringify({ title: `Accreditation Report: ${stamp}`, type: "ACCREDITATION" }),
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

  function handleOpenAddCourse(fac?: string) {
    setTargetFaculty(fac);
    setIsAddCourseOpen(true);
  }

  // Filter courses for registry table
  const filteredCourses = courses.filter((c) => {
    if (facultyFilter !== "ALL" && c.department?.faculty !== facultyFilter) {
      return false;
    }
    if (!courseSearch.trim()) return true;
    const q = courseSearch.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.lecturer?.name ?? "").toLowerCase().includes(q) ||
      (c.department?.name ?? "").toLowerCase().includes(q) ||
      (c.department?.faculty ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <RoleGate minRole={ROLES.ADMIN}>
      <AppShell>
        <div className="py-6 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                UNILAG Command Center
              </span>
              <h1 className="mt-1 font-montserrat text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Institutional Overview
              </h1>
              <p className="mt-1 text-xs text-text-secondary">
                Real-time monitoring of campus sentiment, student whispers, and faculty curriculum.
              </p>
            </div>
            <button
              onClick={() => handleOpenAddCourse()}
              className="btn-primary-green px-4 py-2 text-xs font-semibold"
            >
              <Icon name="add" size={15} /> + Add Course to Faculty
            </button>
          </div>

          {notice && (
            <div className="rounded-lg border border-green-tint bg-green-tint p-4 text-xs font-semibold text-primary">
              ✓ {notice}
            </div>
          )}

          {loading ? (
            <LoadingBlock label="Loading live metrics…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={loadAll} />
          ) : (
            overview && (
              <>
                {/* Metric Summary Cards */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-soft">
                      Total Whispers
                    </span>
                    <div className="mt-2 font-montserrat text-3xl font-bold text-navy">
                      {overview.totalWhispers.toLocaleString()}
                    </div>
                    <span className="mt-1 block text-xs font-semibold text-primary">
                      {overview.pendingInterventions} awaiting review
                    </span>
                  </div>

                  <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-soft">
                      Active Courses
                    </span>
                    <div className="mt-2 font-montserrat text-3xl font-bold text-navy">
                      {courses.length}
                    </div>
                    <span className="mt-1 block text-xs font-semibold text-text-secondary">
                      Across {FACULTY_LIST.length} faculties
                    </span>
                  </div>

                  <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-soft">
                      Pending Interventions
                    </span>
                    <div className="mt-2 font-montserrat text-3xl font-bold text-amber-800">
                      {overview.pendingInterventions}
                    </div>
                    <span className="mt-1 block text-xs font-semibold text-amber-800">
                      Requires departmental review
                    </span>
                  </div>

                  <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-soft">
                      Resolution Rate
                    </span>
                    <div className="mt-2 font-montserrat text-3xl font-bold text-navy">
                      {overview.resolutionRate}%
                    </div>
                    <span className="mt-1 block text-xs font-semibold text-text-secondary">
                      {overview.totalEvaluations} evaluations
                    </span>
                  </div>
                </section>

                {/* Trend & Resolution Charts */}
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card lg:col-span-8">
                    <h2 className="mb-4 font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                      Whisper &amp; Evaluation Activity (14 Days)
                    </h2>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={overview.trend.map((t) => ({
                            date: new Date(t.date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            }),
                            Whispers: t.whispers,
                            Evaluations: t.evaluations,
                          }))}
                          margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
                        >
                          <defs>
                            <linearGradient id="adminWhisper" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#166534" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#166534" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="adminEval" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#1E3A5F" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#1E3A5F" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#f1f5f9" vertical={false} />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 12 }} />
                          <Area
                            type="monotone"
                            dataKey="Whispers"
                            stroke="#166534"
                            fill="url(#adminWhisper)"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="Evaluations"
                            stroke="#1E3A5F"
                            fill="url(#adminEval)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card lg:col-span-4">
                    <h2 className="mb-4 font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                      Resolution Rate
                    </h2>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Resolved", value: overview.resolutionRate },
                              { name: "Remaining", value: Math.max(0, 100 - overview.resolutionRate) },
                            ]}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={45}
                            outerRadius={68}
                            paddingAngle={2}
                            strokeWidth={0}
                          >
                            <Cell fill="#166534" />
                            <Cell fill="#e2e8f0" />
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-5 text-xs text-text-secondary">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary" /> Resolved{" "}
                        {overview.resolutionRate}%
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-slate-200" /> Open{" "}
                        {100 - overview.resolutionRate}%
                      </span>
                    </div>
                  </div>
                </section>

                {/* Faculty Course Registry & Management Section */}
                <section className="rounded-xl border border-border-subtle bg-white p-6 shadow-card space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        Academic Structure
                      </span>
                      <h2 className="font-montserrat text-lg font-bold text-navy">
                        Faculty Course Registry
                      </h2>
                      <p className="text-xs text-text-secondary">
                        Manage and add courses assigned to each UNILAG faculty and department.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenAddCourse()}
                      className="btn-primary-green px-3.5 py-1.5 text-xs font-semibold"
                    >
                      <Icon name="add" size={14} /> Add New Course
                    </button>
                  </div>

                  {/* Faculty Quick Count Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    <button
                      onClick={() => setFacultyFilter("ALL")}
                      className={`rounded-lg border p-2.5 text-left transition-all ${
                        facultyFilter === "ALL"
                          ? "border-primary bg-green-tint text-primary font-bold shadow-xs"
                          : "border-border-subtle bg-slate-50/70 hover:bg-slate-100 text-navy"
                      }`}
                    >
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-text-soft">
                        All Faculties
                      </span>
                      <span className="font-montserrat text-lg font-bold text-navy">
                        {courses.length}
                      </span>
                    </button>
                    {FACULTY_LIST.map((fac) => {
                      const count = courses.filter((c) => c.department?.faculty === fac).length;
                      const isSelected = facultyFilter === fac;
                      return (
                        <div
                          key={fac}
                          className={`group relative rounded-lg border p-2.5 text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-green-tint text-primary font-bold shadow-xs"
                              : "border-border-subtle bg-slate-50/70 hover:bg-slate-100 text-navy"
                          }`}
                          onClick={() => setFacultyFilter(fac)}
                        >
                          <div className="flex items-start justify-between">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-text-soft truncate max-w-[110px]" title={fac}>
                              {fac}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAddCourse(fac);
                              }}
                              title={`Add course to ${fac}`}
                              className="text-text-soft hover:text-primary transition-colors text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-montserrat text-lg font-bold text-navy">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-soft">Viewing:</span>
                      <select
                        value={facultyFilter}
                        onChange={(e) => setFacultyFilter(e.target.value)}
                        className="rounded-lg border border-border-subtle bg-white px-2.5 py-1.5 text-xs font-semibold text-navy outline-none focus:border-primary shadow-xs"
                      >
                        <option value="ALL">All Faculties ({courses.length})</option>
                        {FACULTY_LIST.map((f) => (
                          <option key={f} value={f}>
                            {f} ({courses.filter((c) => c.department?.faculty === f).length})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-soft">
                        <Icon name="search" size={14} />
                      </span>
                      <input
                        type="text"
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        placeholder="Search courses, codes, lecturers…"
                        className="w-full rounded-lg border border-border-subtle bg-white py-1.5 pl-8 pr-3 text-xs text-navy placeholder-text-soft outline-none focus:border-primary shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Course Table */}
                  <div className="overflow-x-auto rounded-lg border border-border-subtle">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border-subtle bg-slate-50">
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-text-soft">
                            Code
                          </th>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-text-soft">
                            Title
                          </th>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-text-soft">
                            Faculty
                          </th>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-text-soft">
                            Department
                          </th>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-text-soft">
                            Lecturer
                          </th>
                          <th className="px-4 py-3 text-right font-bold uppercase tracking-wider text-text-soft">
                            Credits
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCourses.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-text-secondary">
                              No courses found in this category.{" "}
                              <button
                                onClick={() => handleOpenAddCourse(facultyFilter !== "ALL" ? facultyFilter : undefined)}
                                className="text-primary font-bold hover:underline ml-1"
                              >
                                + Add a course now
                              </button>
                            </td>
                          </tr>
                        ) : (
                          filteredCourses.map((c) => (
                            <tr
                              key={c.id}
                              className="border-b border-border-subtle last:border-0 hover:bg-slate-50/70 transition-colors"
                            >
                              <td className="px-4 py-3 font-mono font-bold text-navy">
                                <span className="rounded bg-green-tint px-2 py-0.5 text-[11px] text-primary">
                                  {c.code}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-navy">
                                {c.title}
                              </td>
                              <td className="px-4 py-3 text-text-secondary font-medium">
                                {c.department?.faculty ?? "—"}
                              </td>
                              <td className="px-4 py-3 text-text-secondary">
                                {c.department?.name ?? "—"}
                              </td>
                              <td className="px-4 py-3 text-text-secondary">
                                {c.lecturer?.name ?? "Unassigned"}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-navy">
                                {c.credits ?? 3} units
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Reports & Actions */}
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* Recent Reports (7 cols) */}
                  <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card lg:col-span-7">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                      <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                        Recent Reports
                      </h2>
                      <Link href="/reports" className="text-xs font-semibold text-secondary hover:underline">
                        View all →
                      </Link>
                    </div>

                    <div className="mt-3 divide-y divide-border-subtle">
                      {(reports ?? []).slice(0, 4).map((report) => (
                        <div key={report.id} className="py-3 flex items-start justify-between gap-3">
                          <div>
                            <span className="rounded bg-green-tint px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                              {report.type}
                            </span>
                            <h3 className="mt-1 text-xs font-bold text-navy">
                              {report.title}
                            </h3>
                            <p className="text-[11px] text-text-secondary">
                              {typeof report.content?.scope === "string"
                                ? report.content.scope
                                : "University-wide"}
                            </p>
                          </div>
                          <span className="text-[11px] text-text-soft shrink-0">
                            {formatDate(report.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions (5 cols) */}
                  <div className="space-y-4 lg:col-span-5">
                    <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card space-y-3">
                      <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                        Accreditation Export
                      </h2>
                      <p className="text-xs leading-relaxed text-text-secondary">
                        Securely compile institutional accreditation reports aggregating sentiment across faculties.
                      </p>
                      <button
                        onClick={generateReport}
                        disabled={generating}
                        className="btn-primary-green w-full py-2.5 text-xs font-semibold disabled:opacity-50"
                      >
                        <Icon name="summarize" size={16} />
                        {generating ? "Generating…" : "Generate Accreditation Report"}
                      </button>
                    </div>

                    <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card space-y-2.5">
                      <h3 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                        Quick Links
                      </h3>
                      <ul className="divide-y divide-border-subtle text-xs">
                        <li className="py-2">
                          <button
                            onClick={() => handleOpenAddCourse()}
                            className="flex w-full items-center justify-between text-navy hover:text-primary text-left"
                          >
                            <span className="font-semibold text-primary">+ Register Course to Faculty</span>
                            <Icon name="add" size={14} className="text-primary" />
                          </button>
                        </li>
                        <li className="py-2">
                          <Link href="/admin/faculties" className="flex items-center justify-between text-navy hover:text-primary">
                            <span className="font-semibold text-navy">Manage Faculties &amp; Heads</span>
                            <Icon name="arrow_forward" size={14} />
                          </Link>
                        </li>
                        <li className="py-2">
                          <Link href="/courses" className="flex items-center justify-between text-navy hover:text-primary">
                            <span>Browse Course Hub</span>
                            <Icon name="arrow_forward" size={14} />
                          </Link>
                        </li>
                        <li className="py-2">
                          <Link href="/integrations" className="flex items-center justify-between text-navy hover:text-primary">
                            <span>SIS / LMS Bulk Import</span>
                            <Icon name="arrow_forward" size={14} />
                          </Link>
                        </li>
                        <li className="py-2">
                          <Link href="/surveys" className="flex items-center justify-between text-navy hover:text-primary">
                            <span>Manage Survey Templates</span>
                            <Icon name="arrow_forward" size={14} />
                          </Link>
                        </li>
                        <li className="py-2">
                          <Link href="/reports" className="flex items-center justify-between text-navy hover:text-primary">
                            <span>Audit Logs &amp; Reports</span>
                            <Icon name="arrow_forward" size={14} />
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>
              </>
            )
          )}
        </div>

        {/* Modal for adding course */}
        <AddCourseModal
          isOpen={isAddCourseOpen}
          onClose={() => setIsAddCourseOpen(false)}
          defaultFaculty={targetFaculty}
          onSuccess={() => void loadAll()}
        />
      </AppShell>
    </RoleGate>
  );
}