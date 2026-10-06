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

  // Email diagnostic endpoint
  app.get("/api/v1/test-mail", async (_req, res) => {
    const to = env.ADMIN_NOTIFICATION_EMAILS?.split(",")[0]?.trim() || env.SMTP_USER || "olumidenifemi07@gmail.com";
    const provider = env.BREVO_API_KEY ? "brevo" : env.RESEND_API_KEY ? "resend" : "smtp";

    console.log("[test-mail] Email diagnostic running →", {
      provider,
      hasBrevoKey: Boolean(env.BREVO_API_KEY),
      hasResendKey: Boolean(env.RESEND_API_KEY),
      smtpHost: env.SMTP_HOST,
      smtpPort: env.SMTP_PORT,
      smtpUser: env.SMTP_USER ? env.SMTP_USER.slice(0, 5) + "***" : "NOT SET",
      to,
    });

    if (!env.BREVO_API_KEY && !env.RESEND_API_KEY && (!env.SMTP_USER || !env.SMTP_PASS)) {
      res.json({
        success: false,
        error: "No email provider configured. Set BREVO_API_KEY or RESEND_API_KEY in Render environment.",
        provider: "none",
        to,
      });
      return;
    }

    const result = await sendEmail({
      to,
      subject: "WhisperLag Notification System Test",
      text: "This is an automated test from WhisperLag. If you see this, email delivery is 100% operational!",
      html: "<div style='font-family: sans-serif; padding: 20px; color: #10253a;'><h2 style='color: #009A44;'>🌿 WhisperLag UNILAG</h2><p><strong>Email delivery is 100% operational!</strong></p><p>New whispers submitted on the platform will now trigger immediate inbox alerts.</p></div>",
    });

    res.json({
      success: result.success,
      provider,
      to,
      messageId: result.messageId ?? null,
      error: result.error ?? null,
    });
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
