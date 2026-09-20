"use client";

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
      <div className="space-y-2 py-2">
        <div className="h-4 w-1/2 animate-pulse rounded-md bg-green-tint" />
        <div className="h-3 w-3/4 animate-pulse rounded-md bg-slate-100" />
      </div>
    );
  }
  if (surveys.length === 0) return null;

  return (
    <div className="space-y-3">
      {surveys.map((s, i) => (
        <div
          key={s.id}
          className="rounded-xl border border-border-subtle bg-slate-50/70 p-3.5 transition-all hover:border-slate-300"
        >
          <button
            onClick={() => setOpen(open === s.id ? null : s.id)}
            className="flex w-full items-start gap-3 text-left"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-tint text-xs font-bold text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1">
              <h4 className="font-montserrat text-xs font-bold text-navy hover:text-primary transition-colors">
                {s.title}
              </h4>
              <p className="text-[11px] text-text-secondary">
                {s.questions.length} question{s.questions.length === 1 ? "" : "s"}
                {done[s.id] ? " · ✓ Submitted" : ""}
              </p>
            </div>
            <span className="text-xs font-bold text-text-soft">
              {open === s.id ? "▲" : "▼"}
            </span>
          </button>

          {open === s.id && !done[s.id] && (
            <div className="mt-3 space-y-3 border-t border-border-subtle pt-3">
              {s.questions.map((q) => (
                <div key={q.id} className="space-y-1.5">
                  <p className="text-xs font-semibold text-navy">{q.prompt}</p>
                  {q.type === "RATING" && (
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: n }))}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                            answers[q.id] === n
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
                      <label
                        key={opt}
                        className="flex cursor-pointer items-center gap-2 text-xs font-medium text-navy"
                      >
                        <input
                          type="radio"
                          name={q.id}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                          className="accent-primary"
                        />
                        {opt}
                      </label>
                    ))}
                  {q.type === "FREE_TEXT" && (
                    <textarea
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      placeholder="Your anonymous thoughts..."
                      className="wl-input text-xs"
                      rows={2}
                    />
                  )}
                </div>
              ))}
              <button
                onClick={() => submitAll(s.id)}
                disabled={busy === s.id}
                className="btn-primary-green w-full py-2 text-xs font-semibold"
              >
                {busy === s.id ? "Submitting…" : "Submit anonymously"}
              </button>
            </div>
          )}

          {open === s.id && done[s.id] && (
            <p className="mt-2 text-xs font-semibold text-primary">
              ✓ Answers submitted anonymously.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}