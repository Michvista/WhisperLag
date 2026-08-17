import { PrismaClient } from "@prisma/client";

/**
 * A single Prisma client instance is shared across the whole process.
 * Creating one per request would exhaust connection pools and defeat
 * Prisma's built-in query caching.
 */
export const prisma = new PrismaClient();
