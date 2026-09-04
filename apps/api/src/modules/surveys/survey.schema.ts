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
  questionId: z.string().min(1),
  answer: z.unknown(),
});

export type RespondSurveyInput = z.infer<typeof respondSurveySchema>;
