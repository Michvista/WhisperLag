import { HTTP_STATUS } from "@whisperlag/shared";

/**
 * Domain-level error thrown by services and caught by the global error
 * middleware. Carries a machine-readable code and an HTTP status so the
 * handler can respond consistently.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Authentication required"): ApiError {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, "UNAUTHORIZED", message);
  }

  static forbidden(message = "You do not have permission to do this"): ApiError {
    return new ApiError(HTTP_STATUS.FORBIDDEN, "FORBIDDEN", message);
  }

  static notFound(resource = "Resource"): ApiError {
    return new ApiError(HTTP_STATUS.NOT_FOUND, "NOT_FOUND", `${resource} not found`);
  }

  static conflict(message: string): ApiError {
    return new ApiError(HTTP_STATUS.CONFLICT, "CONFLICT", message);
  }

  static tooManyRequests(message: string): ApiError {
    return new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, "TOO_MANY_REQUESTS", message);
  }
}
