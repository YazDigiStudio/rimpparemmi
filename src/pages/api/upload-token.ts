// src/pages/api/upload-token.ts
// Step 1 of the direct upload flow.
// Verifies the CMS token, then returns a short-lived signed PUT URL
// pointing to staging/ in Firebase Storage. The browser uses this URL
// to upload the file directly — no server, no size limit.

import type { NextApiRequest, NextApiResponse } from "next";
import * as admin from "firebase-admin";
import { getSignedUploadUrl } from "@/lib/image-upload/firebaseStorage";

type UploadTokenResponse =
  | { uploadUrl: string; storagePath: string }
  | { error: string };

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

type AdminCheck = "unauthorized" | "forbidden" | "ok";

// Verifies the token is valid AND belongs to the admin/staff CMS account —
// not just any signed-in Firebase user.
async function verifyAdminToken(authHeader: string | undefined): Promise<AdminCheck> {
  if (!authHeader?.startsWith("Bearer ")) return "unauthorized";
  const token = authHeader.slice(7);
  try {
    const app = getAdminApp();
    const claims = await admin.auth(app).verifyIdToken(token);
    return claims.admin || claims.staff ? "ok" : "forbidden";
  } catch {
    return "unauthorized";
  }
}

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadTokenResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authCheck = await verifyAdminToken(req.headers.authorization);
  if (authCheck === "unauthorized") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (authCheck === "forbidden") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { filename, contentType } = req.body as {
    filename?: string;
    contentType?: string;
  };

  if (!filename || !contentType) {
    return res.status(400).json({ error: "Missing filename or contentType" });
  }

  if (!IMAGE_TYPES.has(contentType) && !PASS_THROUGH_TYPES.has(contentType)) {
    return res.status(400).json({ error: `Unsupported file type: ${contentType}` });
  }

  try {
    const result = await getSignedUploadUrl(filename, contentType);
    return res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate upload URL";
    console.error("upload-token error:", err);
    return res.status(500).json({ error: message });
  }
}
