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

  /** POST /api/v1/evaluations/public : anonymous, no login, rate limited. */
  createPublic: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as CreateEvaluationInput;
    const evaluation = await evaluationService.create(input);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: evaluation, error: null });
  }),

  /** GET /api/v1/evaluations/aggregate/:courseId : faculty/admin only. */
  aggregate: asyncHandler(async (req: Request, res: Response) => {
    const result = await evaluationService.aggregateByCourse(req.params.courseId);
    res.status(HTTP_STATUS.OK).json({ success: true, data: result, error: null });
  }),

  /** GET /api/v1/evaluations/summary : faculty/department or university-wide summary. */
  summary: asyncHandler(async (req: Request, res: Response) => {
    const faculty = req.query.faculty as string | undefined;
    const departmentId = req.query.departmentId as string | undefined;
    const result = await evaluationService.summary({ faculty, departmentId });
    res.status(HTTP_STATUS.OK).json({ success: true, data: result, error: null });
  }),
};
