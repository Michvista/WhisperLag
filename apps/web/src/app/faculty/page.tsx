"use client";

import { useEffect, useState } from "react";
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

const TREND_COLORS = { whispers: "#166534", evaluations: "#1E3A5F" };

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

  return (
    <RoleGate minRole={ROLES.FACULTY}>
      <AppShell>
        <div className="py-6 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border-subtle bg-white p-6 shadow-card">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Faculty Portal {me?.department?.faculty ? `· ${me.department.faculty}` : ""}
              </span>
              <h1 className="mt-1 font-montserrat text-2xl font-bold text-navy sm:text-3xl">
                Faculty Overview
              </h1>
              <p className="mt-1 text-xs text-text-secondary">
                Analytical review of department sentiment and course performance metrics
                {me?.department?.faculty ? ` for ${me.department.faculty}` : ""}.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-soft block">
                Current Term
              </span>
              <span className="font-montserrat text-sm font-bold text-navy">
                {me?.name ?? "Faculty"}
              </span>
              {me?.department && (
                <span className="text-[11px] text-text-secondary block">
                  {me.department.name}
                  {me.department.faculty && me.department.faculty !== me.department.name
                    ? ` · ${me.department.faculty}`
                    : ""}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <LoadingBlock label="Loading faculty data…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => window.location.reload()} />
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  {
                    label: "Sentiment Score",
                    value: summary ? `${summary.averageRating.toFixed(1)}/5` : "—",
                    icon: "star",
                    sub: `${summary?.responseCount ?? 0} responses in ${me?.department?.faculty ?? "faculty"}`,
                  },
                  {
                    label: "Member Departments",
                    value: departments.length,
                    icon: "school",
                    sub: `Departments under ${me?.department?.faculty ?? "faculty"}`,
                  },
                  {
                    label: "Active Courses",
                    value: courses.length,
                    icon: "book",
                    sub: me?.department?.faculty ? `${me.department.faculty} courses` : "Tracked this term",
                  },
                  {
                    label: "Pending Interventions",
                    value: summary?.pendingInterventions ?? "—",
                    icon: "forum",
                    sub: "Faculty whispers requiring review",
                  },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-xl border border-border-subtle bg-white p-5 shadow-card"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name={kpi.icon} size={15} className="text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-soft">
                        {kpi.label}
                      </span>
                    </div>
                    <p className="font-montserrat text-2xl font-bold text-navy">{kpi.value}</p>
                    <p className="mt-1 text-[11px] text-text-secondary">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              {/* Member Departments Under This Faculty Section */}
              {departments.length > 0 && (
                <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-card space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-3">
                    <div>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-primary">
                        Department Structure
                      </span>
                      <h2 className="font-montserrat text-base font-bold text-navy">
                        Departments under {me?.department?.faculty ?? "this Faculty"}
                      </h2>
                      <p className="text-xs text-text-secondary">
                        Official academic departments constituting the Faculty of {me?.department?.faculty ?? "this institution"}.
                      </p>
                    </div>
                    <span className="rounded-full bg-green-tint px-2.5 py-0.5 text-xs font-bold text-primary">
                      {departments.length} {departments.length === 1 ? "Department" : "Departments"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 max-h-[440px] overflow-y-auto pr-1">
                    {departments.map((dept) => {
                      const isSelected = selectedDeptId === dept.id;
                      const courseCount = dept._count?.courses ?? courses.filter((c) => c.department?.id === dept.id).length;
                      const whisperCount = dept._count?.whispers ?? 0;

                      return (
                        <div
                          key={dept.id}
                          className={`rounded-xl border p-4 space-y-3 transition-all ${
                            isSelected
                              ? "border-primary bg-green-tint/30 shadow-xs"
                              : "border-border-subtle bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-montserrat text-sm font-bold text-navy">
                                {dept.name}
                              </h3>

                            </div>
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-border-subtle text-primary">
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
                            {isSelected ? "✓ Viewing Courses (Reset)" : "Filter Courses →"}
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
                <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-card">
                  <h2 className="mb-1 font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                    Activity Trend · 14 Days
                  </h2>
                  <p className="mb-4 text-[11px] text-text-secondary">
                    Whispers submitted {me?.department?.faculty ? `in ${me.department.faculty}` : "over time"}
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
                            borderRadius: 8,
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
                <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-card">
                  <h2 className="mb-1 font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                    Rating by Category
                  </h2>
                  <p className="mb-4 text-[11px] text-text-secondary">Average evaluation score per area</p>
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
                            borderRadius: 8,
                            borderColor: "#e2e8f0",
                            fontSize: 11,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          }}
                          cursor={{ fill: "rgba(22,101,52,0.05)" }}
                        />
                        <Bar dataKey="rating" fill="#166534" radius={[4, 4, 0, 0]} maxBarSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Sentiment bar */}
              {summary && (
                <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                      Overall Sentiment Score {me?.department?.faculty ? `· ${me.department.faculty}` : ""}
                    </h2>
                    <span className="font-montserrat text-xl font-bold text-navy">
                      {summary.averageRating.toFixed(1)}
                      <span className="text-xs font-normal text-text-secondary">/5</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${sentimentPct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-text-secondary">
                    Based on {summary.responseCount} anonymous responses across{" "}
                    {me?.department?.faculty ?? "your faculty"}
                  </p>
                </div>
              )}

              {/* Course Table */}
              {courses.length > 0 && (
                <div className="rounded-xl border border-border-subtle bg-white shadow-card overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border-subtle">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                          Active Courses {me?.department?.faculty ? `(${me.department.faculty})` : ""}
                        </h2>
                        {selectedDeptId !== "ALL" && (
                          <span className="rounded bg-green-tint px-2 py-0.5 text-[10px] font-bold text-primary">
                            Filtered: {departments.find((d) => d.id === selectedDeptId)?.name}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Showing official courses under {me?.department?.faculty ?? "your faculty"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedDeptId !== "ALL" && (
                        <button
                          onClick={() => setSelectedDeptId("ALL")}
                          className="rounded-lg border border-border-subtle px-2.5 py-1 text-[11px] font-semibold text-text-secondary hover:bg-slate-50"
                        >
                          Clear Department Filter
                        </button>
                      )}
                      <span className="rounded-full bg-green-tint px-2.5 py-0.5 text-[10px] font-bold text-primary">
                        {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border-subtle bg-slate-50">
                          <th className="px-6 py-3 text-left font-bold uppercase tracking-wider text-text-soft w-10">
                            #
                          </th>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-text-soft">
                            Course
                          </th>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-text-soft hidden sm:table-cell">
                            Department
                          </th>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-text-soft hidden sm:table-cell">
                            Lecturer
                          </th>
                          <th className="px-4 py-3 text-right font-bold uppercase tracking-wider text-text-soft">
                            Responses
                          </th>
                          <th className="px-6 py-3 text-right font-bold uppercase tracking-wider text-text-soft">
                            Score
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
                              className="border-b border-border-subtle last:border-0 hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-6 py-4 font-mono text-text-soft">
                                {String(i + 1).padStart(2, "0")}
                              </td>
                              <td className="px-4 py-4">
                                <p className="font-semibold text-navy">{course.title}</p>
                                <p className="mt-0.5 text-[10px] text-text-secondary">{course.code}</p>
                              </td>
                              <td className="px-4 py-4 text-text-secondary hidden sm:table-cell">
                                {course.department?.name ?? "—"}
                              </td>
                              <td className="px-4 py-4 text-text-secondary hidden sm:table-cell">
                                {course.lecturer?.name ?? "Unassigned"}
                              </td>
                              <td className="px-4 py-4 text-right text-navy font-semibold">
                                {course.agg.responseCount}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span
                                  className={`inline-block rounded-md px-2 py-0.5 font-bold ${
                                    course.agg.averageRating >= 4
                                      ? "bg-green-tint text-primary"
                                      : course.agg.averageRating >= 2.5
                                      ? "bg-amber-tint text-amber-800"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {course.agg.averageRating.toFixed(1)}
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