"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/useAuth";

const WHISPER_ITEMS = [
  {
    href: "/listwhispers",
    label: "Campus Whispers",
    desc: "Browse public student whispers, campus experiences, and administrative responses.",
    icon: "forum",
    iconBg: "bg-green-tint",
    iconColor: "text-primary",
    badge: "Public Feed",
  },
  {
    href: "/whisper",
    label: "Give Feedback",
    desc: "Submit a new whisper, concern, or experience 100% anonymously.",
    icon: "add",
    iconBg: "bg-green-tint",
    iconColor: "text-primary",
    badge: "100% Anonymous",
  },
  {
    href: "/track",
    label: "Track Whisper",
    desc: "Check the status, review stage, and administrative notes for your whisper.",
    icon: "search",
    iconBg: "bg-blue-tint",
    iconColor: "text-secondary",
    badge: "Reference Key",
  },
];

const CAMPUS_ITEMS = [
  {
    href: "/evaluations",
    label: "Evaluations",
    desc: "Rate your courses, curriculum quality, and lecturers.",
    icon: "star",
    iconBg: "bg-amber-tint",
    iconColor: "text-amber-700",
  },
  {
    href: "/polls",
    label: "Campus Polls",
    desc: "Join campus polls and vote on pressing student matters.",
    icon: "bar_chart",
    iconBg: "bg-blue-tint",
    iconColor: "text-secondary",
  },
  {
    href: "/results",
    label: "Poll Results",
    desc: "Explore aggregated student sentiment and live voting insights.",
    icon: "pie_chart",
    iconBg: "bg-green-tint",
    iconColor: "text-primary",
  },
  {
    href: "/suggestion",
    label: "Suggestion Box",
    desc: "Share ideas and solutions for a better UNILAG experience.",
    icon: "lightbulb",
    iconBg: "bg-purple-tint",
    iconColor: "text-tertiary",
  },
];

const UTILITY_ITEMS = [
  {
    href: "/notifications",
    label: "Notifications",
    desc: "Review campus quality announcements and platform updates.",
    icon: "notifications",
    iconBg: "bg-purple-tint",
    iconColor: "text-tertiary",
  },
  {
    href: "/settings",
    label: "Settings",
    desc: "Manage device preferences and local accessibility options.",
    icon: "settings",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
];

export default function MorePage() {
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";
  const isFaculty = role === "FACULTY";

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-8 pb-10">
        {/* Header */}
        <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-tint text-primary">
              <Icon name="widgets" size={14} />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Explore WhisperLag
            </span>
          </div>
          <h1 className="mt-2 font-montserrat text-2xl font-bold text-navy sm:text-3xl">
            More Features &amp; Hub
          </h1>
          <p className="mt-1 text-xs text-text-secondary sm:text-sm">
            Quickly navigate student voices, academic evaluations, campus polls, and institutional tools.
          </p>
        </div>

        {/* Staff Quick Hub (only shown when logged in as Admin or Faculty) */}
        {(isAdmin || isFaculty) && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="font-montserrat text-sm font-bold text-navy">
                  {isAdmin ? "Admin Controls" : "Faculty Controls"}
                </h2>
                <p className="text-[11px] text-text-secondary">Administrative tools and management desks.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href={isAdmin ? "/admin" : "/faculty"}
                className="group flex items-center gap-3.5 rounded-xl border border-border-subtle bg-white p-4 transition-all hover:border-primary/40 hover:shadow-card"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-tint text-primary">
                  <Icon name="home" size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-montserrat text-xs font-bold text-navy group-hover:text-primary">
                    {isAdmin ? "Admin Command Center" : "Faculty Hub"}
                  </div>
                  <div className="text-[11px] text-text-secondary truncate">Main dashboard &amp; KPIs</div>
                </div>
                <Icon name="chevron_right" size={16} className="text-text-soft" />
              </Link>

              <Link
                href="/whispers"
                className="group flex items-center gap-3.5 rounded-xl border border-border-subtle bg-white p-4 transition-all hover:border-primary/40 hover:shadow-card"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-tint text-primary">
                  <Icon name="forum" size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-montserrat text-xs font-bold text-navy group-hover:text-primary">
                    Whispers Desk
                  </div>
                  <div className="text-[11px] text-text-secondary truncate">Review &amp; moderate submissions</div>
                </div>
                <Icon name="chevron_right" size={16} className="text-text-soft" />
              </Link>

              <Link
                href="/reports"
                className="group flex items-center gap-3.5 rounded-xl border border-border-subtle bg-white p-4 transition-all hover:border-primary/40 hover:shadow-card"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-tint text-secondary">
                  <Icon name="file" size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-montserrat text-xs font-bold text-navy group-hover:text-primary">
                    Institutional Reports
                  </div>
                  <div className="text-[11px] text-text-secondary truncate">Export analytics &amp; summaries</div>
                </div>
                <Icon name="chevron_right" size={16} className="text-text-soft" />
              </Link>

              {isAdmin && (
                <>
                  <Link
                    href="/insights"
                    className="group flex items-center gap-3.5 rounded-xl border border-border-subtle bg-white p-4 transition-all hover:border-primary/40 hover:shadow-card"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-tint text-tertiary">
                      <Icon name="sparkles" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-montserrat text-xs font-bold text-navy group-hover:text-primary">
                        AI Insights
                      </div>
                      <div className="text-[11px] text-text-secondary truncate">Emerging campus sentiment</div>
                    </div>
                    <Icon name="chevron_right" size={16} className="text-text-soft" />
                  </Link>

                  <Link
                    href="/courses"
                    className="group flex items-center gap-3.5 rounded-xl border border-border-subtle bg-white p-4 transition-all hover:border-primary/40 hover:shadow-card"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-tint text-amber-700">
                      <Icon name="school" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-montserrat text-xs font-bold text-navy group-hover:text-primary">
                        Course Hub
                      </div>
                      <div className="text-[11px] text-text-secondary truncate">Catalogues &amp; course units</div>
                    </div>
                    <Icon name="chevron_right" size={16} className="text-text-soft" />
                  </Link>

                  <Link
                    href="/integrations"
                    className="group flex items-center gap-3.5 rounded-xl border border-border-subtle bg-white p-4 transition-all hover:border-primary/40 hover:shadow-card"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Icon name="tune" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-montserrat text-xs font-bold text-navy group-hover:text-primary">
                        SIS / LMS Integrations
                      </div>
                      <div className="text-[11px] text-text-secondary truncate">Portal data sync</div>
                    </div>
                    <Icon name="chevron_right" size={16} className="text-text-soft" />
                  </Link>
                </>
              )}
            </div>
          </section>
        )}

        {/* ── WHISPERS SECTION (Desktop & Mobile) ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <h2 className="font-montserrat text-base font-bold text-navy">
                  Campus Whispers
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-text-secondary">
                Anonymous student feedback, tracking, and community discussion.
              </p>
            </div>
            <Link
              href="/listwhispers"
              className="text-xs font-bold text-primary hover:underline"
            >
              View Feed →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WHISPER_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col justify-between rounded-xl border border-border-subtle bg-white p-5 transition-all hover:border-primary/40 hover:shadow-card-hover"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg}`}>
                      <Icon name={item.icon} size={22} className={item.iconColor} />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="mt-4 font-montserrat text-sm font-bold text-navy group-hover:text-primary">
                    {item.label}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-primary">
                  <span>Open</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CAMPUS ACTIONS SECTION ── */}
        <section className="space-y-3">
          <div className="px-1">
            <h2 className="font-montserrat text-base font-bold text-navy">
              Campus Tools &amp; Insights
            </h2>
            <p className="mt-0.5 text-xs text-text-secondary">
              Academic surveys, ratings, and collaborative ideas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CAMPUS_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-4 rounded-xl border border-border-subtle bg-white p-5 transition-all hover:border-primary/40 hover:shadow-card"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                  <Icon name={item.icon} size={22} className={item.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-montserrat text-sm font-bold text-navy group-hover:text-primary">
                    {item.label}
                  </div>
                  <div className="text-xs text-text-secondary line-clamp-1">{item.desc}</div>
                </div>
                <Icon name="chevron_right" size={18} className="text-text-soft shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>

        {/* ── SETTINGS & UTILITIES ── */}
        <section className="space-y-3">
          <div className="px-1">
            <h2 className="font-montserrat text-base font-bold text-navy">
              Account &amp; System
            </h2>
            <p className="mt-0.5 text-xs text-text-secondary">
              Settings, announcements, and portal details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {UTILITY_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-4 rounded-xl border border-border-subtle bg-white p-5 transition-all hover:border-primary/40 hover:shadow-card"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                  <Icon name={item.icon} size={22} className={item.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-montserrat text-sm font-bold text-navy group-hover:text-primary">
                    {item.label}
                  </div>
                  <div className="text-xs text-text-secondary line-clamp-1">{item.desc}</div>
                </div>
                <Icon name="chevron_right" size={18} className="text-text-soft shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
