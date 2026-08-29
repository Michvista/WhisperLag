import { Router } from "express";
import { PERMISSIONS } from "@whisperlag/shared";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/asyncHandler.js";
import { courseController } from "./course.controller.js";
import { createCourseSchema } from "./course.schema.js";

export const courseRoutes = Router();

courseRoutes.get("/public", courseController.publicList);
courseRoutes.get("/", authenticate, courseController.list);
courseRoutes.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.MANAGE_DEPARTMENT),
  validate(createCourseSchema),
  courseController.create,
);