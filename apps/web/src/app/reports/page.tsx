import { AppShell } from "@/components/layout/AppShell";

const REPORTS = [
  {
    title: "Q3 Safety Audit",
    status: "COMPLETED",
    statusStyle: "bg-primary/10 text-primary",
    description: "Comprehensive review of faculty response times and anonymity protocols across all active whispers.",
    date: "Oct 12, 2024",
    active: true,
  },
  {
    title: "Annual Compliance Report",
    status: "IN PROGRESS",
    statusStyle: "bg-[#E5A823]/10 text-tertiary",
    description: "Aggregated data on reported incidents categorized by severity and faculty department.",
    date: "Nov 05, 2024",
    active: false,
  },
  {
    title: "Harassment Incident Stats",
    status: "COMPLETED",
    statusStyle: "bg-primary/10 text-primary",
    description: "Detailed statistical breakdown of reported harassment cases over the academic year.",
    date: "Sep 20, 2024",
    active: false,
  },
];

/**
 * Accreditation reports view: a report list with a detail pane including
 * the executive summary, category breakdown, and resolution status.
 */
export default function ReportsPage() {
  return (
    <AppShell>
      <div className="grid w-full max-w-container grid-cols-1 gap-gutter lg:grid-cols-12">
        {/* Left column: report list */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-headline-md font-semibold text-onSurface">Reports</h1>
            <button className="flex h-[48px] items-center gap-2 rounded bg-[#009A44] px-4 font-label-md text-label-md text-white transition-colors hover:bg-primary-container">
              <span className="material-symbols-outlined text-[20px]">add</span>
              New
            </button>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-[#78C4EE]/50 bg-[#78C4EE]/20 px-4 py-2">
            <span className="flex items-center justify-center rounded-full bg-[#78C4EE] p-1">
              <span className="material-symbols-outlined text-[14px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            </span>
            <span className="font-label-md text-label-md text-onSurface">Audit Trail Encrypted</span>
          </div>

          <div className="no-scrollbar flex max-h-[600px] flex-col gap-2 overflow-y-auto rounded-lg bg-surface-container-lowest p-4 shadow-level-1">
            {REPORTS.map((report) => (
              <div
                key={report.title}
                className={`relative flex cursor-pointer flex-col gap-2 rounded border p-4 transition-colors ${
                  report.active
                    ? "border-primary bg-surface-container-low"
                    : "border-outlineVariant hover:bg-surface-container-low"
                }`}
              >
                {report.active && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l bg-primary" />}
                <div className="flex items-start justify-between">
                  <span className="font-label-md text-label-md font-semibold text-onSurface">{report.title}</span>
                  <span className={`rounded px-2 py-1 text-[12px] font-semibold tracking-wide ${report.statusStyle}`}>
                    {report.status}
                  </span>
                </div>
                <p className="line-clamp-2 font-body-sm text-body-sm text-onSurfaceVariant">{report.description}</p>
                <div className="mt-1 flex items-center gap-2 font-body-sm text-body-sm text-onSurfaceVariant">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  <span>{report.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: report detail */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          <div className="flex flex-col justify-between gap-4 rounded-lg bg-white p-6 shadow-level-1 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-headline-lg font-bold text-onSurface">Q3 Safety Audit</h2>
              <p className="mt-1 font-body-md text-body-md text-onSurfaceVariant">
                Prepared for UNILAG Quality Assurance Board
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex h-[48px] items-center gap-2 rounded bg-[#78C4EE] px-4 font-label-md text-label-md text-[#001e2c] transition-opacity hover:opacity-90">
                <span className="material-symbols-outlined text-[20px]">download</span>
                PDF
              </button>
              <button className="flex h-[48px] items-center gap-2 rounded border border-outline bg-white px-4 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container-low">
                <span className="material-symbols-outlined text-[20px]">table_view</span>
                Excel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-6 shadow-level-1 md:col-span-2">
              <div className="flex items-center gap-2 border-b border-outlineVariant pb-2">
                <span className="material-symbols-outlined text-primary">summarize</span>
                <h3 className="font-display text-headline-sm font-semibold text-onSurface">Executive Summary</h3>
              </div>
              <p className="font-body-md text-body-md leading-relaxed text-onSurface">
                The Q3 Safety Audit indicates a 15% increase in total whispers submitted, largely
                attributed to the recent campus-wide awareness campaign. Anonymity preservation
                protocols maintained a 100% integrity rate. Average administrative response time
                improved to 24 hours, down from 36 hours in Q2.
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-6 shadow-level-1">
              <div className="flex items-center gap-2 border-b border-outlineVariant pb-2">
                <span className="material-symbols-outlined text-primary">bar_chart</span>
                <h3 className="font-display text-headline-sm font-semibold text-onSurface">Reports by Category</h3>
              </div>
              <div className="relative flex h-48 w-full items-end justify-around overflow-hidden rounded bg-surface-container-low p-4">
                <div className="h-[80%] w-1/5 rounded-t bg-[#78C4EE] opacity-80" />
                <div className="h-[60%] w-1/5 rounded-t bg-primary opacity-80" />
                <div className="h-[30%] w-1/5 rounded-t bg-[#E5A823] opacity-80" />
                <div className="h-[90%] w-1/5 rounded-t bg-[#005b7c] opacity-80" />
              </div>
              <div className="flex justify-between px-2 font-body-sm text-body-sm text-onSurfaceVariant">
                <span>Academic</span>
                <span>Facilities</span>
                <span>Admin</span>
                <span>Safety</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-6 shadow-level-1">
              <div className="flex items-center gap-2 border-b border-outlineVariant pb-2">
                <span className="material-symbols-outlined text-primary">pie_chart</span>
                <h3 className="font-display text-headline-sm font-semibold text-onSurface">Resolution Status</h3>
              </div>
              <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded bg-surface-container-low">
                <div
                  className="h-32 w-32 rounded-full border-[16px] border-primary"
                  style={{ borderRightColor: "#E5A823", borderBottomColor: "#78C4EE", transform: "rotate(45deg)" }}
                />
                <div className="absolute flex flex-col items-center">
                  <span className="font-display text-headline-md font-bold text-onSurface">82%</span>
                  <span className="font-label-md text-label-md text-onSurfaceVariant">Resolved</span>
                </div>
              </div>
              <div className="flex justify-center gap-4 font-body-sm text-body-sm text-onSurfaceVariant">
                <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-primary" /> Resolved</div>
                <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-[#E5A823]" /> Pending</div>
                <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-[#78C4EE]" /> New</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}