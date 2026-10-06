"use client";

import { useEffect, useState, useRef } from "react";
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
  department: { id: string; name: string; faculty?: string } | null;
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

const TEMPLATES: Record<string, string> = {
  nursing: JSON.stringify(
    {
      courses: [
        {
          code: "NSC201",
          title: "Foundations of Nursing Practice",
          department: "Nursing Science",
          lecturer: "Dr. Ada Obi",
          semester: "2025/2026 · First",
          credits: 4,
          syllabus: ["Nursing Process", "Patient Assessment", "Care Planning", "Clinical Skills"],
        },
        {
          code: "NSC301",
          title: "Community Health Nursing",
          department: "Nursing Science",
          lecturer: "Dr. Ada Obi",
          semester: "2025/2026 · Second",
          credits: 4,
          syllabus: ["Community Assessment", "Health Promotion", "Field Clinics"],
        },
      ],
    },
    null,
    2
  ),
  engineering: JSON.stringify(
    {
      courses: [
        {
          code: "CSC201",
          title: "Data Structures & Algorithms",
          department: "Computer Science",
          lecturer: "Prof. O. Balogun",
          semester: "2025/2026 · First",
          credits: 4,
          syllabus: ["Complexity Analysis", "Linked Structures", "Trees & Graphs", "Sorting"],
        },
        {
          code: "EEE301",
          title: "Digital Signal Processing",
          department: "Electrical & Electronics Engineering",
          lecturer: "Dr. E. Okafor",
          semester: "2025/2026 · First",
          credits: 3,
          syllabus: ["Signals & Systems", "Z-Transforms", "Filters"],
        },
        {
          code: "SEN401",
          title: "Systems Modelling & Simulation",
          department: "Systems Engineering",
          lecturer: "Dr. K. Williams",
          semester: "2025/2026 · First",
          credits: 3,
          syllabus: ["System Concepts", "Modelling", "Simulation Tools"],
        },
      ],
    },
    null,
    2
  ),
  business: JSON.stringify(
    {
      courses: [
        {
          code: "BUS202",
          title: "Organisational Behaviour",
          department: "Business Administration",
          lecturer: "Dr. F. Adeleke",
          semester: "2025/2026 · Second",
          credits: 3,
          syllabus: ["Individual Behaviour", "Teams", "Leadership", "Culture"],
        },
        {
          code: "ACC201",
          title: "Financial Accounting",
          department: "Accounting",
          lecturer: "Dr. T. Salami",
          semester: "2025/2026 · First",
          credits: 3,
          syllabus: ["Double Entry", "Final Accounts", "Company Accounts"],
        },
      ],
    },
    null,
    2
  ),
};

function emptyRow(): Row {
  return {
    key: Date.now() + Math.random(),
    code: "",
    title: "",
    department: "",
    lecturer: "",
    semester: "",
    credits: "",
    syllabus: "",
  };
}

export default function IntegrationsPage() {
  const [status, setStatus] = useState<SisStatus | null>(null);
  const [courses, setCourses] = useState<SyncedCourse[] | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [mode, setMode] = useState<"form" | "json">("json");
  const [payload, setPayload] = useState(TEMPLATES.nursing);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const parsed = JSON.parse(payload);
      if (!parsed || !Array.isArray(parsed.courses)) {
        throw new Error("JSON must have a top-level 'courses' array.");
      }
      await doImport(parsed as { courses: unknown[] });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid JSON format";
      setError(msg);
      toast(msg, "error");
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          setPayload(JSON.stringify({ courses: parsed }, null, 2));
        } else if (parsed && typeof parsed === "object" && Array.isArray(parsed.courses)) {
          setPayload(JSON.stringify(parsed, null, 2));
        } else {
          setPayload(text);
        }
        setMode("json");
        toast(`Loaded ${file.name} successfully.`);
      } catch {
        toast("Uploaded file is not valid JSON.", "error");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function exportCurrentRegistry() {
    if (!courses || courses.length === 0) {
      toast("No courses available to export.", "error");
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      institution: "University of Lagos (UNILAG)",
      courses: courses.map((c) => ({
        code: c.code,
        title: c.title,
        department: c.department?.name ?? "General",
        faculty: c.department?.faculty ?? "Unassigned",
        lecturer: c.lecturer?.name ?? "Unassigned",
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `UNILAG_Courses_Registry_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Exported courses registry as JSON.");
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
      setResult(`Import complete: ${res.imported} course${res.imported === 1 ? "" : "s"} processed (${res.created} created, ${res.updated} updated).`);
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
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border-subtle pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                University Systems Sync
              </span>
              <h1 className="mt-1 font-montserrat text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                SIS &amp; LMS Integration
              </h1>
              <p className="mt-1.5 max-w-3xl text-xs text-text-secondary leading-relaxed">
                Connect official course rosters and department registries from the UNILAG Student Portal (SIS) and Moodle (LMS) to power rubric evaluations and automatic feedback routing.
              </p>
            </div>

            <button
              onClick={exportCurrentRegistry}
              className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-white px-3.5 py-2 text-xs font-semibold text-navy hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Icon name="download" size={15} />
              Export Catalog (JSON)
            </button>
          </div>

          {loading ? (
            <LoadingBlock label="Checking integration status…" />
          ) : (
            status && (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Left Column: Status & Synced Courses (5 cols) */}
                <div className="space-y-6 lg:col-span-5">
                  {/* Connection Status Card */}
                  <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card space-y-4">
                    <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                      Sync Status
                    </h2>

                    <div className="divide-y divide-border-subtle">
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-xs text-text-secondary">Sync Method</span>
                        <span className="rounded-md bg-green-tint px-2 py-0.5 text-xs font-bold text-primary">
                          {status.configured ? "Live Automated Feed" : "Manual JSON / Form Sync"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-xs text-text-secondary">Source Feed</span>
                        <span className="font-mono text-xs font-semibold text-navy">
                          {status.endpoint ?? "manual import"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-xs text-text-secondary">Active Courses</span>
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

                  {/* Synced Courses List Card */}
                  <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                      <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                        Synced Courses ({courses?.length ?? 0})
                      </h2>
                    </div>

                    <div className="no-scrollbar mt-3 max-h-80 overflow-y-auto divide-y divide-border-subtle">
                      {(courses ?? []).map((c, i) => (
                        <div key={c.id} className="flex items-start gap-3 py-2.5">
                          <span className="font-mono text-xs font-bold text-slate-400 w-6 mt-0.5">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-navy">{c.title}</p>
                            <p className="text-[11px] text-text-secondary mt-0.5">
                              <span className="font-semibold text-primary">{c.code}</span> · {c.department?.name ?? "Department"} · {c.lecturer?.name ?? "Unassigned"}
                            </p>
                          </div>
                        </div>
                      ))}
                      {courses !== null && courses.length === 0 && (
                        <p className="py-4 text-center text-xs text-text-secondary">
                          No courses synced yet. Import your first JSON dataset.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Importer Form / JSON (7 cols) */}
                <div className="rounded-xl border border-border-subtle bg-white p-5 sm:p-6 shadow-card space-y-6 lg:col-span-7">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4">
                    <div>
                      <h2 className="font-montserrat text-base font-bold text-navy">
                        Import &amp; Sync Courses
                      </h2>
                      <p className="text-xs text-text-secondary">
                        Upload or paste JSON data to synchronize academic courses and lecturer allocations.
                      </p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex rounded-lg border border-border-subtle bg-slate-50 p-0.5">
                      <button
                        type="button"
                        onClick={() => setMode("json")}
                        className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                          mode === "json" ? "bg-white text-primary shadow-2xs font-bold" : "text-text-secondary hover:text-navy"
                        }`}
                      >
                        JSON Importer
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode("form")}
                        className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                          mode === "form" ? "bg-white text-primary shadow-2xs font-bold" : "text-text-secondary hover:text-navy"
                        }`}
                      >
                        Interactive Form
                      </button>
                    </div>
                  </div>

                  {result && (
                    <div className="rounded-lg border border-green-tint bg-green-tint p-3 text-xs font-semibold text-primary flex items-center gap-2">
                      <Icon name="verified" size={16} className="text-primary shrink-0" />
                      <span>{result}</span>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-error flex items-center gap-2">
                      <Icon name="error" size={16} className="text-red-600 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {mode === "json" ? (
                    <div className="space-y-4">
                      {/* Upload & Template Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept=".json,application/json"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-slate-50 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-slate-100 transition-colors"
                          >
                            <Icon name="attachment" size={14} />
                            Upload .JSON File
                          </button>
                        </div>

                        {/* Templates Dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-text-soft">Template:</span>
                          <select
                            onChange={(e) => {
                              const t = TEMPLATES[e.target.value];
                              if (t) setPayload(t);
                            }}
                            className="rounded-md border border-border-subtle bg-white px-2.5 py-1 text-xs text-navy outline-none cursor-pointer"
                          >
                            <option value="nursing">Nursing Science Template</option>
                            <option value="engineering">Engineering Faculty Template</option>
                            <option value="business">Management Sciences Template</option>
                          </select>
                        </div>
                      </div>

                      {/* JSON Editor */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                          Course Payload (JSON Format)
                        </label>
                        <textarea
                          value={payload}
                          onChange={(e) => setPayload(e.target.value)}
                          spellCheck={false}
                          rows={11}
                          className="wl-input font-mono text-xs leading-relaxed"
                          placeholder='{ "courses": [ { "code": "NSC201", "title": "Foundations of Nursing Practice", "department": "Nursing Science" } ] }'
                        />
                      </div>

                      <button
                        onClick={runJsonImport}
                        disabled={importing || !payload.trim()}
                        className="btn-primary-green w-full py-3 text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Icon name="verified" size={15} />
                        {importing ? "Importing & Syncing Courses…" : "Sync Courses from JSON →"}
                      </button>
                    </div>
                  ) : (
                    /* Interactive Form Mode */
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
                                className="text-xs font-semibold text-red-600 hover:underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <input
                              type="text"
                              value={row.code}
                              onChange={(e) => updateRow(row.key, { code: e.target.value })}
                              placeholder="Course code (e.g. NSC201)"
                              className="wl-input text-xs"
                            />
                            <input
                              type="text"
                              value={row.title}
                              onChange={(e) => updateRow(row.key, { title: e.target.value })}
                              placeholder="Course title"
                              className="wl-input text-xs"
                            />
                            <select
                              value={row.department}
                              onChange={(e) => updateRow(row.key, { department: e.target.value })}
                              className="wl-input text-xs"
                            >
                              <option value="">Select Department</option>
                              {departments.map((d) => (
                                <option key={d.id} value={d.name}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={row.lecturer}
                              onChange={(e) => updateRow(row.key, { lecturer: e.target.value })}
                              placeholder="Assigned Lecturer"
                              className="wl-input text-xs"
                            />
                          </div>
                        </div>
                      ))}

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setRows((r) => [...r, emptyRow()])}
                          className="rounded-lg border border-border-subtle bg-white px-3.5 py-2 text-xs font-semibold text-navy hover:bg-slate-50"
                        >
                          + Add Another Course
                        </button>
                        <button
                          type="button"
                          onClick={runFormImport}
                          disabled={importing}
                          className="btn-primary-green px-5 py-2 text-xs font-semibold disabled:opacity-50"
                        >
                          {importing ? "Saving…" : "Save & Sync Courses"}
                        </button>
                      </div>
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