import type { Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { feedbackService } from "./feedback.service.js";
import type { CreateWhisperInput, UpdateWhisperStatusInput } from "./feedback.schema.js";

export const feedbackController = {
  /** POST /api/v1/feedback — submit a whisper (any authenticated user). */
  create: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as CreateWhisperInput;
    const whisper = await feedbackService.create(input);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: whisper, error: null });
  }),

  /** GET /api/v1/feedback — admin-only metadata list. */
  listAdmin: asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const result = await feedbackService.listAdmin(page, limit);
    res.status(HTTP_STATUS.OK).json({ success: true, data: result, error: null });
  }),

  /** PATCH /api/v1/feedback/:id/status — admin-only. */
  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as UpdateWhisperStatusInput;
    const whisper = await feedbackService.updateStatus(req.params.id, input);
    res.status(HTTP_STATUS.OK).json({ success: true, data: whisper, error: null });
  }),

  /** GET /api/v1/feedback/recent — any authenticated user ("Have I been heard?"). */
  recent: asyncHandler(async (_req: Request, res: Response) => {
    const items = await feedbackService.recent();
    res.status(HTTP_STATUS.OK).json({ success: true, data: items, error: null });
  }),
};
