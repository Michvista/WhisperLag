"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingBlock, SignedOut } from "@/components/ui/States";
import { api, getToken } from "@/lib/api";

interface Survey {
  id: string;
  title: string;
  description: string | null;
  status: string;
  questions: { id: string; prompt: string; type: string }[];
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

/** Survey builder — creates and publishes surveys via the API. */
export default function SurveyBuilderPage() {
  const session = Boolean(getToken());
  const [title, setTitle] = useState("Faculty Feedback 2026");
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    { key: 1, prompt: "How clear were the course objectives?", type: "RATING", options: "" },
  ]);
  const [surveys, setSurveys] = useState<Survey[] | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadSurveys() {
    try {
      const data = await api<Survey[]>("/surveys", { token: getToken(), cache: "no-store" });
      setSurveys(data);
    } catch {
      setSurveys([]);
    }
  }

  useEffect(() => {
    if (session) void loadSurveys();
  }, [session]);

  function addQuestion() {
    setQuestions((q) => [
      ...q,
      { key: Date.now(), prompt: "", type: "RATING", options: "" },
    ]);
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
      setNotice("Survey published. Students can now respond anonymously.");
      setQuestions([]);
      setTitle("");
      await loadSurveys();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Failed to publish");
    } finally {
      setPublishing(false);
    }
  }

  if (!session) {
    return (
      <AppShell>
        <SignedOut />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-16 md:flex-row">
        {/* Left: structure */}
        <section className="flex w-full flex-col gap-8 md:w-2/5">
          <div>
            <h1 className="mb-2 font-display text-headline-lg font-semibold text-onSurface">Build Survey</h1>
            <p className="font-body-md text-body-md text-onSurfaceVariant">
              Design your inquiry with institutional precision. All responses are kept anonymous.
            </p>
          </div>

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

          <div className="flex gap-4">
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 border border-ink px-4 py-2 font-label-caps text-label-caps uppercase tracking-wider text-onSurface transition-colors hover:bg-surface-container-highest"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Question
            </button>
          </div>

          <div className="rule-b border-t border-ink/10 pt-8">
            <h3 className="mb-4 font-label-caps text-label-caps text-onSurfaceVariant">Available Types</h3>
            <div className="grid grid-cols-1 gap-4">
              {TYPES.map((t) => (
                <div key={t.value} className="flex cursor-pointer items-center gap-3 border border-ink/10 p-4 transition-colors hover:border-primary">
                  <span className="material-symbols-outlined text-onSurfaceVariant">{t.icon}</span>
                  <span className="font-mono-label text-mono-label">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {notice && (
            <div className="border border-primary/20 bg-primary/5 p-4 font-body-md text-body-md text-onPrimaryContainer">
              {notice}
            </div>
          )}
        </section>

        {/* Right: question canvas */}
        <section className="w-full md:w-3/5">
          <div className="flex flex-col border-l border-ink/10 pl-8 md:pl-16">
            <div className="rule-b mb-8 flex items-end justify-between pb-4">
              <span className="font-label-caps text-label-caps text-onSurfaceVariant">
                {questions.length} Question{questions.length === 1 ? "" : "s"}
              </span>
              <button
                onClick={publish}
                disabled={publishing || questions.length === 0}
                className="bg-ink px-6 py-3 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary disabled:opacity-60"
              >
                {publishing ? "Publishing…" : "Publish Survey"}
              </button>
            </div>

            {questions.map((q, i) => (
              <div key={q.key} className="rule-b -mx-4 flex gap-6 px-4 py-8 transition-colors hover:bg-surface-container-lowest">
                <span className="mt-1 font-display text-3xl font-light text-onSurfaceVariant/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <select
                      value={q.type}
                      onChange={(e) => update(q.key, { type: e.target.value as DraftQuestion["type"] })}
                      className="bg-transparent font-label-caps text-label-caps uppercase tracking-wider text-primary"
                    >
                      {TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <button onClick={() => removeQuestion(q.key)} className="text-onSurfaceVariant transition-colors hover:text-error">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                  <input
                    value={q.prompt}
                    onChange={(e) => update(q.key, { prompt: e.target.value })}
                    placeholder="Question text…"
                    className="input-minimal w-full font-display text-headline-md text-onSurface"
                  />
                  {q.type === "MULTIPLE_CHOICE" && (
                    <input
                      value={q.options}
                      onChange={(e) => update(q.key, { options: e.target.value })}
                      placeholder="Options, comma separated (e.g. Engineering, Arts, Sciences)"
                      className="input-minimal w-full font-body-md text-body-md text-onSurfaceVariant"
                    />
                  )}
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <p className="py-12 font-body-md text-body-md text-onSurfaceVariant">
                Add a question to start building your survey.
              </p>
            )}

            <div className="mt-12">
              <h3 className="rule-b mb-4 font-label-caps text-label-caps uppercase tracking-widest text-onSurface">
                Published Surveys
              </h3>
              {surveys === null ? (
                <LoadingBlock label="Loading…" />
              ) : surveys.length === 0 ? (
                <p className="font-body-md text-body-md text-onSurfaceVariant">None yet. Publish your first survey above.</p>
              ) : (
                <div className="flex flex-col">
                  {surveys.map((s, i) => (
                    <div key={s.id} className="rule-b flex items-center justify-between gap-4 py-4">
                      <div className="flex items-center gap-4">
                        <span className="font-mono-label text-lg font-light text-onSurfaceVariant/40">{String(i + 1).padStart(2, "0")}</span>
                        <div>
                          <h4 className="font-body-md font-medium text-onSurface">{s.title}</h4>
                          <p className="font-label-caps text-label-caps text-onSurfaceVariant">
                            {s.status} · {s.questions.length} questions
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 font-label-caps text-[10px] uppercase tracking-wider ${s.status === "OPEN" ? "bg-unilag-green/10 text-unilag-green" : "bg-ink/5 text-ink/50"}`}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}