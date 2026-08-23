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