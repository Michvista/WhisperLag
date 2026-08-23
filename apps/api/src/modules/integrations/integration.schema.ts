import { z } from "zod";

export const sisImportSchema = z.object({
  // Accepts the standard SIS export shape (courses) or a raw payload keyed
  // under "courses". Kept generic so any SIS/REST export can be pasted.
  courses: z.array(
    z.object({
      code: z.string().min(1),
      title: z.string().min(1),
      department: z.string().optional(),
      lecturer: z.string().optional(),
    }),
  ),
});

export type SisImportInput = z.infer<typeof sisImportSchema>;