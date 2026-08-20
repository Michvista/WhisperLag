import Link from "next/link";

/** Shown on protected screens when there is no stored session. */
export function SignedOut() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-16 text-center">
      <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
        lock
      </span>
      <h2 className="font-display text-headline-lg font-semibold text-onSurface">Institutional Access</h2>
      <p className="font-body-md text-body-md text-onSurfaceVariant">
        Sign in with your UNILAG credentials. Your identity is verified but
        never linked to your submissions.
      </p>
      <Link
        href="/login"
        className="bg-ink px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary"
      >
        Authenticate &amp; Enter
      </Link>
    </div>
  );
}

/** Shared loading state for data-driven dashboards. */
export function LoadingBlock({ label = "Loading live data…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-12 text-onSurfaceVariant">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="font-mono-label text-mono-label">{label}</span>
    </div>
  );
}

/** Shared error state for failed API calls. */
export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 border border-error-container bg-error-container/30 p-6">
      <p className="font-body-md text-body-md text-onErrorContainer">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="border border-ink px-4 py-2 font-label-caps text-label-caps uppercase tracking-wider text-onSurface transition-colors hover:bg-surface-variant"
        >
          Try again
        </button>
      )}
    </div>
  );
}