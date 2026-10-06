"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { Icon } from "@/components/ui/Icon";

interface TabItem {
  href: string;
  label: string;
  icon: string;
}

const STUDENT_TABS: TabItem[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/whisper", label: "Give Feedback", icon: "add" },
  { href: "/listwhispers", label: "Whispers", icon: "forum" },
  { href: "/more", label: "More", icon: "widgets" },
];

const ADMIN_TABS: TabItem[] = [
  { href: "/admin", label: "Home", icon: "home" },
  { href: "/whispers", label: "Whispers", icon: "forum" },
  { href: "/reports", label: "Reports", icon: "file" },
  { href: "/insights", label: "Insights", icon: "sparkles" },
  { href: "/more", label: "More", icon: "widgets" },
];

const FACULTY_TABS: TabItem[] = [
  { href: "/faculty", label: "Home", icon: "home" },
  { href: "/courses", label: "Courses", icon: "book" },
  { href: "/whispers", label: "Whispers", icon: "forum" },
  { href: "/more", label: "More", icon: "widgets" },
];

export function MobileBottomNav() {
  const { role } = useAuth();
  const pathname = usePathname();

  const tabs =
    role === "ADMIN"
      ? ADMIN_TABS
      : role === "FACULTY"
      ? FACULTY_TABS
      : STUDENT_TABS;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[100] flex h-14 items-center justify-around border-t border-border-subtle bg-white/95 px-2 shadow-lg backdrop-blur-md lg:hidden">
      {tabs.map((tab) => {
        const active =
          tab.href === "/"
            ? pathname === "/" || pathname === "/dashboard"
            : tab.href === "/admin"
            ? pathname === "/admin"
            : tab.href === "/faculty"
            ? pathname === "/faculty"
            : pathname === tab.href || pathname.startsWith(tab.href + "/");

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors"
          >
            <div className={`flex items-center justify-center transition-transform ${active ? "scale-105" : ""}`}>
              <Icon
                name={tab.icon}
                size={20}
                className={active ? "text-primary" : "text-text-soft"}
              />
            </div>
            <span
              className={`text-[10px] font-semibold leading-none ${
                active ? "text-primary font-bold" : "text-text-soft"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
