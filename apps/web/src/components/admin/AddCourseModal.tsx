"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { api, getToken } from "@/lib/api";
import { toast } from "@/lib/toast";

interface Department {
  id: string;
  name: string;
  faculty: string | null;
}

interface Lecturer {
  id: string;
  name: string;
  email: string;
  departmentId: string | null;
  department?: { id: string; name: string; faculty: string | null } | null;
}

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultFaculty?: string;
}

const DEFAULT_FACULTIES = [
  "Clinical Sciences",
  "Health Professions",
  "Computing & Informatics",
  "Engineering",
  "Management Sciences",
  "Social Sciences",
  "Law",
  "Pharmacy",
  "Science",
];

const SEMESTERS = [
  "2025/2026 · First Semester",
  "2025/2026 · Second Semester",
  "2026/2027 · First Semester",
  "2026/2027 · Second Semester",
];

export function AddCourseModal({
  isOpen,
  onClose,
  onSuccess,
  defaultFaculty,
}: AddCourseModalProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>(defaultFaculty ?? "");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [semester, setSemester] = useState<string>(SEMESTERS[0]);
  const [credits, setCredits] = useState<number>(3);
  const [lecturerId, setLecturerId] = useState<string>("");
  const [customLecturer, setCustomLecturer] = useState<string>("");
  const [syllabus, setSyllabus] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (defaultFaculty) {
      setSelectedFaculty(defaultFaculty);
    }

    async function loadMeta() {
      try {
        const [deps, lecs] = await Promise.all([
          api<Department[]>("/departments", { token: getToken(), cache: "no-store" }),
          api<Lecturer[]>("/courses/lecturers", { token: getToken(), cache: "no-store" }),
        ]);
        setDepartments(deps);
        setLecturers(lecs);
      } catch {
        // Silently handle meta fetch fallback
      }
    }

    void loadMeta();
  }, [isOpen, defaultFaculty]);

  if (!isOpen) return null;

  // Filter departments based on selected faculty if one is selected
  const filteredDepartments = selectedFaculty
    ? departments.filter((d) => d.faculty?.toLowerCase() === selectedFaculty.toLowerCase())
    : departments;

  // Filter lecturers based on selected faculty/department if applicable
  const filteredLecturers = selectedFaculty
    ? lecturers.filter((l) => l.department?.faculty?.toLowerCase() === selectedFaculty.toLowerCase())
    : lecturers;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter a course code (e.g. ANA201).");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a course title.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        title: title.trim(),
        departmentId: departmentId || undefined,
        lecturerId: lecturerId || undefined,
        lecturerName: customLecturer.trim() || undefined,
        semester: semester || undefined,
        credits: Number(credits) || 3,
        syllabus: syllabus
          ? syllabus
              .split(/[,;\n]/)
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      };

      await api("/courses", {
        method: "POST",
        body: JSON.stringify(payload),
        token: getToken(),
      });

      toast(`Course ${payload.code} created successfully.`);
      // Reset form fields
      setCode("");
      setTitle("");
      setSyllabus("");
      setCustomLecturer("");
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add course");
    } finally {
      setSubmitting(false);
    }
  }

  // Determine available faculties from loaded departments or fallback list
  const availableFaculties = Array.from(
    new Set([
      ...DEFAULT_FACULTIES,
      ...departments.map((d) => d.faculty).filter((f): f is string => Boolean(f)),
    ]),
  ).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-border-subtle bg-white p-6 shadow-2xl transition-all my-8">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border-subtle pb-4">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-primary">
              Curriculum Administration
            </span>
            <h2 className="mt-0.5 font-montserrat text-lg font-bold text-navy">
              Add New Course
            </h2>
            <p className="text-xs text-text-secondary">
              Register an official UNILAG course under a specific faculty and department.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-soft hover:bg-slate-100 hover:text-navy transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Course Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Faculty Selection */}
          <div>
            <label className="block font-bold text-navy mb-1">
              Faculty <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value);
                setDepartmentId(""); // reset department when faculty changes
              }}
              className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs font-semibold text-navy outline-none focus:border-primary"
            >
              <option value="">Select Faculty...</option>
              {availableFaculties.map((fac) => (
                <option key={fac} value={fac}>
                  Faculty of {fac}
                </option>
              ))}
            </select>
          </div>

          {/* Department Selection */}
          <div>
            <label className="block font-bold text-navy mb-1">
              Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs font-semibold text-navy outline-none focus:border-primary"
            >
              <option value="">
                {selectedFaculty ? `Select Department in ${selectedFaculty}...` : "Select Department..."}
              </option>
              {filteredDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.faculty && !selectedFaculty ? `(${d.faculty})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Code & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-navy mb-1">
                Course Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. MED201"
                required
                className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 font-mono text-xs font-bold text-navy placeholder-text-soft outline-none focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-navy mb-1">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Anatomy & Physiology"
                required
                className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs font-semibold text-navy placeholder-text-soft outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Semester & Credits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-navy mb-1">
                Academic Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs font-semibold text-navy outline-none focus:border-primary"
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-navy mb-1">
                Credit Units
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs font-semibold text-navy outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Assigned Lecturer */}
          <div>
            <label className="block font-bold text-navy mb-1">
              Assigned Lecturer / Course Lead
            </label>
            <select
              value={lecturerId}
              onChange={(e) => {
                setLecturerId(e.target.value);
                if (e.target.value) setCustomLecturer("");
              }}
              className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs font-semibold text-navy outline-none focus:border-primary"
            >
              <option value="">Select Faculty Lecturer (Optional)...</option>
              {filteredLecturers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.department?.name ? `(${l.department.name})` : ""}
                </option>
              ))}
            </select>
            {!lecturerId && (
              <input
                type="text"
                value={customLecturer}
                onChange={(e) => setCustomLecturer(e.target.value)}
                placeholder="Or type lecturer name if not listed (e.g. Dr. K. Adeleke)"
                className="mt-1.5 w-full rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs text-navy placeholder-text-soft outline-none focus:border-primary"
              />
            )}
          </div>

          {/* Syllabus Outline */}
          <div>
            <label className="block font-bold text-navy mb-1">
              Syllabus Outline / Core Modules
            </label>
            <textarea
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              rows={2}
              placeholder="Comma-separated topics (e.g. Cell Structure, Genetics, Metabolism, Lab Practical)"
              className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs text-navy placeholder-text-soft outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border-subtle bg-white px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary-green px-5 py-2 text-xs font-semibold disabled:opacity-50"
            >
              {submitting ? "Registering Course…" : "+ Add Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
