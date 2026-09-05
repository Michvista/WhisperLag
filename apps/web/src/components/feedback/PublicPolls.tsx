"use client";
import { Icon } from "@/components/ui/Icon";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

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
 * Active polls for the PUBLIC whisper page — students who never sign in can
 * still answer. Responses are anonymous and rate-limited on the server.
 */
export function PublicPolls() {
  const [surveys, setSurveys] = useState<PublicSurvey[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    api<PublicSurvey[]>("/surveys/public", { cache: "no-store" })
      .then(setSurveys)
      .catch(() => setSurveys([]));
  }, []);

  async function respond(questionId: string) {
    const value = answers[questionId];
    if (value === undefined) return;
    setBusy(questionId);
    try {
      await api(`/surveys/public/questions/${questionId}/respond`, {
        method: "POST",
        body: JSON.stringify({ answer: { value } }),
      });
      setSubmitted((s) => ({ ...s, [questionId]: true }));
      toast("Response submitted anonymously.");
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
        No account needed — your answers stay anonymous.
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
                </p>
              </div>
              <Icon name={open === s.id ? "expand_less" : "expand_more"} size={24} className="text-ink/40" />
            </button>
            {open === s.id && (
              <div className="ml-10 mt-4 flex flex-col gap-4">
                {s.questions.map((q) => {
                  const done = submitted[q.id];
                  return (
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
                              className={`h-8 w-8 border font-mono-label text-mono-label transition-colors ${
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
                      <div className="mt-2">
                        {done ? (
                          <span className="flex items-center gap-1 font-body-sm text-body-sm text-primary">
                            <Icon name="check_circle" size={24} className="text-sm" />
                            Submitted
                          </span>
                        ) : (
                          <button
                            onClick={() => respond(q.id)}
                            disabled={busy === q.id || answers[q.id] === undefined}
                            className="border border-ink px-4 py-1.5 font-label-caps text-label-caps uppercase tracking-wider transition-colors hover:bg-surface-variant disabled:opacity-40"
                          >
                            {busy === q.id ? "Sending…" : "Submit"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}