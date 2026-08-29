"use client";

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

const EXAMPLE_PAYLOAD = JSON.stringify(
  {
    courses: [
      { code: "CSC301", title: "Operating Systems", department: "Computer Science", lecturer: "Dr. Ada Obi" },
      { code: "NUR305", title: "Community Health Nursing", department: "Nursing Science", lecturer: "Dr. Ada Obi" },
    ],
  },
  null,
  2,
);

/** SIS / LMS integration console (admin). */
export default function IntegrationsPage() {
  const [status, setStatus] = useState<SisStatus | null>(null);
  const [courses, setCourses] = useState<SyncedCourse[] | null>(null);
  const [payload, setPayload] = useState(EXAMPLE_PAYLOAD);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function loadStatus() {
    setLoading(true);
    setError(null);
    try {
      const [st, cs] = await Promise.all([
        api<SisStatus>("/integrations/sis/status", { token: getToken(), cache: "no-store" }),
        api<SyncedCourse[]>("/courses", { token: getToken(), cache: "no-store" }),
      ]);
      setStatus(st);
      setCourses(cs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  async function runImport() {
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const parsed = JSON.parse(payload) as { courses: { code: string; title: string; department?: string; lecturer?: string }[] };
      const res = await api<{ imported: number; created: number; updated: number }>("/integrations/sis/import", {
        method: "POST",
        body: JSON.stringify(parsed),
        token: getToken(),
      });
      setResult(`Imported ${res.imported} course${res.imported === 1 ? "" : "s"} — ${res.created} created, ${res.updated} updated.`);
      toast(`SIS import complete: ${res.created} created, ${res.updated} updated.`);
      await loadStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid import payload");
      toast(e instanceof Error ? e.message : "Invalid import payload", "error");
    } finally {
      setImporting(false);
    }
  }

  return (
    <RoleGate minRole={ROLES.ADMIN}>
      <AppShell>
        <header className="rule-b mb-12 pb-8">
          <h1 className="mb-2 font-display text-headline-lg font-semibold text-onSurface">SIS / LMS Integration</h1>
          <p className="font-body-md text-body-md text-onSurfaceVariant">
            Sync course data from UNILAG&apos;s Student Information System. When a
            live <span className="font-medium text-onSurface">SIS_API_URL</span> is
            configured the connector runs automatically; otherwise admins import a
            standard SIS export below.
          </p>
        </header>

        {loading ? (
          <LoadingBlock label="Checking connector…" />
        ) : (
          status && (
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-[40%_60%]">
              <div>
                <h2 className="rule-b mb-6 font-label-caps text-label-caps uppercase tracking-widest text-onSurface">
                  Connector Status
                </h2>
                <div className="flex flex-col border-t border-ink/10">
                  <div className="rule-b flex items-center justify-between py-5">
                    <span className="font-body-md text-body-md text-onSurfaceVariant">Mode</span>
                    <span
                      className={`px-2 py-1 font-label-caps text-[10px] uppercase tracking-wider ${
                        status.configured ? "bg-primary/10 text-primary" : "bg-tertiary-fixed-dim/20 text-tertiary-container"
                      }`}
                    >
                      {status.status}
                    </span>
                  </div>
                  <div className="rule-b flex items-center justify-between py-5">
                    <span className="font-body-md text-body-md text-onSurfaceVariant">Endpoint</span>
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
                          {c.code} · {c.department?.name ?? "—"} · {c.lecturer?.name ?? "Unassigned"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {courses !== null && courses.length === 0 && (
                    <p className="py-4 font-body-sm text-body-sm text-onSurfaceVariant">
                      No courses synced yet — import one on the right.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="rule-b mb-6 font-label-caps text-label-caps uppercase tracking-widest text-onSurface">
                  Import SIS Export
                </h2>
                <label className="mb-2 block font-body-sm text-body-sm text-onSurfaceVariant">
                  Paste the SIS course export (JSON). The standard export shape is:
                </label>
                <pre className="mb-4 overflow-x-auto border border-ink/10 bg-surface-container-low p-4 font-mono-label text-mono-label text-onSurface">
{`{
  "courses": [
    { "code": "CSC301", "title": "Operating Systems",
      "department": "Computer Science", "lecturer": "Dr. Ada Obi" }
  ]
}`}
                </pre>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-onSurfaceVariant">
                    Payload
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(EXAMPLE_PAYLOAD);
                      toast("Template copied.");
                    }}
                    className="font-label-caps text-label-caps text-primary hover:underline"
                  >
                    Copy template
                  </button>
                </div>
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  spellCheck={false}
                  className="input-minimal min-h-[200px] w-full resize-none font-mono-label text-mono-label leading-relaxed text-onSurface"
                />
                <p className="mt-2 font-body-sm text-body-sm text-onSurfaceVariant">
                  <span className="font-medium text-onSurface">Required:</span> code, title.
                  <span className="font-medium text-onSurface"> Optional:</span> department, lecturer (matched by exact name).
                </p>
                <div className="mt-6 flex items-center gap-6">
                  <button
                    onClick={runImport}
                    disabled={importing}
                    className="bg-ink px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary disabled:opacity-60"
                  >
                    {importing ? "Importing…" : "Import Courses"}
                  </button>
                  {result && <span className="font-mono-label text-mono-label text-primary">{result}</span>}
                </div>
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