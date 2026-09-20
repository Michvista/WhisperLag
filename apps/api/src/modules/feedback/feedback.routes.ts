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

// Public "Have I been heard?" feed — no auth.
feedbackRoutes.get("/public-recent", feedbackController.publicRecent);

// Public reference-number tracker — no auth.
feedbackRoutes.get("/lookup/:ref", feedbackController.lookupByRef);

// Public, no-login whisper : accepts JSON OR multipart/form-data (with attachment).
// Rate limited to keep the channel usable. Validation runs inside the controller
// for multipart; for JSON the validate middleware handles it.
feedbackRoutes.post(
  "/public",
  rateLimit,
  (req, res, next) => {
    const ct = req.headers["content-type"] ?? "";
    if (ct.includes("multipart/form-data")) {
      // Skip Zod body parsing — busboy in the controller handles it
      return next();
    }
    return validate(publicWhisperSchema)(req, res, next);
  },
  feedbackController.createPublic,
);

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
