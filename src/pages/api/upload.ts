// src/pages/api/upload.ts
// Thin HTTP handler for CMS image uploads.
// Verifies the Firebase ID token from the Authorization header,
// then delegates all processing to the image-upload service.
// See src/lib/image-upload/README.md for full documentation.

import type { NextApiRequest, NextApiResponse } from "next";
import * as admin from "firebase-admin";
import { uploadFile } from "@/lib/image-upload";

type UploadResponse = { url: string } | { error: string };

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT!, "base64").toString("utf8")
  );
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

async function verifyToken(authHeader: string | undefined): Promise<boolean> {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  try {
    const app = getAdminApp();
    await admin.auth(app).verifyIdToken(token);
    return true;
  } catch {
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authorized = await verifyToken(req.headers.authorization);
  if (!authorized) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { filename, contentType, data, productionId } = req.body as {
    filename?: string;
    contentType?: string;
    data?: string;
    productionId?: string;
  };

  if (!filename || !contentType || !data) {
    return res.status(400).json({ error: "Missing filename, contentType, or data" });
  }

  const buffer = Buffer.from(data, "base64");

  try {
    const result = await uploadFile({ buffer, filename, contentType, productionId });
    return res.status(200).json({ url: result.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("Upload error:", err);
    return res.status(500).json({ error: message });
  }
}
