import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

// Load .env relative to this package (apps/api/.env), regardless of the
// process working directory. Environment variables set by the host (e.g.
// Render) are never overwritten by dotenv.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8).default("whisperlag-dev-secret-change-me"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("*"),
  // Optional AI insights. When unset, the insights endpoint falls back to a
  // deterministic keyword/rule clustering algorithm.
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("openai/gpt-oss-120b"),
  // Optional live SIS/LMS connector. When unset, admins import SIS exports manually.
  SIS_API_URL: z.string().url().optional(),
  // Optional Cloudinary media upload (for persistent attachments on hosted environments like Render/Vercel)
  CLOUDINARY_URL: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  // Email notifications for Admin & Faculty
  // Resend (HTTP API, works on Render free tier) — preferred over raw SMTP
  RESEND_API_KEY: z.string().optional().default(""),
  RESEND_FROM: z.string().optional().default("WhisperLag UNILAG <onboarding@resend.dev>"),
  // SMTP fallback (blocked by most cloud providers on free tier)
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  ADMIN_NOTIFICATION_EMAILS: z.string().optional().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Surface configuration problems early rather than failing mid-request.
  console.error("[config] Invalid environment:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
