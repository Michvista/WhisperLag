import { z } from "zod";

export const createSurveySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  isAnonymous: z.boolean().default(true),
  courseId: z.string().optional(),
  opensAt: z.string().datetime().optional(),
  closesAt: z.string().datetime().optional(),
  questions: z
    .array(
      z.object({
        prompt: z.string().min(1),
        type: z.enum(["MULTIPLE_CHOICE", "RATING", "FREE_TEXT"]).default("MULTIPLE_CHOICE"),
        options: z.array(z.string()).optional(),
      }),
    )
    .min(1),
});

export type CreateSurveyInput = z.infer<typeof createSurveySchema>;

export const respondSurveySchema = z.object({
  // questionId comes from the URL param, not the body.
  answer: z.unknown(),
});

export type RespondSurveyInput = z.infer<typeof respondSurveySchema>;

/** One answer per question, submitted together. */
export const respondBatchSchema = z.object({
  surveyId: z.string().min(1),
  answers: z.array(z.object({ questionId: z.string().min(1), answer: z.unknown() })).min(1),
});

export type RespondBatchInput = z.infer<typeof respondBatchSchema>;

/** Edit an existing survey's metadata (keeps responses intact). */
export const updateSurveySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  courseId: z.string().optional().nullable(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
});

export type UpdateSurveyInput = z.infer<typeof updateSurveySchema>;
