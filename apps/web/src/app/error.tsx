"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { WhisperBrand } from "@/components/ui/WhisperBrand";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error("Runtime error caught by boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-navy">
      <header className="border-b border-border-subtle bg-white/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <WhisperBrand href="/" />
          <Link
            href="/"
            className="text-xs font-bold text-text-secondary transition-colors hover:text-primary"
          >
            ← Home
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-200 text-red-600 shadow-sm">
            <Icon name="error" size={32} className="text-red-600" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
              Application Error
            </span>
            <h1 className="font-montserrat text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Something went wrong
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed">
              An unexpected error occurred while processing this request. Our system logs have registered this event.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => reset()}
              className="btn-primary-green flex items-center justify-center gap-2 py-3 text-xs font-bold shadow-sm"
            >
              <Icon name="refresh" size={16} />
              Try Again
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white py-3 text-xs font-semibold text-navy transition-colors hover:bg-slate-50"
            >
              <Icon name="home" size={16} />
              Return to Safety (Home)
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-[11px] text-text-soft">
        WhisperLag · University of Lagos Student Feedback Platform
      </footer>
    </div>
  );
}
