import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { env } from "../config/env.js";

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Resolves Cloudinary credentials from either CLOUDINARY_URL or discrete environment variables.
 */
function getCloudinaryConfig(): CloudinaryConfig | null {
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    return {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
    };
  }

  if (env.CLOUDINARY_URL) {
    // Format: cloudinary://api_key:api_secret@cloud_name
    try {
      const parsed = new URL(env.CLOUDINARY_URL);
      const cloudName = parsed.hostname;
      const apiKey = decodeURIComponent(parsed.username);
      const apiSecret = decodeURIComponent(parsed.password);

      if (cloudName && apiKey && apiSecret) {
        return { cloudName, apiKey, apiSecret };
      }
    } catch {
      // Fallback regex if URL parsing encounters quirks
      const match = env.CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
      if (match) {
        return {
          apiKey: match[1],
          apiSecret: match[2],
          cloudName: match[3],
        };
      }
    }
  }

  return null;
}

/**
 * Checks if Cloudinary is properly configured.
 */
export function isCloudinaryConfigured(): boolean {
  return getCloudinaryConfig() !== null;
}

/**
 * Uploads a local file to Cloudinary and returns its secure HTTPS URL.
 * If Cloudinary is not configured, it gracefully retains the local file and
 * returns the relative `/uploads/${filename}` URL.
 *
 * @param localFilePath Absolute path to the saved file on disk
 * @param mimeType Optional MIME type
 * @returns Resolves to the publicly accessible URL (Cloudinary HTTPS or local /uploads path)
 */
export async function uploadToCloudinaryOrLocal(
  localFilePath: string,
  mimeType?: string | null,
): Promise<string> {
  const filename = path.basename(localFilePath);
  const config = getCloudinaryConfig();

  // If no Cloudinary credentials, fallback to local storage
  if (!config) {
    return `/uploads/${filename}`;
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "whisperlag_uploads";

    // Cloudinary signature parameters must be sorted alphabetically:
    // "folder=whisperlag_uploads&timestamp=1234567890<apiSecret>"
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${config.apiSecret}`;
    const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

    const fileBuffer = await fs.promises.readFile(localFilePath);
    const blob = new Blob([fileBuffer], { type: mimeType || "application/octet-stream" });

    const formData = new FormData();
    formData.append("file", blob, filename);
    formData.append("api_key", config.apiKey);
    formData.append("timestamp", timestamp);
    formData.append("folder", folder);
    formData.append("signature", signature);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`;

    const res = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[cloudinary] Upload error:", res.status, errText);
      // Fallback to local on upload failure so user submission doesn't fail
      return `/uploads/${filename}`;
    }

    const data = (await res.json()) as { secure_url?: string; url?: string };
    const publicUrl = data.secure_url || data.url;

    if (publicUrl) {
      // Cleanup temporary local file to keep ephemeral containers tidy
      fs.promises.unlink(localFilePath).catch(() => {});
      return publicUrl;
    }

    return `/uploads/${filename}`;
  } catch (err) {
    console.error("[cloudinary] Exception during upload:", err);
    // Fallback to local
    return `/uploads/${filename}`;
  }
}
