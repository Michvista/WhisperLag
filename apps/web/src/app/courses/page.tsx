"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/ui/RoleGate";
import { ErrorBlock, LoadingBlock } from "@/components/ui/States";
import { Icon } from "@/components/ui/Icon";
import { ROLES } from "@whisperlag/shared";
import { api, getToken } from "@/lib/api";
import { AddCourseModal } from "@/components/admin/AddCourseModal";

interface Course {
  id: string;
  code: string;
  title: string;
  semester: string | null;
  credits: number | null;
  syllabus: string[] | null;
  department: { id: string; name: string; faculty?: string | null } | null;
  lecturer: { id: string; name: string } | null;
}

interface Aggregate {
  averageRating: number;
  responseCount: number;
  breakdown: Record<string, number>;
}

interface Me {
  id: string;
  name: string;
  role: string;
  departmentId: string | null;
  department?: { id: string; name: string; faculty: string | null } | null;
}

function toBarData(b: Record<string, number>, count: number) {
  return Object.entries(b).map(([key, sum]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    rating: count > 0 ? Math.round((sum / count) * 100) / 100 : 0,
  }));
}

export default function CourseHubPage() {
  const [courses, setCourses] = useState<(Course & { agg: Aggregate | null })[] | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("ALL");
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);

  async function loadCourses() {
    setLoading(true);
    setError(null);
    try {
      const who = await api<Me>("/auth/me", { token: getToken(), cache: "no-store" });
      setMe(who);

      // If faculty user, default filter to their own faculty if available
      if (who.role === ROLES.FACULTY && who.department?.faculty) {
        setSelectedFaculty(who.department.faculty);
      }

      const cs = await api<Course[]>("/courses", { token: getToken(), cache: "no-store" });

      // Sequential aggregate fetch to preserve connection limits
      const withAgg: (Course & { agg: Aggregate | null })[] = [];
      for (const c of cs) {
        try {
          const agg = await api<Aggregate>(`/evaluations/aggregate/${c.id}`, {
            token: getToken(),
            cache: "no-store",
          });
          withAgg.push({ ...c, agg });
        } catch {
          withAgg.push({ ...c, agg: null });
        }
      }
      setCourses(withAgg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  const facultyList = Array.from(
    new Set(
      (courses ?? [])
        .map((c) => c.department?.faculty)
        .filter((f): f is string => Boolean(f)),
    ),
  ).sort();

  const filteredCourses = (courses ?? []).filter((c) => {
    if (selectedFaculty !== "ALL" && c.department?.faculty !== selectedFaculty) {
      return false;
    }
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.lecturer?.name ?? "").toLowerCase().includes(q) ||
      (c.department?.name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <RoleGate minRole={ROLES.FACULTY}>
      <AppShell>
        <div className="py-6 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border-subtle bg-white p-6 shadow-card">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Academic Catalog &amp; QA
              </span>
              <h1 className="mt-1 font-montserrat text-2xl font-bold text-navy sm:text-3xl">
                Course Hub
              </h1>
              <p className="mt-1 text-xs text-text-secondary">
                Official course syllabus records alongside student anonymous evaluation results.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {me?.role === ROLES.ADMIN && (
                <button
                  onClick={() => setIsAddCourseOpen(true)}
                  className="btn-primary-green px-3.5 py-1.5 text-xs font-semibold"
                >
                  <Icon name="add" size={14} /> + Add Course
                </button>
              )}
              {me?.department && (
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-soft block">
                    Your Affiliation
                  </span>
                  <span className="font-montserrat text-sm font-bold text-navy">
                    {me.department.faculty ? `${me.department.faculty}` : me.department.name}
                  </span>
                  <span className="text-[11px] text-text-secondary block">
                    {me.department.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Faculty Dropdown (Admin only) or Scope Pill (Faculty users) */}
            {me?.role === ROLES.ADMIN ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-text-soft">Filter by Faculty:</span>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-semibold text-navy outline-none focus:border-primary shadow-xs"
                >
                  <option value="ALL">All Faculties ({courses?.length ?? 0})</option>
                  {facultyList.map((fac) => {
                    const count = (courses ?? []).filter((c) => c.department?.faculty === fac).length;
                    return (
                      <option key={fac} value={fac}>
                        {fac} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-soft">Viewing Faculty:</span>
                <span className="rounded-lg bg-green-tint px-3 py-1 text-xs font-bold text-primary border border-primary/20">
                  {me?.department?.faculty ?? me?.department?.name ?? "My Department"}
                </span>
                <span className="text-xs text-text-secondary font-medium">
                  ({filteredCourses.length} course{filteredCourses.length === 1 ? "" : "s"})
                </span>
              </div>
            )}

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-soft">
                <Icon name="search" size={15} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses, codes, lecturers…"
                className="w-full rounded-lg border border-border-subtle bg-white py-1.5 pl-9 pr-3 text-xs text-navy placeholder-text-soft outline-none focus:border-primary shadow-xs"
              />
            </div>
          </div>

          {loading ? (
            <LoadingBlock label="Loading courses and evaluation metrics…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => window.location.reload()} />
          ) : filteredCourses.length === 0 ? (
            <div className="rounded-xl border border-border-subtle bg-white p-12 text-center shadow-card">
              <Icon name="book" size={28} className="mx-auto text-text-soft mb-2" />
              <h3 className="font-montserrat text-sm font-bold text-navy">No courses match your filter</h3>
              <p className="mt-1 text-xs text-text-secondary">
                Try selecting &ldquo;All Faculties&rdquo; or clearing the search box.
              </p>
              <button
                onClick={() => {
                  setSelectedFaculty("ALL");
                  setSearch("");
                }}
                className="mt-4 rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-slate-50"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((c, i) => {
                const isOpen = open === c.id;
                return (
                  <div
                    key={c.id}
                    className="rounded-xl border border-border-subtle bg-white p-5 shadow-card transition-all hover:border-slate-300"
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : c.id)}
                      className="flex w-full items-center gap-4 text-left"
                    >
                      <span className="font-mono text-sm font-bold text-slate-400 w-8">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-montserrat text-sm font-bold text-navy">{c.title}</h2>
                          <span className="rounded bg-green-tint px-2 py-0.5 text-[10.5px] font-bold text-primary">
                            {c.code}
                          </span>
                          {c.department?.faculty && (
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10.5px] font-medium text-slate-600">
                              {c.department.faculty}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-text-secondary">
                          {c.lecturer?.name ?? "Unassigned Lecturer"} · {c.department?.name ?? "Department"} ·{" "}
                          {c.semester ?? "2025/2026"} · {c.credits ?? 3} credits
                        </p>
                      </div>

                      {c.agg && c.agg.responseCount > 0 ? (
                        <div className="shrink-0 text-right">
                          <p className="font-montserrat text-lg font-bold text-primary">
                            {c.agg.averageRating.toFixed(1)}
                            <span className="text-xs font-normal text-text-secondary">/5</span>
                          </p>
                          <p className="text-[11px] text-text-secondary font-medium">
                            {c.agg.responseCount} {c.agg.responseCount === 1 ? "response" : "responses"}
                          </p>
                        </div>
                      ) : (
                        <span className="shrink-0 rounded-md bg-slate-50 border border-border-subtle px-2.5 py-1 text-[10.5px] text-text-soft">
                          No evaluations yet
                        </span>
                      )}
                      <Icon
                        name={isOpen ? "expand_less" : "expand_more"}
                        size={20}
                        className="text-text-soft"
                      />
                    </button>

                    {isOpen && (
                      <div className="mt-6 pt-5 border-t border-border-subtle grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* LMS metadata */}
                        <div>
                          <h3 className="mb-3 font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                            Syllabus Outline (LMS Record)
                          </h3>
                          {c.syllabus && c.syllabus.length > 0 ? (
                            <ol className="flex flex-col gap-2">
                              {c.syllabus.map((topic, ti) => (
                                <li key={ti} className="flex items-start gap-2 text-xs">
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-tint text-[10px] font-bold text-primary">
                                    {ti + 1}
                                  </span>
                                  <span className="text-navy leading-5">{topic}</span>
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <p className="text-xs text-text-secondary">
                              No syllabus modules imported for this course.
                            </p>
                          )}
                        </div>

                        {/* Evaluation breakdown */}
                        <div>
                          <h3 className="mb-3 font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                            Anonymous Evaluation Breakdown
                          </h3>
                          {c.agg && Object.keys(c.agg.breakdown).length > 0 ? (
                            <div className="h-44 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={toBarData(c.agg.breakdown, c.agg.responseCount)}
                                  margin={{ top: 4, right: 4, bottom: 0, left: -28 }}
                                >
                                  <CartesianGrid stroke="rgba(17,24,39,0.06)" vertical={false} />
                                  <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fill: "#64748b" }}
                                    tickLine={false}
                                    axisLine={false}
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
                                    }}
                                  />
                                  <Bar dataKey="rating" fill="#166534" radius={[4, 4, 0, 0]} maxBarSize={36} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <p className="text-xs text-text-secondary">
                              No student evaluations recorded yet. Students can rate this course anonymously.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <AddCourseModal
          isOpen={isAddCourseOpen}
          onClose={() => setIsAddCourseOpen(false)}
          defaultFaculty={selectedFaculty !== "ALL" ? selectedFaculty : undefined}
          onSuccess={() => void loadCourses()}
        />
      </AppShell>
    </RoleGate>
  );
}