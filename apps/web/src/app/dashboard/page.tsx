"use client";

import { AppShell } from "@/components/layout/AppShell";
import { WhisperLock } from "@/components/ui/WhisperLock";
import { WhisperForm } from "@/components/feedback/WhisperForm";
import { SurveyList } from "@/components/feedback/SurveyList";
import { ErrorBlock, LoadingBlock, SignedOut } from "@/components/ui/States";
import { useFetch } from "@/lib/useFetch";
import { getToken } from "@/lib/api";

interface RecentWhisper {
  id: string;
  category: string;
  content: string;
  status: "NEW" | "ACKNOWLEDGED" | "ACTIONED";
  createdAt: string;
}

const STATUS_META: Record<RecentWhisper["status"], { label: string; icon: string; cls: string }> = {
  ACTIONED: { label: "Resolved", icon: "check_circle", cls: "text-primary bg-primary/10" },
  ACKNOWLEDGED: { label: "Reviewed", icon: "pending", cls: "text-tertiary-fixed-dim bg-tertiary-fixed-dim/20" },
  NEW: { label: "New", icon: "radio_button_unchecked", cls: "text-onSurfaceVariant bg-surface-container" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Student dashboard — fully live. Submits whispers, lists real open surveys
 * and the recent-activity feed, all from the API.
 */
export default function StudentDashboardPage() {
  const session = Boolean(getToken());
  const recent = useFetch<RecentWhisper[]>("/feedback/recent");
  const items = recent.data;

  if (!session) {
    return (
      <AppShell>
        <SignedOut />
      </AppShell>
    );
  }

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
              {recent.loading ? (
                <LoadingBlock label="Loading…" />
              ) : recent.error ? (
                <ErrorBlock message={recent.error} onRetry={recent.refetch} />
              ) : items && items.length > 0 ? (
                <div className="space-y-4">
                  {items.slice(0, 4).map((w, i) => {
                    const meta = STATUS_META[w.status];
                    return (
                      <div key={w.id}>
                        <div className="flex items-start gap-4">
                          <span className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.cls}`}>
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {meta.icon}
                            </span>
                          </span>
                          <div>
                            <p className="font-label-md text-label-md text-onSurface">{w.category}</p>
                            <p className="font-body-sm text-body-sm text-onSurfaceVariant">
                              {formatDate(w.createdAt)} ·{" "}
                              <span className="font-medium text-onSurface">{meta.label}</span>
                            </p>
                          </div>
                        </div>
                        {i < items.length - 1 && (
                          <div className="-my-2 ml-4 h-6 w-0.5 bg-outlineVariant/30" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="font-body-sm text-body-sm text-onSurfaceVariant">
                  Nothing yet. Submit your first whisper above — it stays anonymous.
                </p>
              )}
            </section>

            <section className="relative overflow-hidden rounded-xl border border-outlineVariant/20 bg-surface-container-low p-6">
              <h3 className="relative z-10 mb-4 font-display text-headline-sm font-semibold text-onSurface">
                Campus Surveys
              </h3>
              <p className="relative z-10 mb-4 font-body-sm text-body-sm text-onSurfaceVariant">
                Help shape university policies.
              </p>
              <div className="relative z-10">
                <SurveyList />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}