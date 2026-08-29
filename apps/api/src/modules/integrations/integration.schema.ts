import { z } from "zod";

export const sisImportSchema = z.object({
  // Accepts the standard SIS/LMS export shape (courses) or a raw payload
  // keyed under "courses". LMS-style metadata (semester, credits, syllabus)
  // powers the Course Hub.
  courses: z.array(
    z.object({
      code: z.string().min(1),
      title: z.string().min(1),
      department: z.string().optional(),
      lecturer: z.string().optional(),
      semester: z.string().optional(),
      credits: z.coerce.number().int().positive().optional(),
      syllabus: z.array(z.string()).optional(),
    }),
  ),
});

export type SisImportInput = z.infer<typeof sisImportSchema>;