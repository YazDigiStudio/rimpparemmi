/**
 * One-time migration script: uploads all images from public/images/ to Firebase Storage.
 * Processes images through sharp (JPG original + WebP web version).
 * Skips the logo (RRemmi_FUKS_rgb_10Mt.jpeg) — it stays local.
 *
 * Usage:
 *   node scripts/migrate-to-firebase.cjs
 *
 * Output:
 *   scripts/migration-map.json  — mapping of local path → Firebase web URL
 *   Console output              — all URLs for updating YAML and source files
 */

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const sharp = require("sharp");

// --- Load .env.local manually (no dotenv dependency needed) ---
function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = val;
  }
  return env;
}

const env = loadEnv(path.join(__dirname, "../.env.local"));
const SERVICE_ACCOUNT_B64 = env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT;
const STORAGE_BUCKET = env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!SERVICE_ACCOUNT_B64 || !STORAGE_BUCKET) {
  console.error("ERROR: Missing FIREBASE_SERVICE_ACCOUNT or NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in .env.local");
  process.exit(1);
}

const serviceAccount = JSON.parse(Buffer.from(SERVICE_ACCOUNT_B64, "base64").toString("utf8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: STORAGE_BUCKET,
});
const bucket = admin.storage().bucket();

// --- Constants ---
const IMAGES_DIR = path.join(__dirname, "../public/images");
const OUTPUT_FILE = path.join(__dirname, "migration-map.json");
const SKIP = new Set(["RRemmi_FUKS_rgb_10Mt.jpeg"]); // logo stays local
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic"]);

// --- Helpers ---
function buildPublicUrl(filePath) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
}

async function uploadBuffer(buffer, filePath, contentType) {
  await bucket.file(filePath).save(buffer, { contentType });
  return buildPublicUrl(filePath);
}

// --- Per-file migration ---
async function migrateFile(filename) {
  const localPath = path.join(IMAGES_DIR, filename);
  const ext = path.extname(filename).toLowerCase();
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const baseName = safeName.replace(/\.[^.]+$/, "");
  const timestamp = Date.now();

  const buffer = fs.readFileSync(localPath);

  // PNG gets the same treatment as other images
  if (!IMAGE_EXTS.has(ext)) {
    const filePath = `cms/${timestamp}-${safeName}`;
    const url = await uploadBuffer(buffer, filePath, "application/octet-stream");
    console.log(`  ✓ ${filename} (pass-through)\n    → ${url}`);
    return url;
  }

  // Process: JPG original (quality 100) + WebP web (max 1920px, quality 85)
  const instance = sharp(buffer);
  const [originalJpg, webWebp] = await Promise.all([
    instance.clone().jpeg({ quality: 100 }).toBuffer(),
    instance.clone()
      .resize(1920, null, { withoutEnlargement: true, fit: "inside" })
      .webp({ quality: 85 })
      .toBuffer(),
  ]);

  const originalPath = `cms/originals/${timestamp}-${baseName}.jpg`;
  const webPath = `cms/web/${timestamp}-${baseName}.webp`;

  const [, webUrl] = await Promise.all([
    uploadBuffer(originalJpg, originalPath, "image/jpeg"),
    uploadBuffer(webWebp, webPath, "image/webp"),
  ]);

  console.log(`  ✓ ${filename}\n    → ${webUrl}`);
  return webUrl;
}

// --- Main ---
async function main() {
  const files = fs.readdirSync(IMAGES_DIR).filter((f) => {
    if (SKIP.has(f)) {
      console.log(`  ⊘ skipping ${f} (logo — stays local)`);
      return false;
    }
    const ext = path.extname(f).toLowerCase();
    return IMAGE_EXTS.has(ext);
  });

  console.log(`\nMigrating ${files.length} images to Firebase Storage...\n`);

  const map = {}; // local path → Firebase web URL

  for (const file of files) {
    const webUrl = await migrateFile(file);
    // Store both plain and URL-encoded versions as keys (YAMLs use both)
    map[`/images/${file}`] = webUrl;
    const encoded = `/images/${encodeURIComponent(file).replace(/%20/g, "%20")}`;
    if (encoded !== `/images/${file}`) {
      map[encoded] = webUrl;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(map, null, 2));

  console.log("\n========================================");
  console.log("Migration complete!");
  console.log(`Map saved to: scripts/migration-map.json`);
  console.log("\nFull mapping (for manual reference):");
  for (const [local, url] of Object.entries(map)) {
    console.log(`  "${local}"`);
    console.log(`  → "${url}"\n`);
  }
  console.log("Next steps:");
  console.log("  node scripts/update-references.cjs");

  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
