import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";

interface Bucket {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 6;

/**
 * Lightweight in-memory rate limiter (per IP) for the public whisper
 * endpoint. Enough to stop spam without any external dependency; swap for a
 * Redis-backed limiter when deployed at scale.
 */
const buckets = new Map<string, Bucket>();

export function rateLimit(_req: Request, res: Response, next: NextFunction): void {
  const ip = _req.ip ?? _req.socket.remoteAddress ?? "unknown";
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  if (bucket.count >= MAX_REQUESTS) {
    const retryIn = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retryIn));
    next(
      ApiError.tooManyRequests(
        `Too many whispers from this connection. Try again in ${retryIn} second${retryIn === 1 ? "" : "s"}.`,
      ),
    );
    return;
  }

  bucket.count += 1;
  next();
}