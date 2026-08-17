import { Router } from "express";
import { PERMISSIONS } from "@whisperlag/shared";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/asyncHandler.js";
import { surveyController } from "./survey.controller.js";
import { createSurveySchema, respondSurveySchema } from "./survey.schema.js";

export const surveyRoutes = Router();

surveyRoutes.get("/", authenticate, surveyController.list);
surveyRoutes.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.CREATE_SURVEY),
  validate(createSurveySchema),
  surveyController.create,
);
surveyRoutes.post(
  "/questions/:questionId/respond",
  authenticate,
  authorize(PERMISSIONS.RESPOND_SURVEY),
  validate(respondSurveySchema),
  surveyController.respond,
);
