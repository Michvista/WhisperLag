import { WhisperLock } from "@/components/ui/WhisperLock";
import { WhisperForm } from "@/components/feedback/WhisperForm";

/**
 * Focused "Submit a Whisper" transactional screen. A single card, the
 * Whisper Lock indicator up top, and a success state handled client-side.
 */
export default function SubmitWhisperPage() {
  return (
    <main className="flex min-h-screen flex-col bg-brand-gray font-body text-onBackground">
      <nav className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b-2 border-primary bg-surface px-margin-mobile md:h-20 md:px-margin-desktop">
        <span className="font-display text-headline-sm font-bold text-primary">WhisperLag</span>
        <button aria-label="Close" className="rounded-full p-2 text-onSurfaceVariant transition-colors hover:bg-surface-container-low hover:text-primary">
          <span className="material-symbols-outlined">close</span>
        </button>
      </nav>

      <main className="flex w-full flex-grow items-start justify-center px-margin-mobile pb-16 pt-24 md:px-margin-desktop md:pt-32">
        <div className="w-full max-w-2xl rounded-lg bg-surface-container-lowest p-6 shadow-sm md:p-8">
          <div className="mb-8 flex justify-center">
            <WhisperLock />
          </div>
          <h1 className="mb-8 text-center font-display text-headline-lg font-bold text-onSurface md:text-headline-xl">
            Submit a Whisper
          </h1>
          <WhisperForm />
        </div>
      </main>

      <footer className="mt-auto w-full border-t border-outlineVariant bg-surface-container-lowest px-margin-mobile py-8 md:px-margin-desktop">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <span className="font-label-md text-label-md text-onSurfaceVariant">
            © 2024 University of Lagos. Protected by Whisper Lock.
          </span>
          <div className="flex gap-6">
            <a href="#" className="font-body-sm text-body-sm text-onSurfaceVariant opacity-80 transition-opacity hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="font-body-sm text-body-sm text-onSurfaceVariant opacity-80 transition-opacity hover:text-primary">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}