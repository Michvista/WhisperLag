"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Icon } from "@/components/ui/Icon";

interface PublicQuestion {
  id: string;
  prompt: string;
  type: string;
  options: string[] | null;
}

interface PublicSurvey {
  id: string;
  title: string;
  description: string | null;
  questions: PublicQuestion[];
}

/**
 * Public polls for the whisper page. Students answer all the questions they
 * want, then submit once per survey (anonymous, rate-limited).
 */
export function PublicPolls() {
  const [surveys, setSurveys] = useState<PublicSurvey[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    api<PublicSurvey[]>("/surveys/public", { cache: "no-store" })
      .then(setSurveys)
      .catch(() => setSurveys([]));
  }, []);

  async function submitAll(surveyId: string) {
    const questionIds = surveys?.find((s) => s.id === surveyId)?.questions.map((q) => q.id) ?? [];
    const answersToSend = questionIds
      .filter((qid) => answers[qid] !== undefined)
      .map((qid) => ({ questionId: qid, answer: { value: answers[qid] } }));
    if (answersToSend.length === 0) {
      toast("Answer at least one question first.", "error");
      return;
    }
    setBusy(surveyId);
    try {
      await api("/surveys/respond-batch", {
        method: "POST",
        body: JSON.stringify({ surveyId, answers: answersToSend }),
      });
      setDone((d) => ({ ...d, [surveyId]: true }));
      toast("Responses submitted anonymously.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Submission failed", "error");
    } finally {
      setBusy(null);
    }
  }

  if (!surveys) {
    return (
      <div>
        <h2 className="mb-2 flex items-center gap-2 font-display text-headline-md font-semibold text-onSurface">
          Active Polls
          <span className="inline-block h-2 w-2 rounded-full bg-sun-gold" />
        </h2>
        <div className="space-y-2">
          <div className="h-3 w-2/3 animate-pulse bg-surface-container-high" />
          <div className="h-3 w-1/2 animate-pulse bg-surface-container-high" />
        </div>
      </div>
    );
  }
  if (surveys.length === 0) return null;

  return (
    <div>
      <h2 className="mb-2 flex items-center gap-2 font-display text-headline-md font-semibold text-onSurface">
        Active Polls
        <span className="inline-block h-2 w-2 rounded-full bg-sun-gold" />
      </h2>
      <p className="mb-4 font-body-sm text-body-sm text-onSurfaceVariant">
        No account needed. Answer any questions, then submit once.
      </p>
      <div className="flex flex-col">
        {surveys.map((s, i) => (
          <div key={s.id} className="rule-b py-4">
            <button
              onClick={() => setOpen(open === s.id ? null : s.id)}
              className="flex w-full items-start gap-4 text-left"
            >
              <span className="font-mono-label text-lg font-light text-ink/30">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1">
                <h3 className="font-body-md text-body-md text-ink transition-colors hover:text-unilag-green">
                  {s.title}
                </h3>
                <p className="font-mono-label text-mono-label text-ink/50">
                  {s.questions.length} question{s.questions.length === 1 ? "" : "s"}
                  {done[s.id] ? " · Submitted" : ""}
                </p>
              </div>
              <Icon name={open === s.id ? "expand_less" : "expand_more"} size={20} className="text-ink/40" />
            </button>

            {open === s.id && !done[s.id] && (
              <div className="ml-10 mt-4 flex flex-col gap-4">
                {s.questions.map((q) => (
                  <div key={q.id}>
                    <p className="mb-2 font-label-caps text-label-caps uppercase tracking-wider text-onSurfaceVariant">
                      {q.prompt}
                    </p>
                    {q.type === "RATING" && (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setAnswers((a) => ({ ...a, [q.id]: n }))}
                            className={`h-9 w-9 border font-mono-label text-mono-label transition-colors ${
                              answers[q.id] === n ? "border-ink bg-ink text-white" : "border-ink/20 hover:border-ink"
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
                          <input type="radio" name={q.id} onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))} className="accent-primary" />
                          {opt}
                        </label>
                      ))}
                    {q.type === "FREE_TEXT" && (
                      <textarea
                        onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                        placeholder="Your thoughts (kept anonymous)…"
                        className="input-minimal w-full resize-none font-body-md text-body-md"
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={() => submitAll(s.id)}
                  disabled={busy === s.id}
                  className="w-fit border border-ink px-5 py-2.5 font-label-caps text-label-caps uppercase tracking-wider transition-colors hover:bg-surface-variant disabled:opacity-40"
                >
                  {busy === s.id ? "Submitting…" : "Submit responses"}
                </button>
              </div>
            )}

            {open === s.id && done[s.id] && (
              <p className="ml-10 mt-4 flex items-center gap-1 font-body-sm text-body-sm text-primary">
                <Icon name="check_circle" size={16} className="text-primary" />
                Thanks, your answers were submitted anonymously.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}