"use client";
import { Icon } from "@/components/ui/Icon";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { flushOutbox, submitWhisperOfflineAware } from "@/lib/offline";
import { toast } from "@/lib/toast";
import { api } from "@/lib/api";

const CATEGORIES = ["Academic Issue", "Facility Maintenance", "Student Welfare", "Other"];

const UNILAG_DOMAINS = ["unilag.edu.ng", "live.unilag.edu.ng"];

function isUnilagEmail(email: string): boolean {
  if (!email) return true; // optional : blank is allowed
  const domain = email.trim().toLowerCase().split("@").pop() ?? "";
  return UNILAG_DOMAINS.includes(domain);
}

interface Department {
  id: string;
  name: string;
}

interface WhisperFormProps {
  className?: string;
}

/**
 * Public, no-login whisper form : the "anon app" flow. The optional UNILAG
 * email is a soft community gate (validated, never stored); the optional
 * department tags the complaint for staff routing. Offline submissions are
 * queued locally and auto-synced.
 */
export function WhisperForm({ className = "" }: WhisperFormProps) {
  const router = useRouter();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [content, setContent] = useState("");
  const [unilagEmail, setUnilagEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  useEffect(() => {
    api<Department[]>("/departments/public", { cache: "no-store" })
      .then(setDepartments)
      .catch(() => setDepartments([]));
  }, []);

  // When the connection returns, push any offline whispers to the server.
  useEffect(() => {
    const onOnline = () => {
      void flushOutbox();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

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
    const { mode } = await submitWhisperOfflineAware({
      category,
      content,
      departmentId: departmentId || undefined,
      unilagEmail: unilagEmail.trim() || undefined,
    });
    setStatus("idle");
    if (mode === "queued") {
      toast("Saved offline. It will sync when you're back online.", "info");
      router.push("/whisper/success?queued=1");
    } else {
      toast("Your whisper was sent anonymously.");
      router.push("/whisper/success");
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
          02 // Department (optional)
        </label>
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="input-minimal w-full font-body-md text-body-md text-onSurface"
        >
          <option value="">Select department…</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="relative">
        <label className="absolute -top-5 left-0 font-label-caps text-label-caps text-onSurfaceVariant">
          03 // UNILAG Email (optional : never stored)
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
          <Icon name="verified_user" size={22} />
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