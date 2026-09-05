"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
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
 * Public, no-login course rating widget for the whisper page. Students pick
 * their department first, then the courses under it.
 */
export function PublicRate() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptId, setDeptId] = useState("");
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [courseId, setCourseId] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    Promise.all([
      api<Department[]>("/departments/public", { cache: "no-store" }),
      api<Course[]>("/courses/public", { cache: "no-store" }),
      api<Rubric[]>("/rubrics/public", { cache: "no-store" }),
    ])
      .then(([deps, cs, rs]) => {
        setDepartments(deps);
        setCourses(cs.filter((c) => Boolean(c.lecturer?.id)));
        setRubric(rs[0] ?? null);
      })
      .catch(() => setCourses([]));
  }, []);

  const deptCourses = (courses ?? []).filter((c) => c.department?.id === deptId);
  const course = deptCourses.find((c) => c.id === courseId) ?? null;

  async function submit() {
    if (!course || !rubric) return;
    const keys = rubric.criteria.map((c) => c.key);
    if (keys.some((k) => !scores[k])) {
      toast("Rate every criterion first.", "error");
      return;
    }
    setBusy(true);
    try {
      await api("/evaluations/public", {
        method: "POST",
        body: JSON.stringify({
          courseId: course.id,
          lecturerId: course.lecturer?.id ?? "",
          rubricId: rubric.id,
          scores: Object.fromEntries(keys.map((k) => [k, scores[k]])),
        }),
      });
      toast("Course rating submitted anonymously.");
      setDone(true);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Rating failed", "error");
    } finally {
      setBusy(false);
    }
  }

  if (!courses || courses.length === 0 || !rubric) return null;

  if (done) {
    return (
      <div>
        <h2 className="mb-3 font-display text-headline-md font-semibold text-onSurface">Rate a Course</h2>
        <p className="font-body-sm text-body-sm leading-relaxed text-primary">
          ✓ Thanks — your rating was submitted anonymously.
        </p>
        <button
          onClick={() => {
            setDone(false);
            setCourseId("");
            setScores({});
          }}
          className="mt-3 font-label-caps text-label-caps text-primary hover:underline"
        >
          Rate another course
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 font-display text-headline-md font-semibold text-onSurface">Rate a Course</h2>
      <p className="mb-4 font-body-sm text-body-sm text-onSurfaceVariant">
        Anonymous, no account needed — helps departments improve.
      </p>

      <select
        value={deptId}
        onChange={(e) => {
          setDeptId(e.target.value);
          setCourseId("");
          setScores({});
        }}
        className="input-minimal w-full font-body-md text-body-md text-onSurface"
      >
        <option value="">Select your department…</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>

      {deptId && (
        <select
          value={courseId}
          onChange={(e) => {
            setCourseId(e.target.value);
            setScores({});
          }}
          className="input-minimal mt-4 w-full font-body-md text-body-md text-onSurface"
        >
          <option value="">Select a course…</option>
          {deptCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.title} · {c.lecturer?.name}
            </option>
          ))}
        </select>
      )}

      {course && (
        <div className="mt-5 flex flex-col gap-4">
          {rubric.criteria.map((c) => (
            <div key={c.key} className="flex items-center justify-between gap-3">
              <span className="font-body-sm text-body-sm text-onSurfaceVariant">{c.label}</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setScores((s) => ({ ...s, [c.key]: n }))}
                    className={`h-8 w-8 border font-mono-label text-mono-label transition-colors ${
                      scores[c.key] === n ? "border-ink bg-ink text-white" : "border-ink/20 text-onSurfaceVariant hover:border-ink"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={submit}
            disabled={busy}
            className="mt-2 border border-ink px-4 py-2 font-label-caps text-label-caps uppercase tracking-wider transition-colors hover:bg-surface-variant disabled:opacity-40"
          >
            {busy ? "Submitting…" : "Submit rating"}
          </button>
        </div>
      )}
    </div>
  );
}