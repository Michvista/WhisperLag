import { Router } from "express";
import { PERMISSIONS } from "@whisperlag/shared";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/asyncHandler.js";
import { rateLimit } from "../../middleware/rateLimit.js";
import { evaluationController } from "./evaluation.controller.js";
import { createEvaluationSchema } from "./evaluation.schema.js";

export const evaluationRoutes = Router();

evaluationRoutes.post(
  "/public",
  rateLimit,
  validate(createEvaluationSchema),
  evaluationController.createPublic,
);

evaluationRoutes.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.SUBMIT_EVALUATION),
  validate(createEvaluationSchema),
  evaluationController.create,
);

evaluationRoutes.get(
  "/aggregate/:courseId",
  authenticate,
  authorize(PERMISSIONS.VIEW_EVALUATION_AGGREGATES),
  evaluationController.aggregate,
);

evaluationRoutes.get(
  "/summary",
  authenticate,
  authorize(PERMISSIONS.VIEW_EVALUATION_AGGREGATES),
  evaluationController.summary,
);
