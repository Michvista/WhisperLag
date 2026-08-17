import { Router } from "express";
import { PERMISSIONS } from "@whisperlag/shared";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/asyncHandler.js";
import { feedbackController } from "./feedback.controller.js";
import { createWhisperSchema, updateWhisperStatusSchema } from "./feedback.schema.js";

export const feedbackRoutes = Router();

feedbackRoutes.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.SUBMIT_WHISPER),
  validate(createWhisperSchema),
  feedbackController.create,
);

feedbackRoutes.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.VIEW_WHISPER_META),
  feedbackController.listAdmin,
);

feedbackRoutes.patch(
  "/:id/status",
  authenticate,
  authorize(PERMISSIONS.VIEW_WHISPER_META),
  validate(updateWhisperStatusSchema),
  feedbackController.updateStatus,
);
