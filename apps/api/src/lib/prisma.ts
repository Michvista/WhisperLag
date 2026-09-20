import { PrismaClient } from "@prisma/client";

/**
 * A single Prisma client instance shared across the API process.
 *
 * Configured for Neon serverless Postgres connection pooler.
 * Sets connection_limit=25 and pool_timeout=30 to allow parallel queries
 * without connection pool exhaustion.
 */
function buildDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) return url;

  const urlObj = new URL(url);
  urlObj.searchParams.set("pgbouncer", "true");
  urlObj.searchParams.set("connection_limit", "25");
  urlObj.searchParams.set("pool_timeout", "30");
  urlObj.searchParams.set("connect_timeout", "30");
  return urlObj.toString();
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: buildDatabaseUrl(),
    },
  },
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
