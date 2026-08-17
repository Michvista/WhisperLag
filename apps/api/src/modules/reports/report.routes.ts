import { Router } from "express";
import { PERMISSIONS } from "@whisperlag/shared";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/asyncHandler.js";
import { reportController } from "./report.controller.js";
import { generateReportSchema } from "./report.schema.js";

export const reportRoutes = Router();

reportRoutes.get("/", authenticate, authorize(PERMISSIONS.VIEW_REPORTS), reportController.list);
reportRoutes.post(
  "/generate",
  authenticate,
  authorize(PERMISSIONS.GENERATE_REPORT),
  validate(generateReportSchema),
  reportController.generate,
);
