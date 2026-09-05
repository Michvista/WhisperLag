"use client";

import { useEffect, useState } from "react";
import { ErrorBlock, LoadingBlock } from "@/components/ui/States";
import { api } from "@/lib/api";
import { Picker } from "@/components/ui/Picker";
import { toast } from "@/lib/toast";

interface Course {
  id: string;
  code: string;
  title: string;
  department: { id: string; name: string } | null;
  lecturer: { id: string; name: string } | null;
}

interface Rubric {
  id: string;
  name: string;
  criteria: { key: string; label: string; weight: number }[];
}

interface Department {
  id: string;
  name: string;
}

/**
 * Anonymous course evaluation : no login needed. Ratings are aggregated for
 * faculty; identities are never shown, only averages and distributions.
 */
export default function EvaluatePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptId, setDeptId] = useState("");
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [courseId, setCourseId] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [deps, cs, rs] = await Promise.all([
          api<Department[]>("/departments/public", { cache: "no-store" }),
          api<Course[]>("/courses/public", { cache: "no-store" }),
          api<Rubric[]>("/rubrics/public", { cache: "no-store" }),
        ]);
        setDepartments(deps);
        setCourses(cs);
        setRubric(rs[0] ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load courses");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const shownCourses = deptId
      ? (courses ?? []).filter((c) => c.department?.id === deptId)
      : (courses ?? []);
  const course = shownCourses.find((c) => c.id === courseId) ?? null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!course || !rubric) return;
    const keys = rubric.criteria.map((c) => c.key);
    if (keys.some((k) => !scores[k])) {
      toast("Please rate every criterion.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await api("/evaluations/public", {
        method: "POST",
        body: JSON.stringify({
          courseId: course.id,
          lecturerId: course.lecturer?.id ?? "",
          rubricId: rubric.id,
          scores: Object.fromEntries(keys.map((k) => [k, scores[k]])),
          comment: comment.trim() || undefined,
        }),
      });
      toast("Evaluation submitted anonymously.");
      setCourseId("");
      setScores({});
      setComment("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-surface px-margin-mobile py-12 font-body text-onSurface md:px-margin-desktop">
      <div className="mx-auto w-full max-w-2xl">
        <header className="rule-b mb-12 pb-8">
          <h1 className="mb-2 font-display text-headline-lg font-semibold text-onSurface">Rate a Course</h1>
          <p className="font-body-md text-body-md text-onSurfaceVariant">
            Honest, anonymous course evaluations. No account needed : faculty
            see only averages, never who rated what.
          </p>
        </header>

        {loading ? (
          <LoadingBlock label="Loading courses…" />
        ) : error ? (
          <ErrorBlock message={error} onRetry={() => window.location.reload()} />
        ) : (
          <form onSubmit={submit} className="flex max-w-2xl flex-col gap-10">
            <div className="relative">
              <label className="absolute -top-5 left-0 font-label-caps text-label-caps text-onSurfaceVariant">
                Department (optional filter)
              </label>
              <select
                value={deptId}
                onChange={(e) => {
                  setDeptId(e.target.value);
                  setCourseId("");
                  setScores({});
                }}
                required
                className="input-minimal w-full font-body-md text-body-md text-onSurface"
              >
                <option value="">All departments (you can take courses in any)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="absolute -top-5 left-0 font-label-caps text-label-caps text-onSurfaceVariant">
                02 // Course
              </label>
              <Picker
                placeholder="Select a course…"
                value={courseId}
                onChange={(v) => {
                  setCourseId(v);
                  setScores({});
                }}
                options={shownCourses.map((c) => ({ value: c.id, label: `${c.code} : ${c.title} : ${c.lecturer?.name ?? "Unassigned"}` }))}
              />
            </div>

            {course && rubric && (
              <>
                <div>
                  <p className="mb-4 font-label-caps text-label-caps uppercase tracking-wider text-onSurfaceVariant">
                    03 // {rubric.name}
                  </p>
                  <div className="flex flex-col gap-6 border-t border-ink/10">
                    {rubric.criteria.map((c) => (
                      <div key={c.key} className="rule-b flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-body-md font-medium text-onSurface">{c.label}</p>
                          <p className="font-mono-label text-mono-label text-onSurfaceVariant">1 = poor · 5 = excellent</p>
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setScores((s) => ({ ...s, [c.key]: n }))}
                              className={`h-10 w-10 border font-mono-label text-mono-label transition-colors ${
                                scores[c.key] === n
                                  ? "border-ink bg-ink text-white"
                                  : "border-ink/20 text-onSurfaceVariant hover:border-ink"
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-label-caps uppercase tracking-wider text-onSurfaceVariant">
                    04 // Comment (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Anything the department should know…"
                    className="input-minimal min-h-[120px] w-full resize-none font-body-md text-body-md"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-ink px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit Evaluation"}
                </button>
              </>
            )}

            {course && !rubric && (
              <p className="font-body-md text-body-md text-onSurfaceVariant">
                No scoring rubric is configured yet : ask an administrator.
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}