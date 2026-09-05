"use client";
import { Icon } from "@/components/ui/Icon";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/ui/RoleGate";
import { ROLES } from "@whisperlag/shared";
import { api, getToken } from "@/lib/api";

interface InsightItem {
  id: string;
  category: string;
  content: string;
}

interface Cluster {
  id: string;
  title: string;
  summary: string;
  size: number;
  sentiment: "positive" | "neutral" | "negative";
  items: InsightItem[];
}

interface InsightResult {
  provider: "groq" | "algorithm";
  generatedAt: string;
  clusters: Cluster[];
  noise: { id: string; category: string; content: string; reason: string }[];
}

const SENTIMENT_STYLE: Record<Cluster["sentiment"], string> = {
  positive: "text-primary",
  neutral: "text-onSurfaceVariant",
  negative: "text-error",
};

/**
   * AI Complaint Intelligence. Groups anonymous whispers by shared viewpoint
   * with an automatic engine, and flags low-value submissions.
   */
export default function InsightsPage() {
  const [result, setResult] = useState<InsightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<InsightResult>("/insights/analyze", {
        method: "POST",
        token: getToken(),
      });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }


  return (
    <RoleGate minRole={ROLES.ADMIN}>
      <AppShell>
      <header className="rule-b mb-12 flex flex-wrap items-end justify-between gap-6 pb-8">
        <div>
          <h1 className="mb-2 font-display text-headline-lg font-semibold text-onSurface">AI Complaint Intelligence</h1>
          <p className="max-w-xl font-body-md text-body-md text-onSurfaceVariant">
            Groups anonymous whispers by shared viewpoint and surfaces noise :
            automatically, with no identities exposed.
          </p>
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          className="flex items-center gap-2 bg-ink px-6 py-4 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary disabled:opacity-60"
        >
          <Icon name="auto_awesome" size={24} />
          {loading ? "Analyzing…" : "Analyze with AI"}
        </button>
      </header>

      {error && <p className="mb-8 border border-error-container bg-error-container/30 p-4 font-body-md text-body-md text-onErrorContainer">{error}</p>}

      {result && (
        <div className="flex flex-col gap-16">
          <div className="flex items-center gap-4">
            <span className="font-mono-label text-mono-label uppercase tracking-wider text-onSurfaceVariant">
              Engine
            </span>
            <span className="whisper-lock-glow flex items-center gap-2 rounded-sm bg-surface-container-lowest px-3 py-1.5">
              <Icon name={result.provider === "groq" ? "auto_awesome" : "tune"} size={16} className="text-primary" />
              <span className="font-label-caps text-label-caps uppercase text-onSurface">
                {result.provider === "groq" ? "AI Engine" : "Built-in"}
              </span>
            </span>
            <span className="font-mono-label text-mono-label text-onSurfaceVariant">
              {new Date(result.generatedAt).toLocaleTimeString()}
            </span>
          </div>

          <section>
            <h2 className="rule-b mb-6 font-label-caps text-label-caps uppercase tracking-widest text-onSurface">
              Viewpoint Clusters · {result.clusters.length}
            </h2>
            <div className="flex flex-col">
              {result.clusters.map((cluster) => (
                <div key={cluster.id} className="rule-b py-6">
                  <button
                    onClick={() => setExpanded(expanded === cluster.id ? null : cluster.id)}
                    className="flex w-full items-start gap-6 text-left"
                  >
                    <span className={`font-display text-3xl font-light ${SENTIMENT_STYLE[cluster.sentiment]}`}>
                      {cluster.size}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-display text-headline-md font-semibold text-onSurface">{cluster.title}</h3>
                      <p className="mt-1 font-body-md text-body-md text-onSurfaceVariant">{cluster.summary}</p>
                    </div>
                    <Icon name={expanded === cluster.id ? "expand_less" : "expand_more"} size={24} className="text-onSurfaceVariant" />
                  </button>
                  {expanded === cluster.id && (
                    <div className="ml-16 mt-4 flex flex-col gap-3">
                      {cluster.items.map((item) => (
                        <div key={item.id} className="border-l border-ink/10 pl-4">
                          <span className="font-label-caps text-label-caps text-onSurfaceVariant">{item.category}</span>
                          <p className="font-body-md text-body-md text-onSurface">&ldquo;{item.content}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {result.noise.length > 0 && (
            <section>
              <h2 className="rule-b mb-6 font-label-caps text-label-caps uppercase tracking-widest text-onSurface">
                Flagged Noise · {result.noise.length}
              </h2>
              <div className="flex flex-col">
                {result.noise.map((n) => (
                  <div key={n.id} className="rule-b flex items-start gap-6 py-4 opacity-70">
                    <Icon name="report" size={24} className="text-error" />
                    <p className="flex-1 font-body-md text-body-md text-onSurface">&ldquo;{n.content}&rdquo;</p>
                    <span className="font-mono-label text-mono-label text-onSurfaceVariant">{n.reason}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {!result && !loading && !error && (
        <p className="py-12 text-center font-body-md text-body-md text-onSurfaceVariant">
          Run an analysis to cluster this semester&apos;s whispers by viewpoint.
        </p>
      )}
      </AppShell>
    </RoleGate>
  );
}