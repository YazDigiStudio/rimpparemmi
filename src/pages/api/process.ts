// src/pages/api/process.ts
// Step 3 of the direct upload flow.
// Verifies the CMS token, downloads the file from staging/, runs image processing
// (sharp for images, pass-through for PDF/video), uploads final versions,
// deletes the staging file, and returns the public web URL.

import type { NextApiRequest, NextApiResponse } from "next";
import * as admin from "firebase-admin";
import { processUploadedFile } from "@/lib/image-upload";

type ProcessResponse = { url: string } | { error: string };

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
  res: NextApiResponse<ProcessResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authorized = await verifyToken(req.headers.authorization);
  if (!authorized) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { storagePath, filename, contentType, productionId } = req.body as {
    storagePath?: string;
    filename?: string;
    contentType?: string;
    productionId?: string;
  };

  if (!storagePath || !filename || !contentType) {
    return res.status(400).json({ error: "Missing storagePath, filename, or contentType" });
  }

  try {
    const result = await processUploadedFile({
      storagePath,
      filename,
      contentType,
      productionId,
    });
    return res.status(200).json({ url: result.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed";
    console.error("process error:", err);
    return res.status(500).json({ error: message });
  }
}
