"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WhisperBrand } from "@/components/ui/WhisperBrand";
import { Icon } from "@/components/ui/Icon";

function WhisperSuccessContent() {
  const searchParams = useSearchParams();
  const queued = searchParams.get("queued") === "1";
  const refCode = searchParams.get("ref") || `WL-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const category = searchParams.get("cat") || "Academic / Faculty";
  const subject = searchParams.get("sub") || "General Department";
  const feedbackType = searchParams.get("type") || "Constructive";

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20 text-[#10253A]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#DCE3E7] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-extrabold text-[#2C7DA0] hover:underline"
          >
            ‹ Home
          </Link>
          <WhisperBrand href="/" size="sm" />
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DCE3E7] bg-white text-xs">
            <Icon name="notifications" size={16} className="text-[#10253A]" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Success Area with Confetti / Celebration */}
        <section className="text-center">
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#009A44] text-4xl font-extrabold text-white shadow-[0_0_0_12px_#DFF3E9,0_0_0_24px_#EDF9F4]">
            ✓
            {/* Confetti flakes */}
            <span className="absolute -left-8 -top-1 h-3 w-6 rotate-45 rounded-full bg-[#009A44]" />
            <span className="absolute -right-8 top-3 h-3 w-6 -rotate-45 rounded-full bg-[#2C7DA0]" />
            <span className="absolute -left-7 bottom-0 h-3 w-5 rotate-12 rounded-full bg-[#7355A2]" />
            <span className="absolute -right-7 bottom-1 h-3 w-5 -rotate-12 rounded-full bg-[#009A44]" />
          </div>

          <h1 className="font-montserrat text-2xl font-extrabold tracking-tight text-[#10253A] sm:text-3xl">
            Feedback Submitted<br />
            <span className="text-[#009A44]">Successfully!</span>
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#60758C]">
            {queued
              ? "You were offline, so your feedback was encrypted on this device and will sync immediately once you reconnect."
              : "Thank you for sharing your feedback. Your voice makes a difference at the University of Lagos."}
          </p>
        </section>

        {/* Identity Protection Reassurance Card */}
        <section className="mt-8 rounded-2xl border border-[#D3EEE2] bg-[#E5F4EE] p-4 sm:p-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D0EDDF] text-xl text-[#009A44]">
              <Icon name="shield" size={22} className="text-[#009A44]" />
            </div>
            <div>
              <div className="font-montserrat text-sm font-extrabold text-[#10253A]">
                Your identity is protected
              </div>
              <div className="mt-0.5 text-xs leading-relaxed text-[#60758C]">
                Your feedback has been submitted anonymously. No matric number, name, or personal details are attached.
              </div>
            </div>
          </div>
        </section>

        {/* Feedback Reference & Breakdown Card */}
        <section className="mt-4 rounded-2xl border border-[#DCE3E7] bg-white p-5 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#EDF0F1] pb-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5F4EE] text-base text-[#009A44]">
                <Icon name="summarize" size={20} className="text-[#009A44]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#60758C]">Feedback Reference</div>
                <div className="font-montserrat text-lg font-extrabold tracking-tight text-[#009A44]">
                  {refCode}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block rounded-full bg-[#E5F4EE] px-2.5 py-1 text-[11px] font-extrabold text-[#009A44]">
                ✓ Submitted
              </span>
              <div className="mt-1 text-[10px] font-semibold text-[#60758C]">
                {currentDate} • {currentTime}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-[#EDF0F1] pb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E5F4EE] text-sm text-[#009A44]">
              <Icon name="school" size={18} className="text-[#009A44]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#60758C]">Category</div>
              <div className="text-xs font-extrabold text-[#10253A]">{category}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-[#EDF0F1] pb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E5F0F5] text-sm text-[#2C7DA0]">
              <Icon name="forum" size={18} className="text-[#2C7DA0]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#60758C]">Subject / Target</div>
              <div className="text-xs font-extrabold text-[#10253A]">{subject}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEE8F8] text-sm text-[#7355A2]">
              <Icon name="tune" size={18} className="text-[#7355A2]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#60758C]">Feedback Type</div>
              <div className="text-xs font-extrabold text-[#10253A]">{feedbackType}</div>
            </div>
          </div>
        </section>

        {/* What Happens Next Section */}
        <section className="mt-8">
          <h2 className="font-montserrat text-base font-extrabold text-[#10253A]">
            What happens next?
          </h2>
          <p className="mt-1 text-xs text-[#60758C]">
            Your feedback will be processed by the relevant university department.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#D2EEE2] bg-[#EAF7F1] p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#D2EEE2] text-sm font-bold text-[#009A44]">
                <Icon name="filter_list" size={18} className="text-[#009A44]" />
              </div>
              <div className="font-montserrat text-xs font-extrabold text-[#10253A]">
                1. Review
              </div>
              <div className="mt-1 text-[11px] leading-relaxed text-[#60758C]">
                The QA &amp; department review teams inspect the concern.
              </div>
            </div>

            <div className="rounded-2xl border border-[#D4E9F2] bg-[#EAF4F8] p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#D4E9F2] text-sm font-bold text-[#2C7DA0]">
                <Icon name="manage_accounts" size={18} className="text-[#2C7DA0]" />
              </div>
              <div className="font-montserrat text-xs font-extrabold text-[#10253A]">
                2. Action
              </div>
              <div className="mt-1 text-[11px] leading-relaxed text-[#60758C]">
                Appropriate steps are taken to resolve the report.
              </div>
            </div>

            <div className="rounded-2xl border border-[#E2D9F4] bg-[#F1EDFA] p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#E2D9F4] text-sm font-bold text-[#7355A2]">
                <Icon name="sparkles" size={18} className="text-[#7355A2]" />
              </div>
              <div className="font-montserrat text-xs font-extrabold text-[#10253A]">
                3. Impact
              </div>
              <div className="mt-1 text-[11px] leading-relaxed text-[#60758C]">
                Your feedback directly improves the UNILAG experience.
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <Link
            href={`/track?ref=${encodeURIComponent(refCode)}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white py-3.5 text-center text-sm font-extrabold text-navy hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Icon name="search" size={16} className="text-primary" />
            Track this Whisper
          </Link>

          <Link
            href="/whispers"
            className="btn-primary-green w-full py-4 text-center text-sm font-extrabold"
          >
            View My Whispers &nbsp;→
          </Link>

          <Link
            href="/"
            className="btn-primary-blue w-full py-4 text-center text-sm font-extrabold"
          >
            Back to Home &nbsp;→
          </Link>
        </div>

        <p className="mt-4 text-center text-[10.5px] text-text-soft">
          Save your reference number <span className="font-mono font-bold text-primary">{refCode}</span> to track this submission later at{" "}
          <Link href="/track" className="text-primary font-semibold hover:underline">/track</Link>
        </p>
      </main>
    </div>
  );
}

export default function WhisperSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]"><span className="h-7 w-7 animate-spin rounded-full border-2 border-[#009A44] border-t-transparent" /></div>}>
      <WhisperSuccessContent />
    </Suspense>
  );
}