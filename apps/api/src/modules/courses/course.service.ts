import { prisma } from "../../lib/prisma.js";

export class CourseService {
  async list() {
    return prisma.course.findMany({
      include: {
        department: { select: { id: true, name: true } },
        lecturer: { select: { id: true, name: true } },
      },
      orderBy: { code: "asc" },
    });
  }

  async create(input: { code: string; title: string; departmentId?: string; lecturerId?: string }) {
    return prisma.course.create({
      data: {
        code: input.code,
        title: input.title,
        departmentId: input.departmentId ?? null,
        lecturerId: input.lecturerId ?? null,
      },
    });
  }
}

export const courseService = new CourseService();