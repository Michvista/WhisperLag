import type { Request, Response } from "express";
import { HTTP_STATUS } from "@whisperlag/shared";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { integrationService } from "./integration.service.js";
import type { SisImportInput } from "./integration.schema.js";

export const integrationController = {
  /** POST /api/v1/integrations/sis/import : upsert SIS course data. */
  importSis: asyncHandler(async (req: Request, res: Response) => {
    const input = res.locals.validated as SisImportInput;
    const result = await integrationService.importSis(input);
    res.status(HTTP_STATUS.OK).json({ success: true, data: result, error: null });
  }),

  /** GET /api/v1/integrations/sis/status : connector state. */
  status: asyncHandler(async (_req: Request, res: Response) => {
    const result = await integrationService.status();
    res.status(HTTP_STATUS.OK).json({ success: true, data: result, error: null });
  }),
};