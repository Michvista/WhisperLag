"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/ui/Icon";
import { toast } from "@/lib/toast";
import { api } from "@/lib/api";

interface Course {
  id: string;
  code: string;
  title: string;
  department: { id: string; name: string; faculty?: string } | null;
  lecturer: { id: string; name: string } | null;
}

interface Department {
  id: string;
  name: string;
  faculty?: string;
}

interface Rubric {
  id: string;
  name: string;
  criteria: { key: string; label: string; weight: number }[];
}

const COURSE_CRITERIA = [
  {
    key: "curriculum",
    label: "Syllabus Coverage & Depth",
    desc: "Course outline was comprehensive, modern, and covered according to academic calendar.",
  },
  {
    key: "resources",
    label: "Learning Materials & Resources",
    desc: "Lecture notes, reference textbooks, slides, and digital materials were accessible and useful.",
  },
  {
    key: "practical",
    label: "Practical / Lab / Real-world Application",
    desc: "Assignments and practical sessions adequately reinforced theoretical coursework.",
  },
  {
    key: "workload",
    label: "Workload & Pacing",
    desc: "Appropriate pace of curriculum delivery without overwhelming assignment clustering.",
  },
  {
    key: "clarity",
    label: "Learning Outcomes & Clarity",
    desc: "Course expectations and assessment criteria were clearly articulated from the start.",
  },
];

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export default function CourseEvalPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [rubric, setRubric] = useState<Rubric | null>(null);

  const [deptId, setDeptId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [deps, cs, rs] = await Promise.all([
          api<Department[]>("/departments/public", { cache: "no-store" }).catch(() => []),
          api<Course[]>("/courses/public", { cache: "no-store" }).catch(() => []),
          api<Rubric[]>("/rubrics/public", { cache: "no-store" }).catch(() => []),
        ]);
        setDepartments(deps ?? []);
        setCourses(cs ?? []);
        setRubric(rs?.[0] ?? null);
      } catch {
        toast("Failed to load course evaluation resources", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredCourses = deptId
    ? courses.filter((c) => c.department?.id === deptId)
    : courses;

  const selectedCourse = courses.find((c) => c.id === courseId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse) {
      toast("Please select a course to evaluate.", "error");
      return;
    }

    const missingKeys = COURSE_CRITERIA.filter((c) => !scores[c.key]);
    if (missingKeys.length > 0) {
      toast(`Please rate all criteria (${missingKeys[0].label} is missing).`, "error");
      return;
    }

    setSubmitting(true);
    try {
      await api("/evaluations/public", {
        method: "POST",
        body: JSON.stringify({
          courseId: selectedCourse.id,
          lecturerId: selectedCourse.lecturer?.id || "unassigned",
          rubricId: rubric?.id || "default",
          scores,
          comment: comment.trim() || undefined,
        }),
      });

      setSubmitted(true);
      setCourseId("");
      setScores({});
      setComment("");
      toast("Course evaluation submitted anonymously!");
    } catch (err: any) {
      toast(err?.message || "Submission failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Curriculum & Academic Quality
            </span>
            <h1 className="mt-1 font-montserrat text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Course Evaluation
            </h1>
            <p className="mt-1 text-xs text-text-secondary">
              Evaluate course curriculum, syllabus pacing, learning materials, and practical alignment.
            </p>
          </div>
          <Link href="/evaluations" className="text-xs font-semibold text-secondary hover:underline">
            ‹ All Evaluations
          </Link>
        </div>

        {/* Anonymity Banner */}
        <div className="flex items-start gap-3 rounded-2xl border border-secondary/20 bg-blue-tint/50 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-white">
            <Icon name="verified" size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-montserrat text-xs font-bold text-navy">Confidential Academic Review</h3>
            <p className="mt-0.5 text-[11px] text-text-secondary leading-relaxed">
              Course feedback helps curriculum boards and department committees improve course content for future academic sessions.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-border-subtle bg-white p-8 text-center shadow-card space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-tint text-secondary">
              <Icon name="check" size={28} className="text-secondary" />
            </div>
            <h2 className="font-montserrat text-lg font-bold text-navy">Course Evaluation Submitted!</h2>
            <p className="mx-auto max-w-md text-xs text-text-secondary leading-relaxed">
              Your feedback on this course has been recorded and will be factored into the department syllabus review.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setSubmitted(false)}
                className="rounded-xl border border-border-subtle bg-white px-5 py-2.5 text-xs font-bold text-navy hover:bg-slate-50 transition-colors"
              >
                Evaluate Another Course
              </button>
              <Link
                href="/evaluations"
                className="btn-primary-green px-5 py-2.5 text-xs font-bold"
              >
                Back to Evaluations Hub
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Course Selection */}
            <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-card space-y-4">
              <h2 className="font-montserrat text-sm font-bold uppercase tracking-wider text-navy">
                01. Select Course to Evaluate
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Department Filter (Optional)
                  </label>
                  <select
                    value={deptId}
                    onChange={(e) => {
                      setDeptId(e.target.value);
                      setCourseId("");
                    }}
                    className="wl-input text-xs"
                    disabled={loading}
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.faculty ? `${d.faculty} — ` : ""}{d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Course Code & Title *
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    required
                    className="wl-input text-xs"
                    disabled={loading}
                  >
                    <option value="">Select a course…</option>
                    {filteredCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}: {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Course Rubric Criteria */}
            <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h2 className="font-montserrat text-sm font-bold uppercase tracking-wider text-navy">
                  02. Curriculum & Delivery Evaluation
                </h2>
                <span className="text-[11px] text-text-soft">1 = Poor · 5 = Excellent</span>
              </div>

              <div className="space-y-5">
                {COURSE_CRITERIA.map((criterion, idx) => {
                  const currentVal = scores[criterion.key];
                  return (
                    <div
                      key={criterion.key}
                      className="space-y-2 border-b border-border-subtle pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-navy">
                            {idx + 1}. {criterion.label}
                          </div>
                          <p className="text-[11px] text-text-secondary mt-0.5">
                            {criterion.desc}
                          </p>
                        </div>
                        {currentVal && (
                          <span className="shrink-0 rounded-full bg-blue-tint px-2 py-0.5 text-[10px] font-bold text-secondary">
                            {RATING_LABELS[currentVal]}
                          </span>
                        )}
                      </div>

                      {/* Rating scale 1-5 */}
                      <div className="flex items-center gap-2 pt-1">
                        {[1, 2, 3, 4, 5].map((num) => {
                          const isSelected = currentVal === num;
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() =>
                                setScores((prev) => ({ ...prev, [criterion.key]: num }))
                              }
                              className={`flex h-10 flex-1 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                                isSelected
                                  ? "bg-secondary text-white shadow-sm ring-2 ring-secondary/20"
                                  : "border border-border-subtle bg-slate-50 text-navy hover:bg-slate-100"
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Qualitative Written Review */}
            <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-card space-y-3">
              <h2 className="font-montserrat text-sm font-bold uppercase tracking-wider text-navy">
                03. Suggestions for Course Improvement (Optional)
              </h2>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="What topics or resources could make this course better for students next semester?"
                className="wl-input resize-none text-xs"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting || !courseId}
              className="btn-secondary-blue w-full py-3.5 text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? "Submitting Evaluation…" : "Submit Course Evaluation →"}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
