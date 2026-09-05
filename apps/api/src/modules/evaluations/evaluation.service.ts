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
   * Aggregated results for a course. This is what faculty see : averages
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

  /**
   * University-wide aggregate summary for the faculty hub: overall average,
   * response volume, pending interventions, per-criterion averages, and the
   * recurring themes derived from whisper categories. Aggregate only : no
   * individual identities are ever returned.
   */
  async summary() {
    const [evals, whispers] = await Promise.all([
      prisma.evaluation.findMany({ select: { overallRating: true, scores: true } }),
      prisma.whisper.findMany({ select: { category: true, status: true } }),
    ]);

    const responseCount = evals.length;
    const averageRating =
      responseCount > 0
        ? Math.round((evals.reduce((a, e) => a + e.overallRating, 0) / responseCount) * 100) / 100
        : 0;

    const criterionAccum: Record<string, { sum: number; count: number }> = {};
    for (const e of evals) {
      for (const [key, value] of Object.entries(e.scores as Record<string, number>)) {
        const acc = (criterionAccum[key] ??= { sum: 0, count: 0 });
        acc.sum += value;
        acc.count += 1;
      }
    }
    const breakdown = Object.entries(criterionAccum).map(([key, { sum, count }]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      average: Math.round((sum / count) * 100) / 100,
    }));

    const pendingInterventions = whispers.filter((w) => w.status === "NEW").length;

    const themeCounts: Record<string, number> = {};
    for (const w of whispers) {
      themeCounts[w.category] = (themeCounts[w.category] ?? 0) + 1;
    }
    const themes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));

    return { averageRating, responseCount, pendingInterventions, breakdown, themes };
  }
}

export const evaluationService = new EvaluationService();
