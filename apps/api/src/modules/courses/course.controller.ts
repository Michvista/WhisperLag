import type { Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { courseService } from "./course.service.js";
import type { CreateCourseInput } from "./course.schema.js";

export const courseController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const faculty = req.query.faculty as string | undefined;
    const departmentId = req.query.departmentId as string | undefined;
    const lecturerId = req.query.lecturerId as string | undefined;
    const courses = await courseService.list({ faculty, departmentId, lecturerId });
    res.status(HTTP_STATUS.OK).json({ success: true, data: courses, error: null });
  }),

  /** Public course list (for anonymous evaluation) : no auth needed. */
  publicList: asyncHandler(async (req: Request, res: Response) => {
    const faculty = req.query.faculty as string | undefined;
    const departmentId = req.query.departmentId as string | undefined;
    const lecturerId = req.query.lecturerId as string | undefined;
    const courses = await courseService.list({ faculty, departmentId, lecturerId });
    res.status(HTTP_STATUS.OK).json({ success: true, data: courses, error: null });
  }),

  lecturers: asyncHandler(async (_req: Request, res: Response) => {
    const list = await courseService.listLecturers();
    res.status(HTTP_STATUS.OK).json({ success: true, data: list, error: null });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as CreateCourseInput;
    const course = await courseService.create(input);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: course, error: null });
  }),
};