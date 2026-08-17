import { z } from "zod";

export const generateReportSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["ACCREDITATION", "DEPARTMENT_SNAPSHOT", "TREND"]),
  departmentId: z.string().optional(),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
