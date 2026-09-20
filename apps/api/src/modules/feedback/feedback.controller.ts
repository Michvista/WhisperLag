import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import Busboy from "busboy";
import type { Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { feedbackService } from "./feedback.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { isUnilagEmail } from "../../utils/unilagEmail.js";
import type { CreateWhisperInput, PublicWhisperInput, UpdateWhisperStatusInput } from "./feedback.schema.js";

// Ensure uploads directory exists next to the running process
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/**
 * Parse a multipart/form-data request using busboy.
 * Resolves with { fields, filePath } where filePath is the saved UUID-named file
 * (or null if no attachment was included).
 */
function parseMultipart(
  req: Request,
): Promise<{ fields: Record<string, string>; filePath: string | null; mimeType: string | null }> {
  return new Promise((resolve, reject) => {
    const bb = Busboy({
      headers: req.headers as Record<string, string>,
      limits: { fileSize: MAX_FILE_BYTES, files: 1 },
    });

    const fields: Record<string, string> = {};
    let filePath: string | null = null;
    let mimeType: string | null = null;
    let fileError: Error | null = null;

    bb.on("field", (name: string, val: string) => {
      fields[name] = val;
    });

    bb.on("file", (_fieldname: string, stream: any, info: { filename: string; mimeType: string }) => {
      const { mimeType: mime } = info;
      if (!ALLOWED_MIME.has(mime)) {
        stream.resume(); // drain
        fileError = new Error("File type not allowed. Upload images or PDF/DOC documents.");
        return;
      }
      const ext = mime.split("/")[1].replace("vnd.openxmlformats-officedocument.wordprocessingml.document", "docx");
      const uuid = randomUUID();
      const dest = path.join(UPLOADS_DIR, `${uuid}.${ext}`);
      const out = fs.createWriteStream(dest);
      mimeType = mime;

      stream.on("limit", () => {
        out.destroy();
        fs.unlink(dest, () => {});
        fileError = new Error("Attachment exceeds the 10 MB limit.");
      });

      stream.pipe(out);
      out.on("finish", () => {
        filePath = dest;
      });
    });

    bb.on("finish", () => {
      if (fileError) return reject(fileError);
      resolve({ fields, filePath, mimeType });
    });

    bb.on("error", reject);
    req.pipe(bb);
  });
}

export const feedbackController = {
  /** POST /api/v1/feedback : submit a whisper (any authenticated user). */
  create: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as CreateWhisperInput;
    const whisper = await feedbackService.create(input);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: whisper, error: null });
  }),

  /**
   * POST /api/v1/feedback/public : no login needed.
   * Accepts either JSON (no attachment) or multipart/form-data (with attachment).
   */
  createPublic: asyncHandler(async (req: Request, res: Response) => {
    const contentType = req.headers["content-type"] ?? "";
    let input: PublicWhisperInput;
    let attachmentUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      // Parse multipart — file goes to disk, fields come back as strings
      const { fields, filePath } = await parseMultipart(req);

      if (filePath) {
        const filename = path.basename(filePath);
        attachmentUrl = `/uploads/${filename}`;
      }

      // Validate email if provided
      if (fields.unilagEmail && !isUnilagEmail(fields.unilagEmail)) {
        throw ApiError.badRequest(
          "That email doesn't look like a UNILAG address. Leave it blank to continue anonymously.",
        );
      }

      input = {
        category: fields.category ?? "",
        content: fields.content ?? "",
        unilagEmail: fields.unilagEmail || undefined,
        departmentId: fields.departmentId || undefined,
        refNumber: fields.refNumber || undefined,
        attachmentUrl: attachmentUrl ?? undefined,
      };
    } else {
      // Standard JSON path (no file)
      input = res.locals.validated as PublicWhisperInput;
      if (input.unilagEmail && !isUnilagEmail(input.unilagEmail)) {
        throw ApiError.badRequest(
          "That email doesn't look like a UNILAG address. Leave it blank to continue anonymously.",
        );
      }
    }

    if (!input.category || !input.content) {
      throw ApiError.badRequest("category and content are required.");
    }

    const whisper = await feedbackService.createPublic(input);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: whisper, error: null });
  }),

  /** GET /api/v1/feedback : admin-only metadata list. */
  listAdmin: asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const result = await feedbackService.listAdmin(page, limit);
    res.status(HTTP_STATUS.OK).json({ success: true, data: result, error: null });
  }),

  /** PATCH /api/v1/feedback/:id/status : admin-only. */
  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as UpdateWhisperStatusInput;
    const whisper = await feedbackService.updateStatus(req.params.id, input);
    res.status(HTTP_STATUS.OK).json({ success: true, data: whisper, error: null });
  }),

  /** GET /api/v1/feedback/recent : any authenticated user ("Have I been heard?"). */
  recent: asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const items = await feedbackService.recent(limit);
    res.status(HTTP_STATUS.OK).json({ success: true, data: items, error: null });
  }),

  /** GET /api/v1/feedback/public-recent : public "Have I been heard?" feed. */
  publicRecent: asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const items = await feedbackService.recent(limit);
    res.status(HTTP_STATUS.OK).json({ success: true, data: items, error: null });
  }),

  /** GET /api/v1/feedback/lookup/:ref : public reference-number tracker. */
  lookupByRef: asyncHandler(async (req: Request, res: Response) => {
    const ref = req.params.ref;
    if (!ref || !ref.startsWith("WL-")) {
      throw ApiError.badRequest("Invalid reference number format. It should look like WL-2026-118374.");
    }
    const whisper = await feedbackService.lookupByRef(ref);
    if (!whisper) {
      throw ApiError.notFound("Whisper with that reference number");
    }
    res.status(HTTP_STATUS.OK).json({ success: true, data: whisper, error: null });
  }),

  /** POST /api/v1/feedback/analyze : AI-routes untagged whispers to courses. */
  analyze: asyncHandler(async (_req: Request, res: Response) => {
    const result = await feedbackService.analyzeAll();
    res.status(HTTP_STATUS.OK).json({ success: true, data: result, error: null });
  }),
};
