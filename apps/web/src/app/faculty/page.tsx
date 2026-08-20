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
import { ErrorBlock, LoadingBlock, SignedOut } from "@/components/ui/States";
import { api, getToken } from "@/lib/api";

interface Me {
  id: string;
  name: string;
  role: string;
  departmentId: string | null;
}

interface Summary {
  averageRating: number;
  responseCount: number;
  pendingInterventions: number;
  breakdown: { key: string; label: string; average: number }[];
  themes: { category: string; count: number }[];
}

interface Snapshot {
  departmentId: string;
  name: string;
  kpiScores: { engagement: number; quality: number; feedbackReceived: number };
  trend: { period: string; score: number }[];
}

interface Overview {
  trend: { date: string; whispers: number; evaluations: number }[];
}

interface Course {
  id: string;
  code: string;
  title: string;
  lecturer: { id: string; name: string } | null;
}

interface CourseAggregate {
  responseCount: number;
  averageRating: number;
}

const TREND_COLORS = { whispers: "#006b2d", evaluations: "#00668a" };

/** Faculty hub — aggregate-only, live, with Recharts visualizations. */
export default function FacultyHubPage() {
  const session = Boolean(getToken());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [courses, setCourses] = useState<(Course & { agg: CourseAggregate })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [sum, who, courseList, ov] = await Promise.all([
          api<Summary>("/evaluations/summary", { token: getToken(), cache: "no-store" }),
          api<Me>("/auth/me", { token: getToken(), cache: "no-store" }),
          api<Course[]>("/courses", { token: getToken(), cache: "no-store" }),
          api<Overview>("/stats/overview", { token: getToken(), cache: "no-store" }),
        ]);
        setSummary(sum);
        setMe(who);
        setOverview(ov);
        if (who.departmentId) {
          setSnapshot(
            await api<Snapshot>(`/departments/${who.departmentId}/snapshot`, {
              token: getToken(),
              cache: "no-store",
            }),
          );
        }
        const withAgg = await Promise.all(
          courseList.map(async (c) => {
            try {
              const agg = await api<CourseAggregate>(`/evaluations/aggregate/${c.id}`, {
                token: getToken(),
                cache: "no-store",
              });
              return { ...c, agg };
            } catch {
              return { ...c, agg: { responseCount: 0, averageRating: 0 } };
            }
          }),
        );
        setCourses(withAgg);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load faculty data");
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

  const sentimentPct = summary ? Math.round((summary.averageRating / 5) * 100) : 0;
  const breakdownData = summary?.breakdown.map((b) => ({ name: b.label, rating: b.average })) ?? [];
  const trendData =
    overview?.trend.map((t) => ({
      date: new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      Whispers: t.whispers,
      Evaluations: t.evaluations,
    })) ?? [];

  return (
    <AppShell>
      <header className="rule-b mb-16 flex items-end justify-between pb-8">
        <div>
          <h1 className="mb-2 font-display text-headline-lg font-semibold text-onSurface">Faculty Overview</h1>
          <p className="font-body-md text-body-md text-onSurfaceVariant">
            Analytical review of department sentiment and course performance metrics.
          </p>
        </div>
        <div className="text-right">
          <span className="mb-1 block font-label-caps text-label-caps text-onSurfaceVariant">Current Term</span>
          <span className="font-mono-label text-mono-label">{me?.name ?? "Faculty"}</span>
        </div>
      </header>

      {loading ? (
        <LoadingBlock label="Loading faculty data…" />
      ) : error ? (
        <ErrorBlock message={error} onRetry={() => window.location.reload()} />
      ) : (
        <div className="grid grid-cols-1 border-l border-t border-ink/10 lg:grid-cols-12">
          {/* Left: benchmarks + charts */}
          <div className="flex flex-col gap-12 border-b border-r border-ink/10 p-8 lg:col-span-5">
            <div>
              <h2 className="mb-8 font-label-caps text-label-caps uppercase tracking-widest text-onSurface">
                Department Benchmarks
              </h2>
              <div className="space-y-12">
                <div>
                  <div className="mb-2 flex items-end justify-between">
                    <span className="font-body-md text-body-md text-onSurfaceVariant">Overall Sentiment Score</span>
                    <span className="font-display text-headline-md font-semibold text-onSurface">
                      {summary ? summary.averageRating.toFixed(1) : "—"}
                      <span className="text-sm text-onSurfaceVariant">/5</span>
                    </span>
                  </div>
                  <div className="h-1 w-full bg-surface-container-high">
                    <div className="h-1 bg-primary" style={{ width: `${sentimentPct}%` }} />
                  </div>
                  <p className="mt-2 font-label-caps text-label-caps text-onSurfaceVariant">
                    {summary ? `${summary.responseCount} anonymous responses` : "—"}
                  </p>
                </div>
                <div>
                  <div className="mb-2 flex items-end justify-between">
                    <span className="font-body-md text-body-md text-onSurfaceVariant">Pending Interventions</span>
                    <span className="font-display text-headline-md font-semibold text-error">
                      {summary?.pendingInterventions ?? "—"}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-surface-container-high">
                    <div className="h-1 bg-tertiary-fixed-dim" style={{ width: `${Math.min(100, (summary?.pendingInterventions ?? 0) * 4)}%` }} />
                  </div>
                  <p className="mt-2 font-label-caps text-label-caps text-onSurfaceVariant">Require administrative review</p>
                </div>
                {snapshot && (
                  <div>
                    <div className="mb-2 flex items-end justify-between">
                      <span className="font-body-md text-body-md text-onSurfaceVariant">Dept Avg ({snapshot.name})</span>
                      <span className="font-display text-headline-md font-semibold text-primary">
                        {snapshot.kpiScores.quality.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-surface-container-high">
                      <div className="h-1 bg-primary/60" style={{ width: `${Math.round((snapshot.kpiScores.quality / 5) * 100)}%` }} />
                    </div>
                    <p className="mt-2 font-label-caps text-label-caps text-onSurfaceVariant">
                      {snapshot.kpiScores.feedbackReceived} whispers · {snapshot.kpiScores.engagement} evaluations
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-6 font-label-caps text-label-caps uppercase tracking-widest text-onSurface">
                Activity Trend — 14 days
              </h2>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                    <defs>
                      <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={TREND_COLORS.whispers} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={TREND_COLORS.whispers} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(17,24,39,0.06)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#3e4a3e" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: "#3e4a3e" }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 0, borderColor: "#e5e7eb", fontSize: 12 }} />
                    <Area type="monotone" dataKey="Whispers" stroke={TREND_COLORS.whispers} fill="url(#wGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h2 className="mb-6 font-label-caps text-label-caps uppercase tracking-widest text-onSurface">
                Rating by Category
              </h2>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdownData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                    <CartesianGrid stroke="rgba(17,24,39,0.06)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#3e4a3e" }} tickLine={false} axisLine={false} interval={0} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "#3e4a3e" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 0, borderColor: "#e5e7eb", fontSize: 12 }} cursor={{ fill: "rgba(0,107,45,0.06)" }} />
                    <Bar dataKey="rating" fill="#006b2d" radius={[2, 2, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right: course list */}
          <div className="border-b border-ink/10 p-8 lg:col-span-7">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-label-caps text-label-caps uppercase tracking-widest text-onSurface">Active Courses</h2>
            </div>

            <div className="grid grid-cols-12 gap-4 border-b-2 border-ink/10 pb-4 font-label-caps text-label-caps uppercase text-onSurfaceVariant">
              <div className="col-span-2">ID</div>
              <div className="col-span-5">Course Title</div>
              <div className="col-span-2 text-right">Responses</div>
              <div className="col-span-3 text-right">Score</div>
            </div>

            {courses.map((course, i) => (
              <div
                key={course.id}
                className="grid grid-cols-12 items-center gap-4 border-b border-ink/5 py-6 transition-colors hover:bg-surface-bright"
              >
                <div className="col-span-2 font-mono-label text-lg font-light text-onSurfaceVariant">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-5">
                  <div className="font-body-md font-medium text-onSurface">{course.title}</div>
                  <div className="mt-1 font-label-caps text-label-caps text-onSurfaceVariant">
                    {course.code} · {course.lecturer?.name ?? "Unassigned"}
                  </div>
                </div>
                <div className="col-span-2 text-right font-mono-label text-mono-label text-onSurface">
                  {course.agg.responseCount}
                </div>
                <div className="col-span-3 text-right">
                  <span
                    className={`inline-block px-2 py-1 font-mono-label text-mono-label ${
                      course.agg.averageRating >= 4
                        ? "bg-primary/10 text-primary"
                        : "bg-tertiary-fixed-dim/20 text-tertiary-container"
                    }`}
                  >
                    {course.agg.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}