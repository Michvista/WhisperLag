import type { DepartmentSnapshot } from "@whisperlag/shared";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { CreateDepartmentInput } from "./department.schema.js";

export class DepartmentService {
  async create(input: CreateDepartmentInput) {
    return prisma.department.create({ data: { name: input.name, faculty: input.faculty } });
  }

  async list(filter?: { faculty?: string }) {
    const where = filter?.faculty ? { faculty: filter.faculty } : {};
    return prisma.department.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            courses: true,
            whispers: true,
            evaluations: true,
          },
        },
      },
    });
  }

  /**
   * Complete view of all university faculties, member departments,
   * courses, and assigned faculty leads/heads.
   */
  async listFaculties() {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            courses: true,
            whispers: true,
            evaluations: true,
          },
        },
      },
    });

    const facultyUsers = await prisma.user.findMany({
      where: { role: "FACULTY" },
      select: {
        id: true,
        name: true,
        email: true,
        departmentId: true,
      },
      orderBy: { name: "asc" },
    });

    const facultyMap = new Map<
      string,
      {
        name: string;
        departments: { id: string; name: string; courseCount: number; whisperCount: number }[];
        heads: { id: string; name: string; email: string; departmentName?: string }[];
        totalCourses: number;
        totalWhispers: number;
      }
    >();

    for (const d of departments) {
      const facName = d.faculty || "Unassigned";
      if (!facultyMap.has(facName)) {
        facultyMap.set(facName, {
          name: facName,
          departments: [],
          heads: [],
          totalCourses: 0,
          totalWhispers: 0,
        });
      }
      const fac = facultyMap.get(facName)!;
      fac.departments.push({
        id: d.id,
        name: d.name,
        courseCount: d._count.courses,
        whisperCount: d._count.whispers,
      });
      fac.totalCourses += d._count.courses;
      fac.totalWhispers += d._count.whispers;

      const deptsUsers = facultyUsers.filter((u) => u.departmentId === d.id);
      for (const u of deptsUsers) {
        if (!fac.heads.some((h) => h.id === u.id)) {
          fac.heads.push({
            id: u.id,
            name: u.name,
            email: u.email,
            departmentName: d.name,
          });
        }
      }
    }

    return Array.from(facultyMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Creates a faculty along with optional departments and an assigned head.
   * Default password is set to password123.
   */
  async createFaculty(input: {
    name: string;
    departmentNames?: string[];
    headName?: string;
    headEmail?: string;
    headPassword?: string;
  }) {
    const facName = input.name.trim();
    if (!facName) {
      throw ApiError.badRequest("Faculty name is required.");
    }

    const deptNames =
      input.departmentNames && input.departmentNames.length > 0
        ? input.departmentNames.map((n) => n.trim()).filter(Boolean)
        : [facName];

    const createdDepts = [];
    for (const dName of deptNames) {
      const existing = await prisma.department.findUnique({ where: { name: dName } });
      if (existing) {
        const updated = await prisma.department.update({
          where: { id: existing.id },
          data: { faculty: facName },
        });
        createdDepts.push(updated);
      } else {
        const created = await prisma.department.create({
          data: { name: dName, faculty: facName },
        });
        createdDepts.push(created);
      }
    }

    let createdHead = null;
    if (input.headName && input.headEmail) {
      const defaultPassword = input.headPassword || "password123";
      const passwordHash = await bcrypt.hash(defaultPassword, 12);
      const email = input.headEmail.trim().toLowerCase();
      const primaryDeptId = createdDepts[0]?.id || null;

      const user = await prisma.user.upsert({
        where: { email },
        update: {
          name: input.headName.trim(),
          role: "FACULTY",
          departmentId: primaryDeptId,
          passwordHash,
        },
        create: {
          name: input.headName.trim(),
          email,
          role: "FACULTY",
          departmentId: primaryDeptId,
          passwordHash,
        },
      });
      createdHead = { id: user.id, name: user.name, email: user.email };
    }

    return { faculty: facName, departments: createdDepts, head: createdHead };
  }

  /**
   * Updates faculty details: rename, add department, remove department,
   * update head details, or reset head password.
   */
  async updateFaculty(
    facultyName: string,
    input: {
      newName?: string;
      addDepartmentName?: string;
      removeDepartmentId?: string;
      headId?: string;
      headName?: string;
      headEmail?: string;
      resetHeadPassword?: boolean;
    },
  ) {
    const currentName = decodeURIComponent(facultyName).trim();
    const newName = input.newName?.trim();

    if (newName && newName !== currentName) {
      await prisma.department.updateMany({
        where: { faculty: currentName },
        data: { faculty: newName },
      });
    }

    const effectiveFaculty = newName || currentName;

    if (input.addDepartmentName?.trim()) {
      const dName = input.addDepartmentName.trim();
      const existing = await prisma.department.findUnique({ where: { name: dName } });
      if (existing) {
        await prisma.department.update({
          where: { id: existing.id },
          data: { faculty: effectiveFaculty },
        });
      } else {
        await prisma.department.create({
          data: { name: dName, faculty: effectiveFaculty },
        });
      }
    }

    if (input.removeDepartmentId) {
      await prisma.department.update({
        where: { id: input.removeDepartmentId },
        data: { faculty: null },
      });
    }

    if (input.headId) {
      const updateData: Record<string, unknown> = {};
      if (input.headName?.trim()) updateData.name = input.headName.trim();
      if (input.headEmail?.trim()) updateData.email = input.headEmail.trim().toLowerCase();
      if (input.resetHeadPassword) {
        updateData.passwordHash = await bcrypt.hash("password123", 12);
      }
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: input.headId },
          data: updateData,
        });
      }
    } else if (input.headName?.trim() && input.headEmail?.trim()) {
      const depts = await prisma.department.findMany({ where: { faculty: effectiveFaculty } });
      const deptId = depts[0]?.id || null;
      const passwordHash = await bcrypt.hash("password123", 12);
      await prisma.user.upsert({
        where: { email: input.headEmail.trim().toLowerCase() },
        update: {
          name: input.headName.trim(),
          role: "FACULTY",
          departmentId: deptId,
          passwordHash,
        },
        create: {
          name: input.headName.trim(),
          email: input.headEmail.trim().toLowerCase(),
          role: "FACULTY",
          departmentId: deptId,
          passwordHash,
        },
      });
    }

    return { success: true, faculty: effectiveFaculty };
  }

  /**
   * Safely deletes a faculty by unlinking its member departments.
   */
  async deleteFaculty(facultyName: string) {
    const facName = decodeURIComponent(facultyName).trim();
    await prisma.department.updateMany({
      where: { faculty: facName },
      data: { faculty: null },
    });
    return { success: true, deleted: facName };
  }

  /**
   * Resets a faculty head's password to password123.
   */
  async resetHeadPassword(userId: string) {
    const passwordHash = await bcrypt.hash("password123", 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { success: true, message: "Password reset to password123 successfully." };
  }

  /**
   * Performance snapshot for the admin dashboard.
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
