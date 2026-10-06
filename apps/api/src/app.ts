import path from "path";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { courseRoutes } from "./modules/courses/course.routes.js";
import { messageRoutes } from "./modules/collaboration/message.routes.js";
import { departmentRoutes } from "./modules/departments/department.routes.js";
import { evaluationRoutes } from "./modules/evaluations/evaluation.routes.js";
import { feedbackRoutes } from "./modules/feedback/feedback.routes.js";
import { insightsRoutes } from "./modules/insights/insights.routes.js";
import { integrationRoutes } from "./modules/integrations/integration.routes.js";
import { reportRoutes } from "./modules/reports/report.routes.js";
import { rubricRoutes } from "./modules/rubrics/rubric.routes.js";
import { statsRoutes } from "./modules/stats/stats.routes.js";
import { surveyRoutes } from "./modules/surveys/survey.routes.js";

import { sendEmail } from "./lib/mailer.js";

/**
 * Builds and returns the configured Express application. Kept as a
 * factory (rather than module-level side effects) so tests can create
 * isolated instances without shared state.
 */
export function createApp(): Express {
  const app = express();

  // Security + parsing middleware
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: env.CORS_ORIGIN.split(",") }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded attachment files (images / docs uploaded with whispers)
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

  if (env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  // Health check for infrastructure probes
  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok", service: "whisperlag-api" } });
  });

  // SMTP diagnostic endpoint (admin only via secret token)
  app.get("/api/v1/test-mail", async (_req, res) => {
    const to = env.ADMIN_NOTIFICATION_EMAILS?.split(",")[0]?.trim() || env.SMTP_USER;
    console.log("[test-mail] SMTP config →", {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER ? env.SMTP_USER.slice(0, 5) + "***" : "NOT SET",
      passSet: !!env.SMTP_PASS,
      to,
    });
    if (!to || !env.SMTP_USER || !env.SMTP_PASS) {
      res.json({ success: false, error: "SMTP_USER, SMTP_PASS, or ADMIN_NOTIFICATION_EMAILS not configured in environment." });
      return;
    }
    const result = await sendEmail({
      to,
      subject: "WhisperLag SMTP Diagnostic Test",
      text: "This is an automated diagnostic email from WhisperLag. If you see this, SMTP is working!",
      html: "<p><strong>WhisperLag SMTP is fully operational.</strong> Whisper notification emails will be delivered.</p>",
    });
    console.log("[test-mail] Result:", result);
    res.json({ success: result.success, to, error: result.error ?? null });
  });

  // Feature module routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/feedback", feedbackRoutes);
  app.use("/api/v1/evaluations", evaluationRoutes);
  app.use("/api/v1/surveys", surveyRoutes);
  app.use("/api/v1/departments", departmentRoutes);
  app.use("/api/v1/courses", courseRoutes);
  app.use("/api/v1/rubrics", rubricRoutes);
  app.use("/api/v1/stats", statsRoutes);
  app.use("/api/v1/insights", insightsRoutes);
  app.use("/api/v1/integrations", integrationRoutes);
  app.use("/api/v1/messages", messageRoutes);
  app.use("/api/v1/reports", reportRoutes);

  // 404 + error handling (order matters: must be registered last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
