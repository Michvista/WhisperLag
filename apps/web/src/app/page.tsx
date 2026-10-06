"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { WhisperBrand } from "@/components/ui/WhisperBrand";
import { Icon } from "@/components/ui/Icon";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

interface PublicWhisper {
  id: string;
  category: string;
  content: string;
  status: "NEW" | "ACKNOWLEDGED" | "ACTIONED";
  resolutionNote?: string | null;
  refNumber?: string | null;
  createdAt: string;
}

const DEFAULT_MOCK_WHISPERS: {
  id: string;
  title: string;
  content: string;
  category: string;
  status: "Under Review" | "Action Taken" | "Resolved";
  timeAgo: string;
  responses: number;
}[] = [
  {
    id: "sample-1",
    title: "Portal access during registration",
    content: "Many students have been unable to access the portal during registration. The site keeps loading and timing out, especially during peak hours.",
    category: "Administration",
    status: "Under Review",
    timeAgo: "2 days ago",
    responses: 24,
  },
  {
    id: "sample-2",
    title: "Hostel maintenance",
    content: "The maintenance request system is very slow and repairs take too long. Some hostel blocks still have faulty lights and leaking pipes.",
    category: "Facilities",
    status: "Action Taken",
    timeAgo: "5 days ago",
    responses: 41,
  },
  {
    id: "sample-3",
    title: "Lecture hall ventilation",
    content: "Some lecture halls are very hot and have poor ventilation, making it difficult to concentrate during lectures.",
    category: "Academic",
    status: "Resolved",
    timeAgo: "1 week ago",
    responses: 18,
  },
  {
    id: "sample-4",
    title: "More reading spaces",
    content: "We need more reading spaces in the library, especially during exam periods. It gets too crowded.",
    category: "Facilities",
    status: "Under Review",
    timeAgo: "1 week ago",
    responses: 31,
  },
];

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks === 1) return "1 week ago";
    return `${diffWeeks} weeks ago`;
  } catch {
    return "Recent";
  }
}

export default function LandingPage() {
  const { role, logout } = useAuth();
  const [liveWhispers, setLiveWhispers] = useState<PublicWhisper[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  useEffect(() => {
    const fetchRecentWhispers = async () => {
      try {
        const items = await api<PublicWhisper[]>("/feedback/public-recent?limit=20", { cache: "no-store" });
        if (items && items.length > 0) {
          setLiveWhispers(items);
        }
      } catch {
        // Fallback gracefully to default mock items
      }
    };

    void fetchRecentWhispers();
  }, []);

  // Normalise whispers combining live database submissions with default examples
  // Strictly filter out sensitive lecturer feedback from public landing page
  const displayWhispers = useMemo(() => {
    const publicItems = liveWhispers.filter((w) => {
      const cat = (w.category || "").toLowerCase();
      const content = (w.content || "").toLowerCase();
      return !cat.includes("lecturer") && !content.startsWith("[lecturer");
    });

    if (publicItems.length > 0) {
      return publicItems.map((w, idx) => {
        let statusLabel: "Under Review" | "Action Taken" | "Resolved" = "Under Review";
        if (w.status === "ACTIONED") {
          statusLabel = w.resolutionNote ? "Resolved" : "Action Taken";
        } else if (w.status === "ACKNOWLEDGED") {
          statusLabel = "Under Review";
        }

        const cleanContent = w.content.replace(/^\[.*?\]\s*/, "");
        const firstSentence = cleanContent.split(/[.!?\n]/)[0] || "Campus Experience";
        const title = firstSentence.length > 40 ? `${firstSentence.slice(0, 37)}…` : firstSentence;

        return {
          id: w.id,
          title,
          content: cleanContent,
          category: w.category || "General",
          status: statusLabel,
          timeAgo: formatTimeAgo(w.createdAt),
          responses: 12 + ((idx * 7) % 35),
        };
      });
    }
    return DEFAULT_MOCK_WHISPERS;
  }, [liveWhispers]);

  // Filter based on active status pill
  const filteredWhispers = useMemo(() => {
    return displayWhispers.filter((w) => {
      return filterStatus === "All" || w.status === filterStatus;
    });
  }, [displayWhispers, filterStatus]);

  return (
    <main className="flex min-h-screen flex-col bg-[#F8FAFC] font-body text-navy antialiased">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <WhisperBrand href="/" size="md" />
          </div>

          {/* Right Navigation Area */}
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-slate-100 hover:text-navy transition-colors relative"
              aria-label="Notifications"
            >
              <Icon name="notifications" size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </Link>

            {role ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href={role === "ADMIN" ? "/admin" : role === "FACULTY" ? "/faculty" : "/more"}
                  className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-slate-50 px-2.5 py-1 text-xs font-semibold text-navy hover:bg-slate-100"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-tint text-[10.5px] font-bold text-primary">
                    {role[0].toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">
                    {role === "ADMIN" ? "Admin Portal" : role === "FACULTY" ? "Faculty Portal" : "My Dashboard"}
                  </span>
                </Link>
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-white px-2.5 py-1 text-xs font-semibold text-text-secondary hover:bg-slate-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-lg border border-border-subtle bg-white px-2.5 py-1 text-[11.5px] sm:px-3 sm:py-1.5 sm:text-xs font-semibold text-navy transition-colors hover:bg-slate-50"
                >
                  Staff Sign In
                </Link>
                <Link
                  href="/whisper"
                  className="hidden sm:inline-flex rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-primary-hover shadow-button-green"
                >
                  Give Feedback →
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:py-6 sm:px-6 lg:px-8 space-y-6 pb-24 lg:pb-16">
        {/* Staff Active Session Banner (So staff knows when they're logged in and can easily switch or browse as student) */}
        {role && (role === "FACULTY" || role === "ADMIN") && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/90 p-3 text-xs text-navy shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span>
                You are currently signed in as <strong>{role === "ADMIN" ? "QA Administrator" : "Faculty Lead"}</strong>.
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href={role === "ADMIN" ? "/admin" : "/faculty"}
                className="font-bold text-secondary hover:underline"
              >
                Go to {role === "ADMIN" ? "Admin" : "Faculty"} Hub →
              </Link>
              <button
                onClick={() => logout()}
                className="rounded-md border border-blue-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
              >
                Sign Out / Switch Account
              </button>
            </div>
          </div>
        )}

        {/* ── HERO SECTION (Seamless & Non-boxed) ── */}
        <section className="relative overflow-hidden pt-2 pb-4 sm:py-6">
          {/* Mobile Faded Gate Background (Upper Right - Rounded) */}
          <div className="absolute right-0 top-0 h-44 sm:h-52 w-7/12 pointer-events-none overflow-hidden rounded-2xl lg:hidden shadow-2xs">
            <img
              src="/unilag-gate.jpg"
              alt="UNILAG Gate"
              className="h-full w-full object-cover object-left opacity-90 rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC]/30 to-transparent rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-transparent to-transparent rounded-2xl" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left Content */}
            <div className="lg:w-7/12 space-y-4">
              <div className="max-w-lg">
                <h1 className="font-montserrat text-[26px] sm:text-3xl lg:text-[40px] font-extrabold leading-[1.18] tracking-tight text-navy">
                  Your voice <br />
                  makes <span className="text-primary">UNILAG</span> <br />
                  a better place.
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-sm sm:max-w-md leading-relaxed">
                  Share challenges, ideas and experiences anonymously.
                </p>
              </div>

              {/* Mobile Card Action Buttons (Stacked matching mockup) */}
              <div className="flex flex-col gap-2.5 pt-1 lg:hidden">
                <Link
                  href="/whisper"
                  className="flex items-center gap-3.5 rounded-2xl bg-primary p-3.5 sm:p-4 text-white shadow-button-green transition-all active:scale-[0.98]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                    <Icon name="chat" size={20} className="text-white" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold leading-tight">Give Feedback →</span>
                    <span className="block text-[11px] text-white/85 font-medium">Share your experience anonymously</span>
                  </div>
                </Link>

                <Link
                  href="/whisper"
                  className="flex items-center justify-between rounded-2xl border border-green-200/80 bg-green-50/90 p-3 sm:p-3.5 text-navy transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-primary">
                      <Icon name="lock" size={17} className="text-primary" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-navy leading-tight">100% Anonymous</span>
                      <span className="block text-[10.5px] text-text-secondary">No name, no matric number, no personal info.</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary px-1">›</span>
                </Link>
              </div>

              {/* Desktop Action Buttons (Side-by-side matching mockup) */}
              <div className="hidden lg:flex items-center gap-4 pt-2">
                <Link
                  href="/whisper"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-button-green transition-all hover:bg-primary-hover active:scale-[0.98]"
                >
                  <Icon name="chat" size={18} className="text-white" />
                  <span>Give Feedback →</span>
                </Link>

                <div className="inline-flex items-center gap-3 rounded-xl border border-green-200 bg-green-50/80 px-4 py-2.5 text-xs font-semibold text-primary">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100 text-primary">
                    <Icon name="lock" size={15} className="text-primary" />
                  </div>
                  <div>
                    <span className="block font-bold text-navy">100% Anonymous</span>
                    <span className="block text-[11px] text-text-secondary font-normal">No name, no matric number, no personal information.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Desktop Image Column (Smooth edge blend) */}
            <div className="relative hidden lg:block lg:w-5/12 h-[290px] xl:h-[320px] rounded-2xl overflow-hidden shadow-sm">
              <img
                src="/unilag-gate.jpg"
                alt="University of Lagos Main Gate Akoka"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F8FAFC] to-transparent pointer-events-none" />
            </div>
          </div>
        </section>

        {/* ── CAMPUS WHISPERS SECTION ── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <h2 className="font-montserrat text-lg sm:text-xl font-bold text-navy">
                  Campus Whispers
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-text-secondary">
                Anonymous feedback from students across UNILAG.
              </p>
            </div>
            <Link
              href="/listwhispers"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <span>See all</span>
              <span>→</span>
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {["All", "Under Review", "Action Taken", "Resolved"].map((pill) => {
              const active = filterStatus === pill;
              return (
                <button
                  key={pill}
                  onClick={() => setFilterStatus(pill)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                    active
                      ? "bg-primary text-white shadow-2xs font-bold"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {pill}
                </button>
              );
            })}
          </div>

          {/* Cards Grid: Desktop 4 Columns, Mobile Horizontal Scroll (Limited to 8 items) */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-4">
            {filteredWhispers.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-border-subtle bg-white p-4 shadow-card transition-all hover:border-primary/40 hover:shadow-card-hover"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-tint">
                      <Icon name="lock" size={14} className="text-primary" />
                    </div>
                    <span className="text-[11px] font-medium text-text-soft">{item.timeAgo}</span>
                  </div>

                  <h3 className="font-montserrat text-sm font-bold text-navy line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-text-secondary line-clamp-3">
                    &ldquo;{item.content}&rdquo;
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary">
                    <Icon name="school" size={13} className="text-text-soft" />
                    {item.category}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.status === "Resolved"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : item.status === "Action Taken"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Horizontal Carousel (Limited to 8 items) */}
          <div className="flex lg:hidden gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {filteredWhispers.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="w-[280px] shrink-0 snap-start flex flex-col justify-between rounded-xl border border-border-subtle bg-white p-4 shadow-card"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-tint">
                      <Icon name="lock" size={14} className="text-primary" />
                    </div>
                    <span className="text-[11px] font-medium text-text-soft">{item.timeAgo}</span>
                  </div>

                  <h3 className="font-montserrat text-xs font-bold text-navy line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-text-secondary line-clamp-3">
                    &ldquo;{item.content}&rdquo;
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-secondary">
                    <Icon name="school" size={12} className="text-text-soft" />
                    {item.category}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                      item.status === "Resolved"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : item.status === "Action Taken"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── QUICK ACTIONS SECTION ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-montserrat text-lg sm:text-xl font-bold text-navy">
                Quick Actions
              </h2>
              <p className="mt-0.5 text-xs text-text-secondary">
                Explore other ways to share and view insights.
              </p>
            </div>
            <Link
              href="/more"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <span>See all</span>
              <span>→</span>
            </Link>
          </div>

          {/* Desktop 4 Horizontal Cards */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/evaluations"
              className="group flex flex-col justify-between rounded-xl border border-border-subtle bg-white p-5 shadow-card transition-all hover:border-primary/40 hover:shadow-card-hover"
            >
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-tint text-primary">
                  <Icon name="file" size={22} />
                </div>
                <div>
                  <h3 className="font-montserrat text-sm font-bold text-navy group-hover:text-primary">
                    Evaluations
                  </h3>
                  <p className="mt-1 text-xs text-text-secondary">
                    Rate your courses and lecturers.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end text-primary">
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>

            <Link
              href="/polls"
              className="group flex flex-col justify-between rounded-xl border border-border-subtle bg-white p-5 shadow-card transition-all hover:border-secondary/40 hover:shadow-card-hover"
            >
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-tint text-secondary">
                  <Icon name="bar_chart" size={22} />
                </div>
                <div>
                  <h3 className="font-montserrat text-sm font-bold text-navy group-hover:text-secondary">
                    Polls
                  </h3>
                  <p className="mt-1 text-xs text-text-secondary">
                    Join campus polls and voice your opinion.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end text-secondary">
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>

            <Link
              href="/results"
              className="group flex flex-col justify-between rounded-xl border border-border-subtle bg-white p-5 shadow-card transition-all hover:border-primary/40 hover:shadow-card-hover"
            >
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-tint text-primary">
                  <Icon name="pie_chart" size={22} />
                </div>
                <div>
                  <h3 className="font-montserrat text-sm font-bold text-navy group-hover:text-primary">
                    Poll Results
                  </h3>
                  <p className="mt-1 text-xs text-text-secondary">
                    See what other students are saying.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end text-primary">
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>

            <Link
              href="/suggestion"
              className="group flex flex-col justify-between rounded-xl border border-border-subtle bg-white p-5 shadow-card transition-all hover:border-purple-300 hover:shadow-card-hover"
            >
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-tint text-tertiary">
                  <Icon name="lightbulb" size={22} />
                </div>
                <div>
                  <h3 className="font-montserrat text-sm font-bold text-navy group-hover:text-tertiary">
                    Suggestion Box
                  </h3>
                  <p className="mt-1 text-xs text-text-secondary">
                    Share ideas for a better UNILAG.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end text-tertiary">
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </div>

          {/* Mobile 4 Actions Grid Matching Mockup */}
          <div className="grid grid-cols-4 gap-2 sm:hidden">
            <Link
              href="/evaluations"
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border-subtle bg-white p-3 text-center transition-all active:scale-95 shadow-2xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-tint text-primary">
                <Icon name="file" size={20} />
              </div>
              <span className="text-[10px] font-semibold text-navy">Evaluations</span>
            </Link>

            <Link
              href="/polls"
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border-subtle bg-white p-3 text-center transition-all active:scale-95 shadow-2xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-tint text-secondary">
                <Icon name="bar_chart" size={20} />
              </div>
              <span className="text-[10px] font-semibold text-navy">Polls</span>
            </Link>

            <Link
              href="/results"
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border-subtle bg-white p-3 text-center transition-all active:scale-95 shadow-2xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-tint text-primary">
                <Icon name="pie_chart" size={20} />
              </div>
              <span className="text-[10px] font-semibold text-navy">Poll Results</span>
            </Link>

            <Link
              href="/suggestion"
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border-subtle bg-white p-3 text-center transition-all active:scale-95 shadow-2xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-tint text-tertiary">
                <Icon name="lightbulb" size={20} />
              </div>
              <span className="text-[10px] font-semibold text-navy">Suggestion Box</span>
            </Link>
          </div>
        </section>

      </div>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-border-subtle bg-white py-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <WhisperBrand href="/" size="sm" />
          <span className="text-xs text-text-soft text-center sm:text-left">
            © 2026 University of Lagos · End-to-End Encrypted via UNILAG Secure.
          </span>
          <div className="flex gap-4 text-xs font-semibold text-text-secondary">
            <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            <Link href="/handbook" className="hover:text-primary">Handbook</Link>
            <Link href="/ethics" className="hover:text-primary">Ethics</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </main>
  );
}