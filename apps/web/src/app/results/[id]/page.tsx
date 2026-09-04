"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/ui/RoleGate";
import { ErrorBlock, LoadingBlock } from "@/components/ui/States";
import { ROLES } from "@whisperlag/shared";
import { api, getToken } from "@/lib/api";

interface QuestionResults {
  id: string;
  prompt: string;
  type: string;
  responseCount: number;
  counts: Record<string, number>;
  texts: string[];
}

interface SurveyResults {
  id: string;
  title: string;
  status: string;
  course: { code: string; title: string } | null;
  questions: QuestionResults[];
}

/** Full, readable survey results breakdown for staff. */
export default function SurveyResultsPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<SurveyResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await api<SurveyResults>(`/surveys/${params.id}/results`, { token: getToken(), cache: "no-store" }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const total = data?.questions.reduce((a, q) => a + q.responseCount, 0) ?? 0;
  const maxCount = Math.max(1, ...(data?.questions.flatMap((q) => Object.values(q.counts)) ?? [1]));

  return (
    <RoleGate minRole={ROLES.FACULTY}>
      <AppShell>
        {loading ? (
          <LoadingBlock label="Loading results…" />
        ) : error ? (
          <ErrorBlock message={error} onRetry={() => window.location.reload()} />
        ) : (
          data && (
            <div className="mx-auto max-w-3xl">
              <Link href="/surveys" className="mb-8 inline-block font-label-caps text-label-caps text-primary hover:underline">
                ← Back to surveys
              </Link>

              <header className="rule-b mb-10 pb-8">
                <h1 className="mb-2 font-display text-headline-lg font-semibold text-onSurface">{data.title}</h1>
                <p className="font-mono-label text-mono-label text-onSurfaceVariant">
                  {data.status} · {total} total responses
                  {data.course ? ` · Linked course: ${data.course.code} — ${data.course.title}` : ""}
                </p>
              </header>

              <div className="flex flex-col gap-10">
                {data.questions.map((q, qi) => (
                  <section key={q.id}>
                    <h2 className="mb-1 font-display text-headline-md font-semibold text-onSurface">
                      {qi + 1}. {q.prompt}
                    </h2>
                    <p className="mb-4 font-mono-label text-mono-label text-onSurfaceVariant">
                      {q.responseCount} response{q.responseCount === 1 ? "" : "s"}
                    </p>

                    {q.type === "FREE_TEXT" ? (
                      <ul className="flex flex-col gap-2 border-t border-ink/10 pt-4">
                        {q.texts.length > 0 ? (
                          q.texts.map((t, ti) => (
                            <li key={ti} className="border-l-2 border-primary pl-3 font-body-md text-body-md leading-relaxed text-onSurface">
                              &ldquo;{t}&rdquo;
                            </li>
                          ))
                        ) : (
                          <li className="font-body-sm text-body-sm text-onSurfaceVariant">No written responses yet.</li>
                        )}
                      </ul>
                    ) : (
                      <div className="flex flex-col gap-3 border-t border-ink/10 pt-4">
                        {Object.entries(q.counts).length > 0 ? (
                          Object.entries(q.counts)
                            .sort((a, b) => b[1] - a[1])
                            .map(([key, count]) => (
                              <div key={key} className="flex items-center gap-4">
                                <span className="w-16 shrink-0 font-body-md text-body-md text-onSurface">{key}</span>
                                <div className="h-4 flex-1 bg-surface-container-high">
                                  <div className="h-4 bg-primary" style={{ width: `${(count / maxCount) * 100}%` }} />
                                </div>
                                <span className="w-10 shrink-0 text-right font-mono-label text-mono-label text-onSurface">{count}</span>
                              </div>
                            ))
                        ) : (
                          <p className="font-body-sm text-body-sm text-onSurfaceVariant">No responses yet.</p>
                        )}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>
          )
        )}
      </AppShell>
    </RoleGate>
  );
}