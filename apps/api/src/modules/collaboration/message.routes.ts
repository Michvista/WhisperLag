import { Router } from "express";
import { PERMISSIONS } from "@whisperlag/shared";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/asyncHandler.js";
import { messageController } from "./message.controller.js";
import { sendMessageSchema } from "./message.schema.js";

export const messageRoutes = Router();

messageRoutes.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.VIEW_MESSAGES),
  messageController.list,
);
messageRoutes.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.SEND_MESSAGE),
  validate(sendMessageSchema),
  messageController.send,
);