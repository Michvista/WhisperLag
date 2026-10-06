"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { WhisperBrand } from "@/components/ui/WhisperBrand";

export default function NotFound() {
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

      {/* Main 404 Hero */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-lg text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-3.5 py-1 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-soft">
              Error 404 · Page Not Found
            </span>
          </div>

          {/* Large illustration / numeral */}
          <div className="relative py-2">
            <div className="font-montserrat text-7xl font-extrabold tracking-tight text-navy sm:text-8xl select-none">
              4<span className="text-primary">0</span>4
            </div>
            <p className="mt-3 font-montserrat text-lg font-bold text-navy sm:text-xl">
              Lost in the campus corridors?
            </p>
            <p className="mx-auto mt-2 max-w-md text-xs text-text-secondary leading-relaxed">
              The page you are looking for does not exist, has been moved, or is temporarily unavailable.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="btn-primary-green flex w-full items-center justify-center gap-2 px-6 py-3 text-xs font-bold sm:w-auto shadow-sm"
            >
              <Icon name="home" size={16} />
              Return Home
            </Link>
            <Link
              href="/whisper"
              className="btn-secondary-blue flex w-full items-center justify-center gap-2 px-6 py-3 text-xs font-bold sm:w-auto"
            >
              <Icon name="add" size={16} />
              Give Feedback
            </Link>
          </div>

          {/* Helpful quick links */}
          <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-card text-left space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-soft">
              Helpful Campus Links
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link
                href="/track"
                className="flex items-center gap-2.5 rounded-lg p-2 text-xs font-semibold text-navy transition-colors hover:bg-slate-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-tint text-secondary">
                  <Icon name="search" size={14} />
                </div>
                <span>Track a Whisper</span>
              </Link>
              <Link
                href="/listwhispers"
                className="flex items-center gap-2.5 rounded-lg p-2 text-xs font-semibold text-navy transition-colors hover:bg-slate-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-green-tint text-primary">
                  <Icon name="forum" size={14} />
                </div>
                <span>Campus Whispers</span>
              </Link>
              <Link
                href="/evaluations"
                className="flex items-center gap-2.5 rounded-lg p-2 text-xs font-semibold text-navy transition-colors hover:bg-slate-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-tint text-amber-700">
                  <Icon name="school" size={14} />
                </div>
                <span>Evaluations Hub</span>
              </Link>
              <Link
                href="/suggestion"
                className="flex items-center gap-2.5 rounded-lg p-2 text-xs font-semibold text-navy transition-colors hover:bg-slate-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                  <Icon name="lightbulb" size={14} />
                </div>
                <span>Suggestion Box</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle footer */}
      <footer className="py-4 text-center text-[11px] text-text-soft">
        WhisperLag · University of Lagos Student Feedback Platform
      </footer>
    </div>
  );
}
