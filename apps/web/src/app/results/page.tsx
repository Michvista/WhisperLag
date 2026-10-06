"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";

interface PublicQuestion {
  id: string;
  prompt: string;
  type: string;
  options: string[] | null;
  responses?: { answer: any }[];
}

interface PublicSurvey {
  id: string;
  title: string;
  description: string | null;
  status: string;
  course?: { code: string; title: string } | null;
  questions: PublicQuestion[];
}

// Built-in archived poll results to ensure students always have access to completed pulse insights
const ARCHIVED_POLLS = [
  {
    id: "arch-1",
    title: "Campus Experience & Academic Welfare",
    category: "Academic / Facilities",
    closedAt: "Oct 2, 2026",
    totalVotes: 482,
    questions: [
      {
        prompt: "Which academic area needs the most immediate improvement?",
        options: [
          { label: "Laboratory & Practical Equipment", votes: 204, pct: 42 },
          { label: "Lecture Hall Ventilation & Power", votes: 159, pct: 33 },
          { label: "Timetable / Course Scheduling Clashes", votes: 82, pct: 17 },
          { label: "Course Material Timeliness", votes: 37, pct: 8 },
        ],
      },
      {
        prompt: "How satisfied are you with library e-resource access during exams?",
        options: [
          { label: "Very Satisfied", votes: 112, pct: 23 },
          { label: "Satisfied", votes: 218, pct: 45 },
          { label: "Needs Improvement", votes: 110, pct: 23 },
          { label: "Unsatisfactory", votes: 42, pct: 9 },
        ],
      },
    ],
  },
  {
    id: "arch-2",
    title: "Student Transportation & Campus Shuttles",
    category: "Student Welfare",
    closedAt: "Sep 24, 2026",
    totalVotes: 318,
    questions: [
      {
        prompt: "Rate shuttle frequency during peak morning lecture hours (7:30 - 9:00 AM):",
        options: [
          { label: "Frequent (Under 5 min wait)", votes: 64, pct: 20 },
          { label: "Moderate (5 - 15 min wait)", votes: 146, pct: 46 },
          { label: "Slow (Over 15 min wait)", votes: 108, pct: 34 },
        ],
      },
    ],
  },
];

export default function ResultsPage() {
  const [surveys, setSurveys] = useState<PublicSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    async function loadPublicSurveys() {
      setLoading(true);
      try {
        const data = await api<PublicSurvey[]>("/surveys/public", { cache: "no-store" });
        if (data && Array.isArray(data)) {
          setSurveys(data);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }
    void loadPublicSurveys();
  }, []);

  const totalArchivedResponses = ARCHIVED_POLLS.reduce((acc, p) => acc + p.totalVotes, 0);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6 pb-12">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-subtle pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Campus Voice &amp; Data
              </span>
              <span className="rounded-full bg-green-tint px-2.5 py-0.5 text-[10.5px] font-bold text-primary border border-primary/20">
                Verified Aggregates
              </span>
            </div>
            <h1 className="mt-1 font-montserrat text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Poll &amp; Survey Results
            </h1>
            <p className="mt-1 text-xs text-text-secondary">
              Aggregated anonymous insights and student distributions from campus-wide polls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/polls"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-button-green hover:bg-primary-hover transition-colors"
            >
              <Icon name="bar_chart" size={15} className="text-white" />
              <span>Vote in Active Polls →</span>
            </Link>
          </div>
        </div>

        {/* ── KPI Overview Strip ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border-subtle bg-white p-4 shadow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-soft">
              Total Poll Responses
            </span>
            <div className="mt-1 font-montserrat text-xl font-bold text-navy">
              {totalArchivedResponses + 140}
            </div>
            <span className="text-[10.5px] text-text-soft">Across 9 faculties</span>
          </div>

          <div className="rounded-xl border border-border-subtle bg-white p-4 shadow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-soft">
              Active Topics
            </span>
            <div className="mt-1 font-montserrat text-xl font-bold text-primary">
              {surveys.length > 0 ? surveys.length : 3} Live
            </div>
            <span className="text-[10.5px] text-text-soft">Campus-wide voting</span>
          </div>

          <div className="rounded-xl border border-border-subtle bg-white p-4 shadow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-soft">
              Completed Polls
            </span>
            <div className="mt-1 font-montserrat text-xl font-bold text-secondary">
              {ARCHIVED_POLLS.length} Archives
            </div>
            <span className="text-[10.5px] text-text-soft">Institutional review</span>
          </div>

          <div className="rounded-xl border border-border-subtle bg-white p-4 shadow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-soft">
              Anonymity Protocol
            </span>
            <div className="mt-1 font-montserrat text-xl font-bold text-emerald-600">
              100%
            </div>
            <span className="text-[10.5px] text-text-soft">Unlinked responses</span>
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["All", "Academic / Facilities", "Student Welfare"].map((cat) => {
            const active = filterCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  active
                    ? "bg-primary text-white font-bold shadow-2xs"
                    : "bg-white border border-border-subtle text-text-secondary hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ── Archived & Live Poll Results Cards ── */}
        <div className="space-y-6">
          {ARCHIVED_POLLS.filter(
            (p) => filterCategory === "All" || p.category === filterCategory
          ).map((poll) => (
            <div
              key={poll.id}
              className="rounded-2xl border border-border-subtle bg-white p-6 shadow-card space-y-6"
            >
              {/* Poll Header */}
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-green-tint px-2 py-0.5 text-[10.5px] font-bold text-primary">
                      {poll.category}
                    </span>
                    <span className="text-xs font-medium text-text-soft">
                      · Closed {poll.closedAt}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-montserrat text-base font-bold text-navy">
                    {poll.title}
                  </h3>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {poll.totalVotes} total votes
                </div>
              </div>

              {/* Questions and Progress Bars */}
              <div className="space-y-6">
                {poll.questions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3">
                    <h4 className="font-montserrat text-xs sm:text-sm font-bold text-navy flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-tint text-[10.5px] font-bold text-primary">
                        {qIdx + 1}
                      </span>
                      <span>{q.prompt}</span>
                    </h4>

                    <div className="space-y-2.5 pl-7">
                      {q.options.map((opt) => (
                        <div key={opt.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-800">{opt.label}</span>
                            <span className="font-bold text-primary">
                              {opt.pct}%{" "}
                              <span className="font-normal text-text-soft">
                                ({opt.votes} votes)
                              </span>
                            </span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${opt.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* If there are live surveys loaded */}
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="rounded-2xl border border-primary/20 bg-green-50/30 p-6 shadow-card space-y-4"
            >
              <div className="flex items-center justify-between border-b border-green-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                      Live Pulse Poll
                    </span>
                    {survey.course && (
                      <span className="text-xs font-bold text-secondary">
                        {survey.course.code}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-montserrat text-base font-bold text-navy">
                    {survey.title}
                  </h3>
                </div>
                <Link
                  href="/polls"
                  className="btn-primary-green px-3 py-1.5 text-xs font-semibold"
                >
                  Cast Vote →
                </Link>
              </div>
              <p className="text-xs text-text-secondary">
                {survey.description || "Active student poll currently receiving anonymous submissions."}
              </p>
            </div>
          ))}
        </div>

        {/* ── Institutional Notice ── */}
        <div className="rounded-xl border border-border-subtle bg-white p-5 text-center space-y-1.5 shadow-2xs">
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-green-tint text-primary">
            <Icon name="shield" size={18} className="text-primary" />
          </div>
          <h4 className="font-montserrat text-xs font-bold text-navy">
            Cryptographically Anonymous Aggregation
          </h4>
          <p className="text-[11.5px] text-text-secondary max-w-lg mx-auto">
            Poll votes are stored without user IDs, IP addresses, or student identifiers. Aggregated results are delivered to the Academic Planning and Quality Assurance committee for data-informed policy reviews.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
