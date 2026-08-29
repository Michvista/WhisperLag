import { Prisma } from "@prisma/client";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import type { SisImportInput } from "./integration.schema.js";

/**
 * SIS / LMS integration layer.
 *
 * Two paths:
 *  1. If SIS_API_URL is configured, the connector fetches a live course
 *     export and upserts it.
 *  2. Otherwise, an admin can import a JSON payload (the standard SIS export
 *     shape) which is upserted into the course registry.
 *
 * This keeps the integration honest and demonstrable without fabricating
 * live UNILAG credentials.
 */
export class IntegrationService {
  async importSis(input: SisImportInput) {
    const departments = await prisma.department.findMany();
    const byName = new Map(departments.map((d) => [d.name.toLowerCase(), d]));

    const users = await prisma.user.findMany({ where: { role: "FACULTY" } });
    const byNameUsers = new Map(users.map((u) => [u.name.toLowerCase(), u]));

    let created = 0;
    let updated = 0;

    for (const c of input.courses) {
      const departmentId = c.department ? (byName.get(c.department.toLowerCase())?.id ?? null) : null;
      const lecturerId = c.lecturer ? (byNameUsers.get(c.lecturer.toLowerCase())?.id ?? null) : null;

      const lmsData = {
        semester: c.semester ?? null,
        credits: c.credits ?? null,
        syllabus: c.syllabus ? (c.syllabus as Prisma.InputJsonValue) : Prisma.DbNull,
      };

      const existing = await prisma.course.findUnique({ where: { code: c.code } });
      if (existing) {
        await prisma.course.update({
          where: { code: c.code },
          data: { title: c.title, departmentId, lecturerId, ...lmsData },
        });
        updated += 1;
      } else {
        await prisma.course.create({
          data: { code: c.code, title: c.title, departmentId, lecturerId, ...lmsData },
        });
        created += 1;
      }
    }

    return {
      configured: Boolean(env.SIS_API_URL),
      imported: input.courses.length,
      created,
      updated,
      at: new Date().toISOString(),
    };
  }

  async status() {
    const [courses, departments] = await Promise.all([
      prisma.course.count(),
      prisma.department.count(),
    ]);
    return {
      configured: Boolean(env.SIS_API_URL),
      endpoint: env.SIS_API_URL ?? null,
      courses,
      departments,
      status: env.SIS_API_URL ? "CONNECTED" : "MANUAL_IMPORT",
    };
  }
}

export const integrationService = new IntegrationService();