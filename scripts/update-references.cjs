/**
 * Step 2 of the migration: applies the URL mapping from migration-map.json
 * to all YAML content files and source code files that reference /images/*.
 *
 * Run AFTER migrate-to-firebase.cjs has completed.
 *
 * Usage:
 *   node scripts/update-references.cjs
 */

const fs = require("fs");
const path = require("path");

const MAP_FILE = path.join(__dirname, "migration-map.json");

if (!fs.existsSync(MAP_FILE)) {
  console.error("ERROR: scripts/migration-map.json not found. Run migrate-to-firebase.cjs first.");
  process.exit(1);
}

const map = JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));

// Files to update
const ROOT = path.join(__dirname, "..");
const FILES = [
  // Content YAML files
  "content/home.yaml",
  "content/liput.yaml",
  "content/tanssiteatteri.yaml",
  "content/wiljami.yaml",
  "content/productions/hamelnin-pillipiipari.yaml",
  "content/productions/remmi-liveklubi-a-fistful-of-funk.yaml",
  "content/productions/remmi-liveklubi-moving-north.yaml",
  // Source files with hardcoded image paths
  "src/pages/index.tsx",
  "src/pages/yhteystiedot.tsx",
];

let totalReplacements = 0;

for (const relPath of FILES) {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`  ⊘ skipping (not found): ${relPath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, "utf8");
  let fileReplacements = 0;

  for (const [localPath, firebaseUrl] of Object.entries(map)) {
    // Replace both quoted and unquoted occurrences
    const escaped = localPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "g");
    const before = content;
    content = content.replace(regex, firebaseUrl);
    const count = (before.match(regex) || []).length;
    if (count > 0) {
      console.log(`  replaced ${count}× "${localPath}" in ${relPath}`);
      fileReplacements += count;
    }
  }

  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content);
    totalReplacements += fileReplacements;
    console.log(`  ✓ saved ${relPath} (${fileReplacements} replacement${fileReplacements > 1 ? "s" : ""})\n`);
  } else {
    console.log(`  ⊘ no changes needed: ${relPath}`);
  }
}

console.log(`\nDone. ${totalReplacements} total replacements across ${FILES.length} files.`);
console.log("\nNext steps:");
console.log("  1. Review changes with: git diff");
console.log("  2. Run: npm run build  (to catch any broken image paths)");
console.log("  3. If all good, delete public/images/ (except RRemmi_FUKS_rgb_10Mt.jpeg)");
