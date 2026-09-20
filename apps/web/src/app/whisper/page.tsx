import Link from "next/link";
import { WhisperWizard } from "@/components/feedback/WhisperWizard";
import { WhisperBrand } from "@/components/ui/WhisperBrand";
import { WhisperLogo } from "@/components/ui/WhisperLogo";
import { Icon } from "@/components/ui/Icon";
import { PublicPolls } from "@/components/feedback/PublicPolls";
import { PublicRecent } from "@/components/feedback/PublicRecent";

export default function WhisperPage() {
  return (
    <div className="min-h-screen bg-background pb-24 text-navy">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <WhisperBrand href="/" />

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/track"
              className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-slate-50 transition-colors"
            >
              <Icon name="search" size={14} className="text-primary" />
              <span>Track Whisper</span>
            </Link>
            <Link
              href="/listwhispers"
              className="rounded-lg border border-border-subtle bg-white px-3.5 py-1.5 text-xs font-semibold text-navy hover:bg-slate-50 transition-colors"
            >
              Student Whispers
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

      {/* Mobile Floating Bottom Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-border-subtle bg-white/95 px-4 shadow-md backdrop-blur-md lg:hidden">
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-primary"
        >
          <Icon name="home" size={18} />
          Home
        </Link>
        <Link
          href="/track"
          className="flex flex-col items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-primary"
        >
          <Icon name="search" size={18} />
          Track
        </Link>
        <Link
          href="/whisper"
          className="flex flex-col items-center gap-1 text-[11px] font-semibold text-primary"
        >
          <span className="-mt-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-lg font-bold text-white shadow-button-green">
            +
          </span>
          Give Feedback
        </Link>
        <Link
          href="/listwhispers"
          className="flex flex-col items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-primary"
        >
          <Icon name="chat" size={18} />
          Whispers
        </Link>
      </nav>
    </div>
  );
}