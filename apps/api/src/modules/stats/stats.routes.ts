import { Router } from "express";
import { PERMISSIONS } from "@whisperlag/shared";
import { authenticate, authorize } from "../../middleware/auth.js";
import { statsController } from "./stats.controller.js";

export const statsRoutes = Router();

// Public aggregates : no auth, used by the landing page.
statsRoutes.get("/public", statsController.public);

statsRoutes.get(
  "/overview",
  authenticate,
  authorize(PERMISSIONS.VIEW_REPORTS),
  statsController.overview,
);