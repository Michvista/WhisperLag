import type { Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { evaluationService } from "./evaluation.service.js";
import type { CreateEvaluationInput } from "./evaluation.schema.js";

export const evaluationController = {
  /** POST /api/v1/evaluations */
  create: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as CreateEvaluationInput;
    const evaluation = await evaluationService.create(input);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: evaluation, error: null });
  }),

  /** GET /api/v1/evaluations/aggregate/:courseId — faculty/admin only. */
  aggregate: asyncHandler(async (req: Request, res: Response) => {
    const result = await evaluationService.aggregateByCourse(req.params.courseId);
    res.status(HTTP_STATUS.OK).json({ success: true, data: result, error: null });
  }),
};
