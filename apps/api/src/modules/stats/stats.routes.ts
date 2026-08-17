import { Router } from "express";
import { PERMISSIONS } from "@whisperlag/shared";
import { authenticate, authorize } from "../../middleware/auth.js";
import { statsController } from "./stats.controller.js";

export const statsRoutes = Router();

statsRoutes.get(
  "/overview",
  authenticate,
  authorize(PERMISSIONS.VIEW_REPORTS),
  statsController.overview,
);