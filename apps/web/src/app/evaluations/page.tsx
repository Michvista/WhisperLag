"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AppShell } from "@/components/layout/AppShell";

export default function EvaluationsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-montserrat text-2xl font-bold text-navy">Evaluations Hub</h1>
            <p className="mt-1 text-xs text-text-secondary">Access and participate in course and lecturer evaluations.</p>
          </div>
          <Link href="/more" className="text-xs font-semibold text-secondary hover:underline">
            ‹ More Menu
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Course Evaluation */}
          <Link
            href="/evaluations/course"
            className="flex items-center gap-4 rounded-xl border border-border-subtle bg-white p-5 transition-all hover:border-primary/30 hover:shadow-card-hover"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-tint">
              <Icon name="book" size={22} className="text-secondary" />
            </div>
            <div className="flex-1">
              <div className="font-montserrat text-sm font-bold text-navy">Course Evaluation</div>
              <div className="mt-0.5 text-xs text-text-secondary">Evaluate your courses using the approved rubric.</div>
            </div>
            <Icon name="chevron_right" size={18} className="text-text-soft" />
          </Link>

          {/* Lecturer Evaluation */}
          <Link
            href="/evaluations/lecturer"
            className="flex items-center gap-4 rounded-xl border border-border-subtle bg-white p-5 transition-all hover:border-primary/30 hover:shadow-card-hover"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-tint">
              <Icon name="school" size={22} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-montserrat text-sm font-bold text-navy">Lecturer Evaluation</div>
              <div className="mt-0.5 text-xs text-text-secondary">Evaluate your lecturers. Anonymous and confidential.</div>
            </div>
            <Icon name="chevron_right" size={18} className="text-text-soft" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
