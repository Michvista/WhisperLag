"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken } from "@/lib/api";

interface Department {
  id: string;
  name: string;
}

const CATEGORIES = ["Academic Issue", "Facility Maintenance", "Student Welfare", "Other"];

interface WhisperFormProps {
  /** Show the richer metadata inputs (academic unit, course code). */
  withMetadata?: boolean;
  /** Navigate to the success screen after submission. */
  redirectToSuccess?: boolean;
}

/**
 * Editorial whisper submission form. Sends to POST /api/v1/feedback; the
 * backend stores no submitting user, so anonymity is structural.
 */
export function WhisperForm({ withMetadata = false, redirectToSuccess = false }: WhisperFormProps) {
  const router = useRouter();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [content, setContent] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

  useEffect(() => {
    if (!withMetadata) return;
    api<Department[]>("/departments", { token: getToken(), cache: "no-store" })
      .then(setDepartments)
      .catch(() => undefined);
  }, [withMetadata]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setStatus("submitting");
    try {
      await api("/feedback", {
        method: "POST",
        body: JSON.stringify({
          category,
          content,
          isAnonymous: true,
          departmentId: departmentId || undefined,
        }),
        token: getToken(),
      });
      setContent("");
      setStatus("done");
      if (redirectToSuccess) {
        router.push("/whisper/success");
      }
    } catch {
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col gap-6 border border-primary/20 bg-primary/5 p-8">
        <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
        <h3 className="font-display text-headline-md font-semibold text-onSurface">Whisper Received</h3>
        <p className="font-body-md text-body-md text-onSurfaceVariant">
          Your whisper is hidden. It&apos;s been received successfully.
        </p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
      {withMetadata && (
        <>
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
              02 // Academic Unit (Optional)
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
        </>
      )}
      {!withMetadata && (
        <div className="relative">
          <label className="absolute -top-5 left-0 font-label-caps text-label-caps text-onSurfaceVariant">
            Subject
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
      )}

      <div className="flex flex-col gap-2">
        <label className="font-label-caps text-label-caps uppercase tracking-wider text-onSurfaceVariant">
          Your Whisper
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder={withMetadata ? "Begin writing your whisper…" : "Details..."}
          className={`input-minimal w-full resize-none font-body-lg ${withMetadata ? "min-h-[300px] leading-relaxed" : "h-40"}`}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono-label text-mono-label text-unilag-green/80">
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          End-to-End Encrypted
        </div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="bg-ink px-8 py-3 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary disabled:opacity-60"
        >
          {status === "submitting" ? "Sealing…" : withMetadata ? "Seal & Submit" : "Send Securely"}
        </button>
      </div>
    </form>
  );
}