"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhisperBrand } from "@/components/ui/WhisperBrand";
import { Icon } from "@/components/ui/Icon";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/whisper", label: "Give Feedback" },
  { href: "/whispers", label: "Student Whispers" },
  { href: "/faculty", label: "Faculty" },
  { href: "/admin", label: "Admin" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border-subtle bg-white/95 px-5 shadow-xs backdrop-blur-md md:px-8">
      <div className="flex items-center gap-8">
        <WhisperBrand href="/" />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-green-tint text-primary font-bold"
                    : "text-text-secondary hover:bg-slate-100 hover:text-navy"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          aria-label="Notifications"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border-subtle bg-white text-text-secondary transition-colors hover:bg-slate-50 hover:text-navy"
        >
          <Icon name="notifications" size={16} />
        </button>
        <Link
          href="/login"
          aria-label="Account"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border-subtle bg-white text-text-secondary transition-colors hover:bg-slate-50 hover:text-navy"
        >
          <Icon name="account_circle" size={16} />
        </Link>
      </div>
    </header>
  );
}
