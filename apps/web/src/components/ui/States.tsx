import Link from "next/link";

/** Shown on protected screens when there is no stored session. */
export function SignedOut() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg bg-surface-container-lowest p-10 text-center shadow-level-1">
      <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
        lock
      </span>
      <h2 className="font-display text-headline-md font-semibold text-onSurface">Sign in to view this page</h2>
      <p className="font-body-md text-body-md text-onSurfaceVariant">
        Your whisper is hidden. Nobody knows it is you — but you do need an account to continue.
      </p>
      <Link
        href="/login"
        className="flex h-12 items-center gap-2 rounded-lg bg-primary px-8 font-label-md text-label-md text-onPrimary shadow-level-1 transition-colors hover:bg-surface-tint"
      >
        Sign in
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </Link>
    </div>
  );
}

/** Shared loading skeleton for data-driven dashboards. */
export function LoadingBlock({ label = "Loading live data…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-onSurfaceVariant">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="font-body-md text-body-md">{label}</span>
    </div>
  );
}

/** Shared error state for failed API calls. */
export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-error-container bg-error-container/40 p-8 text-center">
      <span className="material-symbols-outlined text-3xl text-error">error</span>
      <p className="font-body-md text-body-md text-onErrorContainer">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg border border-outline px-4 py-2 font-label-md text-label-md text-onSurface transition-colors hover:bg-surface-container-low"
        >
          Try again
        </button>
      )}
    </div>
  );
}