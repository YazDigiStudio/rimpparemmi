// firebaseStorage.ts
// Firebase Storage helpers using the Admin SDK.
// Uploads buffers, downloads buffers, generates signed PUT URLs, deletes files.
// Firebase credentials stay server-side — never exposed to the browser.

import * as admin from "firebase-admin";

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const serviceAccount = JSON.parse(
    Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT!,
      "base64"
    ).toString("utf8")
  );

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

function buildPublicUrl(bucketName: string, filePath: string): string {
  const encoded = encodeURIComponent(filePath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encoded}?alt=media`;
}

export async function uploadBuffer(
  buffer: Buffer,
  filePath: string,
  contentType: string
): Promise<string> {
  const app = getAdminApp();
  const bucket = admin.storage(app).bucket();
  const file = bucket.file(filePath);

  await file.save(buffer, { contentType });

  return buildPublicUrl(bucket.name, filePath);
}

// Returns a signed PUT URL valid for 10 minutes pointing to staging/{uuid}-{filename}.
// The browser uses this URL to upload directly — no server, no size limit.
export async function getSignedUploadUrl(
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; storagePath: string }> {
  const app = getAdminApp();
  const bucket = admin.storage(app).bucket();
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uid = crypto.randomUUID();
  const storagePath = `staging/${Date.now()}-${uid}-${safeName}`;
  const file = bucket.file(storagePath);

  const [uploadUrl] = await file.getSignedUrl({
    action: "write",
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    contentType,
  });

  return { uploadUrl, storagePath };
}

// Downloads a file from Firebase Storage into a Buffer.
export async function downloadBuffer(storagePath: string): Promise<Buffer> {
  const app = getAdminApp();
  const bucket = admin.storage(app).bucket();
  const [buffer] = await bucket.file(storagePath).download();
  return buffer;
}

// Deletes a file from Firebase Storage. Used to clean up staging files.
export async function deleteFile(storagePath: string): Promise<void> {
  const app = getAdminApp();
  const bucket = admin.storage(app).bucket();
  await bucket.file(storagePath).delete();
}
