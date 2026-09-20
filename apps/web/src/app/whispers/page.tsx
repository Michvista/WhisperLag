"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WhisperBrand } from "@/components/ui/WhisperBrand";
import { Icon } from "@/components/ui/Icon";
import { api, getToken, getRole } from "@/lib/api";
import { toast } from "@/lib/toast";
import { AppShell } from "@/components/layout/AppShell";
import { ROLES } from "@whisperlag/shared";

interface WhisperItem {
  id: string;
  category: string;
  content: string;
  isAnonymous: boolean;
  status: "NEW" | "ACKNOWLEDGED" | "ACTIONED";
  createdAt: string;
  department: { id: string; name: string } | null;
  resolutionNote?: string | null;
  refNumber?: string | null;
  attachmentUrl?: string | null;
  aiTag: {
    courseCode?: string;
    courseTitle?: string;
    lecturer?: string;
    department?: string;
    confidence?: number;
  } | null;
}

interface WhisperFeed {
  items: WhisperItem[];
  total: number;
}


type FilterTab = "All" | "New" | "Under Review" | "Resolved";

function parseTitleFromContent(content: string, category: string, aiTag: WhisperItem["aiTag"]): string {
  if (aiTag?.lecturer) return aiTag.lecturer;
  if (aiTag?.courseCode) return `${aiTag.courseCode} ${aiTag.courseTitle ?? ""}`.trim();

  const match = content.match(/^\[(.*?)(?:\s-\s(.*?))?(?:\s\((.*?)\))?\]/);
  if (match && match[2]) {
    return match[2].trim();
  }
  return category || "General Feedback";
}

function cleanBody(content: string): string {
  return content.replace(/^\[.*?\]\s*/, "").trim();
}

export default function WhispersPage() {
  const [items, setItems] = useState<WhisperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Admin specific states
  const [role, setRole] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState<Record<string, string>>({});
  const [tagging, setTagging] = useState(false);

  useEffect(() => {
    const r = getRole();
    setRole(r);
    // Students should use /listwhispers — redirect them away
    if (r === ROLES.STUDENT) {
      window.location.replace("/listwhispers");
      return;
    }
    void loadWhispers();
  }, []);

  async function loadWhispers() {
    setLoading(true);
    try {
      const res = await api<WhisperFeed>("/feedback?page=1&limit=100", {
        token: getToken(),
        cache: "no-store",
      });
      setItems(res?.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(id: string, status: "ACKNOWLEDGED" | "ACTIONED", note?: string) {
    setBusyId(id);
    try {
      await api(`/feedback/${id}/status`, {
        method: "PATCH",
        token: getToken(),
        body: JSON.stringify({ status, resolutionNote: note }),
      });
      toast(status === "ACTIONED" ? "Whisper resolved." : "Whisper moved to review.");
      setResolvingId(null);
      await loadWhispers();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Status update failed", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function tagAll() {
    setTagging(true);
    try {
      const res = await api<{ tagged: number }>("/feedback/analyze", {
        method: "POST",
        token: getToken(),
      });
      toast(res.tagged > 0 ? `Routed ${res.tagged} whisper${res.tagged === 1 ? "" : "s"} to courses.` : "No untagged whispers left.");
      await loadWhispers();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Tagging failed", "error");
    } finally {
      setTagging(false);
    }
  }

  const isAdminOrFaculty = role === ROLES.ADMIN || role === ROLES.FACULTY;

  const allCount = items.length;
  const newCount = items.filter((w) => w.status === "NEW").length;
  const reviewCount = items.filter((w) => w.status === "ACKNOWLEDGED").length;
  const resolvedCount = items.filter((w) => w.status === "ACTIONED").length;

  const filteredItems = items.filter((item) => {
    if (activeTab === "New" && item.status !== "NEW") return false;
    if (activeTab === "Under Review" && item.status !== "ACKNOWLEDGED") return false;
    if (activeTab === "Resolved" && item.status !== "ACTIONED") return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = parseTitleFromContent(item.content, item.category, item.aiTag).toLowerCase();
    const body = item.content.toLowerCase();
    const dept = (item.department?.name ?? "").toLowerCase();
    const cat = item.category.toLowerCase();

    return title.includes(q) || body.includes(q) || dept.includes(q) || cat.includes(q);
  });

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border-subtle pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {isAdminOrFaculty ? "Quality Assurance & Review" : "Campus Feedback Feed"}
          </span>
          <h1 className="mt-1 font-montserrat text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            {isAdminOrFaculty ? "Anonymous Whispers Feed" : "Student Whispers"}
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            {isAdminOrFaculty
              ? `Every student submission with no identity attached · ${items.length} total`
              : "Live anonymous submissions and institutional resolutions across UNILAG"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {role === ROLES.ADMIN && (
            <button
              onClick={tagAll}
              disabled={tagging}
              title="Reads each untagged whisper and automatically tags course, lecturer, or department"
              className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-white px-3.5 py-2 text-xs font-semibold text-navy hover:bg-slate-50 disabled:opacity-50"
            >
              <Icon name="auto_awesome" size={15} className="text-primary" />
              {tagging ? "Routing with AI…" : "Route with AI"}
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "All" as FilterTab, label: "All", count: allCount },
            { id: "New" as FilterTab, label: "New", count: newCount },
            { id: "Under Review" as FilterTab, label: "Under Review", count: reviewCount },
            { id: "Resolved" as FilterTab, label: "Resolved", count: resolvedCount },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
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

        <div className="relative w-full sm:w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-soft">
            <Icon name="search" size={15} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search whispers..."
            className="w-full rounded-lg border border-border-subtle bg-white py-1.5 pl-9 pr-3 text-xs text-navy placeholder-text-soft outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Whispers Feed List */}
      {loading ? (
        <div className="space-y-3 py-10 text-center text-xs font-semibold text-text-secondary">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading whispers...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-white p-10 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-tint text-primary">
            <Icon name="document" size={22} className="text-primary" />
          </div>
          <h3 className="font-montserrat text-sm font-bold text-navy">
            No whispers found
          </h3>
          <p className="mt-1 text-xs text-text-secondary">
            {searchQuery ? "Try refining your search keyword or category filter." : "No submissions in this filter category yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, idx) => {
            const title = parseTitleFromContent(item.content, item.category, item.aiTag);
            const body = cleanBody(item.content);
            const isResolved = item.status === "ACTIONED";
            const isUnderReview = item.status === "ACKNOWLEDGED";

            const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <article
                key={item.id}
                className="rounded-xl border border-border-subtle bg-white p-4 transition-all hover:border-slate-300 shadow-card"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="rounded-md bg-green-tint px-2 py-0.5 text-[11px] font-bold text-primary">
                        {item.category}
                      </span>
                      {item.department && (
                        <span className="text-[11px] font-medium text-text-secondary">
                          · {item.department.name}
                        </span>
                      )}
                      {item.aiTag?.courseCode && (
                        <span className="flex items-center gap-1 rounded bg-blue-tint px-1.5 py-0.5 text-[10.5px] font-semibold text-secondary">
                          <Icon name="school" size={12} />
                          {item.aiTag.courseCode}
                          {item.aiTag.lecturer ? ` · ${item.aiTag.lecturer}` : ""}
                        </span>
                      )}
                      <span className="ml-auto text-[11px] text-text-soft">
                        {formattedDate}
                      </span>
                    </div>

                    <h3 className="font-montserrat text-sm font-bold text-navy">
                      {title}
                    </h3>

                    <p className="text-xs leading-relaxed text-text-secondary">
                      &ldquo;{body}&rdquo;
                    </p>

                    {/* Meta: Ref number & Attachment */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {item.refNumber && (
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-mono text-[10.5px] font-bold text-slate-700">
                          Ref: {item.refNumber}
                        </span>
                      )}
                      {item.attachmentUrl && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${item.attachmentUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-border-subtle bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-secondary hover:bg-blue-tint hover:text-secondary hover:border-secondary transition-colors"
                        >
                          <Icon name="attachment" size={13} className="text-secondary" />
                          <span>View Supporting Attachment</span>
                        </a>
                      )}
                    </div>

                    {item.resolutionNote && (
                      <div className="mt-2 rounded-lg border border-green-tint bg-green-tint p-3 text-xs text-primary">
                        <strong className="font-bold">✓ Action Taken / Resolution:</strong> {item.resolutionNote}
                      </div>
                    )}
                  </div>

                  {/* Status and Action Buttons */}
                  <div className="flex shrink-0 items-center gap-2 md:flex-col md:items-end">
                    {isResolved ? (
                      <span className="rounded-md bg-green-tint px-2.5 py-1 text-[11px] font-bold text-primary">
                        ✓ Action Taken
                      </span>
                    ) : isUnderReview ? (
                      <span className="rounded-md bg-amber-tint px-2.5 py-1 text-[11px] font-bold text-amber-800">
                        ⏱ Under Review
                      </span>
                    ) : (
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                        New
                      </span>
                    )}

                    {/* Admin Moderation Controls */}
                    {role === ROLES.ADMIN && !isResolved && (
                      <div className="mt-2 flex flex-col items-end gap-2">
                        <div className="flex gap-1.5">
                          {!isUnderReview && (
                            <button
                              onClick={() => setStatus(item.id, "ACKNOWLEDGED")}
                              disabled={busyId === item.id}
                              className="rounded-md border border-border-subtle bg-white px-2.5 py-1 text-[11px] font-semibold text-text-secondary hover:bg-slate-50 disabled:opacity-50"
                            >
                              Review
                            </button>
                          )}
                          <button
                            onClick={() => setResolvingId(resolvingId === item.id ? null : item.id)}
                            disabled={busyId === item.id}
                            className="btn-primary-green px-2.5 py-1 text-[11px] font-semibold"
                          >
                            Resolve
                          </button>
                        </div>

                        {resolvingId === item.id && (
                          <div className="mt-2 flex w-64 flex-col gap-2 rounded-lg border border-border-subtle bg-slate-50 p-3">
                            <textarea
                              value={resolveNote[item.id] ?? ""}
                              onChange={(e) => setResolveNote((n) => ({ ...n, [item.id]: e.target.value }))}
                              placeholder="What action was taken? Students will see this public note."
                              rows={2}
                              className="wl-input text-xs"
                            />
                            <button
                              onClick={() => setStatus(item.id, "ACTIONED", resolveNote[item.id]?.trim() || undefined)}
                              disabled={busyId === item.id}
                              className="btn-primary-green w-full py-1.5 text-xs font-semibold"
                            >
                              {busyId === item.id ? "Saving…" : "Confirm & Resolve"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );

  if (isAdminOrFaculty) {
    return (
      <AppShell>
        <div className="py-6 px-4 md:px-8 max-w-6xl mx-auto">
          {content}
        </div>
      </AppShell>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 text-navy">
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <WhisperBrand href="/" />
          <Link
            href="/whisper"
            className="btn-primary-green px-3.5 py-1.5 text-xs font-semibold"
          >
            Give Feedback &nbsp;→
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {content}
      </main>
    </div>
  );
}