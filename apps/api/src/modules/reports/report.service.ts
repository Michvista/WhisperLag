import { prisma } from "../../lib/prisma.js";
import type { GenerateReportInput } from "./report.schema.js";

/**
 * Reporting service. Generates structured report payloads that the API
 * returns as JSON and that the frontend renders / exports to PDF or Excel.
 * The "accreditation report in under 2 minutes" promise lives here: data
 * is pulled and shaped in one place.
 */
export class ReportService {
  async generate(input: GenerateReportInput, generatedById?: string) {
    const where = input.departmentId ? { departmentId: input.departmentId } : {};

    const [evalCount, whisperCount, departments] = await Promise.all([
      prisma.evaluation.count({ where }),
      prisma.whisper.count({ where }),
      prisma.department.findMany({ select: { id: true, name: true } }),
    ]);

    const content = {
      type: input.type,
      generatedAt: new Date().toISOString(),
      scope: input.departmentId ? { departmentId: input.departmentId } : "university-wide",
      metrics: { evaluations: evalCount, whispers: whisperCount },
      departments: departments.length,
      status: "READY",
    };

    const report = await prisma.report.create({
      data: { title: input.title, type: input.type, generatedById, content },
    });

    return report;
  }

  async list() {
    return prisma.report.findMany({ orderBy: { createdAt: "desc" } });
  }
}

export const reportService = new ReportService();
