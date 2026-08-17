import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(1),
  faculty: z.string().optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
