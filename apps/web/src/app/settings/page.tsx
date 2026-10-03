"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AppShell } from "@/components/layout/AppShell";

const SETTINGS_SECTIONS = [
  {
    title: "App Preferences",
    items: [
      { label: "Language", value: "English", icon: "language" },
      { label: "Theme", value: "Light (Clean Editorial)", icon: "palette" },
    ],
  },
  {
    title: "Notifications",
    items: [
      { label: "Evaluation Reminders", toggle: true, defaultOn: true, icon: "notifications" },
      { label: "New Polls & Surveys", toggle: true, defaultOn: true, icon: "bar_chart" },
      { label: "System Updates", toggle: true, defaultOn: false, icon: "info" },
    ],
  },
  {
    title: "Privacy & Security",
    items: [
      { label: "Anonymous Mode", value: "Always On (Encrypted)", icon: "lock" },
      { label: "Privacy Policy", href: "/privacy", icon: "policy" },
      { label: "Ethics & Compliance", href: "/ethics", icon: "verified_user" },
    ],
  },
];

export default function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Evaluation Reminders": true,
    "New Polls & Surveys": true,
    "System Updates": false,
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-montserrat text-2xl font-bold text-navy">Settings</h1>
            <p className="mt-1 text-xs text-text-secondary">Manage your app preferences and notification settings.</p>
          </div>
          <Link href="/more" className="text-xs font-semibold text-secondary hover:underline">
            ‹ More Menu
          </Link>
        </div>

        <div className="space-y-6">
          {SETTINGS_SECTIONS.map((section) => (
            <div key={section.title}>
              {/* Section label */}
              <p className="mb-2 px-1 text-[10.5px] font-bold uppercase tracking-wider text-text-soft">
                {section.title}
              </p>

              <div className="overflow-hidden rounded-xl border border-border-subtle bg-white shadow-card">
                {section.items.map((item, idx) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3.5 px-4 py-3.5 ${
                      idx < section.items.length - 1 ? "border-b border-border-subtle" : ""
                    }`}
                  >
                    <Icon name={item.icon} size={18} className="text-text-soft shrink-0" />
                    <span className="flex-1 text-xs font-semibold text-navy">{item.label}</span>

                    {/* Toggle switch */}
                    {"toggle" in item && item.toggle ? (
                      <button
                        onClick={() =>
                          setToggles((t) => ({ ...t, [item.label]: !t[item.label] }))
                        }
                        aria-label={`Toggle ${item.label}`}
                        className={`relative h-5 w-9 rounded-full transition-colors ${
                          toggles[item.label] ? "bg-primary" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                            toggles[item.label] ? "left-4" : "left-0.5"
                          }`}
                        />
                      </button>
                    ) : "href" in item && item.href ? (
                      <Link href={item.href} className="text-xs font-semibold text-primary hover:underline">
                        View →
                      </Link>
                    ) : (
                      <span className="text-xs text-text-secondary">{"value" in item ? item.value : ""}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
