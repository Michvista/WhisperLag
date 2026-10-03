"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import EvaluatePage from "@/app/evaluate/page";

export default function CourseEvalPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-montserrat text-2xl font-bold text-navy">Course Evaluation</h1>
            <p className="mt-1 text-xs text-text-secondary">
              Submit anonymous, rubric-based feedback on course materials and structure.
            </p>
          </div>
          <Link href="/evaluations" className="text-xs font-semibold text-secondary hover:underline">
            ‹ All Evaluations
          </Link>
        </div>

        <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-card">
          <EvaluatePage />
        </div>
      </div>
    </AppShell>
  );
}
