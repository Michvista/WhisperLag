import { AppShell } from "@/components/layout/AppShell";
import { WhisperLock } from "@/components/ui/WhisperLock";
import { WhisperForm } from "@/components/feedback/WhisperForm";

/**
 * Student dashboard — the heart of the product. Carries the Whisper Lock
 * banner, the primary "Submit a Whisper" form, and the "Have I been heard?"
 * status tracker.
 */
export default function StudentDashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-container space-y-12">
        <div className="mx-auto flex max-w-2xl justify-center">
          <WhisperLock size="banner" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-headline-xl font-bold text-onSurface">Good Morning.</h1>
          <p className="font-body-lg text-body-lg text-onSurfaceVariant">
            Speak up safely. Your identity is protected.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Submit a Whisper */}
          <section className="flex flex-col rounded-xl border border-outlineVariant/30 bg-surface-container-lowest p-6 shadow-level-1 md:col-span-8">
            <h2 className="mb-6 flex items-center gap-2 font-display text-headline-md font-semibold text-onSurface">
              <span className="material-symbols-outlined text-primary">campaign</span>
              Submit a Whisper
            </h2>
            <WhisperForm />
          </section>

          {/* Side column */}
          <aside className="flex flex-col gap-6 md:col-span-4">
            <section className="flex-1 rounded-xl border border-outlineVariant/30 bg-surface-container-lowest p-6 shadow-level-1">
              <h3 className="mb-4 flex items-center gap-2 font-display text-headline-sm font-semibold text-onSurface">
                <span className="material-symbols-outlined text-tertiary-fixed-dim">timeline</span>
                Have I been heard?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                  </span>
                  <div>
                    <p className="font-label-md text-label-md text-onSurface">Library AC Issue</p>
                    <p className="font-body-sm text-body-sm text-onSurfaceVariant">
                      Status: <span className="font-medium text-primary">Resolved</span>
                    </p>
                  </div>
                </div>
                <div className="-my-2 ml-4 h-6 w-0.5 bg-outlineVariant/30" />
                <div className="flex items-start gap-4">
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tertiary-fixed-dim/20">
                    <span className="material-symbols-outlined text-sm text-tertiary-fixed-dim">pending</span>
                  </span>
                  <div>
                    <p className="font-label-md text-label-md text-onSurface">Cafeteria Pricing</p>
                    <p className="font-body-sm text-body-sm text-onSurfaceVariant">
                      Status: <span className="font-medium text-tertiary-fixed-dim">Reviewed</span>
                    </p>
                  </div>
                </div>
              </div>
              <button className="mt-6 w-full rounded py-2 text-center font-label-md text-label-md text-primary transition-colors hover:bg-surface-container-low">
                View All History
              </button>
            </section>

            <section className="relative overflow-hidden rounded-xl border border-outlineVariant/20 bg-surface-container-low p-6">
              <h3 className="relative z-10 mb-2 font-display text-headline-sm font-semibold text-onSurface">
                Campus Surveys
              </h3>
              <p className="relative z-10 mb-4 font-body-sm text-body-sm text-onSurfaceVariant">
                Help shape university policies.
              </p>
              <div className="relative z-10 mb-3 cursor-pointer rounded border border-outlineVariant/30 bg-surface-container-lowest p-4 transition-colors hover:border-secondary">
                <p className="font-label-md text-label-md text-onSurface">New Shuttle Route Feedback</p>
                <p className="mt-1 font-body-sm text-body-sm text-onSurfaceVariant">3 mins</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}