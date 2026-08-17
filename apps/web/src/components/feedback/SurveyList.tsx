"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

interface SurveyQuestion {
  id: string;
  prompt: string;
  type: "MULTIPLE_CHOICE" | "RATING" | "FREE_TEXT";
  options: string[] | null;
}

export interface Survey {
  id: string;
  title: string;
  description: string | null;
  status: string;
  questions: SurveyQuestion[];
}

/**
 * Live survey list from GET /api/v1/surveys, with inline answering that
 * posts to the respond endpoint. All responses are stored anonymously.
 */
export function SurveyList() {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Fetch surveys lazily on first render.
  const [fetchState, setFetchState] = useState<{ loading: boolean; error: string | null }>({
    loading: true,
    error: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await api<Survey[]>("/surveys", { token: getToken(), cache: "no-store" });
        setSurveys(data);
      } catch (e) {
        setFetchState({ loading: false, error: e instanceof Error ? e.message : "Failed to load surveys" });
        return;
      }
      setFetchState({ loading: false, error: null });
      setLoaded(true);
    })();
  }, []);

  async function respond(questionId: string) {
    const value = answers[questionId];
    if (value === undefined) return;
    setBusy(questionId);
    try {
      await api(`/surveys/questions/${questionId}/respond`, {
        method: "POST",
        body: JSON.stringify({ answer: { value } }),
        token: getToken(),
      });
      setSubmitted((s) => ({ ...s, [questionId]: true }));
    } finally {
      setBusy(null);
    }
  }

  if (!loaded) {
    if (fetchState.error) return <p className="font-body-sm text-body-sm text-error">{fetchState.error}</p>;
    return (
      <div className="flex items-center gap-3 py-6 text-onSurfaceVariant">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="font-body-md text-body-md">Loading surveys…</span>
      </div>
    );
  }

  if (surveys.length === 0) {
    return (
      <p className="font-body-sm text-body-sm text-onSurfaceVariant">
        No open surveys right now. Check back soon.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {surveys.map((survey) => (
        <div
          key={survey.id}
          className="rounded border border-outlineVariant/30 bg-surface-container-lowest p-4 transition-colors hover:border-secondary"
        >
          <p className="font-label-md text-label-md text-onSurface">{survey.title}</p>
          {survey.description && (
            <p className="mt-1 font-body-sm text-body-sm text-onSurfaceVariant">{survey.description}</p>
          )}
          <div className="mt-3 space-y-3">
            {survey.questions.map((q) => {
              const done = submitted[q.id];
              return (
                <div key={q.id} className="rounded bg-surface-container-low p-3">
                  <p className="font-body-sm text-body-sm text-onSurface">{q.prompt}</p>
                  {q.type === "RATING" && (
                    <div className="mt-2 flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: n }))}
                          className={`h-8 w-8 rounded-full font-body-sm text-body-sm transition-colors ${
                            answers[q.id] === n
                              ? "bg-primary text-onPrimary"
                              : "bg-surface-container-lowest text-onSurfaceVariant hover:bg-surface-container"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                  {q.type === "MULTIPLE_CHOICE" &&
                    q.options?.map((opt) => (
                      <label key={opt} className="mt-1.5 flex cursor-pointer items-center gap-2 font-body-sm text-body-sm text-onSurface">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                          className="h-4 w-4 accent-primary"
                        />
                        {opt}
                      </label>
                    ))}
                  {q.type === "FREE_TEXT" && (
                    <textarea
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      placeholder="Your thoughts (kept anonymous)…"
                      className="mt-2 h-20 w-full resize-none rounded border border-outlineVariant bg-surface-container-lowest p-2 font-body-sm text-body-sm text-onSurface transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  )}
                  <div className="mt-2 flex items-center justify-end gap-2">
                    {done ? (
                      <span className="flex items-center gap-1 font-body-sm text-body-sm text-primary">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                        Submitted
                      </span>
                    ) : (
                      <button
                        onClick={() => respond(q.id)}
                        disabled={busy === q.id || answers[q.id] === undefined}
                        className="rounded bg-primary px-3 py-1.5 font-label-md text-label-md text-onPrimary transition-colors hover:bg-surface-tint disabled:opacity-40"
                      >
                        {busy === q.id ? "Sending…" : "Submit"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}