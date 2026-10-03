"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AppShell } from "@/components/layout/AppShell";

const MORE_ITEMS = [
  {
    href: "/evaluations",
    label: "Evaluations",
    desc: "Access course and lecturer evaluations.",
    icon: "star",
    iconBg: "bg-amber-tint",
    iconColor: "text-amber-700",
  },
  {
    href: "/polls",
    label: "Polls",
    desc: "Participate in polls and view results.",
    icon: "bar_chart",
    iconBg: "bg-blue-tint",
    iconColor: "text-secondary",
  },
  {
    href: "/suggestion",
    label: "Suggestion Box",
    desc: "Share ideas and suggestions.",
    icon: "lightbulb",
    iconBg: "bg-amber-tint",
    iconColor: "text-amber-700",
  },
  {
    href: "/notifications",
    label: "Notifications",
    desc: "View your latest updates.",
    icon: "notifications",
    iconBg: "bg-purple-tint",
    iconColor: "text-tertiary",
  },
  {
    href: "/settings",
    label: "Settings",
    desc: "Manage your app preferences.",
    icon: "settings",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
] as const;

export default function MorePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="font-montserrat text-2xl font-bold text-navy">More Features</h1>
          <p className="mt-1 text-xs text-text-secondary">Explore secondary student destinations and utilities.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MORE_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 rounded-xl border border-border-subtle bg-white p-5 transition-all hover:border-primary/30 hover:shadow-card-hover"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                <Icon name={item.icon} size={22} className={item.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-montserrat text-sm font-bold text-navy">{item.label}</div>
                <div className="text-xs text-text-secondary line-clamp-1">{item.desc}</div>
              </div>
              <Icon name="chevron_right" size={18} className="text-text-soft shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
