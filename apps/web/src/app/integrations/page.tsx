"use client";
import { Icon } from "@/components/ui/Icon";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingBlock } from "@/components/ui/States";
import { RoleGate } from "@/components/ui/RoleGate";
import { ROLES } from "@whisperlag/shared";
import { api, getToken } from "@/lib/api";
import { toast } from "@/lib/toast";

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
  return { key: Date.now(), code: "", title: "", department: "", lecturer: "", semester: "", credits: "", syllabus: "" };
}

/** SIS / LMS integration console (admin) : friendly form importer. */
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
        syllabus: r.syllabus.split(",").map((s) => s.trim()).filter(Boolean),
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
      setResult(`Imported ${res.imported} course${res.imported === 1 ? "" : "s"} : ${res.created} created, ${res.updated} updated.`);
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
        <header className="rule-b mb-12 pb-8">
          <h1 className="mb-2 font-display text-headline-lg font-semibold text-onSurface">SIS / LMS Integration</h1>
          <p className="max-w-2xl font-body-md text-body-md text-onSurfaceVariant">
            <span className="font-medium text-onSurface">SIS</span> is the
            university&apos;s official record of students, courses and departments.{" "}
            <span className="font-medium text-onSurface">LMS</span> is where courses are
            taught online. WhisperLag reads these records so evaluations, reports and
            department routing all use the official course list — nothing is typed in by
            hand. Add courses in the form below, paste a bigger export, or connect a live
            feed.
          </p>
        </header>

        {loading ? (
          <LoadingBlock label="Checking connector…" />
        ) : (
          status && (
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-[40%_60%]">
              {/* Left: status + synced */}
              <div>
                <h2 className="rule-b mb-6 font-label-caps text-label-caps uppercase tracking-widest text-onSurface">
                  Connection Status
                </h2>
                <div className="flex flex-col border-t border-ink/10">
                  <div className="rule-b flex items-center justify-between py-5">
                    <span className="font-body-md text-body-md text-onSurfaceVariant">How courses are added</span>
                    <span
                      className={`px-2 py-1 font-label-caps text-[10px] uppercase tracking-wider ${
                        status.configured ? "bg-primary/10 text-primary" : "bg-tertiary-fixed-dim/20 text-tertiary-container"
                      }`}
                    >
                      {status.configured ? "Automatic feed" : "Typed or pasted"}
                    </span>
                  </div>
                  <div className="rule-b flex items-center justify-between py-5">
                    <span className="font-body-md text-body-md text-onSurfaceVariant">Source</span>
                    <span className="font-mono-label text-mono-label text-onSurface">{status.endpoint ?? "manual import"}</span>
                  </div>
                  <div className="rule-b flex items-center justify-between py-5">
                    <span className="font-body-md text-body-md text-onSurfaceVariant">Courses synced</span>
                    <span className="font-display text-headline-md font-semibold text-onSurface">{status.courses}</span>
                  </div>
                  <div className="flex items-center justify-between py-5">
                    <span className="font-body-md text-body-md text-onSurfaceVariant">Departments</span>
                    <span className="font-display text-headline-md font-semibold text-onSurface">{status.departments}</span>
                  </div>
                </div>

                <h2 className="rule-b mt-10 mb-4 font-label-caps text-label-caps uppercase tracking-widest text-onSurface">
                  Synced Courses
                </h2>
                <div className="no-scrollbar max-h-72 overflow-y-auto border-t border-ink/10">
                  {(courses ?? []).map((c, i) => (
                    <div key={c.id} className="rule-b flex items-center gap-4 py-3">
                      <span className="font-mono-label text-lg font-light text-onSurfaceVariant/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-body-md text-body-md text-onSurface">{c.title}</p>
                        <p className="font-label-caps text-label-caps text-onSurfaceVariant">
                          {c.code} · {c.department?.name ?? ":"} · {c.lecturer?.name ?? "Unassigned"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {courses !== null && courses.length === 0 && (
                    <p className="py-4 font-body-sm text-body-sm text-onSurfaceVariant">
                      No courses synced yet : add one on the right.
                    </p>
                  )}
                </div>
              </div>

              {/* Right: importer */}
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-label-caps text-label-caps uppercase tracking-widest text-onSurface">
                    Add Courses
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowJson((s) => !s)}
                    className="font-label-caps text-label-caps text-primary hover:underline"
                  >
                    {showJson ? "Use the form" : "Paste JSON instead"}
                  </button>
                </div>

                {showJson ? (
                  <div>
                    <label className="mb-2 block font-body-sm text-body-sm text-onSurfaceVariant">
                      Paste a bulk SIS/LMS export (JSON).
                    </label>
                    <textarea
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                      spellCheck={false}
                      className="input-minimal min-h-[220px] w-full resize-none font-mono-label text-mono-label leading-relaxed text-onSurface"
                    />
                    <div className="mt-6">
                      <button
                        onClick={runJsonImport}
                        disabled={importing}
                        className="bg-ink px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary disabled:opacity-60"
                      >
                        {importing ? "Importing…" : "Import Courses"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="rule-b flex flex-wrap items-end gap-3 pb-2 font-label-caps text-label-caps uppercase tracking-wider text-onSurfaceVariant">
                      <span className="w-28">Code *</span>
                      <span className="w-56">Title *</span>
                      <span className="w-44">Department</span>
                      <span className="w-40">Lecturer</span>
                      <span className="w-36">Semester</span>
                      <span className="w-16">Credits</span>
                    </div>

                    {rows.map((row) => (
                      <div key={row.key} className="flex flex-wrap items-center gap-3">
                        <input
                          value={row.code}
                          onChange={(e) => updateRow(row.key, { code: e.target.value })}
                          placeholder="CSC301"
                          className="input-minimal w-28 font-body-sm text-body-sm"
                        />
                        <input
                          value={row.title}
                          onChange={(e) => updateRow(row.key, { title: e.target.value })}
                          placeholder="Operating Systems"
                          className="input-minimal w-56 font-body-sm text-body-sm"
                        />
                        <select
                          value={row.department}
                          onChange={(e) => updateRow(row.key, { department: e.target.value })}
                          className="input-minimal w-44 font-body-sm text-body-sm"
                        >
                          <option value="">Select…</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                        <input
                          value={row.lecturer}
                          onChange={(e) => updateRow(row.key, { lecturer: e.target.value })}
                          placeholder="Dr. Ada Obi"
                          className="input-minimal w-40 font-body-sm text-body-sm"
                        />
                        <input
                          value={row.semester}
                          onChange={(e) => updateRow(row.key, { semester: e.target.value })}
                          placeholder="2025/2026 · Second"
                          className="input-minimal w-36 font-body-sm text-body-sm"
                        />
                        <input
                          value={row.credits}
                          onChange={(e) => updateRow(row.key, { credits: e.target.value })}
                          placeholder="4"
                          type="number"
                          min={1}
                          className="input-minimal w-16 font-body-sm text-body-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))}
                          className="text-onSurfaceVariant transition-colors hover:text-error"
                          aria-label="Remove row"
                        >
                          <Icon name="close" size={20} />
                        </button>
                        <div className="basis-full">
                          <input
                            value={row.syllabus}
                            onChange={(e) => updateRow(row.key, { syllabus: e.target.value })}
                            placeholder="Syllabus topics, comma separated (optional)"
                            className="input-minimal w-full font-body-sm text-body-sm text-onSurfaceVariant"
                          />
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setRows((r) => [...r, emptyRow()])}
                        className="flex items-center gap-2 border border-ink px-4 py-2 font-label-caps text-label-caps uppercase tracking-wider text-onSurface transition-colors hover:bg-surface-variant"
                      >
                        <Icon name="add" size={18} />
                        Add course
                      </button>
                      <button
                        onClick={runFormImport}
                        disabled={importing}
                        className="bg-ink px-8 py-3 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary disabled:opacity-60"
                      >
                        {importing ? "Importing…" : "Import Courses"}
                      </button>
                    </div>

                    {result && <p className="font-mono-label text-mono-label text-primary">{result}</p>}
                  </div>
                )}

                {error && (
                  <p className="mt-4 border border-error-container bg-error-container/30 p-3 font-body-sm text-body-sm text-onErrorContainer">
                    {error}
                  </p>
                )}
              </div>
            </div>
          )
        )}
      </AppShell>
    </RoleGate>
  );
}