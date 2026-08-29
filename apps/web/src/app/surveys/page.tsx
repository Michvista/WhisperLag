"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/ui/RoleGate";
import { LoadingBlock } from "@/components/ui/States";
import { ROLES } from "@whisperlag/shared";
import { api, getToken } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/lib/toast";

interface Survey {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  questions: { id: string; prompt: string; type: string }[];
}

interface SurveyResults {
  id: string;
  title: string;
  status: string;
  questions: { id: string; prompt: string; type: string; responseCount: number; counts: Record<string, number>; texts: string[] }[];
}

interface DraftQuestion {
  key: number;
  prompt: string;
  type: "RATING" | "MULTIPLE_CHOICE" | "FREE_TEXT";
  options: string;
}

const TYPES = [
  { value: "RATING", label: "Likert Scale", icon: "linear_scale" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice", icon: "radio_button_checked" },
  { value: "FREE_TEXT", label: "Open-ended", icon: "short_text" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Surveys — admins build & publish; staff review anonymous results. */
export default function SurveyBuilderPage() {
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";
  const [title, setTitle] = useState("Faculty Feedback 2026");
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    { key: 1, prompt: "How clear were the course objectives?", type: "RATING", options: "" },
  ]);
  const [surveys, setSurveys] = useState<Survey[] | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, SurveyResults>>({});
  const [openResults, setOpenResults] = useState<string | null>(null);

  async function loadSurveys() {
    try {
      const data = await api<Survey[]>("/surveys", { token: getToken(), cache: "no-store" });
      setSurveys(data);
    } catch {
      setSurveys([]);
    }
  }

  useEffect(() => {
    void loadSurveys();
  }, []);

  async function viewResults(id: string) {
    if (openResults === id) {
      setOpenResults(null);
      return;
    }
    setOpenResults(id);
    if (results[id]) return;
    try {
      const data = await api<SurveyResults>(`/surveys/${id}/results`, { token: getToken(), cache: "no-store" });
      setResults((r) => ({ ...r, [id]: data }));
    } catch {
      toast("Could not load results", "error");
    }
  }

  function addQuestion() {
    setQuestions((q) => [...q, { key: Date.now(), prompt: "", type: "RATING", options: "" }]);
  }

  function update(key: number, patch: Partial<DraftQuestion>) {
    setQuestions((q) => q.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function removeQuestion(key: number) {
    setQuestions((q) => q.filter((item) => item.key !== key));
  }

  async function publish() {
    if (!title.trim() || questions.length === 0) return;
    setPublishing(true);
    setNotice(null);
    try {
      await api("/surveys", {
        method: "POST",
        body: JSON.stringify({
          title,
          isAnonymous: true,
          questions: questions.map((q) => ({
            prompt: q.prompt,
            type: q.type,
            options: q.type === "MULTIPLE_CHOICE" ? q.options.split(",").map((o) => o.trim()).filter(Boolean) : undefined,
          })),
        }),
        token: getToken(),
      });
      setNotice("Survey published and now live for students.");
      toast("Survey published.");
      setQuestions([]);
      setTitle("");
      await loadSurveys();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Failed to publish");
      toast(e instanceof Error ? e.message : "Failed to publish", "error");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <RoleGate minRole={ROLES.FACULTY}>
      <AppShell>
        <header className="rule-b mb-12 pb-8">
          <h1 className="mb-2 font-display text-headline-lg font-semibold text-onSurface">Surveys</h1>
          <p className="font-body-md text-body-md text-onSurfaceVariant">
            {isAdmin ? "Build and publish surveys; every response stays anonymous." : "Review anonymous survey results."}
          </p>
        </header>

        <div className="flex flex-col gap-16 md:flex-row">
          {/* Builder (admin only) */}
          <section className="w-full md:w-2/5">
            {!isAdmin ? (
              <p className="border border-ink/10 bg-surface-container-low p-6 font-body-md text-body-md text-onSurfaceVariant">
                Only administrators can build surveys. You can review results on the right.
              </p>
            ) : (
              <div className="flex flex-col gap-8">
                <div className="relative">
                  <label className="absolute -top-3 left-0 font-label-caps text-label-caps text-onSurfaceVariant">
                    Survey Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title..."
                    className="input-minimal w-full font-display text-headline-md text-onSurface"
                  />
                </div>

                <button
                  onClick={addQuestion}
                  className="flex items-center gap-2 border border-ink px-4 py-2 font-label-caps text-label-caps uppercase tracking-wider text-onSurface transition-colors hover:bg-surface-container-highest"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Add Question
                </button>

                {questions.map((q, i) => (
                  <div key={q.key} className="border-l border-ink/10 pl-6">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-label-caps text-onSurfaceVariant">
                        {String(i + 1).padStart(2, "0")} ·{" "}
                        {TYPES.find((t) => t.value === q.type)?.label ?? q.type}
                      </span>
                      <button onClick={() => removeQuestion(q.key)} className="text-onSurfaceVariant transition-colors hover:text-error">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                    <input
                      value={q.prompt}
                      onChange={(e) => update(q.key, { prompt: e.target.value })}
                      placeholder="Question text…"
                      className="input-minimal w-full font-body-md text-body-md text-onSurface"
                    />
                    <div className="mt-2 flex items-center gap-3">
                      <select
                        value={q.type}
                        onChange={(e) => update(q.key, { type: e.target.value as DraftQuestion["type"] })}
                        className="bg-transparent font-label-caps text-label-caps uppercase tracking-wider text-primary"
                      >
                        {TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      {q.type === "MULTIPLE_CHOICE" && (
                        <input
                          value={q.options}
                          onChange={(e) => update(q.key, { options: e.target.value })}
                          placeholder="Options, comma separated"
                          className="input-minimal flex-1 font-body-sm text-body-sm text-onSurfaceVariant"
                        />
                      )}
                    </div>
                  </div>
                ))}

                {questions.length === 0 && (
                  <p className="font-body-sm text-body-sm text-onSurfaceVariant">
                    Add a question to start building.
                  </p>
                )}

                {notice && (
                  <div className="border border-primary/20 bg-primary/5 p-4 font-body-sm text-body-sm text-onPrimaryContainer">
                    {notice}
                  </div>
                )}

                <button
                  onClick={publish}
                  disabled={publishing || questions.length === 0}
                  className="bg-ink px-6 py-4 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary disabled:opacity-60"
                >
                  {publishing ? "Publishing…" : "Publish Survey"}
                </button>
              </div>
            )}
          </section>

          {/* Published surveys + results */}
          <section className="w-full md:w-3/5">
            <h2 className="rule-b mb-4 font-label-caps text-label-caps uppercase tracking-widest text-onSurface">
              Published Surveys
            </h2>
            {surveys === null ? (
              <LoadingBlock label="Loading…" />
            ) : surveys.length === 0 ? (
              <p className="font-body-md text-body-md text-onSurfaceVariant">
                None yet{isAdmin ? " — publish your first survey on the left." : "."}
              </p>
            ) : (
              <div className="flex flex-col">
                {surveys.map((s, i) => (
                  <div key={s.id} className="rule-b py-4">
                    <button
                      onClick={() => viewResults(s.id)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono-label text-lg font-light text-onSurfaceVariant/40">{String(i + 1).padStart(2, "0")}</span>
                        <div>
                          <h3 className="font-body-md font-medium text-onSurface">{s.title}</h3>
                          <p className="font-label-caps text-label-caps text-onSurfaceVariant">
                            {s.status} · {s.questions.length} questions · {formatDate(s.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 font-label-caps text-[10px] uppercase tracking-wider ${
                            s.status === "OPEN" ? "bg-unilag-green/10 text-unilag-green" : "bg-ink/5 text-ink/50"
                          }`}
                        >
                          {s.status}
                        </span>
                        <span className="material-symbols-outlined text-onSurfaceVariant">
                          {openResults === s.id ? "expand_less" : "expand_more"}
                        </span>
                      </span>
                    </button>

                    {openResults === s.id && (
                      <div className="ml-10 mt-4 flex flex-col gap-4">
                        {results[s.id] ? (
                          results[s.id].questions.map((q) => (
                            <div key={q.id} className="border-l border-ink/10 pl-4">
                              <p className="font-label-caps text-label-caps uppercase tracking-wider text-onSurfaceVariant">
                                {q.prompt} · {q.responseCount} response{q.responseCount === 1 ? "" : "s"}
                              </p>
                              {q.type !== "FREE_TEXT" && Object.keys(q.counts).length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {Object.entries(q.counts).map(([k, v]) => (
                                    <span key={k} className="border border-ink/10 px-2 py-1 font-mono-label text-mono-label">
                                      {k}: <span className="font-semibold text-primary">{v}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <ul className="mt-2 flex flex-col gap-1">
                                  {(q.texts.length ? q.texts : ["No responses yet."]).map((t, idx) => (
                                    <li key={idx} className="font-body-sm text-body-sm text-onSurfaceVariant">
                                      &ldquo;{t}&rdquo;
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))
                        ) : (
                          <LoadingBlock label="Loading results…" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </AppShell>
    </RoleGate>
  );
}