import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";

export class CourseService {
  async listLecturers() {
    return prisma.user.findMany({
      where: { role: "FACULTY" },
      select: {
        id: true,
        name: true,
        email: true,
        departmentId: true,
        department: { select: { id: true, name: true, faculty: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  async list(filter?: { faculty?: string; departmentId?: string; lecturerId?: string }) {
    const where: Prisma.CourseWhereInput = {};
    if (filter?.faculty) {
      where.department = { faculty: filter.faculty };
    }
    if (filter?.departmentId) {
      where.departmentId = filter.departmentId;
    }
    if (filter?.lecturerId) {
      where.lecturerId = filter.lecturerId;
    }

    return prisma.course.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, faculty: true } },
        lecturer: { select: { id: true, name: true } },
      },
      orderBy: { code: "asc" },
    });
  }

  async create(input: {
    code: string;
    title: string;
    departmentId?: string | null;
    lecturerId?: string | null;
    lecturerName?: string | null;
    semester?: string | null;
    credits?: number | null;
    syllabus?: string[] | string | null;
  }) {
    const cleanCode = input.code.toUpperCase().trim();
    const existing = await prisma.course.findUnique({ where: { code: cleanCode } });
    if (existing) {
      throw ApiError.conflict(`Course with code ${cleanCode} already exists.`);
    }

    let resolvedLecturerId = input.lecturerId ?? null;
    if (!resolvedLecturerId && input.lecturerName) {
      const found = await prisma.user.findFirst({
        where: {
          name: { contains: input.lecturerName.trim(), mode: "insensitive" },
          role: "FACULTY",
        },
      });
      if (found) {
        resolvedLecturerId = found.id;
      }
    }

    let parsedSyllabus: string[] | null = null;
    if (Array.isArray(input.syllabus)) {
      parsedSyllabus = input.syllabus.map((s) => s.trim()).filter(Boolean);
    } else if (typeof input.syllabus === "string") {
      parsedSyllabus = input.syllabus
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    return prisma.course.create({
      data: {
        code: cleanCode,
        title: input.title.trim(),
        departmentId: input.departmentId ?? null,
        lecturerId: resolvedLecturerId,
        semester: input.semester ?? null,
        credits: input.credits ?? null,
        syllabus: parsedSyllabus && parsedSyllabus.length > 0 ? (parsedSyllabus as Prisma.InputJsonValue) : Prisma.DbNull,
      },
      include: {
        department: { select: { id: true, name: true, faculty: true } },
        lecturer: { select: { id: true, name: true } },
      },
    });
  }
}

export const courseService = new CourseService();