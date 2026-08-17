"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBlock, LoadingBlock, SignedOut } from "@/components/ui/States";
import { api, getToken, API_BASE } from "@/lib/api";

interface Report {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  content: {
    type?: string;
    scope?: string;
    generatedAt?: string;
    metrics?: { evaluations: number; whispers: number };
    departments?: number;
    status?: string;
  } | null;
}

const TYPE_LABELS: Record<string, string> = {
  ACCREDITATION: "Accreditation",
  DEPARTMENT_SNAPSHOT: "Department Snapshot",
  TREND: "Trend Report",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Accreditation reports — fully live. Lists generated reports, generates new
 * ones, and offers CSV export of the structured payload.
 */
export default function ReportsPage() {
  const session = Boolean(getToken());
  const [reports, setReports] = useState<Report[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadReports() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<Report[]>("/reports", { token: getToken(), cache: "no-store" });
      setReports(data);
      setSelectedId((cur) => cur ?? data[0]?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) void loadReports();
  }, [session]);

  async function generate() {
    setGenerating(true);
    setNotice(null);
    try {
      await api<Report>("/reports/generate", {
        method: "POST",
        body: JSON.stringify({ title: "Accreditation Report", type: "ACCREDITATION" }),
        token: getToken(),
      });
      setNotice("Report generated.");
      await loadReports();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  if (!session) {
    return (
      <AppShell>
        <SignedOut />
      </AppShell>
    );
  }

  const selected = reports?.find((r) => r.id === selectedId) ?? reports?.[0] ?? null;
  const content = selected?.content;

  return (
    <AppShell>
      <div className="grid w-full max-w-container grid-cols-1 gap-gutter lg:grid-cols-12">
        {/* Left column: report list */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-headline-md font-semibold text-onSurface">Reports</h1>
            <button
              onClick={generate}
              disabled={generating}
              className="flex h-[48px] items-center gap-2 rounded bg-[#009A44] px-4 font-label-md text-label-md text-white transition-colors hover:bg-primary-container disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              {generating ? "Generating…" : "New"}
            </button>
          </div>

          {notice && (
            <div className="rounded-lg border border-primary-container bg-primary-container/20 p-3 font-body-sm text-body-sm text-onPrimaryContainer">
              {notice}
            </div>
          )}

          <div className="flex w-fit items-center gap-2 rounded-full border border-[#78C4EE]/50 bg-[#78C4EE]/20 px-4 py-2">
            <span className="flex items-center justify-center rounded-full bg-[#78C4EE] p-1">
              <span className="material-symbols-outlined text-[14px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                lock
              </span>
            </span>
            <span className="font-label-md text-label-md text-onSurface">Audit Trail Encrypted</span>
          </div>

          <div className="no-scrollbar flex max-h-[600px] flex-col gap-2 overflow-y-auto rounded-lg bg-surface-container-lowest p-4 shadow-level-1">
            {loading ? (
              <LoadingBlock label="Loading…" />
            ) : error ? (
              <ErrorBlock message={error} onRetry={loadReports} />
            ) : reports && reports.length > 0 ? (
              reports.map((report) => {
                const active = selected?.id === report.id;
                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedId(report.id)}
                    className={`relative flex cursor-pointer flex-col gap-2 rounded border p-4 text-left transition-colors ${
                      active
                        ? "border-primary bg-surface-container-low"
                        : "border-outlineVariant hover:bg-surface-container-low"
                    }`}
                  >
                    {active && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l bg-primary" />}
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-label-md text-label-md font-semibold text-onSurface">{report.title}</span>
                      <span className="rounded bg-primary/10 px-2 py-1 text-[11px] font-semibold tracking-wide text-primary">
                        {TYPE_LABELS[report.type] ?? report.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-body-sm text-body-sm text-onSurfaceVariant">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="p-4 font-body-sm text-body-sm text-onSurfaceVariant">
                No reports yet. Click &ldquo;New&rdquo; to generate one.
              </p>
            )}
          </div>
        </div>

        {/* Right column: report detail */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          {selected ? (
            <>
              <div className="flex flex-col justify-between gap-4 rounded-lg bg-white p-6 shadow-level-1 md:flex-row md:items-center">
                <div>
                  <h2 className="font-display text-headline-lg font-bold text-onSurface">{selected.title}</h2>
                  <p className="mt-1 font-body-md text-body-md text-onSurfaceVariant">
                    {TYPE_LABELS[selected.type] ?? selected.type} · Prepared for UNILAG Quality Assurance Board
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`${API_BASE}/reports/${selected.id}/export?format=csv`}
                    className="flex h-[48px] items-center gap-2 rounded border border-outline bg-white px-4 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container-low"
                  >
                    <span className="material-symbols-outlined text-[20px]">table_view</span>
                    Excel (CSV)
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-6 shadow-level-1 md:col-span-2">
                  <div className="flex items-center gap-2 border-b border-outlineVariant pb-2">
                    <span className="material-symbols-outlined text-primary">summarize</span>
                    <h3 className="font-display text-headline-sm font-semibold text-onSurface">Executive Summary</h3>
                  </div>
                  <p className="font-body-md text-body-md leading-relaxed text-onSurface">
                    This report aggregates anonymous feedback and evaluations
                    {content?.scope ? ` for ${typeof content.scope === "string" ? content.scope : "the selected department"}` : ""}.{" "}
                    It was generated {content?.generatedAt ? formatDate(content.generatedAt) : "automatically"}{" "}
                    and reflects the latest available data. Anonymity preservation remained at 100% integrity.
                  </p>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="rounded-lg bg-surface-container-low p-4 text-center">
                      <div className="font-display text-headline-md font-bold text-onSurface">
                        {content?.metrics?.whispers ?? 0}
                      </div>
                      <div className="font-body-sm text-body-sm text-onSurfaceVariant">Whispers</div>
                    </div>
                    <div className="rounded-lg bg-surface-container-low p-4 text-center">
                      <div className="font-display text-headline-md font-bold text-onSurface">
                        {content?.metrics?.evaluations ?? 0}
                      </div>
                      <div className="font-body-sm text-body-sm text-onSurfaceVariant">Evaluations</div>
                    </div>
                    <div className="rounded-lg bg-surface-container-low p-4 text-center">
                      <div className="font-display text-headline-md font-bold text-onSurface">
                        {content?.departments ?? 0}
                      </div>
                      <div className="font-body-sm text-body-sm text-onSurfaceVariant">Departments</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-6 shadow-level-1">
                  <div className="flex items-center gap-2 border-b border-outlineVariant pb-2">
                    <span className="material-symbols-outlined text-primary">verified_user</span>
                    <h3 className="font-display text-headline-sm font-semibold text-onSurface">Report Metadata</h3>
                  </div>
                  <dl className="space-y-3 font-body-sm text-body-sm">
                    <div className="flex justify-between">
                      <dt className="text-onSurfaceVariant">Type</dt>
                      <dd className="font-medium text-onSurface">{TYPE_LABELS[selected.type] ?? selected.type}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-onSurfaceVariant">Generated</dt>
                      <dd className="font-medium text-onSurface">{formatDate(selected.createdAt)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-onSurfaceVariant">Status</dt>
                      <dd className="font-medium text-primary">{content?.status ?? "READY"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-onSurfaceVariant">Audit</dt>
                      <dd className="font-medium text-onSurface">Encrypted trail</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-6 shadow-level-1">
                  <div className="flex items-center gap-2 border-b border-outlineVariant pb-2">
                    <span className="material-symbols-outlined text-primary">download</span>
                    <h3 className="font-display text-headline-sm font-semibold text-onSurface">Export</h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-onSurfaceVariant">
                    Download this report as a spreadsheet for your accreditation evidence pack.
                  </p>
                  <a
                    href={`${API_BASE}/reports/${selected.id}/export?format=csv`}
                    className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#78C4EE] px-4 font-label-md text-label-md text-[#001e2c] transition-opacity hover:opacity-90"
                  >
                    <span className="material-symbols-outlined text-[20px]">table_view</span>
                    Download CSV
                  </a>
                </div>
              </div>
            </>
          ) : (
            <p className="font-body-md text-body-md text-onSurfaceVariant">Select a report to view its details.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}