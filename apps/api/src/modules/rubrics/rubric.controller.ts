import type { Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { prisma } from "../../lib/prisma.js";

export const rubricController = {
  /** GET /api/v1/rubrics — list scoring rubrics with their criteria. */
  list: asyncHandler(async (_req: Request, res: Response) => {
    const rubrics = await prisma.rubric.findMany({ orderBy: { name: "asc" } });
    res.status(HTTP_STATUS.OK).json({ success: true, data: rubrics, error: null });
  }),
};