import { Router } from "express";
import { PERMISSIONS } from "@whisperlag/shared";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/asyncHandler.js";
import { rateLimit } from "../../middleware/rateLimit.js";
import { feedbackController } from "./feedback.controller.js";
import {
  createWhisperSchema,
  publicWhisperSchema,
  updateWhisperStatusSchema,
} from "./feedback.schema.js";

export const feedbackRoutes = Router();

// Public, no-login whisper — rate limited to keep the channel usable.
feedbackRoutes.post(
  "/public",
  rateLimit,
  validate(publicWhisperSchema),
  feedbackController.createPublic,
);

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

feedbackRoutes.get(
  "/recent",
  authenticate,
  authorize(PERMISSIONS.SUBMIT_WHISPER),
  feedbackController.recent,
);

feedbackRoutes.patch(
  "/:id/status",
  authenticate,
  authorize(PERMISSIONS.VIEW_WHISPER_META),
  validate(updateWhisperStatusSchema),
  feedbackController.updateStatus,
);
