import { Router } from "express";
import { PERMISSIONS } from "@whisperlag/shared";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/asyncHandler.js";
import { integrationController } from "./integration.controller.js";
import { sisImportSchema } from "./integration.schema.js";

export const integrationRoutes = Router();

integrationRoutes.get(
  "/sis/status",
  authenticate,
  authorize(PERMISSIONS.IMPORT_SIS),
  integrationController.status,
);
integrationRoutes.post(
  "/sis/import",
  authenticate,
  authorize(PERMISSIONS.IMPORT_SIS),
  validate(sisImportSchema),
  integrationController.importSis,
);