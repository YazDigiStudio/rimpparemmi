// firebaseStorage.ts
// Uploads a buffer to Firebase Storage using the Admin SDK.
// Firebase credentials stay server-side — never exposed to the browser.
// Returns a permanent public URL for the uploaded file.

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
