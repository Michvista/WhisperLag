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

interface Rubric {
  id: string;
  name: string;
  criteria: { key: string; label: string; weight: number }[];
}

interface Department {
  id: string;
  name: string;
  faculty?: string;
}

const LECTURER_CRITERIA = [
  {
    key: "clarity",
    label: "Lecture Clarity & Teaching Style",
    desc: "Explains complex concepts clearly, uses relevant examples, and maintains structured pacing.",
  },
  {
    key: "punctuality",
    label: "Punctuality & Lecture Consistency",
    desc: "Arrives on time, honors class schedule, and completes syllabus requirements.",
  },
  {
    key: "engagement",
    label: "Student Engagement & Classroom Climate",
    desc: "Encourages questions, fosters active discussion, and treats students respectfully.",
  },
  {
    key: "fairness",
    label: "Assessment Fairness & Grading",
    desc: "Sets transparent examination expectations, grades objectively, and provides timely feedback.",
  },
  {
    key: "expertise",
    label: "Accessibility & Academic Support",
    desc: "Available during office hours or consultation, approachable for academic guidance.",
  },
];

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export default function LecturerEvalPage() {
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
        toast("Failed to load evaluation resources", "error");
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
      toast("Please select a course and lecturer.", "error");
      return;
    }

    const missingKeys = LECTURER_CRITERIA.filter((c) => !scores[c.key]);
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
      toast("Lecturer evaluation submitted anonymously!");
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
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Student Voice & Quality Assurance
            </span>
            <h1 className="mt-1 font-montserrat text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Lecturer Evaluation
            </h1>
            <p className="mt-1 text-xs text-text-secondary">
              Provide anonymous, constructive feedback on teaching methods, clarity, and academic delivery.
            </p>
          </div>
          <Link href="/evaluations" className="text-xs font-semibold text-secondary hover:underline">
            ‹ All Evaluations
          </Link>
        </div>

        {/* Security & Confidentiality Notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-green-tint/50 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
            <Icon name="verified" size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-montserrat text-xs font-bold text-navy">100% Anonymous & Aggregated</h3>
            <p className="mt-0.5 text-[11px] text-text-secondary leading-relaxed">
              Lecturers and department heads only see aggregated ratings and anonymized constructive summaries. Your identity is never stored.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-border-subtle bg-white p-8 text-center shadow-card space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-tint text-primary">
              <Icon name="check" size={28} className="text-primary" />
            </div>
            <h2 className="font-montserrat text-lg font-bold text-navy">Evaluation Submitted!</h2>
            <p className="mx-auto max-w-md text-xs text-text-secondary leading-relaxed">
              Thank you for helping improve academic standards at UNILAG. Your evaluation has been securely recorded.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setSubmitted(false)}
                className="rounded-xl border border-border-subtle bg-white px-5 py-2.5 text-xs font-bold text-navy hover:bg-slate-50 transition-colors"
              >
                Evaluate Another Lecturer
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
            {/* Step 1: Selection */}
            <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-card space-y-4">
              <h2 className="font-montserrat text-sm font-bold uppercase tracking-wider text-navy">
                01. Select Course & Lecturer
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
                    Course & Lecturer *
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    required
                    className="wl-input text-xs"
                    disabled={loading}
                  >
                    <option value="">Select a course / lecturer…</option>
                    {filteredCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}: {c.title} — {c.lecturer?.name || "Faculty Lecturer"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedCourse && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-blue-tint bg-blue-tint/30 p-3 text-xs">
                  <Icon name="school" size={18} className="text-secondary shrink-0" />
                  <div>
                    <span className="font-bold text-navy">Assigned Lecturer:</span>{" "}
                    <span className="text-secondary font-semibold">
                      {selectedCourse.lecturer?.name || "Department Faculty Member"}
                    </span>{" "}
                    <span className="text-text-soft">({selectedCourse.code})</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Scoring Criteria */}
            <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h2 className="font-montserrat text-sm font-bold uppercase tracking-wider text-navy">
                  02. Performance Assessment
                </h2>
                <span className="text-[11px] text-text-soft">1 = Poor · 5 = Excellent</span>
              </div>

              <div className="space-y-5">
                {LECTURER_CRITERIA.map((criterion, idx) => {
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
                          <span className="shrink-0 rounded-full bg-green-tint px-2 py-0.5 text-[10px] font-bold text-primary">
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
                                  ? "bg-primary text-white shadow-sm ring-2 ring-primary/20"
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

            {/* Step 3: Constructive Written Feedback */}
            <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-card space-y-3">
              <h2 className="font-montserrat text-sm font-bold uppercase tracking-wider text-navy">
                03. Constructive Comments (Optional)
              </h2>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share specific commendations or constructive recommendations for this lecturer's teaching style..."
                className="wl-input resize-none text-xs"
              />
              <p className="text-[11px] text-text-soft">
                Refrain from including personal identifiable information in your remarks.
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting || !courseId}
              className="btn-primary-green w-full py-3.5 text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? "Submitting Evaluation…" : "Submit Confidential Lecturer Evaluation →"}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
