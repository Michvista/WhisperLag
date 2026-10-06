"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { WhisperBrand } from "@/components/ui/WhisperBrand";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-navy">
      {/* Top Brand Bar */}
      <header className="border-b border-border-subtle bg-white/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <WhisperBrand href="/" />
          <Link
            href="/"
            className="text-xs font-bold text-text-secondary transition-colors hover:text-primary"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main 401/403 Hero */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6">
          {/* Icon Badge */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-sm">
            <Icon name="lock" size={32} className="text-amber-600" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Access Restricted · Staff Portal
            </span>
            <h1 className="font-montserrat text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Authentication Required
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed">
              This section is reserved for verified UNILAG faculty, department heads, and platform administrators.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="btn-primary-green flex items-center justify-center gap-2 py-3 text-xs font-bold shadow-sm"
            >
              <Icon name="lock" size={16} />
              Sign in with Staff Credentials →
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white py-3 text-xs font-semibold text-navy transition-colors hover:bg-slate-50"
            >
              <Icon name="home" size={16} />
              Return to Student Home
            </Link>
          </div>

          <div className="rounded-xl border border-border-subtle bg-white p-4 text-left">
            <p className="text-[11px] text-text-secondary leading-relaxed">
              <strong className="text-navy font-semibold">Note for Students:</strong> Whispering feedback, tracking submissions, evaluating courses, and answering polls never require signing in.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-[11px] text-text-soft">
        WhisperLag · University of Lagos Student Feedback Platform
      </footer>
    </div>
  );
}
