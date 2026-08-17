import type { Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { statsService } from "./stats.service.js";

export const statsController = {
  /** GET /api/v1/stats/overview — admin dashboard KPIs + trend. */
  overview: asyncHandler(async (_req: Request, res: Response) => {
    const overview = await statsService.getOverview();
    res.status(HTTP_STATUS.OK).json({ success: true, data: overview, error: null });
  }),
};