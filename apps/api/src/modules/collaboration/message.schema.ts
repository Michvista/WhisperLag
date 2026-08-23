import { z } from "zod";

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(2000),
  departmentId: z.string().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;