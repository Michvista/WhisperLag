import type { Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { feedbackService } from "./feedback.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { isUnilagEmail } from "../../utils/unilagEmail.js";
import type { CreateWhisperInput, PublicWhisperInput, UpdateWhisperStatusInput } from "./feedback.schema.js";

export const feedbackController = {
  /** POST /api/v1/feedback : submit a whisper (any authenticated user). */
  create: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as CreateWhisperInput;
    const whisper = await feedbackService.create(input);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: whisper, error: null });
  }),

  /** POST /api/v1/feedback/public : no login needed. */
  createPublic: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as PublicWhisperInput;
    if (input.unilagEmail && !isUnilagEmail(input.unilagEmail)) {
      throw ApiError.badRequest(
        "That email doesn't look like a UNILAG address. Leave it blank to continue anonymously.",
      );
    }
    const whisper = await feedbackService.createPublic(input);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: whisper, error: null });
  }),

  /** GET /api/v1/feedback : admin-only metadata list. */
  listAdmin: asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const result = await feedbackService.listAdmin(page, limit);
    res.status(HTTP_STATUS.OK).json({ success: true, data: result, error: null });
  }),

  /** PATCH /api/v1/feedback/:id/status : admin-only. */
  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as UpdateWhisperStatusInput;
    const whisper = await feedbackService.updateStatus(req.params.id, input);
    res.status(HTTP_STATUS.OK).json({ success: true, data: whisper, error: null });
  }),

  /** GET /api/v1/feedback/recent : any authenticated user ("Have I been heard?"). */
  recent: asyncHandler(async (_req: Request, res: Response) => {
    const items = await feedbackService.recent();
    res.status(HTTP_STATUS.OK).json({ success: true, data: items, error: null });
  }),

  /** GET /api/v1/feedback/public-recent : public "Have I been heard?" feed. */
  publicRecent: asyncHandler(async (_req: Request, res: Response) => {
    const items = await feedbackService.recent();
    res.status(HTTP_STATUS.OK).json({ success: true, data: items, error: null });
  }),

  /** POST /api/v1/feedback/analyze : AI-routes untagged whispers to courses. */
  analyze: asyncHandler(async (_req: Request, res: Response) => {
    const result = await feedbackService.analyzeAll();
    res.status(HTTP_STATUS.OK).json({ success: true, data: result, error: null });
  }),
};
