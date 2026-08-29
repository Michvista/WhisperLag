import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { rubricController } from "./rubric.controller.js";

export const rubricRoutes = Router();

rubricRoutes.get("/public", rubricController.list);
rubricRoutes.get("/", authenticate, rubricController.list);