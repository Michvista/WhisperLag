"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WhisperBrand } from "@/components/ui/WhisperBrand";
import { Icon } from "@/components/ui/Icon";
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

const DEFAULT_ITEMS: WhisperItem[] = [
  {
    id: "demo-1",
    category: "Lecturer",
    content: "The explanations in class are sometimes too fast and it can be difficult to keep up. It would be helpful if lecture notes were shared after class.",
    isAnonymous: true,
    status: "ACKNOWLEDGED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    resolutionNote: null,
  },
  {
    id: "demo-2",
    category: "Course / Learning",
    content: "The portal is slow during course registration and keeps timing out when attempting to generate docket.",
    isAnonymous: true,
    status: "ACTIONED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    resolutionNote: "CITS portal server bandwidth increased by 300% for the registration window.",
  },
  {
    id: "demo-3",
    category: "Hostel / Facilities",
    content: "More quiet study spaces and functional power outlets are needed in the science library annex.",
    isAnonymous: true,
    status: "ACTIONED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    resolutionNote: "16 additional study tables with power hubs installed in the science annex.",
  },
  {
    id: "demo-4",
    category: "Lecturer",
    content: "Sometimes lectures start much later than scheduled due to projector connectivity issues in Faculty of Arts LT.",
    isAnonymous: true,
    status: "ACKNOWLEDGED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    resolutionNote: null,
  },
  {
    id: "demo-5",
    category: "Administration",
    content: "The exam timetable has a 30-minute conflict between faculty required elective and general studies.",
    isAnonymous: true,
    status: "ACTIONED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    resolutionNote: "Timetable committee adjusted GST schedule to avoid departmental overlap.",
  },
];

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
        if (res && res.length > 0) {
          setItems(res);
        } else {
          setItems(DEFAULT_ITEMS);
        }
      } catch {
        setItems(DEFAULT_ITEMS);
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
    <div className="min-h-screen bg-background pb-24 text-navy">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <WhisperBrand href="/" />
          <div className="flex items-center gap-3">
            <Link
              href="/whisper"
              className="btn-primary-green px-3.5 py-1.5 text-xs font-semibold"
            >
              <Icon name="add" size={14} className="text-white" /> Give Feedback
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
        {/* Header Title */}
        <div className="border-b border-border-subtle pb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Student Whispers Feed
          </span>
          <h1 className="mt-1 font-montserrat text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Recent Student Whispers
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Explore anonymous student submissions and official university resolutions across departments.
          </p>
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
          <div className="space-y-3">
            {filteredItems.map((item, idx) => {
              const isResolved = item.status === "ACTIONED";
              const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-border-subtle bg-white p-4 shadow-card space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="rounded-md bg-green-tint px-2 py-0.5 text-[11px] font-bold text-primary">
                        {item.category}
                      </span>
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

                  <p className="text-xs leading-relaxed text-navy">
                    &ldquo;{item.content.replace(/^\[.*?\]\s*/, "")}&rdquo;
                  </p>

                  {/* Attachment & Ref if available */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {item.refNumber && (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                        Ref: {item.refNumber}
                      </span>
                    )}
                    {item.attachmentUrl && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${item.attachmentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-border-subtle bg-slate-50 px-2 py-0.5 text-[10.5px] font-semibold text-secondary hover:bg-blue-tint hover:text-secondary transition-colors"
                      >
                        <Icon name="attachment" size={12} className="text-secondary" />
                        <span>View Attachment</span>
                      </a>
                    )}
                  </div>

                  {item.resolutionNote && (
                    <div className="rounded-lg border border-green-tint bg-green-tint p-2.5 text-xs text-primary">
                      <strong className="font-bold">✓ Institutional Resolution:</strong> {item.resolutionNote}
                    </div>
                  )}

                  <div className="text-[11px] text-text-soft pt-1">
                    Submitted {formattedDate} · Anonymously via Whisper Lock
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Mobile Floating Bottom Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-border-subtle bg-white/95 px-6 shadow-md backdrop-blur-md lg:hidden">
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-primary"
        >
          <Icon name="home" size={18} />
          Home
        </Link>
        <Link
          href="/whisper"
          className="flex flex-col items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-primary"
        >
          <span className="-mt-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-lg font-bold text-white shadow-button-green">
            +
          </span>
          Give Feedback
        </Link>
        <Link
          href="/listwhispers"
          className="flex flex-col items-center gap-1 text-[11px] font-semibold text-primary"
        >
          <Icon name="chat" size={18} className="text-primary" />
          Whispers
        </Link>
      </nav>
    </div>
  );
}
