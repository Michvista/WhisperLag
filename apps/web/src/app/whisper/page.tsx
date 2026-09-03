import Link from "next/link";
import { WhisperForm } from "@/components/feedback/WhisperForm";
import { PublicPolls } from "@/components/feedback/PublicPolls";
import { PublicRecent } from "@/components/feedback/PublicRecent";
import { WhisperLock } from "@/components/ui/WhisperLock";
import { WhisperLogo } from "@/components/ui/WhisperLogo";

/**
 * The Whisper — public, no-login submission. Students drop anonymous feedback
 * here directly, exactly like an anonymous confession app: no account, no
 * friction. The optional UNILAG email is validated but never stored.
 */
export default function WhisperPage() {
  return (
    <main className="flex min-h-screen flex-col bg-surface font-body text-onSurface">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex w-full max-w-wide items-center justify-between px-margin-mobile py-4 md:px-margin-desktop">
          <Link href="/" className="font-display text-headline-md font-bold tracking-tighter text-primary">
            WhisperLag
          </Link>
          <WhisperLock compact />
        </div>
      </header>

      {/* Submit: context left, form right */}
      <main className="mx-auto w-full max-w-[1200px] flex-grow px-margin-mobile py-16 md:px-margin-desktop">
        <div className="flex flex-col gap-16 md:flex-row md:gap-24">
          <section className="flex w-full flex-col justify-center gap-8 md:w-2/5">
            <div className="flex flex-col gap-4">
              <h1 className="font-display text-headline-lg-mobile font-semibold text-onSurface md:text-headline-lg">
                The Whisper.
              </h1>
              <p className="font-body-lg text-body-lg text-onSurfaceVariant">
                No account. No login. Your message is anonymized before it ever
                reaches us — even we cannot tell who wrote it.
              </p>
            </div>
            <WhisperLogo size={140} />
          </section>

          <section className="w-full md:w-3/5">
            <div className="mb-8 flex items-center justify-between border-b border-ink/10 pb-4">
              <span className="font-mono-label text-mono-label text-onSurfaceVariant">ANONYMOUS SUBMISSION</span>
            </div>
            <WhisperForm />
          </section>
        </div>

        {/* Campus engagement: polls + recent activity, full width */}
        <div className="mx-auto mt-16 grid max-w-[1200px] grid-cols-1 gap-16 border-t border-ink/10 pt-10 md:grid-cols-2">
          <section>
            <PublicPolls />
          </section>
          <section>
            <PublicRecent />
          </section>
        </div>
      </main>
    </main>
  );
}