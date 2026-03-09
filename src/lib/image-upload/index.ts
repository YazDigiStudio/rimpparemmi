// index.ts
// Public API for the image-upload service.
// Import from here — do not import processImage or firebaseStorage directly.
//
// Usage:
//   import { uploadFile } from "@/lib/image-upload";
//   const result = await uploadFile({ buffer, filename, contentType });
//   // result.url       → web WebP URL — store this in CMS content files
//   // result.originalUrl → original JPG URL — for press/archiving

import { processImage } from "./processImage";
import { uploadBuffer } from "./firebaseStorage";
import type { ImageUploadOptions, UploadResult } from "./types";

export type { ImageUploadOptions, UploadResult };

// MIME types that go through image processing (→ JPG original + WebP web)
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif", // HEIC variant used by some devices
]);

// MIME types stored as-is, no processing
const PASS_THROUGH_TYPES = new Set([
  "application/pdf",
  "image/svg+xml",
]);

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export async function uploadFile(
  options: ImageUploadOptions
): Promise<UploadResult> {
  const { buffer, filename, contentType, productionId } = options;

  if (buffer.byteLength > MAX_SIZE_BYTES) {
    throw new Error("File too large (max 50 MB)");
  }

  if (!IMAGE_TYPES.has(contentType) && !PASS_THROUGH_TYPES.has(contentType)) {
    throw new Error(`Unsupported file type: ${contentType}`);
  }

  // Sanitise filename — keep only safe characters
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const base = productionId ? `productions/${productionId}` : "cms";

  // PDF and SVG — store as-is, return single URL for both fields
  if (PASS_THROUGH_TYPES.has(contentType)) {
    const filePath = `${base}/${timestamp}-${safeName}`;
    const url = await uploadBuffer(buffer, filePath, contentType);
    return { url, originalUrl: url };
  }

  // Images — process into original JPG + web WebP
  const { originalJpg, webWebp } = await processImage(buffer);

  // Strip original extension, always use .jpg / .webp
  const baseName = safeName.replace(/\.[^.]+$/, "");
  const originalPath = `${base}/originals/${timestamp}-${baseName}.jpg`;
  const webPath = `${base}/web/${timestamp}-${baseName}.webp`;

  // Upload both in parallel
  const [originalUrl, url] = await Promise.all([
    uploadBuffer(originalJpg, originalPath, "image/jpeg"),
    uploadBuffer(webWebp, webPath, "image/webp"),
  ]);

  return { url, originalUrl };
}
