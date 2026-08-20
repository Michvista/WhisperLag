import Link from "next/link";
import { WhisperForm } from "@/components/feedback/WhisperForm";
import { WhisperLock } from "@/components/ui/WhisperLock";
import { WhisperLogo } from "@/components/ui/WhisperLogo";

/**
 * Transactional whisper screen: an editorial 40/60 split. Context and
 * metadata sit on the left; the message canvas on the right.
 */
export default function WhisperPage() {
  return (
    <main className="flex min-h-screen flex-col bg-surface font-body text-onSurface">
      {/* Slim header (transactional focus page) */}
      <header className="border-b border-ink/10">
        <div className="mx-auto flex w-full max-w-wide items-center justify-between px-margin-desktop py-4">
          <Link href="/dashboard" className="font-display text-headline-md font-bold tracking-tighter text-primary">
            WhisperLag
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/dashboard" className="font-label-caps text-label-caps uppercase text-onSurfaceVariant/70 transition-colors hover:text-primary">Dashboard</Link>
            <Link href="/faculty" className="font-label-caps text-label-caps uppercase text-onSurfaceVariant/70 transition-colors hover:text-primary">Faculty</Link>
            <Link href="/reports" className="font-label-caps text-label-caps uppercase text-onSurfaceVariant/70 transition-colors hover:text-primary">Reports</Link>
          </nav>
          <WhisperLock compact />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1600px] flex-grow flex-col gap-16 px-margin-mobile py-12 md:flex-row md:px-margin-desktop md:py-section-gap md:gap-32">
        {/* Left: context & metadata (40%) */}
        <section className="flex w-full flex-col gap-12 border-b border-ink/10 pb-12 md:w-[40%] md:border-b-0 md:border-r md:pb-0 md:pr-16">
          <div className="flex flex-col gap-4">
            <h1 className="font-display text-headline-lg-mobile font-semibold text-onSurface md:text-headline-lg">The Whisper.</h1>
            <p className="font-body-lg text-body-lg text-onSurfaceVariant">
              Your voice is secure. Provide context below to help institutional
              processing while remaining entirely anonymous.
            </p>
          </div>
          <WhisperLogo size={160} />
          <WhisperForm withMetadata redirectToSuccess />
        </section>

        {/* Right: the message canvas (60%) */}
        <section className="flex w-full flex-col md:w-[60%]">
          <div className="mb-8 flex items-end justify-between border-b border-ink/10 pb-4">
            <span className="font-mono-label text-mono-label text-onSurfaceVariant">THE MESSAGE</span>
            <WhisperLock compact />
          </div>
          <p className="font-body-lg text-body-lg text-onSurfaceVariant">
            Press Enter to continue line. Shift+Enter for a new paragraph.
          </p>
        </section>
      </main>
    </main>
  );
}