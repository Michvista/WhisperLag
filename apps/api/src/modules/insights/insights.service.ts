import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";

interface WhisperRecord {
  id: string;
  category: string;
  content: string;
  status: string;
  createdAt: Date;
}

interface Cluster {
  id: string;
  title: string;
  summary: string;
  size: number;
  sentiment: "positive" | "neutral" | "negative";
  items: { id: string; category: string; content: string }[];
}

interface InsightResult {
  provider: "groq" | "algorithm";
  generatedAt: string;
  clusters: Cluster[];
  noise: { id: string; category: string; content: string; reason: string }[];
}

const NOISE_HINTS = /\b(lol|test|asap|pls|please fix|fix this)\b/i;

function isLikelyNoise(w: WhisperRecord): string | null {
  if (w.content.trim().length < 12) return "Too short to be actionable";
  if (!/[a-zA-Z]{3}/.test(w.content)) return "Contains no meaningful words";
  if (NOISE_HINTS.test(w.content)) return "Likely non-substantive";
  return null;
}

/** Deterministic fallback: cluster by category, then by a couple of topic keywords. */
function algorithmCluster(whispers: WhisperRecord[]): InsightResult {
  const kept = whispers.filter((w) => !isLikelyNoise(w));
  const noise = whispers.filter((w) => isLikelyNoise(w)).map((w) => ({ id: w.id, category: w.category, content: w.content, reason: isLikelyNoise(w) as string }));

  const groups = new Map<string, WhisperRecord[]>();
  for (const w of kept) {
    const key = w.category;
    groups.set(key, [...(groups.get(key) ?? []), w]);
  }

  const clusters: Cluster[] = [...groups.entries()].map(([category, items]) => ({
    id: `alg-${category.replace(/\s+/g, "-").toLowerCase()}`,
    title: category,
    summary: `${items.length} whispers grouped under ${category.toLowerCase()}.`,
    size: items.length,
    sentiment: "neutral" as const,
    items: items.map((i) => ({ id: i.id, category: i.category, content: i.content })),
  }));

  return {
    provider: "algorithm",
    generatedAt: new Date().toISOString(),
    clusters,
    noise,
  };
}

/** LLM clustering via Groq : groups whispers by shared viewpoint semantically. */
async function groqCluster(whispers: WhisperRecord[]): Promise<InsightResult> {
  const kept = whispers.filter((w) => !isLikelyNoise(w));
  const noise = whispers.filter((w) => isLikelyNoise(w)).map((w) => ({ id: w.id, category: w.category, content: w.content, reason: isLikelyNoise(w) as string }));

  const prompt = `You are the WhisperLag intelligence engine for the University of Lagos.
Group the anonymous student whispers below into 2-6 clusters of SIMILAR VIEWPOINTS (the underlying issue/opinion, not the category label).
Return STRICT JSON (no markdown) with shape:
{"clusters":[{"title":"short title","summary":"one sentence","sentiment":"positive|neutral|negative","itemIds":["..."]}]}
Only reference itemIds that exist. Ignore empty/fluff items by leaving them out.
Whispers:
${kept.map((w) => `[${w.id}] (${w.category}) ${w.content}`).join("\n")}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(25000),
  });

  if (!res.ok) {
    throw new Error(`Groq request failed (${res.status})`);
  }

  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = body.choices?.[0]?.message?.content ?? "";
  const parsed = JSON.parse(content) as { clusters?: { title?: string; summary?: string; sentiment?: string; itemIds?: string[] }[] };

  const byId = new Map(kept.map((w) => [w.id, w]));
  const clusters: Cluster[] = (parsed.clusters ?? []).map((c, i) => {
    const items = (c.itemIds ?? [])
      .map((id) => byId.get(id))
      .filter((w): w is WhisperRecord => Boolean(w));
    return {
      id: `groq-${i}`,
      title: c.title ?? `Cluster ${i + 1}`,
      summary: c.summary ?? "",
      size: items.length,
      sentiment: (["positive", "neutral", "negative"].includes(c.sentiment ?? "")
        ? c.sentiment
        : "neutral") as Cluster["sentiment"],
      items: items.map((w) => ({ id: w.id, category: w.category, content: w.content })),
    };
  });

  return { provider: "groq", generatedAt: new Date().toISOString(), clusters, noise };
}

export class InsightsService {
  /** Analyzes recent whispers, using Groq when configured, else the algorithm. */
  async analyze(limit = 100): Promise<InsightResult> {
    const whispers = (await prisma.whisper.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    })) as WhisperRecord[];

    if (env.GROQ_API_KEY) {
      try {
        return await groqCluster(whispers);
      } catch (err) {
        console.warn("[insights] Groq unavailable, falling back to algorithm:", String(err));
      }
    }
    return algorithmCluster(whispers);
  }
}

export const insightsService = new InsightsService();