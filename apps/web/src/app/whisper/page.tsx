import Link from "next/link";
import { WhisperWizard } from "@/components/feedback/WhisperWizard";
import { WhisperBrand } from "@/components/ui/WhisperBrand";
import { WhisperLogo } from "@/components/ui/WhisperLogo";
import { Icon } from "@/components/ui/Icon";
import { PublicPolls } from "@/components/feedback/PublicPolls";
import { PublicRecent } from "@/components/feedback/PublicRecent";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function WhisperPage() {
  return (
    <div className="min-h-screen bg-background pb-24 text-navy">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2.5 sm:px-6">
          <WhisperBrand href="/" size="sm" />

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/track"
              className="flex items-center gap-1 rounded-lg border border-border-subtle bg-white px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold text-navy hover:bg-slate-50 transition-colors"
            >
              <Icon name="search" size={13} className="text-primary" />
              <span className="hidden xs:inline">Track</span>
            </Link>
            <Link
              href="/listwhispers"
              className="rounded-lg border border-border-subtle bg-white px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold text-navy hover:bg-slate-50 transition-colors"
            >
              <span className="hidden sm:inline">Student </span>Whispers
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left / Center: The Wizard Card (7 cols) */}
          <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-card sm:p-8 lg:col-span-7">
            <WhisperWizard />
          </div>

          {/* Right Sidebar: Context, Trust, Polls & Activity on Desktop (5 cols) */}
          <aside className="space-y-6 lg:col-span-5">
            {/* Quick Trust Card */}
            <div className="rounded-xl border border-green-tint bg-green-tint p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white border border-border-subtle">
                  <WhisperLogo size={32} />
                </div>
                <div>
                  <h3 className="font-montserrat text-xs font-bold text-navy">
                    Whisper Lock Protected
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    End-to-end anonymized
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                Your feedback is unlinked from your account or IP before storage. No faculty or staff can trace it back to you.
              </p>
            </div>

            {/* Active Polls */}
            <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                    Campus Pulse &amp; Polls
                  </h3>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    Anonymous student survey questions
                  </p>
                </div>
                <span className="flex h-2 w-2 rounded-full bg-primary" />
              </div>
              <PublicPolls />
            </div>

            {/* Recent Community Whispers */}
            <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card">
              <PublicRecent />
            </div>
          </aside>
        </div>
      </main>


      <MobileBottomNav />
    </div>
  );
}