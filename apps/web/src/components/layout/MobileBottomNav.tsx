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

const FACULTY_TABS: TabItem[] = [
  { href: "/faculty", label: "Faculty Hub", icon: "school" },
  { href: "/courses", label: "Courses", icon: "book" },
  { href: "/whispers", label: "Whispers", icon: "forum" },
  { href: "/more", label: "More", icon: "widgets" },
];

const ADMIN_TABS: TabItem[] = [
  { href: "/admin", label: "Admin", icon: "settings" },
  { href: "/whispers", label: "Whispers", icon: "forum" },
  { href: "/reports", label: "Reports", icon: "file" },
  { href: "/more", label: "More", icon: "widgets" },
];

export function MobileBottomNav() {
  const { role } = useAuth();
  const pathname = usePathname();

  // If the user is on public / student pages, always show the 4 student tabs
  const isPublicOrStudentPath =
    pathname === "/" ||
    pathname === "/whisper" ||
    pathname === "/listwhispers" ||
    pathname === "/track" ||
    pathname === "/evaluations" ||
    pathname === "/polls" ||
    pathname === "/results" ||
    pathname === "/suggestion" ||
    pathname === "/more";

  let tabs = STUDENT_TABS;
  if (!isPublicOrStudentPath) {
    if (role === "ADMIN") {
      tabs = ADMIN_TABS;
    } else if (role === "FACULTY") {
      tabs = FACULTY_TABS;
    }
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[100] grid h-16 grid-cols-4 items-center border-t border-border-subtle bg-white/95 px-1 shadow-lg backdrop-blur-md lg:hidden">
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
            className="flex flex-col items-center justify-center gap-0.5 py-1 transition-colors"
          >
            <div className={`flex h-6 w-6 items-center justify-center transition-transform ${active ? "scale-110" : ""}`}>
              <Icon
                name={tab.icon}
                size={20}
                className={active ? "text-primary" : "text-text-soft"}
              />
            </div>
            <span
              className={`text-[10px] font-semibold leading-tight text-center truncate max-w-full px-0.5 ${
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

