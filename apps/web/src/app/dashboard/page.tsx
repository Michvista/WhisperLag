"use client";
import { Icon } from "@/components/ui/Icon";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { WhisperForm } from "@/components/feedback/WhisperForm";
import { ErrorBlock, LoadingBlock } from "@/components/ui/States";
import { useFetch } from "@/lib/useFetch";
import { api, getToken } from "@/lib/api";
import { toast } from "@/lib/toast";
import { ExpandableText } from "@/components/ui/ExpandableText";

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
  ACTIONED: { label: "Resolved", cls: "bg-unilag-green/10 text-unilag-green" },
  ACKNOWLEDGED: { label: "Under Review", cls: "bg-unilag-green/10 text-unilag-green" },
  NEW: { label: "New", cls: "bg-ink/5 text-ink/50" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Compact expandable poll list wired to the batch respond endpoint. */
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
    <div>
      {surveys.map((survey, i) => (
        <div key={survey.id} className="rule-b py-4">
          <button onClick={() => setOpen(open === survey.id ? null : survey.id)} className="flex w-full items-start gap-4 text-left">
            <span className="font-mono-label text-lg font-light text-ink/30">{String(i + 1).padStart(2, "0")}</span>
            <div className="flex flex-1 flex-col gap-1">
              <h3 className="font-body-md text-body-md text-ink transition-colors hover:text-unilag-green">{survey.title}</h3>
              <p className="font-mono-label text-mono-label text-ink/50">
                  {survey.status === "OPEN" ? "Open" : survey.status.toLowerCase()} · {survey.questions.length} question{survey.questions.length === 1 ? "" : "s"}
                  {done[survey.id] ? " · Submitted" : ""}
                </p>
            </div>
            <Icon name={open === survey.id ? "expand_less" : "expand_more"} size={24} className="text-ink/40" />
          </button>

          {open === survey.id && !done[survey.id] && (
            <div className="ml-10 mt-4 flex flex-col gap-4">
              {survey.questions.map((q) => (
                <div key={q.id}>
                  <p className="mb-2 font-label-caps text-label-caps uppercase tracking-wider text-onSurfaceVariant">{q.prompt}</p>
                  {q.type === "RATING" && (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setAnswer((a) => ({ ...a, [q.id]: n }))}
                          className={`h-9 w-9 border font-mono-label text-mono-label transition-colors ${
                            answer[q.id] === n ? "border-ink bg-ink text-white" : "border-ink/20 hover:border-ink"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                  {q.type === "MULTIPLE_CHOICE" &&
                    q.options?.map((opt) => (
                      <label key={opt} className="flex cursor-pointer items-center gap-2 py-0.5 font-body-md text-body-md text-onSurface">
                        <input type="radio" name={q.id} onChange={() => setAnswer((a) => ({ ...a, [q.id]: opt }))} className="accent-primary" />
                        {opt}
                      </label>
                    ))}
                  {q.type === "FREE_TEXT" && (
                    <textarea
                      onChange={(e) => setAnswer((a) => ({ ...a, [q.id]: e.target.value }))}
                      placeholder="Your thoughts (kept anonymous)…"
                      className="input-minimal w-full resize-none font-body-md text-body-md"
                    />
                  )}
                </div>
              ))}
              <button
                onClick={() => submitAll(survey.id)}
                disabled={busy === survey.id}
                className="mt-2 w-fit border border-ink px-5 py-2.5 font-label-caps text-label-caps uppercase tracking-wider transition-colors hover:bg-surface-variant disabled:opacity-40"
              >
                {busy === survey.id ? "Submitting…" : "Submit responses"}
              </button>
            </div>
          )}
          {open === survey.id && done[survey.id] && (
            <p className="ml-10 mt-4 flex items-center gap-1 font-body-sm text-body-sm text-primary">
              <Icon name="check_circle" size={16} className="text-primary" />
              Thanks, your answers were submitted anonymously.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/** Student dashboard : editorial split layout, fully live. */
export default function StudentDashboardPage() {
  const recent = useFetch<RecentWhisper[]>("/feedback/recent");
  const surveys = useFetch<Survey[]>("/surveys");
  const items = recent.data;

  return (
    <AppShell>
      <div className="flex flex-col gap-16 md:flex-row md:gap-24">
        {/* Left: the whisper (60%) */}
        <div className="w-full bg-surface-container-lowest p-8 md:w-3/5 md:p-12">
          <header className="mb-8 flex flex-col gap-4">
            <h1 className="font-display text-headline-lg-mobile font-bold text-ink md:text-display-xl">Speak freely.</h1>
            <p className="max-w-xl font-body-lg text-body-lg text-ink/70">
              Your voice matters. Use this space to share feedback, report
              concerns, or propose changes with absolute anonymity.
            </p>
          </header>
          <div className="rule-b mb-8" />
          <WhisperForm />
        </div>

        {/* Right: context & activity (40%) */}
        <div className="flex w-full flex-col gap-16 md:w-2/5">
          <section className="flex flex-col gap-6">
            <h2 className="flex items-center gap-2 font-display text-headline-md font-semibold text-ink">
              Active Polls
              <span className="inline-block h-2 w-2 rounded-full bg-sun-gold" />
            </h2>
            {surveys.loading ? (
              <LoadingBlock label="Loading…" />
            ) : surveys.error ? (
              <ErrorBlock message={surveys.error} onRetry={surveys.refetch} />
            ) : surveys.data && surveys.data.length > 0 ? (
              <PollList
                surveys={surveys.data.filter((s) => s.status === "OPEN")}
                onDone={surveys.refetch}
              />
            ) : (
              <p className="font-mono-label text-mono-label text-ink/50">No open polls right now.</p>
            )}
          </section>

          <section className="flex flex-col gap-6">
            <h2 className="font-display text-headline-md font-semibold text-ink">Recent Activity</h2>
            {recent.loading ? (
              <LoadingBlock label="Loading…" />
            ) : recent.error ? (
              <ErrorBlock message={recent.error} onRetry={recent.refetch} />
            ) : items && items.length > 0 ? (
              <div className="max-h-[360px] overflow-y-auto pr-1">
                <div className="flex flex-col">
                {items.slice(0, 5).map((w) => {
                  const meta = STATUS_META[w.status];
                  return (
                    <div key={w.id} className="rule-b flex items-start justify-between gap-3 py-4">
                      <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-body-md text-body-md text-ink">{w.category}</h3>
                          <p className="font-mono-label text-mono-label text-ink/50">{formatDate(w.createdAt)}</p>
                        </div>
                        <ExpandableText text={w.content} />
                        {w.status === "ACTIONED" && w.resolutionNote && (
                          <p className="font-body-sm text-body-sm leading-relaxed text-primary">
                            ✓ {w.resolutionNote}
                          </p>
                        )}
                      </div>
                      <span className={`shrink-0 px-2 py-1 font-label-caps text-[10px] uppercase tracking-wider ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>
                  );
                })}
                </div>
              </div>
            ) : (
              <p className="font-mono-label text-mono-label text-ink/50">
                Nothing yet. Submit your first whisper : it stays anonymous.
              </p>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}