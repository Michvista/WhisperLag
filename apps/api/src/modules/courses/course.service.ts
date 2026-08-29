import { Prisma } from "@prisma/client";
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

  async create(input: {
    code: string;
    title: string;
    departmentId?: string;
    lecturerId?: string;
    semester?: string;
    credits?: number;
    syllabus?: string[];
  }) {
    return prisma.course.create({
      data: {
        code: input.code,
        title: input.title,
        departmentId: input.departmentId ?? null,
        lecturerId: input.lecturerId ?? null,
        semester: input.semester ?? null,
        credits: input.credits ?? null,
        syllabus: input.syllabus ? (input.syllabus as Prisma.InputJsonValue) : Prisma.DbNull,
      },
    });
  }
}

export const courseService = new CourseService();