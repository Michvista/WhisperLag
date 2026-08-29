import type { Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { surveyService } from "./survey.service.js";
import type { CreateSurveyInput, RespondSurveyInput } from "./survey.schema.js";

export const surveyController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as CreateSurveyInput;
    const survey = await surveyService.create(input);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: survey, error: null });
  }),

  list: asyncHandler(async (_req: Request, res: Response) => {
    const surveys = await surveyService.list();
    res.status(HTTP_STATUS.OK).json({ success: true, data: surveys, error: null });
  }),

  /** Public: open surveys for non-logged-in students. */
  listPublic: asyncHandler(async (_req: Request, res: Response) => {
    const surveys = await surveyService.listPublic();
    res.status(HTTP_STATUS.OK).json({ success: true, data: surveys, error: null });
  }),

  respond: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as RespondSurveyInput;
    const response = await surveyService.respond(req.params.questionId, input);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: response, error: null });
  }),

  /** Public, rate-limited anonymous response. */
  respondPublic: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as RespondSurveyInput;
    const response = await surveyService.respond(req.params.questionId, input);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: response, error: null });
  }),

  /** Staff: aggregated results for a survey. */
  results: asyncHandler(async (req: Request, res: Response) => {
    const result = await surveyService.results(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: result, error: null });
  }),
};
