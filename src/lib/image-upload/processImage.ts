// processImage.ts
// Converts any supported image format into two output buffers:
//   - originalJpg: full resolution, JPG quality 100 (for press/archiving)
//   - webWebp:     max 1920px wide, WebP quality 85 (for website display)
//
// Sharp handles JPG, PNG, WebP and HEIC natively — no extra packages needed.
// Input buffer can be any of those formats.

import sharp from "sharp";
import type { ProcessedImage } from "./types";

const WEB_MAX_WIDTH = 1920;
const WEB_QUALITY = 85;
const ORIGINAL_QUALITY = 100;

export async function processImage(buffer: Buffer): Promise<ProcessedImage> {
  const image = sharp(buffer);

  const [originalJpg, webWebp] = await Promise.all([
    // Original: convert to JPG at maximum quality, no resize
    image
      .clone()
      .jpeg({ quality: ORIGINAL_QUALITY, progressive: true })
      .toBuffer(),

    // Web: resize to max 1920px, convert to WebP at quality 85
    image
      .clone()
      .resize(WEB_MAX_WIDTH, undefined, {
        withoutEnlargement: true, // never upscale smaller images
        fit: "inside",            // maintain aspect ratio
      })
      .webp({ quality: WEB_QUALITY })
      .toBuffer(),
  ]);

  return { originalJpg, webWebp };
}
