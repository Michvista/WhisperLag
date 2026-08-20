import type { Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { insightsService } from "./insights.service.js";

export const insightsController = {
  /** POST /api/v1/insights/analyze — admin-only AI clustering of whispers. */
  analyze: asyncHandler(async (_req: Request, res: Response) => {
    const result = await insightsService.analyze();
    res.status(HTTP_STATUS.OK).json({ success: true, data: result, error: null });
  }),
};