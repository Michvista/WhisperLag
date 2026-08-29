import { HTTP_STATUS, PAGINATION, type Whisper } from "@whisperlag/shared";
import { Prisma } from "@prisma/client";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { CreateWhisperInput, PublicWhisperInput, UpdateWhisperStatusInput } from "./feedback.schema.js";

interface RouteTag {
  id: string;
  courseCode?: string;
  courseTitle?: string;
  lecturer?: string;
  department?: string;
  confidence?: number;
}

/**
 * Feedback service — the heart of WhisperLag.
 *
 * Anonymity invariant (the "Whisper Lock"): an anonymous whisper never
 * stores a reference to the submitting user. The row simply has no owner.
 * This is enforced structurally by the Prisma model (no userId column on
 * Whisper) rather than by discipline in code, so it cannot regress.
 */
export class FeedbackService {
  async create(input: CreateWhisperInput): Promise<Whisper> {
    const whisper = await prisma.whisper.create({
      data: {
        category: input.category,
        content: input.content,
        isAnonymous: input.isAnonymous,
        departmentId: input.departmentId ?? null,
      },
    });
    return whisper as unknown as Whisper;
  }

  /**
   * Public, no-login submission (the "anon app" flow). The optional UNILAG
   * email is a soft gate — it is validated upstream and never stored here.
   * The optional department tags the complaint for staff routing.
   */
  async createPublic(input: PublicWhisperInput): Promise<Whisper> {
    const whisper = await prisma.whisper.create({
      data: {
        category: input.category,
        content: input.content,
        isAnonymous: true,
        departmentId: input.departmentId ?? null,
      },
    });
    return whisper as unknown as Whisper;
  }

  /** Admin/faculty view of anonymous whispers (no identities, ever). */
  async listAdmin(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.whisper.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { department: { select: { id: true, name: true } } },
      }),
      prisma.whisper.count(),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: string, input: UpdateWhisperStatusInput): Promise<Whisper> {
    const existing = await prisma.whisper.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound("Whisper");
    }
    const updated = await prisma.whisper.update({
      where: { id },
      data: { status: input.status },
    });
    return updated as unknown as Whisper;
  }

  /** Anonymous-by-design: a student can confirm their whisper was received. */
  async get(id: string): Promise<Whisper | null> {
    const whisper = await prisma.whisper.findUnique({ where: { id } });
    return whisper ? (whisper as unknown as Whisper) : null;
  }

  /**
   * The "Have I been heard?" feed. Because whispers are anonymous, this
   * surfaces the most recent items and their resolution status so students
   * can see the university is acting on feedback without revealing who
   * submitted what.
   */
  async recent(limit = 8) {
    return prisma.whisper.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        category: true,
        content: true,
        status: true,
        createdAt: true,
      },
    });
  }

  /**
   * AI whisper routing. Reads each untagged whisper and infers which course /
   * lecturer / department it concerns, then stores the tag. Uses Groq when
   * configured; otherwise keyword-matches against the course registry.
   */
  async analyzeAll() {
    const whispers = await prisma.whisper.findMany({
      where: { aiTag: { equals: Prisma.DbNull } },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
    const courses = await prisma.course.findMany({
      include: {
        lecturer: { select: { name: true } },
        department: { select: { name: true } },
      },
    });

    if (whispers.length === 0) return { tagged: 0, provider: "none" as const };

    let tags: RouteTag[] = [];
    let provider: "groq" | "keyword" = "keyword";

    if (env.GROQ_API_KEY) {
      try {
        tags = await this.groqRoute(whispers, courses);
        provider = "groq";
      } catch {
        tags = keywordRoute(whispers, courses);
      }
    } else {
      tags = keywordRoute(whispers, courses);
    }

    let tagged = 0;
    for (const t of tags) {
      await prisma.whisper.update({ where: { id: t.id }, data: { aiTag: t as unknown as Prisma.InputJsonValue } });
      tagged += 1;
    }

    return { tagged, provider };
  }

  private async groqRoute(
    whispers: { id: string; content: string }[],
    courses: { code: string; title: string; lecturer: { name: string } | null; department: { name: string } | null }[],
  ): Promise<RouteTag[]> {
    const courseIndex = courses
      .map((c, i) => `${i}: ${c.code} — ${c.title} (${c.lecturer?.name ?? "unassigned"}, ${c.department?.name ?? "no dept"})`)
      .join("\n");

    const prompt = `You are WhisperLag's routing engine for UNILAG.
For each anonymous whisper, infer which COURSE / LECTURER / DEPARTMENT it is about, choosing ONLY from the registry below.
Return STRICT JSON (no markdown): {"routes":[{"id":"<whisper id>","courseCode":"<or \"\">","courseTitle":"<or \"\">","lecturer":"<or \"\">","department":"<or \"\">","confidence":0.0-1.0}]}
Only include ids that exist. If a whisper isn't about a specific course, set courseCode/lecturer to "".
Courses registry:
${courseIndex}
Whispers:
${whispers.map((w) => `[${w.id}] ${w.content}`).join("\n")}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: env.GROQ_MODEL,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) throw new Error(`Groq routing failed (${res.status})`);
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const parsed = JSON.parse(body.choices?.[0]?.message?.content ?? "{}") as {
      routes?: RouteTag[];
    };
    return parsed.routes ?? [];
  }
}

/** Deterministic fallback: substring-match whisper content against the registry. */
function keywordRoute(
  whispers: { id: string; content: string }[],
  courses: { code: string; title: string; lecturer: { name: string } | null; department: { name: string } | null }[],
): RouteTag[] {
  return whispers.map((w) => {
    const text = w.content.toLowerCase();
    const match = courses.find((c) => {
      const hay = [c.code, c.title, c.lecturer?.name, c.department?.name]
        .filter(Boolean)
        .map((s) => (s as string).toLowerCase());
      return hay.some((s) => s.length > 2 && text.includes(s));
    });
    if (!match) return { id: w.id };
    return {
      id: w.id,
      courseCode: match.code,
      courseTitle: match.title,
      lecturer: match.lecturer?.name,
      department: match.department?.name,
      confidence: 0.7,
    };
  });
}

export const feedbackService = new FeedbackService();
