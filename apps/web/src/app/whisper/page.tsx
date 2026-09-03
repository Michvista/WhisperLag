import Link from "next/link";
import { WhisperForm } from "@/components/feedback/WhisperForm";
import { PublicPolls } from "@/components/feedback/PublicPolls";
import { PublicRecent } from "@/components/feedback/PublicRecent";
import { WhisperLock } from "@/components/ui/WhisperLock";
import { WhisperLogo } from "@/components/ui/WhisperLogo";

/**
 * The Whisper — public, no-login submission. Main form on the left, with
 * Active Polls + Recent Activity in a structured right sidebar. Stacks to a
 * single column on mobile/tablet.
 */
export default function WhisperPage() {
  return (
    <main className="flex min-h-screen flex-col bg-surface font-body text-onSurface">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-margin-mobile py-4 md:px-margin-desktop">
          <Link href="/" className="font-display text-headline-md font-bold tracking-tighter text-primary">
            WhisperLag
          </Link>
          <WhisperLock compact />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-grow px-margin-mobile py-12 md:px-margin-desktop md:py-16">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main: the form */}
          <section className="flex flex-col gap-8">
            <div className="flex items-start gap-5">
              <WhisperLogo size={72} className="mt-1 shrink-0" />
              <div>
                <h1 className="font-display text-headline-lg-mobile font-semibold text-onSurface md:text-headline-lg">
                  The Whisper.
                </h1>
                <p className="font-body-lg text-body-lg text-onSurfaceVariant">
                  No account. No login. Your message is anonymized before it
                  ever reaches us — even we cannot tell who wrote it.
                </p>
              </div>
            </div>

            <div className="border-b border-ink/10 pb-4">
              <span className="font-mono-label text-mono-label text-onSurfaceVariant">ANONYMOUS SUBMISSION</span>
            </div>
            <WhisperForm />
          </section>

          {/* Right sidebar: polls + recent activity */}
          <aside className="flex flex-col gap-12 border-t border-ink/10 pt-10 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <PublicPolls />
            <PublicRecent />
          </aside>
        </div>
      </main>
    </main>
  );
}