"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingBlock } from "@/components/ui/States";
import { RoleGate } from "@/components/ui/RoleGate";
import { ROLES } from "@whisperlag/shared";
import { api, getToken } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Icon } from "@/components/ui/Icon";

interface SisStatus {
  configured: boolean;
  endpoint: string | null;
  courses: number;
  departments: number;
  status: string;
}

interface SyncedCourse {
  id: string;
  code: string;
  title: string;
  department: { id: string; name: string } | null;
  lecturer: { id: string; name: string } | null;
}

interface Department {
  id: string;
  name: string;
}

interface Row {
  key: number;
  code: string;
  title: string;
  department: string;
  lecturer: string;
  semester: string;
  credits: string;
  syllabus: string;
}

const EXAMPLE_PAYLOAD = JSON.stringify(
  {
    courses: [
      {
        code: "CSC301",
        title: "Operating Systems",
        department: "Computer Science",
        lecturer: "Dr. Ada Obi",
        semester: "2025/2026 · Second",
        credits: 4,
        syllabus: ["Processes & Threads", "Memory Management", "File Systems", "Scheduling"],
      },
    ],
  },
  null,
  2,
);

function emptyRow(): Row {
  return { key: Date.now() + Math.random(), code: "", title: "", department: "", lecturer: "", semester: "", credits: "", syllabus: "" };
}

export default function IntegrationsPage() {
  const [status, setStatus] = useState<SisStatus | null>(null);
  const [courses, setCourses] = useState<SyncedCourse[] | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [showJson, setShowJson] = useState(false);
  const [payload, setPayload] = useState(EXAMPLE_PAYLOAD);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function loadStatus() {
    setLoading(true);
    setError(null);
    try {
      const [st, cs, deps] = await Promise.all([
        api<SisStatus>("/integrations/sis/status", { token: getToken(), cache: "no-store" }),
        api<SyncedCourse[]>("/courses", { token: getToken(), cache: "no-store" }),
        api<Department[]>("/departments", { token: getToken(), cache: "no-store" }),
      ]);
      setStatus(st);
      setCourses(cs);
      setDepartments(deps);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((r) => r.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  async function runFormImport() {
    const valid = rows.filter((r) => r.code.trim() && r.title.trim());
    if (valid.length === 0) {
      toast("Add at least one course with a code and title.", "error");
      return;
    }
    await doImport({
      courses: valid.map((r) => ({
        code: r.code.trim(),
        title: r.title.trim(),
        department: r.department || undefined,
        lecturer: r.lecturer || undefined,
        semester: r.semester || undefined,
        credits: r.credits ? Number(r.credits) : undefined,
        syllabus: r.syllabus ? r.syllabus.split(",").map((s) => s.trim()).filter(Boolean) : [],
      })),
    });
  }

  async function runJsonImport() {
    try {
      await doImport(JSON.parse(payload) as { courses: unknown[] });
    } catch (e) {
      setError(e instanceof Error ? "That JSON doesn't parse." : "Invalid payload");
      toast("That JSON doesn't parse.", "error");
    }
  }

  async function doImport(body: { courses: unknown[] }) {
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const res = await api<{ imported: number; created: number; updated: number }>("/integrations/sis/import", {
        method: "POST",
        body: JSON.stringify(body),
        token: getToken(),
      });
      setResult(`Imported ${res.imported} course${res.imported === 1 ? "" : "s"}: ${res.created} created, ${res.updated} updated.`);
      toast(`Import complete: ${res.created} created, ${res.updated} updated.`);
      await loadStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
      toast(e instanceof Error ? e.message : "Import failed", "error");
    } finally {
      setImporting(false);
    }
  }

  return (
    <RoleGate minRole={ROLES.ADMIN}>
      <AppShell>
        <div className="py-6 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="border-b border-border-subtle pb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              University Systems Sync
            </span>
            <h1 className="mt-1 font-montserrat text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              SIS / LMS Integration
            </h1>
            <p className="mt-2 max-w-3xl text-xs sm:text-sm leading-relaxed text-text-secondary">
              <strong className="font-semibold text-navy">SIS (Student Information System)</strong> is the university&apos;s official record of students, courses and departments. <strong className="font-semibold text-navy">LMS (Learning Management System)</strong> is where course materials and assessments live. WhisperLag connects with these records so evaluations and routing use official data without manual entry.
            </p>
          </div>

          {loading ? (
            <LoadingBlock label="Checking connector…" />
          ) : (
            status && (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Left: Status & Synced Courses (5 cols) */}
                <div className="space-y-6 lg:col-span-5">
                  {/* Connection Status Card */}
                  <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card space-y-4">
                    <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                      Connection Status
                    </h2>

                    <div className="divide-y divide-border-subtle">
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-xs text-text-secondary">Sync Method</span>
                        <span className="rounded-md bg-green-tint px-2 py-0.5 text-xs font-bold text-primary">
                          {status.configured ? "Automatic feed" : "Manual / Form Import"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-xs text-text-secondary">Source Feed</span>
                        <span className="font-mono text-xs font-semibold text-navy">
                          {status.endpoint ?? "manual import"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-xs text-text-secondary">Courses Synced</span>
                        <span className="font-montserrat text-sm font-bold text-navy">
                          {status.courses}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-xs text-text-secondary">Departments</span>
                        <span className="font-montserrat text-sm font-bold text-navy">
                          {status.departments}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Synced Courses Card */}
                  <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                      <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                        Synced Courses ({courses?.length ?? 0})
                      </h2>
                    </div>

                    <div className="no-scrollbar mt-3 max-h-80 overflow-y-auto divide-y divide-border-subtle">
                      {(courses ?? []).map((c, i) => (
                        <div key={c.id} className="flex items-start gap-3 py-2.5">
                          <span className="font-mono text-xs font-bold text-slate-400 w-6">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-navy">{c.title}</p>
                            <p className="text-[11px] text-text-secondary">
                              <span className="font-semibold text-primary">{c.code}</span> · {c.department?.name ?? "Department"} · {c.lecturer?.name ?? "Unassigned"}
                            </p>
                          </div>
                        </div>
                      ))}
                      {courses !== null && courses.length === 0 && (
                        <p className="py-4 text-center text-xs text-text-secondary">
                          No courses synced yet. Add courses using the import form.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Importer Form / JSON (7 cols) */}
                <div className="rounded-xl border border-border-subtle bg-white p-5 sm:p-6 shadow-card space-y-6 lg:col-span-7">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                    <div>
                      <h2 className="font-montserrat text-base font-bold text-navy">
                        Add &amp; Sync Courses
                      </h2>
                      <p className="text-xs text-text-secondary">
                        Insert new course units into the active institutional catalog.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowJson((s) => !s)}
                      className="rounded-md border border-border-subtle bg-white px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-slate-50"
                    >
                      {showJson ? "Use Form" : "Paste JSON"}
                    </button>
                  </div>

                  {showJson ? (
                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-text-secondary">
                        Paste a bulk SIS / LMS JSON export:
                      </label>
                      <textarea
                        value={payload}
                        onChange={(e) => setPayload(e.target.value)}
                        spellCheck={false}
                        rows={10}
                        className="wl-input font-mono text-xs leading-relaxed"
                      />
                      <button
                        onClick={runJsonImport}
                        disabled={importing}
                        className="btn-primary-green w-full sm:w-auto py-2.5 px-6 text-xs font-semibold disabled:opacity-50"
                      >
                        {importing ? "Importing…" : "Import Courses from JSON"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rows.map((row, idx) => (
                        <div
                          key={row.key}
                          className="rounded-lg border border-border-subtle bg-slate-50/60 p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-slate-500">
                              Course #{idx + 1}
                            </span>
                            {rows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))}
                                className="text-xs text-error hover:underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-text-secondary mb-1">
                                Course Code *
                              </label>
                              <input
                                value={row.code}
                                onChange={(e) => updateRow(row.key, { code: e.target.value })}
                                placeholder="e.g. CSC301"
                                className="wl-input text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-text-secondary mb-1">
                                Course Title *
                              </label>
                              <input
                                value={row.title}
                                onChange={(e) => updateRow(row.key, { title: e.target.value })}
                                placeholder="e.g. Operating Systems"
                                className="wl-input text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-text-secondary mb-1">
                                Department
                              </label>
                              <select
                                value={row.department}
                                onChange={(e) => updateRow(row.key, { department: e.target.value })}
                                className="wl-input text-xs cursor-pointer"
                              >
                                <option value="">Select Department…</option>
                                {departments.map((d) => (
                                  <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-text-secondary mb-1">
                                Lecturer Name
                              </label>
                              <input
                                value={row.lecturer}
                                onChange={(e) => updateRow(row.key, { lecturer: e.target.value })}
                                placeholder="e.g. Prof. Grace Adeyemi"
                                className="wl-input text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-text-secondary mb-1">
                                Semester
                              </label>
                              <input
                                value={row.semester}
                                onChange={(e) => updateRow(row.key, { semester: e.target.value })}
                                placeholder="e.g. 2025/2026 · First"
                                className="wl-input text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-text-secondary mb-1">
                                Units / Credits
                              </label>
                              <input
                                value={row.credits}
                                onChange={(e) => updateRow(row.key, { credits: e.target.value })}
                                placeholder="3"
                                type="number"
                                min={1}
                                className="wl-input text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-text-secondary mb-1">
                              Syllabus Topics (Optional, comma-separated)
                            </label>
                            <input
                              value={row.syllabus}
                              onChange={(e) => updateRow(row.key, { syllabus: e.target.value })}
                              placeholder="e.g. Memory Management, File Systems, Virtualization"
                              className="wl-input text-xs"
                            />
                          </div>
                        </div>
                      ))}

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setRows((r) => [...r, emptyRow()])}
                          className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-white px-3.5 py-2 text-xs font-semibold text-navy hover:bg-slate-50"
                        >
                          <Icon name="add" size={15} /> Add Another Course
                        </button>

                        <button
                          onClick={runFormImport}
                          disabled={importing}
                          className="btn-primary-green px-5 py-2 text-xs font-semibold disabled:opacity-50"
                        >
                          {importing ? "Importing…" : "Save & Sync Courses"}
                        </button>
                      </div>

                      {result && (
                        <div className="rounded-lg border border-green-tint bg-green-tint p-3 text-xs font-semibold text-primary">
                          ✓ {result}
                        </div>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-error">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </AppShell>
    </RoleGate>
  );
}