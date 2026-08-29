import { Router } from "express";
import { PERMISSIONS } from "@whisperlag/shared";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/asyncHandler.js";
import { departmentController } from "./department.controller.js";
import { createDepartmentSchema } from "./department.schema.js";

export const departmentRoutes = Router();

departmentRoutes.get("/public", departmentController.publicList);
departmentRoutes.get("/", authenticate, authorize(PERMISSIONS.VIEW_DEPARTMENT), departmentController.list);
departmentRoutes.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.MANAGE_DEPARTMENT),
  validate(createDepartmentSchema),
  departmentController.create,
);
departmentRoutes.get(
  "/:id/snapshot",
  authenticate,
  authorize(PERMISSIONS.VIEW_DEPARTMENT),
  departmentController.snapshot,
);
