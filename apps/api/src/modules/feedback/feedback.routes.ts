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

// Public "Have I been heard?" feed.
feedbackRoutes.get("/public-recent", feedbackController.publicRecent);

// Admin: AI-route untagged whispers to courses/lecturers.
feedbackRoutes.post(
  "/analyze",
  authenticate,
  authorize(PERMISSIONS.MANAGE_WHISPERS),
  feedbackController.analyze,
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
  authorize(PERMISSIONS.MANAGE_WHISPERS),
  validate(updateWhisperStatusSchema),
  feedbackController.updateStatus,
);
