"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { flushOutbox, submitWhisperOfflineAware } from "@/lib/offline";
import { toast } from "@/lib/toast";
import { api } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";

export interface CategoryOption {
  id: string;
  title: string;
  desc: string;
  iconBg: string;
  iconColor: string;
  iconName: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: "Lecturer",
    title: "Lecturer",
    desc: "Feedback about teaching quality, lecturer behaviour, assessment, etc.",
    iconBg: "bg-green-tint",
    iconColor: "text-primary",
    iconName: "school",
  },
  {
    id: "Course / Learning",
    title: "Course / Learning",
    desc: "Course content, schedule, resources, exams, timetable clashes, etc.",
    iconBg: "bg-blue-tint",
    iconColor: "text-secondary",
    iconName: "book",
  },
  {
    id: "Department / Service",
    title: "Department / Service",
    desc: "Academic departments, student services, records, portal access, etc.",
    iconBg: "bg-green-tint",
    iconColor: "text-primary",
    iconName: "building",
  },
  {
    id: "Hostel / Facilities",
    title: "Hostel / Facilities",
    desc: "Hostel conditions, maintenance, facilities, security, water/power, etc.",
    iconBg: "bg-purple-tint",
    iconColor: "text-tertiary",
    iconName: "facility",
  },
  {
    id: "Administration",
    title: "Administration",
    desc: "Staff, policies, communication, management, student welfare, etc.",
    iconBg: "bg-amber-tint",
    iconColor: "text-amber-800",
    iconName: "settings",
  },
  {
    id: "Other",
    title: "Other",
    desc: "Anything else you want to share about your UNILAG experience.",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
    iconName: "chat",
  },
];

const FEEDBACK_TYPES = ["Constructive", "Concern", "Suggestion", "Praise", "Urgent"];

const UNILAG_DOMAINS = ["unilag.edu.ng", "live.unilag.edu.ng"];

function isUnilagEmail(email: string): boolean {
  if (!email) return true;
  const domain = email.trim().toLowerCase().split("@").pop() ?? "";
  return UNILAG_DOMAINS.includes(domain);
}

interface Department {
  id: string;
  name: string;
}

export function WhisperWizard() {
  const router = useRouter();

  // Step: 1 (Type) -> 2 (Details) -> 3 (Privacy) -> 4 (Review)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [category, setCategory] = useState<string>("Lecturer");
  const [subject, setSubject] = useState<string>("");
  const [feedbackType, setFeedbackType] = useState<string>("Constructive");
  const [content, setContent] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [unilagEmail, setUnilagEmail] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Validation / Status
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    api<Department[]>("/departments/public", { cache: "no-store" })
      .then(setDepartments)
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    const onOnline = () => {
      void flushOutbox();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  const selectedCategoryObj =
    CATEGORY_OPTIONS.find((c) => c.id === category) ?? CATEGORY_OPTIONS[0];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast("File is too large. Maximum size is 10 MB.", "error");
        return;
      }
      setSelectedFile(file);
      toast("Attachment added: " + file.name);
    }
  }

  function handleNextFromDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please enter your feedback message before continuing.");
      return;
    }
    if (!isUnilagEmail(unilagEmail)) {
      setEmailError(
        "That doesn't look like a UNILAG address. Leave it blank to stay completely anonymous."
      );
      return;
    }
    setEmailError(null);
    setError(null);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleFinalSubmit() {
    setError(null);
    setSubmitting(true);

    const refCode = `WL-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const contentBody = subject
      ? `[${category} - ${subject} (${feedbackType})]\n\n${content}`
      : `[${category} (${feedbackType})]\n\n${content}`;

    try {
      let mode: "online" | "queued" = "online";

      if (selectedFile) {
        // Multipart submission with real file
        const fd = new FormData();
        fd.append("category", category);
        fd.append("content", contentBody);
        fd.append("refNumber", refCode);
        if (departmentId) fd.append("departmentId", departmentId);
        if (unilagEmail.trim()) fd.append("unilagEmail", unilagEmail.trim());
        fd.append("attachment", selectedFile);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/v1/feedback/public`,
          { method: "POST", body: fd }
        );
        if (!res.ok) {
          const json = (await res.json()) as { error?: string };
          throw new Error(json.error ?? "Upload failed");
        }
        mode = "online";
      } else {
        // Standard JSON submission (no attachment)
        const payload = {
          category,
          content: contentBody,
          departmentId: departmentId || undefined,
          unilagEmail: unilagEmail.trim() || undefined,
          refNumber: refCode,
        };
        const result = await submitWhisperOfflineAware(payload);
        mode = result.mode as "online" | "queued";
      }

      setSubmitting(false);

      if (mode === "queued") {
        toast("Saved offline. It will sync when you're back online.", "info");
        router.push(
          `/whisper/success?queued=1&ref=${refCode}&cat=${encodeURIComponent(
            category
          )}&sub=${encodeURIComponent(subject || category)}&type=${encodeURIComponent(
            feedbackType
          )}`
        );
      } else {
        toast("Feedback submitted anonymously!");
        router.push(
          `/whisper/success?ref=${refCode}&cat=${encodeURIComponent(
            category
          )}&sub=${encodeURIComponent(subject || category)}&type=${encodeURIComponent(
            feedbackType
          )}`
        );
      }
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
      toast("Failed to submit feedback", "error");
    }
  }

  return (
    <div className="w-full">
      {/* 4-Step Progress Indicator */}
      <div className="mb-6 flex items-center justify-between px-2 sm:px-4">
        {[
          { num: 1, label: "Type" },
          { num: 2, label: "Details" },
          { num: 3, label: "Privacy" },
          { num: 4, label: "Submit" },
        ].map((item, idx, arr) => {
          const isDone = step > item.num;
          const isActive = step === item.num;

          return (
            <div key={item.num} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => {
                  if (item.num < step) setStep(item.num as 1 | 2 | 3 | 4);
                }}
                disabled={item.num > step}
                className="flex flex-col items-center gap-1 focus:outline-none disabled:cursor-default"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isDone || isActive
                      ? "bg-primary text-white"
                      : "border border-border-subtle bg-white text-text-soft"
                  }`}
                >
                  {isDone ? "✓" : item.num}
                </div>
                <span
                  className={`text-[11px] font-semibold tracking-tight ${
                    isActive ? "text-navy font-bold" : "text-text-soft"
                  }`}
                >
                  {item.label}
                </span>
              </button>

              {idx < arr.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition-colors ${
                    step > idx + 1 ? "bg-primary" : "bg-border-subtle"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* STEP 1: CHOOSE FEEDBACK TYPE */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <span className="text-xs font-bold tracking-wider text-secondary uppercase">
              Give Feedback
            </span>
            <h1 className="mt-1 font-montserrat text-2xl font-bold tracking-tight text-navy">
              What type of feedback are you sharing?
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
              Select a category that best describes your feedback to route it quickly to the right review board.
            </p>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-1">
            {CATEGORY_OPTIONS.map((opt) => {
              const isSelected = category === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCategory(opt.id)}
                  className={`group flex items-center gap-3.5 rounded-lg border p-3.5 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-green-tint shadow-xs"
                      : "border-border-subtle bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${opt.iconBg} ${opt.iconColor}`}
                  >
                    <Icon name={opt.iconName} size={20} className={opt.iconColor} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-montserrat text-sm font-bold text-navy">
                      {opt.title}
                    </div>
                    <div className="text-xs leading-relaxed text-text-secondary">
                      {opt.desc}
                    </div>
                  </div>

                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-border-subtle bg-white"
                    }`}
                  >
                    {isSelected && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setStep(2);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="btn-primary-green w-full py-3 text-sm font-semibold"
          >
            Continue &nbsp;→
          </button>
        </div>
      )}

      {/* STEP 2: DETAILS & FEEDBACK CONTENT */}
      {step === 2 && (
        <form onSubmit={handleNextFromDetails} className="space-y-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
            >
              ‹ Back to Category
            </button>
            <span className="rounded-md bg-green-tint px-2.5 py-0.5 text-xs font-bold text-primary">
              {selectedCategoryObj.title}
            </span>
          </div>

          <div>
            <h1 className="font-montserrat text-2xl font-bold tracking-tight text-navy">
              Tell us the details
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              Be as specific as you like. Your identity remains strictly protected.
            </p>
          </div>

          {/* Subject / Lecturer Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              Subject / Course / Person (Optional)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Dr. Adeyemi, CSC 301, Jaja Hall, Portal Login..."
              className="wl-input"
            />
          </div>

          {/* Feedback Tone / Tag */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              Feedback Type
            </label>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFeedbackType(type)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    feedbackType === type
                      ? "bg-primary text-white"
                      : "border border-border-subtle bg-white text-text-secondary hover:border-primary hover:text-navy"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Department Router (Optional) */}
          {departments.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-navy">
                Target Department / Faculty (Optional)
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="wl-input cursor-pointer"
              >
                <option value="">Auto-route by system (Recommended)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Main Feedback Content */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              Your Feedback <span className="text-error">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe what happened, what could be improved, or what you appreciate..."
              className="wl-input resize-none"
            />
          </div>

          {/* Attachment upload */}
          <div className="rounded-lg border border-dashed border-border-subtle bg-white p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${selectedFile ? "bg-green-tint" : "bg-blue-tint"} text-secondary`}>
                  <Icon name="attachment" size={18} className={selectedFile ? "text-primary" : "text-secondary"} />
                </div>
                <div>
                  <div className="text-xs font-bold text-navy">
                    {selectedFile ? selectedFile.name : "Attach supporting file (Optional)"}
                  </div>
                  <div className="text-[11px] text-text-soft">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(0)} KB · Will upload securely`
                      : "Screenshots or documents (Max 10MB)"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    Remove
                  </button>
                )}
                <label className="cursor-pointer rounded-md border border-border-subtle bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-slate-50">
                  {selectedFile ? "Change" : "Browse"}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Soft Gate UNILAG email (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-text-soft">
              UNILAG Email (Optional — Verified, never stored or linked)
            </label>
            <input
              type="email"
              value={unilagEmail}
              onChange={(e) => setUnilagEmail(e.target.value)}
              placeholder="you@live.unilag.edu.ng"
              className="wl-input"
            />
            {emailError && (
              <p className="text-xs font-semibold text-error">{emailError}</p>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-semibold text-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary-green w-full py-3 text-sm font-semibold"
          >
            Continue to Privacy &nbsp;→
          </button>
        </form>
      )}

      {/* STEP 3: PRIVACY */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h1 className="font-montserrat text-2xl font-bold tracking-tight text-navy">
              Your whisper is <span className="text-primary">protected.</span>
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              Your identity is stripped at the network boundary before this feedback is stored.
            </p>
          </div>

          <div className="rounded-lg border border-border-subtle bg-white p-4 space-y-3">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-tint text-primary">
                <Icon name="user" size={16} className="text-primary" />
              </div>
              <div>
                <div className="font-montserrat text-xs font-bold text-navy">
                  No name required
                </div>
                <div className="text-xs leading-relaxed text-text-secondary">
                  You can share freely without revealing your name or contact info.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-tint text-primary">
                <Icon name="shield" size={16} className="text-primary" />
              </div>
              <div>
                <div className="font-montserrat text-xs font-bold text-navy">
                  No matric number required
                </div>
                <div className="text-xs leading-relaxed text-text-secondary">
                  Your student identity isn&apos;t collected or linked to your message.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-tint text-primary">
                <Icon name="verified_user" size={16} className="text-primary" />
              </div>
              <div>
                <div className="font-montserrat text-xs font-bold text-navy">
                  Cryptographically isolated
                </div>
                <div className="text-xs leading-relaxed text-text-secondary">
                  We keep your feedback and authentication tokens strictly separate.
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setStep(4);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="btn-primary-green w-full py-3 text-sm font-semibold"
          >
            Continue to Review &nbsp;→
          </button>
        </div>
      )}

      {/* STEP 4: REVIEW FEEDBACK */}
      {step === 4 && (
        <div className="space-y-5">
          <div>
            <h1 className="font-montserrat text-2xl font-bold tracking-tight text-navy">
              Review your feedback
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              Take a moment to review the details below before submitting.
            </p>
          </div>

          <div className="rounded-lg border border-border-subtle bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
                Summary
              </span>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
              >
                <Icon name="edit" size={12} /> Edit
              </button>
            </div>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-2.5">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${selectedCategoryObj.iconBg}`}>
                <Icon name={selectedCategoryObj.iconName} size={16} className={selectedCategoryObj.iconColor} />
              </div>
              <div>
                <div className="text-[11px] text-text-soft">Category</div>
                <div className="text-xs font-bold text-navy">{category}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-tint text-secondary">
                <Icon name="forum" size={16} className="text-secondary" />
              </div>
              <div>
                <div className="text-[11px] text-text-soft">Subject / Target</div>
                <div className="text-xs font-bold text-navy">{subject || "General"}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 border-b border-slate-100 pb-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-tint text-primary">
                <Icon name="description" size={16} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] text-text-soft">Your Feedback</div>
                <div className="mt-0.5 text-xs leading-relaxed text-navy">{content}</div>
              </div>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-3 border-b border-slate-100 pb-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-tint text-secondary">
                  <Icon name="attachment" size={16} className="text-secondary" />
                </div>
                <div>
                  <div className="text-[11px] text-text-soft">Attachment</div>
                  <div className="text-xs font-bold text-navy">{selectedFile.name}</div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs font-semibold text-navy">Anonymous Submission</div>
              <span className="rounded-md bg-green-tint px-2 py-0.5 text-xs font-bold text-primary">
                ✓ Active
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-semibold text-error">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={handleFinalSubmit}
            className="btn-primary-green w-full py-3.5 text-sm font-semibold"
          >
            {submitting ? "Submitting securely..." : "Submit Feedback \u00A0→"}
          </button>
        </div>
      )}
    </div>
  );
}
