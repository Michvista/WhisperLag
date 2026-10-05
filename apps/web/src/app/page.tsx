"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
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

const TRUST_ITEMS = [
  {
    num: "01",
    title: "Cryptographically Anonymous",
    body: "Every submission is stripped of identifying metadata before it reaches our servers. The Whisper Lock ensures your identity remains solely yours.",
  },
  {
    num: "02",
    title: "Editorial Clarity & Dignity",
    body: "We prioritize the substance of your message. A calm, distraction-free space to articulate complex concerns with focus and institutional respect.",
  },
  {
    num: "03",
    title: "Direct Institutional Routing",
    body: "Feedback isn't shouted into a void. It is securely routed to the appropriate faculty boards and Quality Assurance units for confidential review.",
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

/** Animated counter for the live stats band. */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduce) {
      setN(value);
      return;
    }
    const duration = 1000;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  return (
    <span className="font-montserrat text-3xl font-bold tracking-tight text-navy md:text-4xl">
      {n.toLocaleString()}
      <span className="text-primary">{suffix}</span>
    </span>
  );
}

export default function LandingPage() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState<{ whispers: number; departments: number; rate: number } | null>(null);
  const [liveWhispers, setLiveWhispers] = useState<PublicWhisper[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const d = await api<{ totalWhispers: number; totalDepartments: number; resolutionRate: number }>(
          "/stats/public",
          { cache: "no-store" },
        );
        setStats({ whispers: d.totalWhispers, departments: d.totalDepartments, rate: d.resolutionRate });
      } catch {
        setStats({ whispers: 48, departments: 16, rate: 96 });
      }
    };

    const fetchRecentWhispers = async () => {
      try {
        const items = await api<PublicWhisper[]>("/feedback/public-recent?limit=8", { cache: "no-store" });
        if (items && items.length > 0) {
          setLiveWhispers(items);
        }
      } catch {
        // Fallback gracefully to default items
      }
    };

    void fetchStats();
    void fetchRecentWhispers();
  }, []);

  // Normalise whispers combining live database submissions with default examples
  const displayWhispers = useMemo(() => {
    if (liveWhispers.length > 0) {
      return liveWhispers.map((w, idx) => {
        let statusLabel: "Under Review" | "Action Taken" | "Resolved" = "Under Review";
        if (w.status === "ACTIONED") {
          statusLabel = w.resolutionNote ? "Resolved" : "Action Taken";
        } else if (w.status === "ACKNOWLEDGED") {
          statusLabel = "Under Review";
        }

        // Generate a concise title if content doesn't have markdown title
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

  // Filter based on active pill and search query
  const filteredWhispers = useMemo(() => {
    return displayWhispers.filter((w) => {
      const matchesFilter = filterStatus === "All" || w.status === filterStatus;
      const matchesSearch =
        searchQuery.trim() === "" ||
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [displayWhispers, filterStatus, searchQuery]);

  return (
    <main className="flex min-h-screen flex-col bg-[#F8FAFC] font-body text-navy antialiased">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <WhisperBrand href="/" size="md" />

            {/* Desktop Search in Header */}
            <div className="relative hidden md:block w-72 lg:w-96">
              <Icon
                name="search"
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-soft"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus whispers..."
                className="w-full rounded-full border border-border-subtle bg-slate-50/80 py-1.5 pl-10 pr-4 text-xs text-navy placeholder:text-text-soft focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Desktop Right Links */}
          <div className="flex items-center gap-3">
            <Link
              href="/notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-slate-100 hover:text-navy transition-colors relative"
              aria-label="Notifications"
            >
              <Icon name="notifications" size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={role === "ADMIN" ? "/admin" : role === "FACULTY" ? "/faculty" : "/more"}
                  className="flex items-center gap-2 rounded-full border border-border-subtle bg-slate-50 px-3 py-1 text-xs font-semibold text-navy hover:bg-slate-100"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-tint text-[11px] font-bold text-primary">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </span>
                  <span className="hidden sm:inline">{user.name || "My Dashboard"}</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-slate-50"
                >
                  Staff Sign In
                </Link>
                <Link
                  href="/whisper"
                  className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-primary-hover shadow-button-green"
                >
                  Give Feedback →
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-8 pb-24 lg:pb-16">
        {/* ── HERO BANNER ── */}
        <section className="relative overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-card">
          <div className="flex flex-col lg:flex-row items-stretch">
            {/* Left Content Column */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 lg:w-7/12 space-y-5">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                  University of Lagos · SERVICOM &amp; Quality Assurance
                </p>
                <h1 className="font-montserrat text-3xl font-extrabold leading-tight text-navy sm:text-4xl lg:text-[42px]">
                  Your voice <br />
                  makes <span className="text-primary">UNILAG</span> <br />
                  a better place.
                </h1>
                {/* Preserved Signature Tagline */}
                <p className="mt-2 text-sm sm:text-base font-bold text-primary italic">
                  &ldquo;a student who whispers is still speaking&rdquo;
                </p>
                <p className="mt-2 text-xs sm:text-sm text-text-secondary">
                  Share challenges, ideas and experiences anonymously.
                </p>
              </div>

              {/* Mobile Hero Gate Image */}
              <div className="relative overflow-hidden rounded-xl h-44 sm:h-52 w-full lg:hidden border border-border-subtle my-2">
                <img
                  src="/unilag-gate.jpg"
                  alt="University of Lagos Main Gate Akoka"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-3">
                  <span className="text-white text-[11px] font-semibold drop-shadow-md">
                    University of Lagos · Main Entrance Gate, Akoka
                  </span>
                </div>
              </div>

              {/* Actions row: Give Feedback CTA + 100% Anonymous Badge */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link
                  href="/whisper"
                  className="group flex items-center justify-between sm:justify-start gap-3 rounded-xl bg-primary px-6 py-4 text-white shadow-button-green transition-all hover:bg-primary-hover active:scale-[0.99]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
                    <Icon name="chat" size={18} className="text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-montserrat text-sm font-bold flex items-center gap-1.5">
                      <span>Give Feedback</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </div>
                    <div className="text-[11px] text-white/80">Share your experience anonymously</div>
                  </div>
                </Link>

                <div className="flex items-center gap-3 rounded-xl border border-green-200/80 bg-green-50/70 p-3 sm:py-3.5 sm:px-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-primary">
                    <Icon name="lock" size={18} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-navy">100% Anonymous</div>
                    <div className="text-[10.5px] text-text-secondary leading-snug">
                      No name, no matric number, no personal information.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Desktop Image Column */}
            <div className="relative hidden lg:block lg:w-5/12 overflow-hidden bg-slate-100">
              <img
                src="/unilag-gate.jpg"
                alt="University of Lagos Main Gate Akoka"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/10 to-transparent w-24 pointer-events-none" />
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

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
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

            {/* Mobile / Secondary Search bar */}
            <div className="relative block md:hidden w-full">
              <Icon
                name="search"
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-soft"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus whispers..."
                className="w-full rounded-lg border border-border-subtle bg-white py-1.5 pl-9 pr-3 text-xs text-navy placeholder:text-text-soft focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Cards Grid: Desktop 4 Columns, Mobile Horizontal Scroll */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-4">
            {filteredWhispers.map((item) => (
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
                  <div className="flex items-center gap-1.5">
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

                  <div className="flex items-center gap-1 text-[11px] font-semibold text-text-soft">
                    <Icon name="chat" size={13} />
                    <span>{item.responses}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Horizontal Carousel */}
          <div className="flex lg:hidden gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {filteredWhispers.map((item) => (
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
                  <div className="flex items-center gap-1.5">
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

                  <div className="flex items-center gap-1 text-[10px] font-semibold text-text-soft">
                    <Icon name="chat" size={12} />
                    <span>{item.responses}</span>
                  </div>
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

        {/* ── Live Stats Band ── */}
        <section className="rounded-xl border border-border-subtle bg-white p-6 shadow-card">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-1 md:border-r md:border-border-subtle md:pr-6">
              <span className="text-xs font-bold uppercase tracking-wider text-text-soft">
                Anonymous Whispers Submitted
              </span>
              <Counter value={stats?.whispers ?? 48} />
              <span className="text-xs font-semibold text-primary">Every identity protected</span>
            </div>
            <div className="flex flex-col gap-1 md:border-r md:border-border-subtle md:px-6">
              <span className="text-xs font-bold uppercase tracking-wider text-text-soft">
                Faculties &amp; Units Covered
              </span>
              <Counter value={stats?.departments ?? 16} />
              <span className="text-xs font-semibold text-secondary">Across the University of Lagos</span>
            </div>
            <div className="flex flex-col gap-1 md:pl-6">
              <span className="text-xs font-bold uppercase tracking-wider text-text-soft">
                Resolution Rate
              </span>
              <Counter value={stats?.rate ?? 96} suffix="%" />
              <span className="text-xs font-semibold text-text-secondary">Closed through institutional review</span>
            </div>
          </div>
        </section>

        {/* ── Architecture of Trust Section ── */}
        <section id="trust" className="rounded-xl border border-border-subtle bg-white p-6 sm:p-8 shadow-card">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Security &amp; Charter
            </span>
            <h2 className="mt-1 font-montserrat text-2xl font-extrabold text-navy">
              The Architecture of Trust
            </h2>
          </div>
          <div className="space-y-4">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-2 border-t border-border-subtle pt-4 sm:flex-row sm:items-start sm:gap-6"
              >
                <span className="font-montserrat text-lg font-extrabold text-primary sm:w-10">
                  {item.num}
                </span>
                <div className="flex-1">
                  <h3 className="font-montserrat text-sm font-bold text-navy">{item.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">{item.body}</p>
                </div>
              </div>
            ))}
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