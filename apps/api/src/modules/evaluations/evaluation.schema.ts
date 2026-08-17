import { z } from "zod";

/** Submitting an evaluation for a course/lecturer. */
export const createEvaluationSchema = z.object({
  courseId: z.string().min(1),
  lecturerId: z.string().min(1),
  rubricId: z.string().min(1),
  scores: z.record(z.number().min(0).max(5)),
  comment: z.string().max(2000).optional(),
});

export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
