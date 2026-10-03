"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AppShell } from "@/components/layout/AppShell";

// Placeholder notifications — ready for live notification stream
const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "evaluation",
    title: "Evaluation Reminder",
    desc: "Your semester course and lecturer evaluations are now open.",
    time: "2h ago",
    icon: "star",
    iconBg: "bg-amber-tint",
    iconColor: "text-amber-700",
    unread: true,
  },
  {
    id: "2",
    type: "poll",
    title: "New Campus Poll",
    desc: "A new survey on library facilities is available for your participation.",
    time: "1d ago",
    icon: "bar_chart",
    iconBg: "bg-blue-tint",
    iconColor: "text-secondary",
    unread: true,
  },
  {
    id: "3",
    type: "suggestion",
    title: "Suggestion Received",
    desc: "Your suggestion regarding Wi-Fi access in New Hall was reviewed.",
    time: "2d ago",
    icon: "lightbulb",
    iconBg: "bg-amber-tint",
    iconColor: "text-amber-700",
    unread: false,
  },
  {
    id: "4",
    type: "system",
    title: "System Update",
    desc: "WhisperLock v2 security verification has been successfully deployed.",
    time: "3d ago",
    icon: "info",
    iconBg: "bg-green-tint",
    iconColor: "text-primary",
    unread: false,
  },
] as const;

export default function NotificationsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-montserrat text-2xl font-bold text-navy">Notifications</h1>
            <p className="mt-1 text-xs text-text-secondary">View system alerts, evaluation reminders, and poll updates.</p>
          </div>
          <Link href="/more" className="text-xs font-semibold text-secondary hover:underline">
            ‹ More Menu
          </Link>
        </div>

        <div className="space-y-2.5">
          {MOCK_NOTIFICATIONS.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3.5 rounded-xl border p-4 transition-all ${
                n.unread
                  ? "border-border-subtle bg-white shadow-card"
                  : "border-border-subtle bg-white/70"
              }`}
            >
              {/* Icon badge */}
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${n.iconBg}`}>
                <Icon name={n.icon} size={18} className={n.iconColor} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-montserrat text-xs font-bold text-navy">{n.title}</span>
                  <span className="shrink-0 text-[10px] text-text-soft">{n.time}</span>
                </div>
                <p className="mt-0.5 text-xs text-text-secondary">{n.desc}</p>
              </div>

              {/* Unread indicator */}
              {n.unread && (
                <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
