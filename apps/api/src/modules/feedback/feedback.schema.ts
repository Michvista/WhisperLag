import { z } from "zod";

/** Submitting a whisper. Anonymous submissions store NO submitting user. */
export const createWhisperSchema = z.object({
  category: z.string().min(1),
  content: z.string().min(1).max(2000),
  isAnonymous: z.boolean().default(true),
  departmentId: z.string().optional(),
});

export type CreateWhisperInput = z.infer<typeof createWhisperSchema>;

/** Admin-only status transitions, with an optional public resolution note. */
export const updateWhisperStatusSchema = z.object({
  status: z.enum(["NEW", "ACKNOWLEDGED", "ACTIONED"]),
  resolutionNote: z.string().max(1000).optional(),
});

export type UpdateWhisperStatusInput = z.infer<typeof updateWhisperStatusSchema>;

/**
 * Public, no-login whisper. An optional UNILAG email is a soft community gate:
 * it is validated but never persisted, so the submission stays anonymous.
 * The optional department tags the complaint for routing — it is not identity.
 */
export const publicWhisperSchema = z.object({
  category: z.string().min(1),
  content: z.string().min(1).max(2000),
  unilagEmail: z.string().email().optional().or(z.literal("")),
  departmentId: z.string().optional(),
});

export type PublicWhisperInput = z.infer<typeof publicWhisperSchema>;
