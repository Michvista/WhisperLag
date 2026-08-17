import { LoginForm } from "@/components/auth/LoginForm";

/** Standalone sign-in / onboarding screen (per the Stitch design). */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-gray p-margin-mobile font-body md:p-margin-desktop">
      <div className="flex w-full max-w-md flex-col gap-8 rounded-lg bg-surface-container-lowest p-6 shadow-level-1">
        <div className="text-center">
          <h1 className="font-display text-headline-xl font-bold text-primary">WhisperLag</h1>
          <p className="font-body-md text-body-md text-onSurfaceVariant">Sign in to your protected session</p>
        </div>

        <div className="flex items-center justify-center gap-3 rounded-full bg-secondary-fixed-dim/20 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-outlineVariant bg-surface-container-lowest">
            <span className="material-symbols-outlined text-[18px] text-primary">lock</span>
          </span>
          <span className="font-label-md text-label-md text-onSurface">
            Your anonymity is our priority. No personal data is attached to your whispers.
          </span>
        </div>

        <LoginForm />

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-outlineVariant" />
          <span className="font-body-sm text-body-sm uppercase tracking-wider text-onSurfaceVariant">or</span>
          <div className="h-px flex-1 bg-outlineVariant" />
        </div>

        <div className="text-center">
          <p className="font-body-md text-body-md text-onSurfaceVariant">
            New to WhisperLag?
            <a href="#" className="ml-1 font-label-md text-label-md text-primary hover:underline">
              Register your ID
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}