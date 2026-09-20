"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { WhisperBrand } from "@/components/ui/WhisperBrand";
import { Icon } from "@/components/ui/Icon";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Student Portal",
  FACULTY: "Faculty Portal",
  ADMIN: "Admin Command Center",
  GUEST: "External Review",
};

const NAV_HINTS: Record<string, string> = {
  "SIS / LMS": "Student & course records integration.",
  "AI Insights": "Automatically groups anonymous whispers by shared viewpoint.",
  "Course Hub": "Course syllabus and student ratings.",
};

function useNavItems() {
  const { role } = useAuth();
  const items: { href: string; label: string; iconName: string }[] =
    role === "ADMIN"
      ? [
          { href: "/whispers", label: "Whispers", iconName: "forum" },
          { href: "/admin", label: "Command Center", iconName: "settings" },
          { href: "/admin/faculties", label: "Faculties & Heads", iconName: "school" },
          { href: "/courses", label: "Course Hub", iconName: "book" },
          { href: "/collaboration", label: "Collaboration", iconName: "chat" },
          { href: "/integrations", label: "SIS / LMS", iconName: "tune" },
          { href: "/surveys", label: "Surveys", iconName: "summarize" },
          { href: "/reports", label: "Reports", iconName: "file" },
          { href: "/insights", label: "AI Insights", iconName: "sparkles" },
        ]
      : role === "FACULTY"
        ? [
            { href: "/whispers", label: "Whispers", iconName: "forum" },
            { href: "/faculty", label: "Faculty", iconName: "school" },
            { href: "/courses", label: "Course Hub", iconName: "book" },
            { href: "/surveys", label: "Surveys", iconName: "summarize" },
            { href: "/collaboration", label: "Collaboration", iconName: "chat" },
            { href: "/reports", label: "Reports", iconName: "file" },
          ]
        : [
            { href: "/dashboard", label: "Dashboard", iconName: "home" },
            { href: "/whisper", label: "Give Feedback", iconName: "add" },
            { href: "/listwhispers", label: "Student Whispers", iconName: "forum" },
            { href: "/evaluate", label: "Rate a Course", iconName: "star" },
          ];
  return { items, role };
}

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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border-subtle bg-white lg:flex">
      <div className="p-5 border-b border-border-subtle">
        <WhisperBrand href={items[0]?.href ?? "/dashboard"} />
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="mb-2.5 px-3 text-[10.5px] font-bold uppercase tracking-wider text-text-soft">
          {ROLE_LABELS[role ?? ""] ?? "Portal"}
        </p>
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const hint = NAV_HINTS[item.label];
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={hint}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    active
                      ? "bg-green-tint text-primary font-bold shadow-2xs"
                      : "text-text-secondary hover:bg-slate-50 hover:text-navy"
                  }`}
                >
                  <Icon
                    name={item.iconName}
                    size={17}
                    className={active ? "text-primary" : "text-text-secondary"}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border-subtle p-4">
        <button
          onClick={handleLogout}
          disabled={signingOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-subtle bg-white py-2 text-xs font-semibold text-text-secondary transition-all hover:bg-slate-50 hover:text-navy disabled:opacity-50"
        >
          {signingOut ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-700 border-t-transparent" />
          ) : (
            <Icon name="logout" size={15} />
          )}
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { items } = useNavItems();
  const { logout } = useAuth();

  return (
    <nav className="fixed inset-x-0 top-0 z-40 border-b border-border-subtle bg-white/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <WhisperBrand href="/dashboard" size="sm" />
        <button
          onClick={logout}
          className="rounded-md border border-border-subtle bg-white px-2.5 py-1 text-[11px] font-semibold text-text-secondary"
        >
          Sign Out
        </button>
      </div>
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto px-4 py-2">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                active ? "bg-green-tint text-primary font-bold" : "text-text-secondary hover:text-navy"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}