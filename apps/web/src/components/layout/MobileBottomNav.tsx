"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { Icon } from "@/components/ui/Icon";

interface TabItem {
  href: string;
  label: string;
  icon: string;
  isPrimary?: boolean;
}

const STAFF_ROUTES = [
  "/admin",
  "/faculty",
  "/whispers",
  "/reports",
  "/integrations",
  "/collaboration",
  "/surveys",
  "/insights",
  "/courses",
];

const STUDENT_TABS: TabItem[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/whisper", label: "Give Feedback", icon: "rate_review" },
  { href: "/track", label: "Track", icon: "search" },
  { href: "/more", label: "More", icon: "widgets" },
];

export function MobileBottomNav() {
  const { role } = useAuth();
  const pathname = usePathname();

  // Only hide when genuinely navigating inside staff / admin control rooms
  const isStaffRoute = STAFF_ROUTES.some((r) => pathname.startsWith(r));
  if (isStaffRoute && (role === "ADMIN" || role === "FACULTY")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[100] flex h-14 items-center justify-around border-t border-border-subtle bg-white/95 px-2 shadow-lg backdrop-blur-md lg:hidden">
      {STUDENT_TABS.map((tab) => {
        const active =
          tab.href === "/"
            ? pathname === "/" || pathname === "/dashboard"
            : pathname === tab.href || pathname.startsWith(tab.href + "/");

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors"
          >
            <Icon
              name={tab.icon}
              size={20}
              className={active ? "text-primary" : "text-text-soft"}
            />
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
