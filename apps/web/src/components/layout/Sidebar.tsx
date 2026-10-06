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

function useNavItems() {
  const { role } = useAuth();

  const isStudent = !role || role === "STUDENT" || role === "GUEST";

  // Main nav items
  const items: { href: string; label: string; iconName: string }[] =
    role === "ADMIN"
      ? [
          { href: "/whispers", label: "Whispers", iconName: "forum" },
          { href: "/admin", label: "Command Center", iconName: "settings" },
          { href: "/admin/faculties", label: "Faculties & Heads", iconName: "school" },
          { href: "/courses", label: "Course Hub", iconName: "book" },
          { href: "/collaboration", label: "Collaboration", iconName: "chat" },
          { href: "/integrations", label: "SIS / LMS", iconName: "tune" },
          { href: "/surveys", label: "Surveys & Polls", iconName: "summarize" },
          { href: "/reports", label: "Reports", iconName: "file" },
          { href: "/insights", label: "AI Insights", iconName: "sparkles" },
          { href: "/notifications", label: "Notifications", iconName: "notifications" },
          { href: "/settings", label: "Settings", iconName: "tune" },
        ]
      : role === "FACULTY"
        ? [
            { href: "/whispers", label: "Whispers", iconName: "forum" },
            { href: "/faculty", label: "Faculty Hub", iconName: "school" },
            { href: "/courses", label: "Course Hub", iconName: "book" },
            { href: "/surveys", label: "Surveys & Polls", iconName: "summarize" },
            { href: "/collaboration", label: "Collaboration", iconName: "chat" },
            { href: "/reports", label: "Reports", iconName: "file" },
            { href: "/notifications", label: "Notifications", iconName: "notifications" },
            { href: "/settings", label: "Settings", iconName: "tune" },
          ]
        : [
            // Student primary nav matching UI design
            { href: "/", label: "Home", iconName: "home" },
            { href: "/whisper", label: "Give Feedback", iconName: "add" },
            { href: "/track", label: "Track Whisper", iconName: "search" },
            { href: "/listwhispers", label: "Campus Whispers", iconName: "forum" },
            { href: "/evaluations", label: "Evaluations", iconName: "file" },
            { href: "/polls", label: "Polls", iconName: "bar_chart" },
            { href: "/results", label: "Poll Results", iconName: "pie_chart" },
            { href: "/suggestion", label: "Suggestion Box", iconName: "lightbulb" },
          ];

  // More section links for student desktop sidebar
  const moreItems: { href: string; label: string; iconName: string }[] =
    isStudent
      ? [
          { href: "/more", label: "More Features", iconName: "widgets" },
          { href: "/notifications", label: "Notifications", iconName: "notifications" },
          { href: "/settings", label: "Settings", iconName: "settings" },
        ]
      : [];

  return { items, moreItems, role, isStudent };
}

export function Sidebar() {
  const pathname = usePathname();
  const { items, moreItems, role, isStudent } = useNavItems();
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

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        <div>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-text-soft">
            {ROLE_LABELS[role ?? ""] ?? "Student Portal"}
          </p>
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/" || pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
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
        </div>

        {/* More section directly visible on desktop for students */}
        {isStudent && moreItems.length > 0 && (
          <div className="border-t border-border-subtle pt-3">
            <div className="mb-2 flex items-center justify-between px-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-soft">
                More Features
              </p>
              <Link href="/more" className="text-[10px] font-bold text-primary hover:underline">
                Hub →
              </Link>
            </div>
            <ul className="flex flex-col gap-1">
              {moreItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        active
                          ? "bg-green-tint text-primary font-bold shadow-2xs"
                          : "text-text-secondary hover:bg-slate-50 hover:text-navy"
                      }`}
                    >
                      <Icon
                        name={item.iconName}
                        size={16}
                        className={active ? "text-primary" : "text-text-soft"}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {!isStudent && (
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
      )}
    </aside>
  );
}

/**
 * Legacy export — kept so existing imports compile.
 * Actual mobile nav is now MobileBottomNav.
 */
export function MobileNav() {
  return null;
}