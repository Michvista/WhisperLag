import Link from "next/link";
import { WhisperLock } from "@/components/ui/WhisperLock";
import { WhisperLogo } from "@/components/ui/WhisperLogo";
import { Icon } from "@/components/ui/Icon";

/** Post-submission confirmation : "Your whisper is hidden." */
export default function WhisperSuccessPage({
  searchParams,
}: {
  searchParams: { queued?: string };
}) {
  const queued = searchParams.queued === "1";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-gray px-margin-mobile font-body text-onBackground md:px-margin-desktop">
      <div className="flex w-full max-w-[560px] flex-col items-center py-12 text-center">
        <WhisperLogo size={140} className="mb-10" />

        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Icon name="check_circle" size={34} className="text-primary" />
        </div>

        <h1 className="mb-3 font-display text-headline-lg-mobile font-bold text-onBackground md:text-headline-lg">
          Your whisper is hidden.
          <br />
          <span className="opacity-80">Nobody knows it is you.</span>
        </h1>
        <p className="mb-8 max-w-sm font-body-md text-body-md leading-relaxed text-onSurfaceVariant">
          {queued
            ? "You were offline, so it was saved on this device and will be delivered automatically when you're back online."
            : "It has been received and routed to the right place, completely anonymously."}
        </p>

        <WhisperLock compact={false} />

        {queued && (
          <p className="mt-6 border border-tertiary-fixed-dim/40 bg-tertiary-fixed-dim/10 px-4 py-3 font-body-sm text-body-sm text-onSurfaceVariant">
            Offline whisper queued : it will sync when you reconnect.
          </p>
        )}

        <div className="mt-12 flex w-full max-w-xs flex-col gap-4">
          <Link
            href="/whisper"
            className="bg-ink px-6 py-4 text-center font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary"
          >
            Submit another whisper
          </Link>
          <Link
            href="/"
            className="border border-ink px-6 py-4 text-center font-label-caps text-label-caps uppercase tracking-widest text-ink transition-colors duration-300 hover:bg-surface-dim"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}