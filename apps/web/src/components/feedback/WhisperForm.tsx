"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const CATEGORIES = ["Academic Issue", "Facility Maintenance", "Student Welfare", "Other"];

/**
 * Whisper submission form shared by the student dashboard and the focused
 * submit screen. Posts to POST /api/v1/feedback; anonymity is enforced
 * server-side (the backend stores no submitting user).
 */
export function WhisperForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setStatus("submitting");
    try {
      await api("/feedback", {
        method: "POST",
        body: JSON.stringify({ category, content, isAnonymous: true }),
        token: localStorage.getItem("whisperlag_token") ?? undefined,
      });
      setContent("");
      setStatus("done");
      onSubmitted?.();
    } catch {
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-label-md text-label-md text-onSurfaceVariant">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-12 w-full rounded border border-outlineVariant bg-surface-container-lowest px-3 text-onSurface transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1">
        <label className="mb-2 block font-label-md text-label-md text-onSurfaceVariant">Your Message</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder="Describe the issue safely and clearly..."
          className="h-32 w-full resize-none rounded border border-outlineVariant bg-surface-container-lowest p-3 text-onSurface transition-all outline-none placeholder:text-onSurfaceVariant/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="h-12 rounded-lg bg-primary px-8 font-label-md text-label-md text-onPrimary shadow-sm transition-colors hover:bg-surface-tint disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Send Anonymously"}
        </button>
      </div>
    </form>
  );
}