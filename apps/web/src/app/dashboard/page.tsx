"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { WhisperForm } from "@/components/feedback/WhisperForm";
import { ErrorBlock, LoadingBlock } from "@/components/ui/States";
import { useFetch } from "@/lib/useFetch";
import { api, getToken } from "@/lib/api";
import { toast } from "@/lib/toast";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

interface RecentWhisper {
  id: string;
  category: string;
  content: string;
  status: "NEW" | "ACKNOWLEDGED" | "ACTIONED";
  createdAt: string;
  resolutionNote?: string | null;
}

interface Survey {
  id: string;
  title: string;
  description: string | null;
  status: string;
  closesAt: string | null;
  questions: { id: string; prompt: string; type: string; options: string[] | null }[];
}

const STATUS_META: Record<RecentWhisper["status"], { label: string; cls: string }> = {
  ACTIONED: { label: "✓ Action Taken", cls: "bg-green-tint text-primary font-bold" },
  ACKNOWLEDGED: { label: "⏱ Under Review", cls: "bg-amber-tint text-amber-800 font-bold" },
  NEW: { label: "▣ Submitted", cls: "bg-slate-100 text-slate-700 font-bold" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function PollList({ surveys, onDone }: { surveys: Survey[]; onDone: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [answer, setAnswer] = useState<Record<string, unknown>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function submitAll(surveyId: string) {
    const survey = surveys.find((s) => s.id === surveyId);
    if (!survey) return;
    const toSend = survey.questions
      .filter((q) => answer[q.id] !== undefined)
      .map((q) => ({ questionId: q.id, answer: { value: answer[q.id] } }));
    if (toSend.length === 0) {
      toast("Answer at least one question first.", "error");
      return;
    }
    setBusy(surveyId);
    try {
      await api("/surveys/respond-batch", {
        method: "POST",
        body: JSON.stringify({ surveyId, answers: toSend }),
        token: getToken(),
      });
      setDone((d) => ({ ...d, [surveyId]: true }));
      toast("Responses submitted anonymously.");
      onDone();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      {surveys.map((survey, i) => (
        <div key={survey.id} className="rounded-lg border border-border-subtle bg-slate-50/50 p-3.5 transition-all">
          <button
            onClick={() => setOpen(open === survey.id ? null : survey.id)}
            className="flex w-full items-start gap-3 text-left"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-tint text-xs font-bold text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-1 flex-col gap-0.5">
              <h3 className="font-montserrat text-xs font-bold text-navy hover:text-primary">
                {survey.title}
              </h3>
              <p className="text-[11px] text-text-secondary">
                {survey.status === "OPEN" ? "Open Poll" : survey.status} · {survey.questions.length} questions
                {done[survey.id] ? " · ✓ Submitted" : ""}
              </p>
            </div>
            <span className="text-xs font-bold text-text-soft">
              {open === survey.id ? "▲" : "▼"}
            </span>
          </button>

          {open === survey.id && !done[survey.id] && (
            <div className="mt-3 space-y-3 border-t border-border-subtle pt-3">
              {survey.questions.map((q) => (
                <div key={q.id} className="space-y-1.5">
                  <p className="text-xs font-semibold text-navy">{q.prompt}</p>
                  {q.type === "RATING" && (
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setAnswer((a) => ({ ...a, [q.id]: n }))}
                          className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition-all ${
                            answer[q.id] === n
                              ? "bg-primary text-white"
                              : "border border-border-subtle bg-white text-navy hover:border-primary"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                  {q.type === "MULTIPLE_CHOICE" &&
                    q.options?.map((opt) => (
                      <label key={opt} className="flex cursor-pointer items-center gap-2 text-xs text-navy">
                        <input
                          type="radio"
                          name={q.id}
                          onChange={() => setAnswer((a) => ({ ...a, [q.id]: opt }))}
                          className="accent-primary"
                        />
                        {opt}
                      </label>
                    ))}
                  {q.type === "FREE_TEXT" && (
                    <textarea
                      onChange={(e) => setAnswer((a) => ({ ...a, [q.id]: e.target.value }))}
                      placeholder="Your anonymous thoughts..."
                      className="wl-input text-xs"
                      rows={2}
                    />
                  )}
                </div>
              ))}
              <button
                onClick={() => submitAll(survey.id)}
                disabled={busy === survey.id}
                className="btn-primary-green w-full py-2 text-xs font-semibold"
              >
                {busy === survey.id ? "Submitting…" : "Submit Anonymously"}
              </button>
            </div>
          )}

          {open === survey.id && done[survey.id] && (
            <p className="mt-2 text-xs font-semibold text-primary">
              ✓ Thanks! Your answers were submitted anonymously.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Staff / Admin Overview ─────────────────────────────────────────────────

interface StatsData {
  totalWhispers: number;
  totalDepartments: number;
  resolutionRate: number;
  totalEvaluations: number;
}

function StaffDashboard() {
  const stats = useFetch<StatsData>("/stats/overview");

  const quickLinks = [
    { href: "/whispers", label: "Whispers Feed", icon: "forum", desc: "Review and moderate student feedback" },
    { href: "/reports", label: "Reports", icon: "file", desc: "Download analytics and institutional reports" },
    { href: "/surveys", label: "Surveys", icon: "summarize", desc: "Manage campus polls and surveys" },
    { href: "/integrations", label: "SIS / LMS", icon: "tune", desc: "Course and student record integration" },
    { href: "/courses", label: "Course Hub", icon: "book", desc: "Course catalogue and evaluations" },
    { href: "/collaboration", label: "Collaboration", icon: "chat", desc: "Staff communication hub" },
  ];

  return (
    <div className="py-6 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-card">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Staff Overview
        </span>
        <h1 className="mt-1 font-montserrat text-2xl font-bold text-navy sm:text-3xl">
          Whisper<span className="text-primary">Lag</span> Command Center
        </h1>
        <p className="mt-1 text-xs text-text-secondary">
          Monitor campus sentiment, review anonymous feedback, and generate institutional reports.
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.loading ? (
          <div className="col-span-4"><LoadingBlock label="Loading stats…" /></div>
        ) : stats.error ? (
          <div className="col-span-4"><ErrorBlock message={stats.error} onRetry={stats.refetch} /></div>
        ) : (
          <>
            {[
              { label: "Total Whispers", value: stats.data?.totalWhispers ?? 0, icon: "forum" },
              { label: "Departments", value: stats.data?.totalDepartments ?? 0, icon: "school" },
              { label: "Resolution Rate", value: `${stats.data?.resolutionRate ?? 0}%`, icon: "star" },
              { label: "Evaluations", value: stats.data?.totalEvaluations ?? 0, icon: "file" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border-subtle bg-white p-5 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name={s.icon} size={15} className="text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-soft">{s.label}</span>
                </div>
                <p className="font-montserrat text-2xl font-bold text-navy">{s.value}</p>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Quick Links Grid */}
      <div>
        <h2 className="mb-4 font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-start gap-4 rounded-xl border border-border-subtle bg-white p-5 shadow-card transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-tint text-primary">
                <Icon name={link.icon} size={18} />
              </div>
              <div>
                <p className="font-montserrat text-xs font-bold text-navy group-hover:text-primary">{link.label}</p>
                <p className="mt-0.5 text-[11px] text-text-secondary">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Student Dashboard ──────────────────────────────────────────────────────

function StudentDashboard() {
  const recent = useFetch<RecentWhisper[]>("/feedback/recent");
  const surveys = useFetch<Survey[]>("/surveys");
  const items = recent.data;

  return (
    <div className="py-6 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-subtle bg-white p-6 shadow-card">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Student Voice Hub
          </span>
          <h1 className="mt-1 font-montserrat text-2xl font-bold text-navy sm:text-3xl">
            Welcome to Whisper<span className="text-primary">Lag</span>
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Share confidential feedback, rate academic courses, and participate in active polls.
          </p>
        </div>
        <Link href="/listwhispers" className="rounded-lg border border-border-subtle bg-white px-4 py-2 text-xs font-semibold text-navy hover:bg-slate-50">
          Student Whispers →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main: Feedback Wizard Card (7 cols) */}
        <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-card lg:col-span-7">
          <WhisperForm />
        </div>

        {/* Right: Active Polls & Recent Whispers (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Active Polls */}
          <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                Active Campus Polls
              </h2>
              <span className="flex h-2 w-2 rounded-full bg-primary" />
            </div>

            {surveys.loading ? (
              <LoadingBlock label="Loading polls…" />
            ) : surveys.error ? (
              <ErrorBlock message={surveys.error} onRetry={surveys.refetch} />
            ) : surveys.data && surveys.data.length > 0 ? (
              <PollList
                surveys={surveys.data.filter((s) => s.status === "OPEN")}
                onDone={surveys.refetch}
              />
            ) : (
              <p className="text-xs text-text-secondary">No open polls right now.</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                Recent Feedback Updates
              </h2>
              <Link href="/listwhispers" className="text-xs font-semibold text-secondary hover:underline">
                View all →
              </Link>
            </div>

            {recent.loading ? (
              <LoadingBlock label="Loading updates…" />
            ) : recent.error ? (
              <ErrorBlock message={recent.error} onRetry={recent.refetch} />
            ) : items && items.length > 0 ? (
              <div className="space-y-2.5">
                {items.slice(0, 5).map((w) => {
                  const meta = STATUS_META[w.status];
                  return (
                    <div key={w.id} className="rounded-lg border border-border-subtle bg-slate-50/50 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {w.category}
                        </span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="text-xs text-navy">
                        <ExpandableText text={w.content} />
                      </div>
                      {w.status === "ACTIONED" && w.resolutionNote && (
                        <div className="rounded-md border border-green-tint bg-green-tint p-2 text-xs font-semibold text-primary">
                          ✓ Action: {w.resolutionNote}
                        </div>
                      )}
                      <div className="text-[10px] text-text-soft">
                        {formatDate(w.createdAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-text-secondary">
                No recent whispers. Submit your first report to see updates here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root Component ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { role } = useAuth();

  return (
    <AppShell>
      {role === "STUDENT" || role == null ? (
        <StudentDashboard />
      ) : (
        <StaffDashboard />
      )}
    </AppShell>
  );
}