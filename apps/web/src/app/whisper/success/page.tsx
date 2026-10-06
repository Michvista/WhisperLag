"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WhisperBrand } from "@/components/ui/WhisperBrand";
import { Icon } from "@/components/ui/Icon";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { toast } from "@/lib/toast";

function WhisperSuccessContent() {
  const searchParams = useSearchParams();
  const queued = searchParams.get("queued") === "1";
  const refCode = searchParams.get("ref") || `WL-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const category = searchParams.get("cat") || "Academic / Faculty";
  const subject = searchParams.get("sub") || "General Feedback";
  const feedbackType = searchParams.get("type") || "Constructive";

  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

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

  async function handleCopyKey() {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(refCode);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = refCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast("Tracking key copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast("Failed to copy key. Please write it down manually.", "error");
    }
  }

  function handleSaveToDevice() {
    setSaving(true);
    try {
      const receiptContent = `================================================
WHISPERLAG · UNIVERSITY OF LAGOS
OFFICIAL SUBMISSION RECEIPT
================================================

YOUR PRIVATE TRACKING KEY:
${refCode}

Submission Details:
- Date: ${currentDate} at ${currentTime}
- Category: ${category}
- Subject / Target: ${subject}
- Feedback Type: ${feedbackType}
- Security: 100% Cryptographically Anonymous & Unlinked

HOW TO TRACK YOUR SUBMISSION:
1. Visit: https://whisperlag.vercel.app/track
2. Enter your Tracking Key: ${refCode}
3. Check investigation progress, status updates, and institutional responses.

SECURITY NOTICE:
Your identity is never stored or linked to this report.
Keep this receipt file in a safe place. WhisperLag administrators cannot recover lost tracking keys.

================================================
University of Lagos · Quality Assurance & Student Feedback
`;

      const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = url;
      downloadAnchor.download = `WhisperLag-Receipt-${refCode}.txt`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
      toast("Receipt saved to your device!");
    } catch {
      toast("Could not save file. Please copy the key manually.", "error");
    } finally {
      setTimeout(() => setSaving(false), 800);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-navy antialiased">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/whisper"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-white text-navy hover:bg-slate-50 transition-colors"
            title="Back to Whisper Form"
          >
            <Icon name="arrow_back" size={16} />
          </Link>
          <WhisperBrand href="/" size="sm" />
          <Link
            href="/notifications"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-white text-text-secondary hover:bg-slate-50 transition-colors"
          >
            <Icon name="notifications" size={16} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6 sm:py-8 space-y-5">
        {/* ── Confetti & Success Banner ── */}
        <div className="relative text-center pt-2">
          {/* Decorative Confetti Flakes */}
          <div className="pointer-events-none absolute inset-x-0 -top-2 flex justify-center gap-12 opacity-80">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="h-2.5 w-2.5 rounded-full bg-secondary rotate-45" />
            <span className="h-2 w-3 rounded-full bg-amber-400 -rotate-12" />
            <span className="h-2.5 w-2 rounded-full bg-tertiary rotate-12" />
            <span className="h-2 w-2 rounded-full bg-primary" />
          </div>

          {/* Green Checkmark Circle */}
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#009A44] text-white shadow-[0_0_0_8px_#DFF3E9,0_0_0_18px_#EDF9F4]">
            <Icon name="check" size={36} className="text-white" />
          </div>

          <h1 className="font-montserrat text-2xl sm:text-[26px] font-extrabold tracking-tight text-navy">
            Your whisper has <br />
            been submitted!
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-text-secondary">
            {queued
              ? "You were offline. Your feedback is encrypted on this device and will sync when you're connected."
              : "Thank you for helping make UNILAG better."}
          </p>
        </div>

        {/* ── Your Tracking Key Box ── */}
        <div className="rounded-2xl border border-border-subtle bg-white p-4 sm:p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary flex items-center gap-1">
              Your Tracking Key <span className="text-[11px] text-text-soft">ⓘ</span>
            </span>
            <span className="rounded-full bg-green-tint px-2 py-0.5 text-[10.5px] font-bold text-primary">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50/80 border border-slate-200/80 px-4 py-3">
            <span className="font-mono text-base sm:text-lg font-extrabold tracking-wider text-navy selection:bg-green-100">
              {refCode}
            </span>
            <button
              onClick={handleCopyKey}
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-green-100 transition-colors"
              title="Copy Tracking Key"
            >
              <Icon name={copied ? "check" : "content_copy"} size={18} className="text-primary" />
            </button>
          </div>
        </div>

        {/* ── Keep This Key Safe Alert Box ── */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/90 p-4 text-xs">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <Icon name="lock" size={17} className="text-amber-800" />
          </div>
          <div className="space-y-1">
            <h3 className="font-montserrat text-xs font-bold text-amber-950">
              Keep this key safe.
            </h3>
            <p className="text-[11.5px] leading-relaxed text-amber-900/90">
              It is the only way to privately track your whisper. We cannot recover it because we don&apos;t store your identity with your feedback.
            </p>
          </div>
        </div>

        {/* ── Action Buttons Row: Copy Key & Save to Device ── */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleCopyKey}
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-button-green transition-all hover:bg-primary-hover active:scale-[0.98]"
          >
            <Icon name={copied ? "check" : "content_copy"} size={16} className="text-white" />
            <span>{copied ? "Copied!" : "Copy Key"}</span>
          </button>

          <button
            onClick={handleSaveToDevice}
            disabled={saving}
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50/90 px-4 py-3 text-xs sm:text-sm font-bold text-primary transition-all hover:bg-green-100 active:scale-[0.98] disabled:opacity-50"
          >
            <Icon name="download" size={16} className="text-primary" />
            <span>{saving ? "Saving…" : "Save to Device"}</span>
          </button>
        </div>

        {/* ── Track My Whisper Full Width Button ── */}
        <div className="pt-1">
          <Link
            href={`/track?ref=${encodeURIComponent(refCode)}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white py-3.5 text-xs sm:text-sm font-bold text-navy shadow-card transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
          >
            <Icon name="search" size={16} className="text-text-secondary" />
            <span>Track My Whisper</span>
          </Link>
        </div>

        {/* ── Submission Metadata Breakdown ── */}
        <div className="rounded-2xl border border-border-subtle bg-white p-4 text-xs space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-text-secondary font-medium">Category:</span>
            <span className="font-bold text-navy">{category}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-text-secondary font-medium">Subject / Target:</span>
            <span className="font-bold text-navy truncate max-w-[180px]">{subject}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-text-secondary font-medium">Feedback Type:</span>
            <span className="font-semibold text-primary">{feedbackType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary font-medium">Submitted At:</span>
            <span className="font-medium text-text-soft">{currentDate} · {currentTime}</span>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs font-bold text-primary hover:underline"
          >
            Return to Homepage →
          </Link>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}

export default function WhisperSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#009A44] border-t-transparent" />
        </div>
      }
    >
      <WhisperSuccessContent />
    </Suspense>
  );
}