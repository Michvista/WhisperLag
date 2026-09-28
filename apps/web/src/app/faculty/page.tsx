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
  BarChart,
  Bar,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/ui/RoleGate";
import { ROLES } from "@whisperlag/shared";
import { ErrorBlock, LoadingBlock } from "@/components/ui/States";
import { Icon } from "@/components/ui/Icon";
import { api, getToken } from "@/lib/api";

interface Me {
  id: string;
  name: string;
  role: string;
  departmentId: string | null;
  department?: {
    id: string;
    name: string;
    faculty: string | null;
  } | null;
}

interface Summary {
  averageRating: number;
  responseCount: number;
  pendingInterventions: number;
  breakdown: { key: string; label: string; average: number }[];
  themes: { category: string; count: number }[];
}

interface Overview {
  trend: { date: string; whispers: number; evaluations: number }[];
}

interface Course {
  id: string;
  code: string;
  title: string;
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
    faculty?: string | null;
  } | null;
  lecturer: { id: string; name: string } | null;
}

interface CourseAggregate {
  responseCount: number;
  averageRating: number;
}

interface DepartmentItem {
  id: string;
  name: string;
  faculty: string | null;
  _count?: {
    courses: number;
    whispers: number;
    evaluations: number;
  };
}

const TREND_COLORS = { whispers: "#009A44", evaluations: "#10253A" };

function getInitials(name: string): string {
  if (!name) return "FP";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function FacultyHubPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [courses, setCourses] = useState<(Course & { agg: CourseAggregate })[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Sequential awaits — prevents Neon connection pool exhaustion
        const who = await api<Me>("/auth/me", { token: getToken(), cache: "no-store" });
        setMe(who);

        const facultyParam = who.department?.faculty
          ? `?faculty=${encodeURIComponent(who.department.faculty)}`
          : who.departmentId
          ? `?departmentId=${who.departmentId}`
          : "";

        const sum = await api<Summary>(`/evaluations/summary${facultyParam}`, {
          token: getToken(),
          cache: "no-store",
        });
        const courseList = await api<Course[]>(`/courses${facultyParam}`, {
          token: getToken(),
          cache: "no-store",
        });
        const ov = await api<Overview>(`/stats/overview${facultyParam}`, {
          token: getToken(),
          cache: "no-store",
        });
        const deptList = await api<DepartmentItem[]>(`/departments${facultyParam}`, {
          token: getToken(),
          cache: "no-store",
        });

        setSummary(sum);
        setOverview(ov);
        setDepartments(deptList);

        // Scope courses strictly to the logged-in faculty/department or courses lectured by them
        const relevantCourses = courseList.filter((c) => {
          if (who.department?.faculty && c.department?.faculty) {
            return c.department.faculty.toLowerCase() === who.department.faculty.toLowerCase();
          }
          if (who.departmentId && c.department?.id) {
            return c.department.id === who.departmentId;
          }
          if (c.lecturer?.id && c.lecturer.id === who.id) {
            return true;
          }
          return false;
        });

        const displayCourses = relevantCourses.length > 0 ? relevantCourses : courseList;

        // Fetch course aggregates one at a time to stay within pool limits
        const withAgg: (Course & { agg: CourseAggregate })[] = [];
        for (const c of displayCourses) {
          try {
            const agg = await api<CourseAggregate>(`/evaluations/aggregate/${c.id}`, {
              token: getToken(),
              cache: "no-store",
            });
            withAgg.push({ ...c, agg });
          } catch {
            withAgg.push({ ...c, agg: { responseCount: 0, averageRating: 0 } });
          }
        }
        setCourses(withAgg);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load faculty data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sentimentPct = summary ? Math.round((summary.averageRating / 5) * 100) : 0;

  const breakdownData =
    summary?.breakdown.map((b) => ({ name: b.label, rating: Number(b.average.toFixed(1)) })) ?? [];

  const trendData =
    overview?.trend.map((t) => ({
      date: new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      Whispers: t.whispers,
      Evaluations: t.evaluations,
    })) ?? [];

  const filteredCourses = courses.filter((c) => {
    if (selectedDeptId === "ALL") return true;
    return c.department?.id === selectedDeptId || c.departmentId === selectedDeptId;
  });

  const facultyName = me?.department?.faculty ?? me?.department?.name ?? "Faculty Hub";

  return (
    <RoleGate minRole={ROLES.FACULTY}>
      <AppShell>
        <div className="py-6 px-4 md:px-8 max-w-6xl mx-auto space-y-7">
          {/* Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-white p-6 shadow-card">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Faculty Portal
                </span>
                <span className="rounded-full bg-green-tint px-2.5 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
                  {facultyName}
                </span>
              </div>
              <h1 className="font-montserrat text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
                Faculty Overview
              </h1>
              <p className="text-xs text-text-secondary">
                Real-time quality assurance, student sentiment, and course evaluations for {facultyName}.
              </p>
            </div>

            <div className="flex items-center gap-3.5 border-t border-border-subtle pt-3 sm:border-t-0 sm:pt-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-tint font-montserrat text-sm font-extrabold text-primary shadow-xs">
                {getInitials(me?.name ?? "Faculty")}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-text-soft">
                  Logged In As
                </div>
                <div className="font-montserrat text-sm font-bold text-navy">
                  {me?.name ?? "Faculty Lead"}
                </div>
                <div className="text-[11px] text-text-secondary">
                  {me?.department?.name ?? "Department"}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingBlock label="Loading faculty data…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => window.location.reload()} />
          ) : (
            <>
              {/* Modern KPI Cards Grid (Designer-inspired soft icon badges) */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {/* Sentiment Score */}
                <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-card transition-all hover:border-slate-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-soft">
                      Sentiment Score
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF7F0] text-[#009A44]">
                      <Icon name="star" size={18} className="text-[#009A44]" />
                    </div>
                  </div>
                  <div className="font-montserrat text-2xl font-extrabold text-navy">
                    {summary ? `${summary.averageRating.toFixed(1)}/5` : "—"}
                  </div>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    {summary?.responseCount ?? 0} student ratings in {facultyName}
                  </p>
                </div>

                {/* Member Departments */}
                <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-card transition-all hover:border-slate-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-soft">
                      Departments
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF3FF] text-[#3775D6]">
                      <Icon name="school" size={18} className="text-[#3775D6]" />
                    </div>
                  </div>
                  <div className="font-montserrat text-2xl font-extrabold text-navy">
                    {departments.length}
                  </div>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    Official academic departments
                  </p>
                </div>

                {/* Active Courses */}
                <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-card transition-all hover:border-slate-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-soft">
                      Active Courses
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2EDFF] text-[#7138D5]">
                      <Icon name="book" size={18} className="text-[#7138D5]" />
                    </div>
                  </div>
                  <div className="font-montserrat text-2xl font-extrabold text-navy">
                    {courses.length}
                  </div>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    Tracked under {facultyName}
                  </p>
                </div>

                {/* Pending Interventions */}
                <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-card transition-all hover:border-slate-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-soft">
                      Whispers
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF3E5] text-[#E88917]">
                      <Icon name="forum" size={18} className="text-[#E88917]" />
                    </div>
                  </div>
                  <div className="font-montserrat text-2xl font-extrabold text-amber-800">
                    {summary?.pendingInterventions ?? 0}
                  </div>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    Requires departmental review
                  </p>
                </div>
              </div>

              {/* Quick Actions Navigation Row (Modular Cards inspired by designer mockup) */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  href="/whispers"
                  className="flex items-center gap-3.5 rounded-2xl border border-border-subtle bg-white p-4 shadow-xs transition-all hover:border-primary hover:shadow-card group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF3E5] text-[#E88917] group-hover:scale-105 transition-transform">
                    <Icon name="chat" size={20} className="text-[#E88917]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-montserrat text-sm font-bold text-navy group-hover:text-primary transition-colors truncate">
                      Faculty Whispers
                    </div>
                    <div className="text-[11px] text-text-secondary truncate mt-0.5">
                      Review feedback for {facultyName}
                    </div>
                  </div>
                  <span className="text-text-soft group-hover:text-primary transition-colors text-base font-bold">
                    ›
                  </span>
                </Link>

                <Link
                  href="/courses"
                  className="flex items-center gap-3.5 rounded-2xl border border-border-subtle bg-white p-4 shadow-xs transition-all hover:border-primary hover:shadow-card group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F2EDFF] text-[#7138D5] group-hover:scale-105 transition-transform">
                    <Icon name="book" size={20} className="text-[#7138D5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-montserrat text-sm font-bold text-navy group-hover:text-primary transition-colors truncate">
                      Course Registry
                    </div>
                    <div className="text-[11px] text-text-secondary truncate mt-0.5">
                      Syllabus &amp; student ratings
                    </div>
                  </div>
                  <span className="text-text-soft group-hover:text-primary transition-colors text-base font-bold">
                    ›
                  </span>
                </Link>

                <Link
                  href="/reports"
                  className="flex items-center gap-3.5 rounded-2xl border border-border-subtle bg-white p-4 shadow-xs transition-all hover:border-primary hover:shadow-card group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF3FF] text-[#3775D6] group-hover:scale-105 transition-transform">
                    <Icon name="description" size={20} className="text-[#3775D6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-montserrat text-sm font-bold text-navy group-hover:text-primary transition-colors truncate">
                      QA Reports
                    </div>
                    <div className="text-[11px] text-text-secondary truncate mt-0.5">
                      Accreditation dossiers &amp; logs
                    </div>
                  </div>
                  <span className="text-text-soft group-hover:text-primary transition-colors text-base font-bold">
                    ›
                  </span>
                </Link>

                <Link
                  href="/collaboration"
                  className="flex items-center gap-3.5 rounded-2xl border border-border-subtle bg-white p-4 shadow-xs transition-all hover:border-primary hover:shadow-card group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF7F0] text-[#009A44] group-hover:scale-105 transition-transform">
                    <Icon name="forum" size={20} className="text-[#009A44]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-montserrat text-sm font-bold text-navy group-hover:text-primary transition-colors truncate">
                      Collaboration
                    </div>
                    <div className="text-[11px] text-text-secondary truncate mt-0.5">
                      Message HODs &amp; QA officers
                    </div>
                  </div>
                  <span className="text-text-soft group-hover:text-primary transition-colors text-base font-bold">
                    ›
                  </span>
                </Link>
              </div>

              {/* Member Departments Under This Faculty Section */}
              {departments.length > 0 && (
                <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-card space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-3.5">
                    <div>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-primary">
                        Department Structure
                      </span>
                      <h2 className="font-montserrat text-base font-bold text-navy">
                        Departments under {facultyName}
                      </h2>
                      <p className="text-xs text-text-secondary">
                        Select a department to filter the course evaluation table below.
                      </p>
                    </div>
                    <span className="rounded-full bg-green-tint px-3 py-1 text-xs font-bold text-primary border border-primary/20">
                      {departments.length} {departments.length === 1 ? "Department" : "Departments"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
                    {departments.map((dept) => {
                      const isSelected = selectedDeptId === dept.id;
                      const courseCount =
                        dept._count?.courses ?? courses.filter((c) => c.department?.id === dept.id).length;
                      const whisperCount = dept._count?.whispers ?? 0;

                      return (
                        <div
                          key={dept.id}
                          className={`rounded-xl border p-4 space-y-3 transition-all ${
                            isSelected
                              ? "border-primary bg-green-tint/30 shadow-xs ring-1 ring-primary/30"
                              : "border-border-subtle bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-montserrat text-sm font-bold text-navy">
                                {dept.name}
                              </h3>
                              <p className="text-[11px] text-text-secondary">
                                {facultyName}
                              </p>
                            </div>
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-border-subtle text-primary shadow-xs">
                              <Icon name="school" size={16} />
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs border-t border-border-subtle pt-2.5">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-text-soft block">
                                Courses
                              </span>
                              <span className="font-montserrat font-bold text-navy text-sm">
                                {courseCount}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-text-soft block">
                                Whispers
                              </span>
                              <span className="font-montserrat font-bold text-navy text-sm">
                                {whisperCount}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedDeptId(isSelected ? "ALL" : dept.id)}
                            className={`w-full rounded-lg py-1.5 text-xs font-semibold transition-colors text-center ${
                              isSelected
                                ? "bg-primary text-white"
                                : "border border-border-subtle bg-white text-navy hover:bg-slate-100"
                            }`}
                          >
                            {isSelected ? "✓ Active Filter (Reset)" : "Filter Courses →"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Charts Row */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Activity Trend */}
                <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-card">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                      Activity Trend · 14 Days
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-text-secondary">
                      Feedback Volume
                    </span>
                  </div>
                  <p className="mb-4 text-[11px] text-text-secondary">
                    Whispers submitted concerning {facultyName}
                  </p>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                        <defs>
                          <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={TREND_COLORS.whispers} stopOpacity={0.25} />
                            <stop offset="100%" stopColor={TREND_COLORS.whispers} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(17,24,39,0.06)" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          tickLine={false}
                          axisLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 10,
                            borderColor: "#e2e8f0",
                            fontSize: 11,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="Whispers"
                          stroke={TREND_COLORS.whispers}
                          fill="url(#wGrad)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Rating by Category */}
                <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-card">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                      Rating by Category
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-text-secondary">
                      Rubric Scores
                    </span>
                  </div>
                  <p className="mb-4 text-[11px] text-text-secondary">
                    Average student evaluation score across criteria
                  </p>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={breakdownData}
                        margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
                      >
                        <CartesianGrid stroke="rgba(17,24,39,0.06)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 9, fill: "#64748b" }}
                          tickLine={false}
                          axisLine={false}
                          interval={0}
                        />
                        <YAxis
                          domain={[0, 5]}
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 10,
                            borderColor: "#e2e8f0",
                            fontSize: 11,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          }}
                          cursor={{ fill: "rgba(0,154,68,0.05)" }}
                        />
                        <Bar dataKey="rating" fill="#009A44" radius={[6, 6, 0, 0]} maxBarSize={44} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Sentiment Progress Card */}
              {summary && (
                <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                        Overall Faculty Sentiment
                      </h2>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Aggregated from {summary.responseCount} anonymous student evaluations across {facultyName}
                      </p>
                    </div>
                    <span className="font-montserrat text-2xl font-extrabold text-navy">
                      {summary.averageRating.toFixed(1)}
                      <span className="text-xs font-normal text-text-secondary">/5</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${sentimentPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Course Registry Table */}
              {courses.length > 0 && (
                <div className="rounded-2xl border border-border-subtle bg-white shadow-card overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border-subtle bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                          Active Courses ({facultyName})
                        </h2>
                        {selectedDeptId !== "ALL" && (
                          <span className="rounded-full bg-green-tint px-2.5 py-0.5 text-[10.5px] font-bold text-primary border border-primary/20">
                            Department: {departments.find((d) => d.id === selectedDeptId)?.name}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Showing courses under {facultyName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedDeptId !== "ALL" && (
                        <button
                          onClick={() => setSelectedDeptId("ALL")}
                          className="rounded-lg border border-border-subtle bg-white px-2.5 py-1 text-[11px] font-semibold text-text-secondary hover:bg-slate-50"
                        >
                          Clear Department Filter
                        </button>
                      )}
                      <span className="rounded-full bg-green-tint px-2.5 py-0.5 text-[10px] font-bold text-primary">
                        {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 z-10 bg-slate-50 shadow-xs">
                        <tr className="border-b border-border-subtle bg-slate-50">
                          <th className="px-6 py-3 text-left font-bold uppercase tracking-wider text-text-soft w-10 bg-slate-50">
                            #
                          </th>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-text-soft bg-slate-50">
                            Course
                          </th>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-text-soft hidden sm:table-cell bg-slate-50">
                            Department
                          </th>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-text-soft hidden sm:table-cell bg-slate-50">
                            Lecturer
                          </th>
                          <th className="px-4 py-3 text-right font-bold uppercase tracking-wider text-text-soft bg-slate-50">
                            Responses
                          </th>
                          <th className="px-6 py-3 text-right font-bold uppercase tracking-wider text-text-soft bg-slate-50">
                            Rating
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCourses.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-text-secondary">
                              No courses found for this department.
                            </td>
                          </tr>
                        ) : (
                          filteredCourses.map((course, i) => (
                            <tr
                              key={course.id}
                              className="border-b border-border-subtle last:border-0 hover:bg-slate-50/80 transition-colors"
                            >
                              <td className="px-6 py-4 font-mono text-text-soft">
                                {String(i + 1).padStart(2, "0")}
                              </td>
                              <td className="px-4 py-4">
                                <p className="font-semibold text-navy">{course.title}</p>
                                <span className="inline-block rounded bg-green-tint px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary mt-0.5">
                                  {course.code}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-text-secondary hidden sm:table-cell font-medium">
                                {course.department?.name ?? "—"}
                              </td>
                              <td className="px-4 py-4 text-text-secondary hidden sm:table-cell">
                                {course.lecturer?.name ?? "Unassigned"}
                              </td>
                              <td className="px-4 py-4 text-right text-navy font-semibold font-mono">
                                {course.agg.responseCount}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span
                                  className={`inline-block rounded-md px-2 py-0.5 font-bold font-mono ${
                                    course.agg.averageRating >= 4
                                      ? "bg-green-tint text-primary"
                                      : course.agg.averageRating >= 2.5
                                      ? "bg-amber-tint text-amber-800"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {course.agg.averageRating.toFixed(1)} / 5
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </AppShell>
    </RoleGate>
  );
}