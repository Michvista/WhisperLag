"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const CATEGORIES = ["Academic Issue", "Facility Maintenance", "Student Welfare", "Other"];

const UNILAG_DOMAINS = ["unilag.edu.ng", "live.unilag.edu.ng"];

function isUnilagEmail(email: string): boolean {
  if (!email) return true; // optional — blank is allowed
  const domain = email.trim().toLowerCase().split("@").pop() ?? "";
  return UNILAG_DOMAINS.includes(domain);
}

interface WhisperFormProps {
  redirectToSuccess?: boolean;
  className?: string;
}

/**
 * Public, no-login whisper form — the "anon app" flow. An optional UNILAG
 * email is a soft community gate: it is validated client- and server-side
 * but NEVER stored or linked to the message.
 */
export function WhisperForm({ redirectToSuccess = false, className = "" }: WhisperFormProps) {
  const router = useRouter();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [content, setContent] = useState("");
  const [unilagEmail, setUnilagEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    if (!isUnilagEmail(unilagEmail)) {
      setEmailError("That doesn't look like a UNILAG address. Leave it blank to stay anonymous.");
      return;
    }
    setEmailError(null);
    setError(null);
    setStatus("submitting");
    try {
      await api("/feedback/public", {
        method: "POST",
        body: JSON.stringify({ category, content, unilagEmail: unilagEmail.trim() }),
      });
      if (redirectToSuccess) {
        router.push("/whisper/success");
      } else {
        setContent("");
        router.push("/whisper/success");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your whisper. Try again.");
      setStatus("idle");
    }
  }

  return (
    <form className={`flex flex-col gap-8 ${className}`} onSubmit={handleSubmit}>
      <div className="relative">
        <label className="absolute -top-5 left-0 font-label-caps text-label-caps text-onSurfaceVariant">
          01 // Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-minimal w-full font-body-md text-body-md text-onSurface"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="relative">
        <label className="absolute -top-5 left-0 font-label-caps text-label-caps text-onSurfaceVariant">
          02 // UNILAG Email (optional — never stored)
        </label>
        <input
          type="email"
          value={unilagEmail}
          onChange={(e) => setUnilagEmail(e.target.value)}
          placeholder="you@live.unilag.edu.ng"
          className="input-minimal w-full font-body-md text-body-md text-onSurface"
        />
        {emailError && (
          <p className="mt-2 font-body-sm text-body-sm text-error">{emailError}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-label-caps text-label-caps uppercase tracking-wider text-onSurfaceVariant">
          Your Whisper
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder="Describe the issue or share your feedback…"
          className="input-minimal min-h-[220px] w-full resize-none font-body-lg leading-relaxed"
        />
      </div>

      {error && (
        <p className="border border-error-container bg-error-container/30 p-3 font-body-sm text-body-sm text-onErrorContainer">
          {error}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-ink/10 pt-6">
        <div className="flex items-center gap-2 font-mono-label text-mono-label text-unilag-green">
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          Anonymized before it reaches us
        </div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="bg-ink px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary disabled:opacity-60"
        >
          {status === "submitting" ? "Sealing…" : "Seal & Submit"}
        </button>
      </div>
    </form>
  );
}