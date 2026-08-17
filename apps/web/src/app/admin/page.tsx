import { AppShell } from "@/components/layout/AppShell";

const DEPARTMENTS = [
  { initials: "EN", name: "Engineering", reports: "42 Active Reports", health: "Needs Attention", healthStyle: "bg-tertiary-fixed-dim/20 text-tertiary-container" },
  { initials: "AR", name: "Arts & Humanities", reports: "12 Active Reports", health: "Healthy", healthStyle: "bg-primary/10 text-primary" },
  { initials: "SC", name: "Sciences", reports: "28 Active Reports", health: "Healthy", healthStyle: "bg-primary/10 text-primary" },
];

const TOOLS = [
  { icon: "format_list_bulleted_add", title: "Survey Builder", body: "Create new feedback forms" },
  { icon: "manage_accounts", title: "User Management", body: "Manage faculty access" },
];

/**
 * Admin command center: real-time KPI cards, a trend chart placeholder,
 * departmental snapshots, and administrative tools.
 */
export default function AdminCommandCenterPage() {
  return (
    <AppShell>
      <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="mb-2 font-display text-headline-lg font-bold text-onSurface">
            Platform Overview
          </h2>
          <p className="font-body-md text-body-md text-onSurfaceVariant">
            Real-time metrics and institutional compliance status.
          </p>
        </div>
        <button className="flex min-h-[48px] items-center rounded-lg bg-primary px-6 py-3 font-label-md text-label-md text-onPrimary shadow-level-1 transition-all hover:shadow-level-2">
          <span className="material-symbols-outlined mr-2">description</span>
          Generate Accreditation Report
        </button>
      </div>

      {/* KPI cards */}
      <div className="mb-12 grid grid-cols-1 gap-gutter md:grid-cols-3">
        <div className="flex h-48 flex-col justify-between rounded-xl border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-onSurfaceVariant">Total Whispers</span>
            <span className="rounded-lg bg-primary-container/20 p-2 text-primary">
              <span className="material-symbols-outlined">forum</span>
            </span>
          </div>
          <div>
            <div className="mb-1 font-display text-headline-xl font-bold text-onSurface">12,483</div>
            <div className="flex items-center font-body-sm text-body-sm text-primary">
              <span className="material-symbols-outlined mr-1 text-sm">trending_up</span>
              +14% from last month
            </div>
          </div>
        </div>

        <div className="flex h-48 flex-col justify-between rounded-xl border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-onSurfaceVariant">Student Sentiment</span>
            <span className="rounded-lg bg-secondary-container/30 p-2 text-secondary">
              <span className="material-symbols-outlined">mood</span>
            </span>
          </div>
          <div>
            <div className="mb-1 font-display text-headline-xl font-bold text-onSurface">4.2/5</div>
            <div className="font-body-sm text-body-sm text-onSurfaceVariant">Based on recent feedback surveys</div>
          </div>
        </div>

        <div className="relative flex h-48 flex-col justify-between overflow-hidden rounded-xl border border-primary bg-surface-container-lowest p-6 shadow-level-1">
          <div className="absolute -mr-10 -mt-10 right-0 top-0 h-32 w-32 rounded-bl-full bg-primary-container/10" />
          <div className="relative z-10 flex items-start justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-onSurfaceVariant">Compliance Status</span>
            <span className="material-symbols-outlined text-primary">verified_user</span>
          </div>
          <div className="relative z-10">
            <div className="mb-1 font-display text-headline-lg font-bold text-primary">Audited &amp; Secure</div>
            <div className="mt-2 flex items-center font-body-sm text-body-sm text-onSurfaceVariant">
              <span className="mr-2 h-2 w-2 rounded-full bg-primary" />
              All departments reporting active
            </div>
          </div>
        </div>
      </div>

      {/* Trend chart placeholder */}
      <div className="mb-12 flex h-96 flex-col rounded-xl border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-display text-headline-sm font-semibold text-onSurface">
            Sentiment &amp; Activity Trends
          </h3>
          <div className="flex space-x-2">
            <button className="rounded-md bg-surface-variant px-3 py-1 text-sm text-onSurfaceVariant">Weekly</button>
            <button className="rounded-md px-3 py-1 text-sm text-onSurfaceVariant hover:bg-surface-variant">Monthly</button>
          </div>
        </div>
        <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-lg border border-dashed border-outlineVariant bg-surface-container-low">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 19px, #bdcaba 20px)" }} />
          <svg className="absolute bottom-0 left-0 h-full w-full text-primary opacity-50" preserveAspectRatio="none" viewBox="0 0 100 40">
            <path d="M0 40 L0 30 Q 25 10, 50 25 T 100 15 L 100 40 Z" fill="currentColor" />
          </svg>
          <span className="z-10 rounded-lg bg-surface/80 px-4 py-2 font-body-md text-body-md text-onSurfaceVariant">
            Interactive Chart Visualization
          </span>
        </div>
      </div>

      {/* Departments + tools */}
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <div className="rounded-xl border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-display text-headline-sm font-semibold text-onSurface">Departmental Snapshots</h3>
            <a href="#" className="font-label-md text-label-md text-primary hover:underline">View All</a>
          </div>
          <div className="space-y-4">
            {DEPARTMENTS.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between rounded-lg border border-outlineVariant bg-surface p-4 transition-colors hover:border-primary">
                <div className="flex items-center">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container font-bold text-onSecondaryContainer">
                    {dept.initials}
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-onSurface">{dept.name}</h4>
                    <p className="font-body-sm text-body-sm text-onSurfaceVariant">{dept.reports}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${dept.healthStyle}`}>{dept.health}</span>
                  <button className="text-onSurfaceVariant hover:text-primary">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1">
          <h3 className="mb-6 font-display text-headline-sm font-semibold text-onSurface">Administrative Tools</h3>
          <div className="flex-1 space-y-4">
            {TOOLS.map((tool) => (
              <button key={tool.title} className="group flex w-full items-start justify-start rounded-lg border border-outlineVariant bg-surface p-4 text-left transition-colors hover:bg-surface-container-low">
                <span className="mr-3 text-secondary transition-colors group-hover:text-primary">
                  <span className="material-symbols-outlined">{tool.icon}</span>
                </span>
                <div>
                  <div className="font-label-md text-label-md text-onSurface">{tool.title}</div>
                  <div className="font-body-sm text-body-sm text-onSurfaceVariant">{tool.body}</div>
                </div>
              </button>
            ))}
            <div className="mt-8 flex items-start rounded-lg border border-secondary-fixed-dim/30 bg-secondary-fixed-dim/20 p-4">
              <span className="material-symbols-outlined mr-3 mt-1 text-secondary">lock</span>
              <div>
                <h4 className="mb-1 font-label-md text-label-md text-onSurface">Whisper Lock Active</h4>
                <p className="font-body-sm text-body-sm text-onSurfaceVariant">
                  All student identities in this view are cryptographically anonymized per institutional policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}