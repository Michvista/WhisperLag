import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Global error handler. Formats every failure into the standard
 * ApiResponse envelope so the client can rely on a consistent shape.
 * Unknown errors return 500 and, in development, the stack trace.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      success: false,
      data: null,
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  console.error("[error] Unhandled:", err);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    data: null,
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong on our side",
      ...(env.NODE_ENV === "development" ? { details: String(err) } : {}),
    },
  });
}
