import type { Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { prisma } from "../../lib/prisma.js";
import { messageService } from "./message.service.js";
import type { SendMessageInput } from "./message.schema.js";

export const messageController = {
  /** POST /api/v1/messages — send an internal note. */
  send: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as SendMessageInput;
    const message = await messageService.send(input, req.principal!.id, req.principal!.role);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: message, error: null });
  }),

  /** GET /api/v1/messages — the collaboration feed, scoped by role. */
  list: asyncHandler(async (req: Request, res: Response) => {
    const principal = req.principal!;
    const user = await prisma.user.findUnique({ where: { id: principal.id } });
    const messages = await messageService.list({
      id: principal.id,
      role: principal.role,
      departmentId: user?.departmentId ?? null,
    });
    res.status(HTTP_STATUS.OK).json({ success: true, data: messages, error: null });
  }),
};