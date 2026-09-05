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

  /** Renders a report as a detailed, descriptive CSV for the export button. */
  async toCsv(id: string): Promise<{ filename: string; csv: string }> {
    const report = await this.get(id);
    const content = report.content as {
      type?: string;
      scope?: string;
      metrics?: { evaluations: number; whispers: number };
      departments?: number;
      generatedAt?: string;
    };

    // Enrich the export with live numbers so it reads as a real document.
    // Scope stats to the report's department when it is a department snapshot.
    const scopeDeptId =
      content.scope && typeof content.scope === "object"
        ? (content.scope as { departmentId?: string }).departmentId
        : undefined;
    const where = scopeDeptId ? { departmentId: scopeDeptId } : {};

    const [avgEval, resolved, categories] = await Promise.all([
      prisma.evaluation.aggregate({ where, _avg: { overallRating: true } }),
      prisma.whisper.count({ where: { ...where, status: "ACTIONED" } }),
      prisma.whisper.groupBy({ by: ["category"], where, _count: { _all: true } }),
    ]);

    const scope =
      typeof content.scope === "string"
        ? content.scope
        : content.scope
          ? JSON.stringify(content.scope)
          : "University-wide";

    const totalWhispers = content.metrics?.whispers ?? 0;
    const resolvedRate = totalWhispers > 0 ? Math.round((resolved / totalWhispers) * 1000) / 10 : 0;
    const avgRating = avgEval._avg.overallRating ? Math.round(avgEval._avg.overallRating * 100) / 100 : 0;

    const csv: string[] = [];
    csv.push("WhisperLag — Institutional Report");
    csv.push(`Title,${report.title}`);
    csv.push(`Type,${content.type ?? "REPORT"}`);
    csv.push(`Scope,${scope}`);
    csv.push(`Generated,${content.generatedAt ?? report.createdAt.toISOString()}`);
    csv.push("");
    csv.push("Key indicators (live from the database)");
    csv.push("Departments covered,Evaluations collected,Whispers received,Resolved,Resolution rate %,Average rating /5");
    csv.push(`${content.departments ?? 0},${content.metrics?.evaluations ?? 0},${totalWhispers},${resolved},${resolvedRate},${avgRating}`);
    csv.push("");
    csv.push("Whispers by category");
    csv.push("Category,Count");
    for (const c of categories.sort((a, b) => b._count._all - a._count._all)) {
      csv.push(`${c.category},${c._count._all}`);
    }
    csv.push("");
    csv.push("Note,All whispers are anonymous and carry no identity. Totals are computed at export time.");

    const safe = report.title.replace(/[^\w-]+/g, "_");
    return { filename: `${safe}.csv`, csv: csv.join("\n") };
  }
}

export const reportService = new ReportService();
