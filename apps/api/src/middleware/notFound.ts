import type { Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";

/** Fallback handler for unmatched routes. */
export function notFound(_req: Request, res: Response): void {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    data: null,
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
}
