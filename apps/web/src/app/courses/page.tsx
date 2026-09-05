"use client";
import { Icon } from "@/components/ui/Icon";

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
import { ROLES } from "@whisperlag/shared";
import { api, getToken } from "@/lib/api";

interface Course {
  id: string;
  code: string;
  title: string;
  semester: string | null;
  credits: number | null;
  syllabus: string[] | null;
  department: { id: string; name: string } | null;
  lecturer: { id: string; name: string } | null;
}

interface Aggregate {
  averageRating: number;
  responseCount: number;
  breakdown: Record<string, number>;
}

function toBarData(b: Record<string, number>, count: number) {
  return Object.entries(b).map(([key, sum]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    rating: count > 0 ? Math.round((sum / count) * 100) / 100 : 0,
  }));
}

/**
 * Course Hub — QA connected to where teaching happens. Each course shows its
 * LMS metadata (semester, credits, syllabus outline) beside its live
 * evaluation aggregates, all from the same registry.
 */
export default function CourseHubPage() {
  const [courses, setCourses] = useState<(Course & { agg: Aggregate | null })[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const cs = await api<Course[]>("/courses", { token: getToken(), cache: "no-store" });
        const withAgg = await Promise.all(
          cs.map(async (c) => {
            try {
              const agg = await api<Aggregate>(`/evaluations/aggregate/${c.id}`, {
                token: getToken(),
                cache: "no-store",
              });
              return { ...c, agg };
            } catch {
              return { ...c, agg: null };
            }
          }),
        );
        setCourses(withAgg);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load courses");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <RoleGate minRole={ROLES.FACULTY}>
      <AppShell>
        <header className="rule-b mb-12 pb-8">
          <h1 className="mb-2 font-display text-headline-lg font-semibold text-onSurface">Course Hub</h1>
          <p className="font-body-md text-body-md text-onSurfaceVariant">
            Each course&apos;s LMS record (semester, credits, syllabus) beside
            its live, anonymous evaluation results — QA connected to where
            teaching happens.
          </p>
        </header>

        {loading ? (
          <LoadingBlock label="Loading courses…" />
        ) : error ? (
          <ErrorBlock message={error} onRetry={() => window.location.reload()} />
        ) : (
          <div className="flex flex-col border-t border-ink/10">
            {(courses ?? []).map((c, i) => (
              <div key={c.id} className="rule-b py-6">
                <button
                  onClick={() => setOpen(open === c.id ? null : c.id)}
                  className="flex w-full items-center gap-4 text-left"
                >
                  <span className="font-display w-10 text-2xl font-light text-onSurfaceVariant/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-headline-md font-semibold text-onSurface">{c.title}</h2>
                      <span className="bg-primary/10 px-2 py-0.5 font-label-caps text-[10px] uppercase tracking-wider text-primary">
                        {c.code}
                      </span>
                    </div>
                    <p className="mt-1 font-mono-label text-mono-label text-onSurfaceVariant">
                      {c.lecturer?.name ?? "Unassigned"} · {c.department?.name ?? "—"} ·{" "}
                      {c.semester ?? "Semester TBA"} · {c.credits ?? 0} credits
                    </p>
                  </div>
                  {c.agg ? (
                    <div className="shrink-0 text-right">
                      <p className="font-display text-headline-md font-semibold text-primary">
                        {c.agg.averageRating.toFixed(1)}
                        <span className="text-sm text-onSurfaceVariant">/5</span>
                      </p>
                      <p className="font-mono-label text-mono-label text-onSurfaceVariant">
                        {c.agg.responseCount} responses
                      </p>
                    </div>
                  ) : (
                    <span className="font-mono-label text-mono-label text-onSurfaceVariant">No ratings yet</span>
                  )}
                  <Icon name={open === c.id ? "expand_less" : "expand_more"} size={24} className="text-onSurfaceVariant" />
                </button>

                {open === c.id && (
                  <div className="ml-14 mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* LMS metadata */}
                    <div>
                      <h3 className="rule-b mb-3 pb-2 font-label-caps text-label-caps uppercase tracking-widest text-onSurfaceVariant">
                        Syllabus · LMS record
                      </h3>
                      {c.syllabus && c.syllabus.length > 0 ? (
                        <ol className="flex flex-col gap-2">
                          {c.syllabus.map((topic, ti) => (
                            <li key={ti} className="flex items-start gap-3">
                              <span className="font-mono-label text-mono-label text-primary">
                                {String(ti + 1).padStart(2, "0")}
                              </span>
                              <span className="font-body-md text-body-md text-onSurface">{topic}</span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="font-body-sm text-body-sm text-onSurfaceVariant">
                          No syllabus imported yet.
                        </p>
                      )}
                    </div>

                    {/* Evaluation breakdown */}
                    <div>
                      <h3 className="rule-b mb-3 pb-2 font-label-caps text-label-caps uppercase tracking-widest text-onSurfaceVariant">
                        Student evaluation (anonymous)
                      </h3>
                      {c.agg && Object.keys(c.agg.breakdown).length > 0 ? (
                        <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={toBarData(c.agg.breakdown, c.agg.responseCount)} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                              <CartesianGrid stroke="rgba(17,24,39,0.06)" vertical={false} />
                              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#565B4A" }} tickLine={false} axisLine={false} />
                              <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "#565B4A" }} tickLine={false} axisLine={false} />
                              <Tooltip contentStyle={{ borderRadius: 0, borderColor: "#e5e7eb", fontSize: 12 }} cursor={{ fill: "rgba(75,141,109,0.06)" }} />
                              <Bar dataKey="rating" fill="#4B8D6D" radius={[2, 2, 0, 0]} maxBarSize={40} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <p className="font-body-sm text-body-sm text-onSurfaceVariant">
                          No evaluations yet — students can rate this course on /evaluate.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AppShell>
    </RoleGate>
  );
}