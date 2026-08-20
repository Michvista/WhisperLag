"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/faculty", label: "Faculty" },
  { href: "/reports", label: "Reports" },
  { href: "/insights", label: "AI Insights" },
  { href: "/surveys", label: "Survey Builder" },
];

/**
 * Sidebar-only navigation for the authenticated app (per design direction:
 * one navigation pattern, not a nav bar + sidebar). Institutional aesthetic:
 * sharp edges, label-caps items, and a Sun Gold dot marking the active page.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink/10 bg-surface">
      <Link
        href="/dashboard"
        className="px-8 py-8 font-display text-headline-lg font-bold tracking-tighter text-primary"
      >
        WhisperLag
      </Link>

      <nav className="flex-1 px-4">
        <p className="mb-4 px-4 font-label-caps text-label-caps uppercase tracking-widest text-onSurfaceVariant/60">
          Command
        </p>
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-3 px-4 py-3 font-label-caps text-label-caps uppercase tracking-wider transition-colors duration-300 ${
                    active
                      ? "font-semibold text-onSurface"
                      : "text-onSurfaceVariant/70 hover:text-primary"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 h-1 w-1 rounded-full bg-sun-gold" />
                  )}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-4 px-6 py-8">
        <Link
          href="/whisper"
          className="block bg-ink px-6 py-3 text-center font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary"
        >
          Submit a Whisper
        </Link>
        <div className="whisper-lock-glow flex items-center justify-center gap-2 rounded-sm bg-surface-container-lowest px-3 py-2">
          <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            lock
          </span>
          <span className="font-label-caps text-label-caps text-onSurfaceVariant">Whisper Lock: Secure</span>
        </div>
      </div>
    </aside>
  );
}