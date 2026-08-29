import { Router } from "express";
import { PERMISSIONS } from "@whisperlag/shared";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/asyncHandler.js";
import { rateLimit } from "../../middleware/rateLimit.js";
import { surveyController } from "./survey.controller.js";
import { createSurveySchema, respondSurveySchema } from "./survey.schema.js";

export const surveyRoutes = Router();

// Public: open surveys + anonymous responses (rate limited).
surveyRoutes.get("/public", surveyController.listPublic);
surveyRoutes.post(
  "/public/questions/:questionId/respond",
  rateLimit,
  validate(respondSurveySchema),
  surveyController.respondPublic,
);

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
surveyRoutes.get(
  "/:id/results",
  authenticate,
  authorize(PERMISSIONS.VIEW_SURVEY_RESULTS),
  surveyController.results,
);
