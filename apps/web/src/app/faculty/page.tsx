import { AppShell } from "@/components/layout/AppShell";
import { WhisperLock } from "@/components/ui/WhisperLock";

const BARS = [
  { label: "Clarity", height: "90%" },
  { label: "Punctuality", height: "75%" },
  { label: "Engagement", height: "85%" },
  { label: "Fairness", height: "60%" },
  { label: "Expertise", height: "95%" },
];

const THEMES = [
  {
    icon: "thumb_up",
    color: "text-primary",
    title: "Approachable Office Hours",
    body: "Mentioned in 42% of positive responses.",
  },
  {
    icon: "schedule",
    color: "text-[#E5A823]",
    title: "Late Assignment Grading",
    body: "Flagged 15 times this month.",
  },
  {
    icon: "auto_stories",
    color: "text-primary",
    title: "Clear Syllabus Structure",
    body: "Highly praised across 3 departments.",
  },
];

/**
 * Faculty performance hub. Shows aggregates only — averages, distributions,
 * and themes. Never individual names, honouring the anonymity contract.
 */
export default function FacultyHubPage() {
  return (
    <AppShell>
      <div className="mb-8 flex justify-center">
        <WhisperLock />
      </div>

      <div className="mb-10">
        <h1 className="mb-2 font-display text-headline-lg-mobile font-bold text-onSurface md:text-headline-lg">
          Faculty Performance Overview
        </h1>
        <p className="font-body-md text-body-md text-onSurfaceVariant">
          Aggregate anonymized data across all registered courses for the current semester.
        </p>
      </div>

      <div className="grid max-w-container grid-cols-1 gap-gutter md:grid-cols-12">
        {/* Key metrics */}
        <div className="flex flex-col justify-between rounded-lg border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1 md:col-span-4">
          <div>
            <h3 className="mb-1 font-label-md text-label-md uppercase tracking-wider text-onSurfaceVariant">
              Overall Faculty Rating
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-headline-xl font-bold text-primary">4.2</span>
              <span className="font-body-md text-body-md text-onSurfaceVariant">/ 5.0</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>trending_up</span>
            <span className="font-body-sm text-body-sm text-primary">+0.3 from last semester</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1 md:col-span-4">
          <div>
            <h3 className="mb-1 font-label-md text-label-md uppercase tracking-wider text-onSurfaceVariant">
              Total Anonymous Responses
            </h3>
            <span className="font-display text-headline-xl font-bold text-onSurface">1,248</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontSize: "20px" }}>groups</span>
            <span className="font-body-sm text-body-sm text-onSurfaceVariant">Across 12 departments</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1 md:col-span-4">
          <div>
            <h3 className="mb-1 font-label-md text-label-md uppercase tracking-wider text-onSurfaceVariant">
              Pending Interventions
            </h3>
            <span className="font-display text-headline-xl font-bold text-error">7</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#E5A823]" />
            <span className="font-body-sm text-body-sm text-onSurfaceVariant">Require administrative review</span>
          </div>
        </div>

        {/* Distribution chart */}
        <div className="rounded-lg border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1 md:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-display text-headline-sm font-semibold text-onSurface">
              Rating Distribution by Category
            </h3>
            <span className="rounded-full border border-outlineVariant bg-surface-container-low px-3 py-1 font-label-md text-label-md text-onSurfaceVariant">
              vs. Dept Avg
            </span>
          </div>
          <div className="relative mt-8">
            <div className="absolute left-0 right-0 top-[40%] z-10 border-t border-dashed border-tertiary" />
            <div className="absolute right-0 top-[35%] bg-surface px-1 font-label-md text-label-md text-tertiary">
              Dept Avg (3.8)
            </div>
            <div className="flex h-[150px] items-end gap-4 border-b border-[#E5E7EB] pb-6">
              {BARS.map((bar) => (
                <div key={bar.label} className="relative flex-1">
                  <div
                    className="rounded-t bg-primary transition-opacity hover:opacity-80"
                    style={{ height: bar.height }}
                  />
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-body-sm text-body-sm text-onSurfaceVariant">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recurring themes */}
        <div className="rounded-lg border border-outlineVariant bg-surface-container-lowest p-6 shadow-level-1 md:col-span-4">
          <h3 className="mb-4 font-display text-headline-sm font-semibold text-onSurface">
            Recurring Themes
          </h3>
          <p className="mb-4 font-body-sm text-body-sm text-onSurfaceVariant">
            Analyzed from qualitative whispers.
          </p>
          <ul className="space-y-4">
            {THEMES.map((theme) => (
              <li key={theme.title} className="flex items-start gap-3 border-b border-outlineVariant pb-3 last:border-0 last:pb-0">
                <span className={`material-symbols-outlined mt-0.5 ${theme.color}`}>{theme.icon}</span>
                <div>
                  <h4 className="font-label-md text-label-md text-onSurface">{theme.title}</h4>
                  <p className="font-body-sm text-body-sm text-onSurfaceVariant">{theme.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}