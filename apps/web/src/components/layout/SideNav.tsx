"use client";
import { Icon } from "@/components/ui/Icon";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SideItem {
  href: string;
  label: string;
  icon: string;
}

const SIDE_ITEMS: SideItem[] = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/whisper", label: "Whispers", icon: "chat_bubble" },
  { href: "/faculty", label: "Faculty Hub", icon: "school" },
  { href: "/admin", label: "Admin Panel", icon: "admin_panel_settings" },
  { href: "/reports", label: "Reports", icon: "description" },
];

/**
 * Left-hand navigation shown on authenticated app screens (desktop). On
 * mobile it is hidden in favour of the top bar + a focus on the primary
 * task, per the mobile-first layout.
 */
export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 flex-col space-y-4 border-r border-surface-container-low bg-surface p-4 shadow-sm md:flex">
      <div className="mb-6 px-2">
        <h2 className="font-display text-headline-sm font-bold text-primary">Student Portal</h2>
        <p className="font-body-sm text-body-sm text-onSurfaceVariant">Anonymous Session</p>
      </div>

      <div className="flex-1 space-y-2">
        {SIDE_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 font-label-md text-label-md transition-all ${
                active
                  ? "translate-x-1 bg-primary-container font-semibold text-onPrimaryContainer"
                  : "text-onSurfaceVariant hover:bg-surface-container-high"
              }`}
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <Link
        href="/whisper"
        className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-primary font-label-md text-label-md text-onPrimary shadow-level-1 transition-all hover:shadow-level-2"
      >
        <Icon name="add" size={18} />
        New Whisper
      </Link>

      <div className="space-y-2 border-t border-outlineVariant pt-4">
        <Link
          href="/help"
          className="flex items-center gap-3 rounded-lg px-4 py-2 text-onSurfaceVariant transition-all hover:bg-surface-container-low"
        >
          <Icon name="help" size={24} />
          <span className="font-label-md text-label-md">Help</span>
        </Link>
        <Link
          href="/logout"
          className="flex items-center gap-3 rounded-lg px-4 py-2 text-onSurfaceVariant transition-all hover:bg-surface-container-low"
        >
          <Icon name="logout" size={24} />
          <span className="font-label-md text-label-md">Logout</span>
        </Link>
      </div>
    </nav>
  );
}
