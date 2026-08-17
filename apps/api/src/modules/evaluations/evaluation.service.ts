import type { EvaluationAggregate } from "@whisperlag/shared";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { CreateEvaluationInput } from "./evaluation.schema.js";

export class EvaluationService {
  async create(input: CreateEvaluationInput): Promise<unknown> {
    const rubric = await prisma.rubric.findUnique({ where: { id: input.rubricId } });
    if (!rubric) {
      throw ApiError.notFound("Rubric");
    }

    const overallRating =
      Object.values(input.scores).reduce((a, b) => a + b, 0) /
      Math.max(Object.keys(input.scores).length, 1);

    const evaluation = await prisma.evaluation.create({
      data: {
        courseId: input.courseId,
        lecturerId: input.lecturerId,
        rubricId: input.rubricId,
        scores: input.scores,
        overallRating,
        comment: input.comment,
      },
    });
    return evaluation;
  }

  /**
   * Aggregated results for a course. This is what faculty see — averages
   * and distributions only, never any identity. Personal data is excluded
   * at the query level.
   */
  async aggregateByCourse(courseId: string): Promise<EvaluationAggregate> {
    const rows = await prisma.evaluation.findMany({
      where: { courseId },
      select: { overallRating: true, scores: true },
    });

    if (rows.length === 0) {
      return {
        courseId,
        lecturerId: "",
        averageRating: 0,
        responseCount: 0,
        breakdown: {},
      };
    }

    const total = rows.reduce((a, r) => a + r.overallRating, 0);
    const breakdown: Record<string, number> = {};
    for (const r of rows) {
      for (const [key, value] of Object.entries(r.scores as Record<string, number>)) {
        breakdown[key] = (breakdown[key] ?? 0) + value;
      }
    }

    return {
      courseId,
      lecturerId: "",
      averageRating: total / rows.length,
      responseCount: rows.length,
      breakdown,
    };
  }
}

export const evaluationService = new EvaluationService();
