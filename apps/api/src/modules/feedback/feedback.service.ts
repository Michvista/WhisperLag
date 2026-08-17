import { HTTP_STATUS, PAGINATION, type Whisper } from "@whisperlag/shared";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { CreateWhisperInput, UpdateWhisperStatusInput } from "./feedback.schema.js";

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

  /** Admin view of whisper metadata (counts, categories, statuses). */
  async listAdmin(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.whisper.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
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
}

export const feedbackService = new FeedbackService();
