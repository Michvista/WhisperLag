"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { WhisperLock } from "@/components/ui/WhisperLock";
import { Icon } from "@/components/ui/Icon";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Administrator",
  GUEST: "External Review",
};

/** One-line explanation shown on hover for items whose names aren't obvious. */
const NAV_HINTS: Record<string, string> = {
  "SIS / LMS": "SIS = the university's official student & course records. LMS = where courses are taught online. This page syncs them into the app.",
  "AI Insights": "Automatically groups anonymous whispers by shared viewpoint.",
  "Course Hub": "Each course's syllabus beside its anonymous student ratings.",
};

/** Sidebar items, gated by role. Students just drop a whisper; staff see the console. */
function useNavItems() {
  const { role } = useAuth();
  const items: { href: string; label: string }[] =
    role === "ADMIN"
      ? [
          { href: "/whispers", label: "Whispers" },
          { href: "/admin", label: "Command Center" },
          { href: "/courses", label: "Course Hub" },
          { href: "/collaboration", label: "Collaboration" },
          { href: "/integrations", label: "SIS / LMS" },
          { href: "/surveys", label: "Surveys" },
          { href: "/reports", label: "Reports" },
          { href: "/insights", label: "AI Insights" },
        ]
      : role === "FACULTY"
        ? [
            { href: "/whispers", label: "Whispers" },
            { href: "/faculty", label: "Faculty" },
            { href: "/courses", label: "Course Hub" },
            { href: "/surveys", label: "Surveys" },
            { href: "/collaboration", label: "Collaboration" },
            { href: "/reports", label: "Reports" },
          ]
        : [{ href: "/dashboard", label: "Drop a Whisper" }, { href: "/evaluate", label: "Rate a Course" }];
  return { items, role };
}

/** Desktop fixed sidebar. */
export function Sidebar() {
  const pathname = usePathname();
  const { items, role } = useNavItems();
  const { logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  function handleLogout() {
    setSigningOut(true);
    logout();
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-ink/10 bg-surface lg:flex">
      <Link
        href={items[0]?.href ?? "/dashboard"}
        className="px-8 py-8 font-display text-headline-lg font-bold tracking-tighter text-primary"
      >
        WhisperLag
      </Link>

      <nav className="flex-1 px-4">
        <p className="mb-1 px-4 font-label-caps text-label-caps uppercase tracking-widest text-onSurfaceVariant/60">
          {ROLE_LABELS[role ?? ""] ?? "Portal"}
        </p>
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const hint = NAV_HINTS[item.label];
            return (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  title={hint}
                  className={`relative flex items-center gap-3 px-4 py-3 font-label-caps text-label-caps uppercase tracking-wider transition-colors duration-300 ${
                    active ? "font-semibold text-primary" : "text-onSurfaceVariant/70 hover:text-primary"
                  }`}
                >
                  {active && <span className="absolute left-0 h-1 w-1 rounded-full bg-sun-gold" />}
                  {item.label}
                </Link>
                {hint && (
                  <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-3 w-60 -translate-y-1/2 rounded-sm border border-ink/10 bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm normal-case tracking-normal text-onSurface opacity-0 shadow-level-2 transition-opacity group-hover:opacity-100">
                    {hint}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-4 border-t border-ink/10 px-6 py-6">
        <WhisperLock compact className="w-full justify-center" />
        <button
          onClick={handleLogout}
          disabled={signingOut}
          className="flex w-full items-center justify-center gap-2 border border-ink px-4 py-2.5 font-label-caps text-label-caps uppercase tracking-wider text-onSurface transition-colors duration-300 hover:bg-surface-variant disabled:opacity-50"
        >
          {signingOut ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          ) : (
            <Icon name="logout" size={16} />
          )}
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}

/** Mobile top navigation bar (replaces the sidebar under lg). */
export function MobileNav() {
  const pathname = usePathname();
  const { items } = useNavItems();
  const { logout } = useAuth();

  return (
    <nav className="fixed inset-x-0 top-0 z-40 border-b border-ink/10 bg-surface lg:hidden">
      <div className="flex items-center justify-between px-margin-mobile py-3">
        <Link href="/dashboard" className="font-display text-headline-md font-bold tracking-tighter text-primary">
          WhisperLag
        </Link>
        <WhisperLock compact />
      </div>
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto px-margin-mobile pb-2">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 px-3 py-1.5 font-label-caps text-label-caps uppercase tracking-wider transition-colors ${
                active ? "text-primary" : "text-onSurfaceVariant/70"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <button onClick={logout} className="ml-1 shrink-0 border border-ink px-3 py-1.5 font-label-caps text-label-caps uppercase tracking-wider text-onSurface">
          Sign Out
        </button>
      </div>
    </nav>
  );
}