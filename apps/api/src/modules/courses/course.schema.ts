import { z } from "zod";

export const createCourseSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  departmentId: z.string().optional(),
  lecturerId: z.string().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;