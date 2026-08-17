import { z } from "zod";

/** Registration input. */
export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(["STUDENT", "FACULTY", "ADMIN", "GUEST"]).default("STUDENT"),
  departmentId: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/** Login input. */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
