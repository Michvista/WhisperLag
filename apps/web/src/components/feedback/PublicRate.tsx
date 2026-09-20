"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Picker } from "@/components/ui/Picker";

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

  const shownCourses = deptId
      ? (courses ?? []).filter((c) => c.department?.id === deptId)
      : (courses ?? []);
  const course = shownCourses.find((c) => c.id === courseId) ?? null;

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
      <div className="space-y-2">
        <h3 className="font-montserrat text-sm font-extrabold text-[#10253A]">Rate a Course</h3>
        <p className="text-xs font-bold text-[#009A44]">
          ✓ Thanks! Your course evaluation was submitted anonymously.
        </p>
        <button
          onClick={() => {
            setDone(false);
            setCourseId("");
            setScores({});
          }}
          className="text-xs font-extrabold text-[#2C7DA0] hover:underline"
        >
          Rate another course
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-montserrat text-sm font-extrabold text-[#10253A]">
        Rate a Course
      </h3>
      <p className="mt-1 text-xs text-[#60758C]">
        Confidential rating for teaching quality and course delivery.
      </p>

      <div className="mt-3 space-y-2.5">
        <select
          value={deptId}
          onChange={(e) => {
            setDeptId(e.target.value);
            setCourseId("");
            setScores({});
          }}
          className="wl-input text-xs"
        >
          <option value="">All faculties &amp; departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <div>
          <Picker
            placeholder="Select course to rate…"
            value={courseId}
            onChange={(v) => {
              setCourseId(v);
              setScores({});
            }}
            options={shownCourses.map((c) => ({ value: c.id, label: `${c.code} — ${c.title} (${c.lecturer?.name ?? ""})` }))}
          />
        </div>
      </div>

      {course && (
        <div className="mt-4 space-y-3 rounded-2xl border border-[#DCE3E7] bg-[#F9FBFA] p-3.5">
          {rubric.criteria.map((c) => (
            <div key={c.key} className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#10253A]">{c.label}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setScores((s) => ({ ...s, [c.key]: n }))}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-extrabold transition-all ${
                      scores[c.key] === n
                        ? "bg-[#009A44] text-white shadow-xs"
                        : "border border-[#DCE3E7] bg-white text-[#10253A] hover:border-[#009A44]"
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
            className="btn-primary-green w-full py-2 text-xs font-extrabold"
          >
            {busy ? "Submitting…" : "Submit rating"}
          </button>
        </div>
      )}
    </div>
  );
}