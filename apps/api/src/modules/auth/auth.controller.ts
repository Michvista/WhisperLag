import type { Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authService } from "./auth.service.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

export const authController = {
  /** POST /api/v1/auth/register */
  register: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as RegisterInput;
    const result = await authService.register(input);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: result, error: null });
  }),

  /** POST /api/v1/auth/login */
  login: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as LoginInput;
    const result = await authService.login(input);
    res.status(HTTP_STATUS.OK).json({ success: true, data: result, error: null });
  }),

  /** GET /api/v1/auth/me (authenticated) */
  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.principal!);
    res.status(HTTP_STATUS.OK).json({ success: true, data: user, error: null });
  }),
};
