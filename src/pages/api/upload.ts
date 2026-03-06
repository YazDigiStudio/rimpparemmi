// src/pages/api/upload.ts
// Server-side file upload to Firebase Storage via Admin SDK.
// Called by the Decap CMS media adapter — credentials never reach the browser.

import type { NextApiRequest, NextApiResponse } from "next";
import * as admin from "firebase-admin";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

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

type UploadResponse = { url: string } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { filename, contentType, data } = req.body as {
    filename?: string;
    contentType?: string;
    data?: string;
  };

  if (!filename || !contentType || !data) {
    return res.status(400).json({ error: "Missing filename, contentType, or data" });
  }

  if (!ALLOWED_TYPES.has(contentType)) {
    return res.status(400).json({ error: "File type not allowed" });
  }

  const buffer = Buffer.from(data, "base64");
  if (buffer.byteLength > MAX_SIZE_BYTES) {
    return res.status(400).json({ error: "File too large (max 20 MB)" });
  }

  try {
    const app = getAdminApp();
    const bucket = admin.storage(app).bucket();
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `cms/${Date.now()}-${safeName}`;
    const file = bucket.file(filePath);

    await file.save(buffer, { contentType });

    // Construct permanent public URL — readable because Firebase rules allow read: true
    const encodedPath = encodeURIComponent(filePath);
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media`;

    return res.status(200).json({ url });
  } catch (err) {
    console.error("Firebase upload error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
}
