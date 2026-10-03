"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

// Mock poll results data — ready for real API integration
const MOCK_RESULTS = [
  {
    id: "1",
    question: "What should receive more attention this semester?",
    closedAt: "Sep 30, 2026",
    totalVotes: 234,
    options: [
      { label: "Facilities", votes: 89, pct: 38 },
      { label: "Learning Experience", votes: 102, pct: 44 },
      { label: "Administration", votes: 43, pct: 18 },
    ],
  },
  {
    id: "2",
    question: "How would you rate the library resources?",
    closedAt: "Sep 15, 2026",
    totalVotes: 178,
    options: [
      { label: "Excellent", votes: 32, pct: 18 },
      { label: "Good", votes: 71, pct: 40 },
      { label: "Average", votes: 53, pct: 30 },
      { label: "Poor", votes: 22, pct: 12 },
    ],
  },
];

export default function PollResultsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-montserrat text-2xl font-bold text-navy">Poll Results Archive</h1>
            <p className="mt-1 text-xs text-text-secondary">View results and student vote distributions from previous campus polls.</p>
          </div>
          <Link href="/polls" className="text-xs font-semibold text-secondary hover:underline">
            ‹ Active Polls
          </Link>
        </div>

        <div className="space-y-4">
          {MOCK_RESULTS.map((poll) => (
            <div key={poll.id} className="rounded-xl border border-border-subtle bg-white p-6 shadow-card">
              {/* Poll meta */}
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-soft">
                  Closed {poll.closedAt}
                </span>
                <span className="text-[10px] font-semibold text-text-soft">{poll.totalVotes} total responses</span>
              </div>

              <h3 className="mb-4 font-montserrat text-sm font-bold text-navy">{poll.question}</h3>

              {/* Option bars */}
              <div className="space-y-3">
                {poll.options.map((opt) => (
                  <div key={opt.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-navy">{opt.label}</span>
                      <span className="text-xs font-bold text-primary">{opt.pct}% <span className="font-normal text-text-soft">({opt.votes})</span></span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${opt.pct}%` }}
                      />
                    </div>
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
