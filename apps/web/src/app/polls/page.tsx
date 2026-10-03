"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AppShell } from "@/components/layout/AppShell";
import { PublicPolls } from "@/components/feedback/PublicPolls";

export default function PollsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-montserrat text-2xl font-bold text-navy">Campus Polls</h1>
            <p className="mt-1 text-xs text-text-secondary">
              View active polls and participate anonymously.
            </p>
          </div>
          <Link
            href="/polls/results"
            className="rounded-lg border border-border-subtle bg-white px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-slate-50 transition-colors"
          >
            View Past Results →
          </Link>
        </div>

        {/* Active polls card */}
        <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-montserrat text-xs font-bold uppercase tracking-wider text-text-soft">
              Active Campus Polls
            </h2>
            <span className="flex h-2 w-2 rounded-full bg-primary" />
          </div>
          <PublicPolls />
        </div>

        {/* Link to poll results */}
        <div>
          <Link
            href="/polls/results"
            className="flex items-center justify-between rounded-xl border border-border-subtle bg-white p-4 transition-all hover:border-primary/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-tint">
                <Icon name="bar_chart" size={20} className="text-secondary" />
              </div>
              <div>
                <div className="font-montserrat text-sm font-bold text-navy">Poll Results Archive</div>
                <div className="text-xs text-text-secondary">View results and distributions from previous semesters.</div>
              </div>
            </div>
            <Icon name="chevron_right" size={18} className="text-text-soft" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
