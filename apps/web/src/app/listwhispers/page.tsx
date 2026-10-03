"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";

interface WhisperItem {
  id: string;
  category: string;
  content: string;
  isAnonymous: boolean;
  status: "NEW" | "ACKNOWLEDGED" | "ACTIONED";
  createdAt: string;
  resolutionNote?: string | null;
  refNumber?: string | null;
  attachmentUrl?: string | null;
}

type FilterTab = "All" | "Under Review" | "Resolved";

export default function ListWhispersPage() {
  const [items, setItems] = useState<WhisperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api<WhisperItem[]>("/feedback/public-recent?limit=100", { cache: "no-store" });
        setItems(Array.isArray(res) ? res : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const allCount = items.length;
  const reviewCount = items.filter((w) => w.status === "ACKNOWLEDGED" || w.status === "NEW").length;
  const resolvedCount = items.filter((w) => w.status === "ACTIONED").length;

  const filteredItems = items.filter((item) => {
    if (activeTab === "Under Review" && item.status !== "ACKNOWLEDGED" && item.status !== "NEW") return false;
    if (activeTab === "Resolved" && item.status !== "ACTIONED") return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.content.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Student Whispers Feed
            </span>
            <h1 className="mt-1 font-montserrat text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Public Feedback & Resolutions
            </h1>
            <p className="mt-1 text-xs text-text-secondary">
              Track general campus feedback and official university resolutions across departments.
            </p>
          </div>
          <Link
            href="/whisper"
            className="btn-primary-green px-4 py-2 text-xs font-semibold"
          >
            <Icon name="add" size={14} className="text-white" /> Give Feedback
          </Link>
        </div>

        {/* Sensitive Content Protection Policy Notice */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-tint bg-blue-tint/60 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-secondary shadow-2xs">
            <Icon name="shield" size={16} className="text-secondary" />
          </div>
          <div className="text-xs text-navy">
            <span className="font-bold">Confidentiality & Due Process:</span> To protect student safety and uphold fair academic due process, sensitive claims and specific personnel allegations are kept strictly confidential for University Quality Assurance review and are redacted from this public feed.
          </div>
        </div>

        {/* Filter Tabs and Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5">
            {[
              { id: "All" as FilterTab, label: "All", count: allCount },
              { id: "Under Review" as FilterTab, label: "Under Review", count: reviewCount },
              { id: "Resolved" as FilterTab, label: "Resolved", count: resolvedCount },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "border-primary bg-green-tint text-primary font-bold"
                      : "border-border-subtle bg-white text-text-secondary hover:text-navy hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                      isActive ? "bg-primary text-white" : "bg-slate-100 text-text-secondary"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-soft">
              <Icon name="search" size={15} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feedback..."
              className="w-full rounded-lg border border-border-subtle bg-white py-1.5 pl-9 pr-3 text-xs text-navy placeholder-text-soft outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Whispers Feed */}
        {loading ? (
          <div className="space-y-3 py-10 text-center text-xs font-semibold text-text-secondary">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading student whispers...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-white p-10 text-center">
            <h3 className="font-montserrat text-sm font-bold text-navy">
              No whispers found
            </h3>
            <p className="mt-1 text-xs text-text-secondary">
              Try searching with another keyword or submit your own feedback.
            </p>
            <Link
              href="/whisper"
              className="btn-primary-green mt-4 inline-flex text-xs font-semibold"
            >
              Give Feedback &nbsp;→
            </Link>
          </div>
        ) : (
          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredItems.map((item, idx) => {
              const isResolved = item.status === "ACTIONED";
              const isLecturer = item.category === "Lecturer";
              const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              // Clean message content
              const rawContent = item.content.replace(/^\[.*?\]\s*/, "");

              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-border-subtle bg-white p-4 shadow-card space-y-2.5 transition-all hover:border-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="rounded-md bg-green-tint px-2 py-0.5 text-[11px] font-bold text-primary">
                        {item.category}
                      </span>
                      {isLecturer && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-tint px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          <Icon name="lock" size={11} /> Confidential Review
                        </span>
                      )}
                    </div>

                    {isResolved ? (
                      <span className="rounded-md bg-green-tint px-2 py-0.5 text-[10px] font-bold text-primary">
                        ✓ Action Taken
                      </span>
                    ) : (
                      <span className="rounded-md bg-amber-tint px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        ⏱ Under Review
                      </span>
                    )}
                  </div>

                  {/* If Lecturer category and unresolved, redact sensitive accusation details */}
                  {isLecturer && !isResolved ? (
                    <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <Icon name="visibility_off" size={14} className="text-amber-700" />
                        Specific details redacted for faculty review
                      </div>
                      <p className="text-[11.5px] leading-relaxed text-slate-600">
                        Academic teaching quality feedback submitted anonymously. Individual allegations and evidence files are restricted to accredited QA Committee members to prevent public disclosure during active investigation.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs leading-relaxed text-navy">
                      &ldquo;{rawContent}&rdquo;
                    </p>
                  )}

                  {/* Evidence attachment handling: public only for general facilities / non-lecturer matters */}
                  {item.attachmentUrl && !isLecturer && (
                    <div className="pt-0.5">
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${item.attachmentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-border-subtle bg-slate-50 px-2 py-0.5 text-[10.5px] font-semibold text-secondary hover:bg-blue-tint hover:text-secondary transition-colors"
                      >
                        <Icon name="attachment" size={12} className="text-secondary" />
                        <span>View Attachment</span>
                      </a>
                    </div>
                  )}

                  {isLecturer && item.attachmentUrl && (
                    <div className="text-[10.5px] text-text-soft flex items-center gap-1">
                      <Icon name="lock" size={12} /> Supporting evidence delivered securely to review committee
                    </div>
                  )}

                  {item.resolutionNote && (
                    <div className="rounded-lg border border-green-tint bg-green-tint p-2.5 text-xs text-primary">
                      <strong className="font-bold">✓ Institutional Resolution:</strong> {item.resolutionNote}
                    </div>
                  )}

                  <div className="text-[11px] text-text-soft pt-0.5">
                    Submitted {formattedDate} · Anonymously via Whisper Lock
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
