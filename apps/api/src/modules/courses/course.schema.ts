import { z } from "zod";

export const createCourseSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  departmentId: z.string().optional().nullable(),
  lecturerId: z.string().optional().nullable(),
  lecturerName: z.string().optional().nullable(),
  semester: z.string().optional().nullable(),
  credits: z.coerce.number().int().positive().optional().nullable(),
  syllabus: z.union([z.array(z.string()), z.string()]).optional().nullable(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;