import { Router } from "express";
import { PERMISSIONS } from "@whisperlag/shared";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/asyncHandler.js";
import { evaluationController } from "./evaluation.controller.js";
import { createEvaluationSchema } from "./evaluation.schema.js";

export const evaluationRoutes = Router();

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
