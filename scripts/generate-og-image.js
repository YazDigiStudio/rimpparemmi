// generate-og-image.js
// Generates public/og-image.png (1200x630) from the logo JPEG.
// Resizes logo to fit height, then extends with fuchsia on the sides.
// Run: node scripts/generate-og-image.js

const sharp = require("sharp");
const path = require("path");

const WIDTH = 1200;
const HEIGHT = 630;
// Sampled from the logo JPEG edge pixels (JPEG compression shifts the colour)
const FUCHSIA = "#E82068";

async function main() {
  const logoPath = path.join(__dirname, "..", "public", "images", "RRemmi_FUKS_rgb_10Mt.jpeg");
  const outPath = path.join(__dirname, "..", "public", "og-image.png");

  // Resize logo to fit the target height
  const resized = await sharp(logoPath)
    .resize({ height: HEIGHT })
    .toBuffer();

  const { width: logoWidth } = await sharp(resized).metadata();
  const pad = Math.round((WIDTH - logoWidth) / 2);

  await sharp(resized)
    .extend({
      left: pad,
      right: WIDTH - logoWidth - pad,
      background: FUCHSIA,
    })
    .png()
    .toFile(outPath);

  console.log(`Created ${outPath} (${WIDTH}x${HEIGHT})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
