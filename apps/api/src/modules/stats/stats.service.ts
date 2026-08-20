import { prisma } from "../../lib/prisma.js";

const DAYS = 14;

function toDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Admin analytics: real-time KPI counts plus a 14-day whisper/evaluation
 * trend series, all computed from the database so dashboards show live data.
 */
export class StatsService {
  async getOverview() {
    const since = new Date();
    since.setDate(since.getDate() - (DAYS - 1));
    since.setHours(0, 0, 0, 0);

    const [totalWhispers, totalEvaluations, totalDepartments, pending, resolved, whisperRows, evalRows] =
      await Promise.all([
        prisma.whisper.count(),
        prisma.evaluation.count(),
        prisma.department.count(),
        prisma.whisper.count({ where: { status: "NEW" } }),
        prisma.whisper.count({ where: { status: "ACTIONED" } }),
        prisma.whisper.findMany({ select: { createdAt: true }, where: { createdAt: { gte: since } } }),
        prisma.evaluation.findMany({ select: { createdAt: true, overallRating: true } }),
      ]);

    const resolutionRate =
      totalWhispers > 0 ? Math.round((resolved / totalWhispers) * 1000) / 10 : 0;

    const avgRating =
      totalEvaluations > 0
        ? Math.round((evalRows.reduce((a, e) => a + e.overallRating, 0) / evalRows.length) * 100) / 100
        : 0;

    const trend = new Map<string, { date: string; whispers: number; evaluations: number }>();
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      trend.set(toDayKey(d), { date: toDayKey(d), whispers: 0, evaluations: 0 });
    }
    for (const w of whisperRows) {
      const bucket = trend.get(toDayKey(w.createdAt));
      if (bucket) bucket.whispers += 1;
    }
    for (const e of evalRows) {
      const bucket = trend.get(toDayKey(e.createdAt));
      if (bucket) bucket.evaluations += 1;
    }

    return {
      totalWhispers,
      totalEvaluations,
      totalDepartments,
      pendingInterventions: pending,
      resolutionRate,
      averageRating: avgRating,
      trend: [...trend.values()],
    };
  }
}

export const statsService = new StatsService();