import type { Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { reportService } from "./report.service.js";
import type { GenerateReportInput } from "./report.schema.js";

export const reportController = {
  generate: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as GenerateReportInput;
    const report = await reportService.generate(input, req.principal!.id);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: report, error: null });
  }),

  list: asyncHandler(async (_req: Request, res: Response) => {
    const reports = await reportService.list();
    res.status(HTTP_STATUS.OK).json({ success: true, data: reports, error: null });
  }),

  /** GET /api/v1/reports/:id : single report detail. */
  get: asyncHandler(async (req: Request, res: Response) => {
    const report = await reportService.get(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: report, error: null });
  }),

  /** GET /api/v1/reports/:id/export?format=csv : download as spreadsheet. */
  export: asyncHandler(async (req: Request, res: Response) => {
    const { filename, csv } = await reportService.toCsv(req.params.id);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  }),
};
