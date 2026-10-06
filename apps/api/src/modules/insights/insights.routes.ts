import { Router } from "express";
import { PERMISSIONS } from "@whisperlag/shared";
import { authenticate, authorize } from "../../middleware/auth.js";
import { insightsController } from "./insights.controller.js";

export const insightsRoutes = Router();

insightsRoutes.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.VIEW_INSIGHTS),
  insightsController.analyze,
);

insightsRoutes.get(
  "/analyze",
  authenticate,
  authorize(PERMISSIONS.VIEW_INSIGHTS),
  insightsController.analyze,
);

insightsRoutes.post(
  "/analyze",
  authenticate,
  authorize(PERMISSIONS.VIEW_INSIGHTS),
  insightsController.analyze,
);