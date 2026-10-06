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
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Mobile-only Top Trust Banner (shows before form on small screens) */}
        <div className="mb-5 block rounded-xl border border-green-tint bg-green-tint p-4 shadow-xs lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white border border-border-subtle">
              <WhisperLogo size={28} />
            </div>
            <div>
              <h3 className="font-montserrat text-xs font-bold text-navy">
                100% Anonymous &amp; Protected
              </h3>
              <p className="text-[11px] font-medium text-primary">
                Whisper Lock Guarantee
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
            Your feedback is completely unlinked from your name, matric number, and IP address. No lecturer or staff can ever trace it back to you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left / Center: The Wizard Card (7 cols) */}
          <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-card sm:p-8 lg:col-span-7">
            <WhisperWizard />
          </div>

          {/* Right Sidebar: Context, Trust, Polls & Activity on Desktop ONLY (hidden on mobile) */}
          <aside className="hidden space-y-6 lg:block lg:col-span-5">
            {/* Quick Trust Card (Desktop) */}
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
                    100% Anonymous &amp; Private
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                Your feedback is completely unlinked from your name, matric number, or IP address. No faculty member or school administrator can ever trace it back to you.
              </p>
            </div>

            {/* Active Polls (Desktop only) */}
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

            {/* Recent Community Whispers (Desktop only) */}
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