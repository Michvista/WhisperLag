import type { DepartmentSnapshot } from "@whisperlag/shared";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { CreateDepartmentInput } from "./department.schema.js";

export class DepartmentService {
  async create(input: CreateDepartmentInput) {
    return prisma.department.create({ data: { name: input.name, faculty: input.faculty } });
  }

  async list() {
    return prisma.department.findMany({ orderBy: { name: "asc" } });
  }

  /**
   * Performance snapshot for the admin dashboard: KPI scores derived from
   * recent evaluation volume and ratings, plus a lightweight trend series.
   */
  async snapshot(id: string): Promise<DepartmentSnapshot> {
    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) {
      throw ApiError.notFound("Department");
    }

    const recent = await prisma.evaluation.findMany({
      where: { departmentId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const responseCount = recent.length;
    const avgRating =
      responseCount === 0
        ? 0
        : recent.reduce((a, e) => a + e.overallRating, 0) / responseCount;

    const whisperCount = await prisma.whisper.count({ where: { departmentId: id } });

    return {
      departmentId: id,
      name: department.name,
      kpiScores: {
        engagement: responseCount,
        quality: Math.round(avgRating * 100) / 100,
        feedbackReceived: whisperCount,
      },
      trend: [{ period: "current", score: Math.round(avgRating * 100) / 100 }],
    };
  }
}

export const departmentService = new DepartmentService();
