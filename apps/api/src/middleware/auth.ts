import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthPrincipal, Permission } from "@whisperlag/shared";
import { can } from "@whisperlag/shared";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

/** Extend Express's Request with the authenticated principal. */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      principal?: AuthPrincipal;
    }
  }
}

/**
 * Verifies the Bearer JWT and attaches `req.principal`.
 * Routes guarded by this middleware reject unauthenticated callers.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw ApiError.unauthorized();
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      email: string;
      role: AuthPrincipal["role"];
    };
    req.principal = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }
}

/**
 * RBAC guard. Checks that the authenticated principal holds every
 * requested permission (from the shared role/permission matrix).
 * Must run after `authenticate`.
 */
export function authorize(...permissions: Permission[]): RequestHandler {
  return (req, _res, next) => {
    const principal = req.principal;
    if (!principal) {
      throw ApiError.unauthorized();
    }
    const missing = permissions.filter((p) => !can(principal.role, p));
    if (missing.length > 0) {
      throw ApiError.forbidden(`Missing permission(s): ${missing.join(", ")}`);
    }
    next();
  };
}
