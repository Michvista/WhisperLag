import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, type ZodType } from "zod";
import { ApiError } from "../utils/ApiError.js";

/**
 * Wraps an async route handler so rejected promises reach the global
 * error middleware instead of crashing the process. Express 4 does not
 * forward async errors on its own.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

/**
 * Validates a request body against a Zod schema. Injects the parsed
 * (and type-correct) result into `res.locals.validated` for the route.
 */
export function validate(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    try {
      res.locals.validated = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(
          ApiError.badRequest(
            "Validation failed",
            err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
          ),
        );
        return;
      }
      next(err);
    }
  };
}
