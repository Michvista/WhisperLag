import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
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

  async get(id: string) {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw ApiError.notFound("Report");
    }
    return report;
  }

  /** Renders a report as CSV for the Excel / spreadsheet export affordance. */
  async toCsv(id: string): Promise<{ filename: string; csv: string }> {
    const report = await this.get(id);
    const content = report.content as {
      type?: string;
      scope?: string;
      metrics?: { evaluations: number; whispers: number };
      departments?: number;
      generatedAt?: string;
    };

    const header = "title,type,scope,generated_at,departments,evaluations,whispers";
    const row = [
      `"${report.title.replace(/"/g, '""')}"`,
      content.type ?? "",
      `"${String(content.scope ?? "")}"`,
      content.generatedAt ?? report.createdAt.toISOString(),
      content.departments ?? 0,
      content.metrics?.evaluations ?? 0,
      content.metrics?.whispers ?? 0,
    ].join(",");

    const safe = report.title.replace(/[^\w-]+/g, "_");
    return { filename: `${safe}.csv`, csv: `${header}\n${row}\n` };
  }
}

export const reportService = new ReportService();
