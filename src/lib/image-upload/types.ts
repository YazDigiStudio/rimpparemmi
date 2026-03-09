// types.ts
// Shared TypeScript types for the image-upload service.

// Input options for uploadFile()
export type ImageUploadOptions = {
  buffer: Buffer;
  filename: string;
  contentType: string;
  productionId?: string; // optional — routes storage under productions/{id}/
};

// What uploadFile() returns
export type UploadResult = {
  url: string;         // web version (WebP) — store this in CMS content files
  originalUrl: string; // original (JPG or pass-through) — for press/archiving
};

// Internal: what processImage() produces
export type ProcessedImage = {
  originalJpg: Buffer; // full resolution, JPG quality 100
  webWebp: Buffer;     // max 1920px, WebP quality 85
};
