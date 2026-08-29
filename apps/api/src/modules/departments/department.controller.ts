import type { Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { departmentService } from "./department.service.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateDepartmentInput } from "./department.schema.js";

export const departmentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as CreateDepartmentInput;
    const department = await departmentService.create(input);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: department, error: null });
  }),

  list: asyncHandler(async (_req: Request, res: Response) => {
    const departments = await departmentService.list();
    res.status(HTTP_STATUS.OK).json({ success: true, data: departments, error: null });
  }),

  /** Public: department names only, for tagging a whisper. No auth needed. */
  publicList: asyncHandler(async (_req: Request, res: Response) => {
    const departments = await prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    res.status(HTTP_STATUS.OK).json({ success: true, data: departments, error: null });
  }),

  snapshot: asyncHandler(async (req: Request, res: Response) => {
    const snapshot = await departmentService.snapshot(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: snapshot, error: null });
  }),
};
