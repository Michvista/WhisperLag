import Link from "next/link";
import { WhisperLock } from "@/components/ui/WhisperLock";
import { WhisperLogo } from "@/components/ui/WhisperLogo";

/** Post-submission confirmation — "Your whisper is hidden." */
export default function WhisperSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-gray px-margin-mobile font-body text-onBackground md:px-margin-desktop">
      <div className="flex w-full max-w-[600px] flex-col items-center space-y-20 text-center">
        <div className="flex flex-col items-center">
          <WhisperLogo size={120} className="mb-8" />
          <h1 className="font-display text-headline-lg-mobile font-bold text-onBackground md:text-headline-lg">
            Your whisper is hidden.
            <br />
            <span className="opacity-80">Nobody knows it is you.</span>
          </h1>
          <div className="mt-8">
            <WhisperLock compact={false} />
          </div>
        </div>

        <div className="h-px w-1/2 bg-ink opacity-10" />

        <div className="flex w-full max-w-xs flex-col space-y-4">
          <Link
            href="/dashboard"
            className="bg-ink px-6 py-4 text-center font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary"
          >
            Return to Dashboard
          </Link>
          <Link
            href="/dashboard"
            className="border border-ink px-6 py-4 text-center font-label-caps text-label-caps uppercase tracking-widest text-ink transition-colors duration-300 hover:bg-surface-dim"
          >
            View Status
          </Link>
        </div>
      </div>
    </main>
  );
}