// functions/src/index.ts
// Firebase HTTP Function: processImage
// Replaces the Netlify /api/process endpoint.
// Runs inside Google infrastructure — storage transfers are internal and fast.

import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import sharp from "sharp";

admin.initializeApp();

const WEB_MAX_WIDTH = 1920;
const WEB_QUALITY = 85;
const ORIGINAL_QUALITY = 100;
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const PASS_THROUGH_TYPES = new Set([
  "application/pdf",
  "image/svg+xml",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "application/zip",
]);

function buildPublicUrl(bucketName: string, filePath: string): string {
  const encoded = encodeURIComponent(filePath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encoded}?alt=media`;
}

export const processImage = onRequest(
  {
    region: "europe-north1",
    timeoutSeconds: 300,
    memory: "1GiB",
    cors: true,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Verify Firebase Auth token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      await admin.auth().verifyIdToken(authHeader.slice(7));
    } catch {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const { storagePath, filename, contentType, productionId } =
      req.body as {
        storagePath?: string;
        filename?: string;
        contentType?: string;
        productionId?: string;
      };

    if (!storagePath || !filename || !contentType) {
      res
        .status(400)
        .json({ error: "Missing storagePath, filename, or contentType" });
      return;
    }

    if (!IMAGE_TYPES.has(contentType) && !PASS_THROUGH_TYPES.has(contentType)) {
      res.status(400).json({ error: `Unsupported file type: ${contentType}` });
      return;
    }

    try {
      const bucket = admin.storage().bucket();
      const stagingFile = bucket.file(storagePath);
      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const timestamp = Date.now();
      const base = productionId ? `productions/${productionId}` : "cms";

      let webUrl: string;

      if (PASS_THROUGH_TYPES.has(contentType)) {
        // PDF, SVG, video — copy from staging to final path, no processing
        const finalPath = `${base}/${timestamp}-${safeName}`;
        await stagingFile.copy(bucket.file(finalPath));
        webUrl = buildPublicUrl(bucket.name, finalPath);
      } else {
        // Download from staging (internal transfer — fast)
        const [buffer] = await stagingFile.download();

        if (buffer.byteLength > MAX_SIZE_BYTES) {
          res.status(400).json({ error: "File too large (max 50 MB)" });
          return;
        }

        const baseName = safeName.replace(/\.[^.]+$/, "");
        const originalPath = `${base}/originals/${timestamp}-${baseName}.jpg`;
        const webPath = `${base}/web/${timestamp}-${baseName}.webp`;

        const image = sharp(buffer);

        const [originalJpg, webWebp] = await Promise.all([
          // Full quality JPG for press/media downloads
          image
            .clone()
            .jpeg({ quality: ORIGINAL_QUALITY, progressive: true })
            .toBuffer(),
          // Optimized WebP for website display
          image
            .clone()
            .resize(WEB_MAX_WIDTH, undefined, {
              withoutEnlargement: true,
              fit: "inside",
            })
            .webp({ quality: WEB_QUALITY })
            .toBuffer(),
        ]);

        // Upload both in parallel (internal transfers — fast)
        await Promise.all([
          bucket
            .file(originalPath)
            .save(originalJpg, { contentType: "image/jpeg" }),
          bucket
            .file(webPath)
            .save(webWebp, { contentType: "image/webp" }),
        ]);

        webUrl = buildPublicUrl(bucket.name, webPath);
      }

      // Delete staging file — best-effort
      stagingFile.delete().catch((err) => {
        console.warn("Failed to delete staging file:", storagePath, err);
      });

      res.status(200).json({ url: webUrl });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Processing failed";
      console.error("processImage error:", err);
      res.status(500).json({ error: message });
    }
  }
);
