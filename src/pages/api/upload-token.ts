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
  res: NextApiResponse<UploadTokenResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authorized = await verifyToken(req.headers.authorization);
  if (!authorized) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { filename, contentType } = req.body as {
    filename?: string;
    contentType?: string;
  };

  if (!filename || !contentType) {
    return res.status(400).json({ error: "Missing filename or contentType" });
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
