"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/useAuth";

const STUDENT_WHISPER_ITEMS = [
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

const STUDENT_CAMPUS_ITEMS = [
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

const FACULTY_ITEMS = [
  {
    href: "/faculty",
    label: "Faculty Hub",
    desc: "Main dashboard, performance metrics, and sentiment scores.",
    icon: "home",
    iconBg: "bg-green-tint",
    iconColor: "text-primary",
  },
  {
    href: "/courses",
    label: "My Courses",
    desc: "View courses assigned to your faculty and their student ratings.",
    icon: "book",
    iconBg: "bg-amber-tint",
    iconColor: "text-amber-700",
  },
  {
    href: "/whispers",
    label: "Whispers Desk",
    desc: "Review and respond to departmental student whispers.",
    icon: "forum",
    iconBg: "bg-blue-tint",
    iconColor: "text-secondary",
  },
  {
    href: "/reports",
    label: "QA & Reports",
    desc: "Accreditation dossiers, export summaries, and audit logs.",
    icon: "file",
    iconBg: "bg-purple-tint",
    iconColor: "text-tertiary",
  },
  {
    href: "/surveys",
    label: "Surveys",
    desc: "Departmental survey templates and feedback questions.",
    icon: "summarize",
    iconBg: "bg-green-tint",
    iconColor: "text-primary",
  },
  {
    href: "/collaboration",
    label: "Collaboration & Chat",
    desc: "Message HODs, faculty members, and QA officers.",
    icon: "chat",
    iconBg: "bg-blue-tint",
    iconColor: "text-secondary",
  },
];

const ADMIN_ITEMS = [
  {
    href: "/admin",
    label: "Institutional Overview",
    desc: "University-wide dashboard, active courses, and resolution KPIs.",
    icon: "home",
    iconBg: "bg-green-tint",
    iconColor: "text-primary",
  },
  {
    href: "/whispers",
    label: "Whispers Desk",
    desc: "Moderate, track, and route campus whispers with AI.",
    icon: "forum",
    iconBg: "bg-blue-tint",
    iconColor: "text-secondary",
  },
  {
    href: "/courses",
    label: "Course Hub & Registry",
    desc: "Manage academic registry, faculties, and course units.",
    icon: "school",
    iconBg: "bg-amber-tint",
    iconColor: "text-amber-700",
  },
  {
    href: "/reports",
    label: "Accreditation Reports",
    desc: "Generate institutional reports and export data.",
    icon: "file",
    iconBg: "bg-purple-tint",
    iconColor: "text-tertiary",
  },
  {
    href: "/insights",
    label: "AI Insights",
    desc: "Emerging sentiment trends and topic clustering across faculties.",
    icon: "sparkles",
    iconBg: "bg-green-tint",
    iconColor: "text-primary",
  },
  {
    href: "/surveys",
    label: "Survey Templates",
    desc: "Manage official quality assurance survey instruments.",
    icon: "summarize",
    iconBg: "bg-blue-tint",
    iconColor: "text-secondary",
  },
  {
    href: "/integrations",
    label: "SIS & LMS Integrations",
    desc: "Portal data sync and bulk student roster import.",
    icon: "tune",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
  },
];

export default function MorePage() {
  const { role, logout } = useAuth();
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
              {isAdmin ? "Admin Navigation" : isFaculty ? "Faculty Navigation" : "Explore WhisperLag"}
            </span>
          </div>
          <h1 className="mt-2 font-montserrat text-2xl font-bold text-navy sm:text-3xl">
            {isAdmin ? "Admin Controls & Hub" : isFaculty ? "Faculty Portal & Hub" : "More Features & Hub"}
          </h1>
          <p className="mt-1 text-xs text-text-secondary sm:text-sm">
            {isAdmin
              ? "Access university-wide management, reports, curriculum, and settings."
              : isFaculty
              ? "Access your courses, departmental whispers, QA reports, and tools."
              : "Quickly navigate student voices, academic evaluations, campus polls, and institutional tools."}
          </p>
        </div>

        {/* ── FACULTY VIEW ── */}
        {isFaculty && (
          <>
            <section className="space-y-3">
              <div className="px-1">
                <h2 className="font-montserrat text-base font-bold text-navy">
                  Faculty Dashboard Sections
                </h2>
                <p className="mt-0.5 text-xs text-text-secondary">
                  Manage your courses, feedback, and departmental collaboration.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {FACULTY_ITEMS.map((item) => (
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

            {/* Account & Settings */}
            <section className="space-y-3">
              <div className="px-1">
                <h2 className="font-montserrat text-base font-bold text-navy">
                  Account &amp; System
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  href="/notifications"
                  className="group flex items-center gap-4 rounded-xl border border-border-subtle bg-white p-4 transition-all hover:border-primary/40 hover:shadow-card"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-tint text-tertiary">
                    <Icon name="notifications" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-montserrat text-sm font-bold text-navy group-hover:text-primary">
                      Notifications
                    </div>
                    <div className="text-xs text-text-secondary">Announcements &amp; alerts</div>
                  </div>
                  <Icon name="chevron_right" size={16} className="text-text-soft" />
                </Link>

                <Link
                  href="/settings"
                  className="group flex items-center gap-4 rounded-xl border border-border-subtle bg-white p-4 transition-all hover:border-primary/40 hover:shadow-card"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon name="settings" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-montserrat text-sm font-bold text-navy group-hover:text-primary">
                      Settings
                    </div>
                    <div className="text-xs text-text-secondary">Preferences &amp; security</div>
                  </div>
                  <Icon name="chevron_right" size={16} className="text-text-soft" />
                </Link>
              </div>

              <div className="pt-2">
                <button
                  onClick={logout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                >
                  <Icon name="logout" size={16} />
                  Sign Out of Faculty Account
                </button>
              </div>
            </section>
          </>
        )}

        {/* ── ADMIN VIEW ── */}
        {isAdmin && (
          <>
            <section className="space-y-3">
              <div className="px-1">
                <h2 className="font-montserrat text-base font-bold text-navy">
                  Admin Command Tools
                </h2>
                <p className="mt-0.5 text-xs text-text-secondary">
                  Complete institutional oversight, reporting, and registry tools.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {ADMIN_ITEMS.map((item) => (
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

            {/* Account & Settings */}
            <section className="space-y-3">
              <div className="px-1">
                <h2 className="font-montserrat text-base font-bold text-navy">
                  Account &amp; System
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  href="/notifications"
                  className="group flex items-center gap-4 rounded-xl border border-border-subtle bg-white p-4 transition-all hover:border-primary/40 hover:shadow-card"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-tint text-tertiary">
                    <Icon name="notifications" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-montserrat text-sm font-bold text-navy group-hover:text-primary">
                      Notifications
                    </div>
                    <div className="text-xs text-text-secondary">Administrative alerts</div>
                  </div>
                  <Icon name="chevron_right" size={16} className="text-text-soft" />
                </Link>

                <Link
                  href="/settings"
                  className="group flex items-center gap-4 rounded-xl border border-border-subtle bg-white p-4 transition-all hover:border-primary/40 hover:shadow-card"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon name="settings" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-montserrat text-sm font-bold text-navy group-hover:text-primary">
                      Settings
                    </div>
                    <div className="text-xs text-text-secondary">System configuration</div>
                  </div>
                  <Icon name="chevron_right" size={16} className="text-text-soft" />
                </Link>
              </div>

              <div className="pt-2">
                <button
                  onClick={logout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                >
                  <Icon name="logout" size={16} />
                  Sign Out of Admin Account
                </button>
              </div>
            </section>
          </>
        )}

        {/* ── STUDENT / PUBLIC VIEW ── */}
        {!isAdmin && !isFaculty && (
          <>
            {/* Campus Whispers */}
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
                {STUDENT_WHISPER_ITEMS.map((item) => (
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

            {/* Campus Tools */}
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
                {STUDENT_CAMPUS_ITEMS.map((item) => (
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

            {/* Settings & Utilities */}
            <section className="space-y-3">
              <div className="px-1">
                <h2 className="font-montserrat text-base font-bold text-navy">
                  Account &amp; System
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  href="/notifications"
                  className="group flex items-center gap-4 rounded-xl border border-border-subtle bg-white p-4 transition-all hover:border-primary/40 hover:shadow-card"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-tint text-tertiary">
                    <Icon name="notifications" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-montserrat text-sm font-bold text-navy group-hover:text-primary">
                      Notifications
                    </div>
                    <div className="text-xs text-text-secondary">Platform announcements</div>
                  </div>
                  <Icon name="chevron_right" size={16} className="text-text-soft" />
                </Link>

                <Link
                  href="/settings"
                  className="group flex items-center gap-4 rounded-xl border border-border-subtle bg-white p-4 transition-all hover:border-primary/40 hover:shadow-card"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon name="settings" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-montserrat text-sm font-bold text-navy group-hover:text-primary">
                      Settings
                    </div>
                    <div className="text-xs text-text-secondary">Preferences &amp; accessibility</div>
                  </div>
                  <Icon name="chevron_right" size={16} className="text-text-soft" />
                </Link>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white p-3.5 text-xs font-bold text-navy transition-colors hover:bg-slate-50"
                >
                  Staff Sign In Portal →
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
