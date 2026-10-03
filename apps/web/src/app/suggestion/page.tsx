"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AppShell } from "@/components/layout/AppShell";
import { toast } from "@/lib/toast";
import { api } from "@/lib/api";

export default function SuggestionPage() {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      // Submit as a whisper with category "Other" and a [Suggestion Box] prefix
      await api("/feedback/public", {
        method: "POST",
        body: JSON.stringify({
          category: "Other",
          content: `[Suggestion Box]\n\n${text.trim()}`,
          refNumber: `WL-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        }),
      });
      setSubmitted(true);
      setText("");
      toast("Suggestion submitted anonymously!");
    } catch {
      toast("Failed to submit. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header link */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-montserrat text-2xl font-bold text-navy">Suggestion Box</h1>
            <p className="mt-1 text-xs text-text-secondary">
              Share ideas to help make UNILAG a better campus for all students.
            </p>
          </div>
          <Link href="/more" className="text-xs font-semibold text-secondary hover:underline">
            ‹ More Menu
          </Link>
        </div>

        {/* Hero illustration card */}
        <div className="flex flex-col items-center rounded-2xl border border-amber-tint bg-amber-tint/40 p-6 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-tint">
            <Icon name="lightbulb" size={28} className="text-amber-700" />
          </div>
          <h2 className="font-montserrat text-base font-bold text-navy">Have an improvement idea?</h2>
          <p className="mt-1 max-w-sm text-xs text-text-secondary">
            Your suggestions are routed directly to student affairs and campus facility administrators anonymously.
          </p>
        </div>

        {/* Success state */}
        {submitted ? (
          <div className="rounded-xl border border-green-tint bg-green-tint p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
              <Icon name="check" size={24} className="text-white" />
            </div>
            <h3 className="font-montserrat text-base font-bold text-navy">Suggestion Received!</h3>
            <p className="text-xs text-text-secondary">Thank you for contributing. Your idea has been queued for review.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-2 rounded-lg border border-border-subtle bg-white px-5 py-2 text-xs font-semibold text-navy hover:bg-slate-50 transition-colors"
            >
              Submit Another Suggestion
            </button>
          </div>
        ) : (
          /* Submission form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-card space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                Your Suggestion
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                rows={5}
                placeholder="Describe what could be improved, a new idea, or positive feedback for campus operations..."
                className="wl-input resize-none text-sm"
              />
              <p className="text-[11px] text-text-soft">
                Whisper Lock protected — no personal credentials are saved with this note.
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="btn-primary-green w-full py-3.5 text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? "Submitting securely…" : "Submit Suggestion →"}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
