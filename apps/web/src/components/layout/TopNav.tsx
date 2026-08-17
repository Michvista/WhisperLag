"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/whispers", label: "My Whispers" },
  { href: "/faculty", label: "Faculty" },
  { href: "/admin", label: "Admin" },
];

/**
 * Fixed top navigation bar used across the app. The active link is
 * underlined with the UNILAG Green bottom border, per the design system.
 */
export function TopNav() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b-2 border-primary bg-surface px-margin-mobile md:px-margin-desktop"
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="font-display text-headline-sm font-bold text-primary">
          WhisperLag
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 font-label-md text-label-md transition-colors hover:bg-surface-container-low ${
                  active
                    ? "border-b-2 border-primary font-bold text-primary"
                    : "text-onSurfaceVariant hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4 text-primary">
        <button
          aria-label="Notifications"
          className="rounded-full p-2 transition-colors hover:bg-surface-container-low active:scale-95"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          aria-label="Account"
          className="rounded-full p-2 transition-colors hover:bg-surface-container-low active:scale-95"
        >
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </motion.header>
  );
}
