# Image Upload Service

Reusable server-side image processing and Firebase Storage upload module.
Built for Next.js API routes but contains no Next.js dependencies — the core
logic works with plain buffers and can be adapted to any Node.js server.

---

## What It Does

When a file arrives from the CMS (or any upload source), this service:

1. **Images** (JPG, PNG, WebP, HEIC)
   - Converts to JPG at full resolution and maximum quality → saved as `original`
   - Converts to WebP at max 1920px width and quality 85 → saved as `web`
   - Returns the `web` URL to the caller (what the CMS stores in content files)
   - Original is always preserved at the predictable `originals/` path

2. **Pass-through files** (PDF, SVG)
   - Stored as-is, no processing
   - Returns the storage URL to the caller

---

## File Structure

```
src/lib/image-upload/
  README.md          ← this file
  types.ts           ← shared TypeScript types
  processImage.ts    ← sharp logic: buffer in → { originalJpg, webWebp } out
  firebaseStorage.ts ← Firebase Admin SDK upload: buffer + path → public URL
  index.ts           ← public API, re-exports what the API route needs
```

API routes that use this service:

```
src/pages/api/cms-token.ts ← issues a short-lived Firebase ID token to the CMS adapter
src/pages/api/upload.ts    ← verifies token, parses request, calls uploadFile()
```

Browser side:

```
public/admin/cms-media-adapter.js ← Decap CMS media library: fetches token, sends files
```

---

## Firebase Storage Layout

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

| Format | Type       | Processing                                      |
|--------|------------|-------------------------------------------------|
| JPG    | image      | Original: JPG quality 100. Web: WebP quality 85 |
| PNG    | image      | Original: JPG quality 100. Web: WebP quality 85 |
| WebP   | image      | Original: JPG quality 100. Web: WebP quality 85 |
| HEIC   | image      | Original: JPG quality 100. Web: WebP quality 85 |
| PDF    | pass-through | Stored as-is, no processing                   |
| SVG    | pass-through | Stored as-is, no processing                   |

All image formats are converted to JPG for the original (consistent format
for press downloads and printing) and WebP for the web version (smaller file
size, supported by all modern browsers).

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

The upload endpoint is protected — only authenticated CMS users can upload files.

```
Browser (CMS adapter)       Server                        Firebase
        |                      |                              |
        |-- POST /api/cms-token ->|                            |
        |                      |-- sign in with               |
        |                      |   CMS_UPLOAD_EMAIL           |
        |                      |   CMS_UPLOAD_PASSWORD ------>|
        |                      |<-- short-lived ID token -----|
        |<-- { token } --------|                              |
        |                      |                              |
        |-- POST /api/upload -->|                              |
        |   Authorization:      |                              |
        |   Bearer {token}      |-- verifyIdToken() --------->|
        |                      |<-- valid -------------------|
        |                      |-- uploadFile() ------------->|
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

    // Web-optimised images: public read (served directly by website)
    match /cms/web/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
    match /productions/{id}/web/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }

    // Originals: no public read (download via signed URL or admin only)
    match /cms/originals/{allPaths=**} {
      allow read, write: if false;
    }
    match /productions/{id}/originals/{allPaths=**} {
      allow read, write: if false;
    }

    // All writes go through the server-side API (Firebase Admin SDK bypasses rules)
    // No direct client uploads allowed
  }
}
```

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

```ts
import { uploadFile } from "@/lib/image-upload";

// In your API handler:
const result = await uploadFile({
  buffer,           // Buffer — raw file bytes
  filename,         // string — original filename
  contentType,      // string — MIME type
  productionId,     // string | undefined — optional, for production-specific storage
});

// result.url  — the web-optimised public URL (store this in content files)
// result.originalUrl — the original file URL (informational, not stored in CMS)
```

---

## How to Copy to Another Project

1. Copy the entire `src/lib/image-upload/` folder into the new project
2. Copy `src/pages/api/upload.ts` into the new project
3. Copy `src/pages/api/cms-token.ts` into the new project
4. Copy `public/admin/cms-media-adapter.js` into the new project
5. Install sharp: `npm install sharp`
6. Create a Firebase Auth user for the CMS (e.g. `cms@yourclient.fi`)
7. Add all environment variables (see above)
8. Set up Firebase Security Rules (see above)

No other changes needed. The service is self-contained.

---

## What Is Not Handled Here

- **Video files** — too large for this flow, requires separate handling
- **Audio files** — separate service
- **Image galleries / ordering** — handled by the CMS content files
- **Signed URLs for originals** — not yet implemented, add to `firebaseStorage.ts` if needed
