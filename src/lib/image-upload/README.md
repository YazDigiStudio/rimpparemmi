# Image Upload Service

Reusable server-side image processing and Firebase Storage upload module.
Built for Next.js API routes but contains no Next.js dependencies — the core
logic works with plain buffers and can be adapted to any Node.js server.

---

## Architecture: Direct Firebase Upload (Signed URLs)

Files are uploaded directly from the browser to Firebase Storage using a
short-lived signed URL. The server never receives the file bytes — it only
issues the signed URL and later processes the already-stored file.

This removes the 6 MB Netlify Function body limit that blocked large images
and makes future video support straightforward.

### Upload flow (3 steps)

```
Browser (CMS adapter)       Server                        Firebase Storage
        |                      |                              |
        |                      |     STEP 1: get signed URL   |
        |-- POST /api/upload-token -->|                        |
        |   { filename, contentType } |                        |
        |                      |-- Admin SDK: sign URL ------>|
        |                      |<-- signed upload URL --------|
        |<-- { uploadUrl, storagePath } --|                    |
        |                      |                              |
        |                     STEP 2: upload directly          |
        |-- PUT {file bytes} directly to Firebase via URL ---->|
        |<-- 200 OK ------------------------------------------|
        |                      |                              |
        |                     STEP 3: process                  |
        |-- POST /api/process -->|                             |
        |   { storagePath, filename, contentType }             |
        |                      |-- download from Firebase ---->|
        |                      |<-- buffer ------------------|
        |                      |-- sharp: JPG + WebP          |
        |                      |-- upload processed files ---->|
        |<-- { url } ----------|                              |
```

**Step 1** — `/api/upload-token`: Verifies the CMS token, generates a signed
PUT URL valid for 10 minutes pointing to `staging/{uuid}-{filename}`.

**Step 2** — Browser PUTs the raw file directly to Firebase. No server
involved. No size limit. Works for photos, PDFs, and videos alike.

**Step 3** — `/api/process`: Downloads the file from `staging/`, runs sharp
(images only), stores originals and web versions, deletes the staging file,
returns the public web URL.

---

## File Structure

```
src/lib/image-upload/
  README.md            ← this file
  types.ts             ← shared TypeScript types
  processImage.ts      ← sharp logic: buffer in → { originalJpg, webWebp } out
  firebaseStorage.ts   ← Firebase Admin SDK: upload, download, getSignedUploadUrl
  index.ts             ← public API: uploadFile(), processUploadedFile()
```

API routes:

```
src/pages/api/cms-token.ts     ← issues short-lived Firebase ID token to CMS adapter
src/pages/api/upload-token.ts  ← verifies token, returns signed PUT URL + storagePath
src/pages/api/process.ts       ← verifies token, downloads staging file, runs sharp, returns URL
```

Browser side:

```
public/admin/cms-media-adapter.js ← Decap CMS media library: 3-step upload flow
```

---

## Firebase Storage Layout

### Staging area (temporary, auto-cleaned after processing)

```
staging/{uuid}-{filename}          ← raw upload, deleted after Step 3
```

### CMS uploads (general content)

```
cms/originals/{timestamp}-{filename}.jpg   ← full resolution, JPG
cms/web/{timestamp}-{filename}.webp        ← 1920px max, WebP quality 85
```

### Production-specific uploads (optional)

Pass a `productionId` to store files under a production folder instead:

```
productions/{productionId}/originals/{timestamp}-{filename}.jpg
productions/{productionId}/web/{timestamp}-{filename}.webp
productions/{productionId}/{filename}.pdf   ← riders, pass-through
```

---

## Supported Formats

| Format | Type         | Processing                                      |
|--------|--------------|-------------------------------------------------|
| JPG    | image        | Original: JPG quality 100. Web: WebP quality 85 |
| PNG    | image        | Original: JPG quality 100. Web: WebP quality 85 |
| WebP   | image        | Original: JPG quality 100. Web: WebP quality 85 |
| HEIC   | image        | Original: JPG quality 100. Web: WebP quality 85 |
| PDF    | pass-through | Stored as-is, no processing                     |
| SVG    | pass-through | Stored as-is, no processing                     |
| MP4    | pass-through | Stored as-is, no processing                     |
| MOV    | pass-through | Stored as-is, no processing                     |

All image formats are converted to JPG for the original (consistent format
for press downloads and printing) and WebP for the web version (smaller file
size, supported by all modern browsers).

Pass-through files skip Step 3 processing — Step 2 uploads them directly to
their final path and Step 3 just returns the URL.

---

## Image Processing Details

**Original (JPG)**
- Format: JPEG
- Quality: 100 (maximum — as close to source as possible)
- Resolution: full, no resize
- Purpose: press downloads, print, archiving

**Web version (WebP)**
- Format: WebP
- Quality: 85
- Max width: 1920px (maintains aspect ratio, never upscales)
- Purpose: website display, fast loading

---

## Authentication Flow

The upload endpoints are protected — only authenticated CMS users can upload.

```
Browser (CMS adapter)       Server                        Firebase
        |                      |                              |
        |-- POST /api/cms-token ->|                           |
        |                      |-- sign in with               |
        |                      |   CMS_UPLOAD_EMAIL           |
        |                      |   CMS_UPLOAD_PASSWORD ------>|
        |                      |<-- short-lived ID token -----|
        |<-- { token } --------|                              |
        |                      |                              |
        |-- POST /api/upload-token ->|                        |
        |   Authorization: Bearer {token}                     |
        |                      |-- verifyIdToken() --------->|
        |                      |<-- valid -------------------|
        |                      |-- Admin SDK: sign URL ------>|
        |<-- { uploadUrl, storagePath } --|                   |
        |                      |                              |
        |-- POST /api/process -->|                            |
        |   Authorization: Bearer {token}                     |
        |                      |-- verifyIdToken() --------->|
        |                      |<-- valid -------------------|
        |<-- { url } ----------|                              |
```

- The token is cached in the adapter for 50 minutes (Firebase tokens expire after 1 hour)
- Credentials (`CMS_UPLOAD_EMAIL`, `CMS_UPLOAD_PASSWORD`) are server-side only — never reach the browser
- The Firebase Auth user (`cms@domain.fi`) is a dedicated service account, not a real person

---

## Environment Variables

Add these to `.env.local` (development) and to your hosting environment (production):

```env
# Firebase service account key — base64-encoded JSON
# Generate: base64 -i serviceAccountKey.json | tr -d '\n'
FIREBASE_SERVICE_ACCOUNT=your_base64_encoded_service_account_json

# Firebase Storage bucket name (without gs:// prefix)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app

# Firebase project API key (already NEXT_PUBLIC, safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key

# Firebase project ID (already NEXT_PUBLIC, safe to expose)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# CMS service account credentials — server-side only, NO NEXT_PUBLIC_ prefix
CMS_UPLOAD_EMAIL=cms@yourdomain.fi
CMS_UPLOAD_PASSWORD=your_strong_password
```

### How to get the service account key

1. Go to Firebase Console → Project Settings → Service accounts
2. Click "Generate new private key" → downloads a JSON file
3. Base64-encode it: `base64 -i serviceAccountKey.json | tr -d '\n'`
4. Paste the result as `FIREBASE_SERVICE_ACCOUNT`
5. Never commit the JSON file or the env file to git

---

## Firebase Security Rules

Set these rules in Firebase Console → Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Staging area: signed URL uploads only (Admin SDK signs, rules not checked)
    // No public read — staging files are temporary and deleted after processing
    match /staging/{allPaths=**} {
      allow read, write: if false;
    }

    // Web-optimised images: public read (served directly by website)
    match /cms/web/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
    match /productions/{id}/web/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }

    // Originals: no public read (Admin SDK only)
    match /cms/originals/{allPaths=**} {
      allow read, write: if false;
    }
    match /productions/{id}/originals/{allPaths=**} {
      allow read, write: if false;
    }

    // All other paths: no access
    // (All writes go through the server-side API using Firebase Admin SDK,
    //  which bypasses Security Rules entirely)
  }
}
```

Note: Signed URLs (used for staging uploads) bypass Firebase Security Rules.
The `staging/` rules above are therefore informational — they document intent
but are not enforced for signed URL requests.

---

## Dependencies

```bash
npm install sharp
```

`firebase-admin` is already in `package.json`.

Sharp handles all image format conversions including HEIC. No separate
`heic-convert` package needed — sharp handles HEIC natively on Node.js.

---

## How to Use in the API Route

**Issue a signed upload URL:**

```ts
import { getSignedUploadUrl } from "@/lib/image-upload/firebaseStorage";

const { uploadUrl, storagePath } = await getSignedUploadUrl(filename, contentType);
// Return { uploadUrl, storagePath } to the browser
```

**Process a file after direct upload:**

```ts
import { processUploadedFile } from "@/lib/image-upload";

const result = await processUploadedFile({
  storagePath,    // string — path in staging/ returned by upload-token
  filename,       // string — original filename
  contentType,    // string — MIME type
  productionId,   // string | undefined — optional, for production-specific storage
});

// result.url — the web-optimised public URL (store this in content files)
```

---

## How to Copy to Another Project

1. Copy the entire `src/lib/image-upload/` folder into the new project
2. Copy `src/pages/api/cms-token.ts` into the new project
3. Copy `src/pages/api/upload-token.ts` into the new project
4. Copy `src/pages/api/process.ts` into the new project
5. Copy `public/admin/cms-media-adapter.js` into the new project
6. Install sharp: `npm install sharp`
7. Create a Firebase Auth user for the CMS (e.g. `cms@yourclient.fi`)
8. Add all environment variables (see above)
9. Set up Firebase Security Rules (see above)

No other changes needed. The service is self-contained.

---

## What Is Not Handled Here

- **Audio files** — separate service needed
- **Image galleries / ordering** — handled by the CMS content files
- **ZIP / folder batch upload** — not yet implemented
