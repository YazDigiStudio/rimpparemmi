// generate-sitemap.js — Build-time sitemap generator
// Reads production, sales, and touring YAML files to include all dynamic pages.
// Run automatically before each build via the "prebuild" script.

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const SITE_URL = "https://rimpparemmi.fi";
const contentDir = path.join(__dirname, "..", "content");
const outputPath = path.join(__dirname, "..", "public", "sitemap.xml");

// Static pages with priority and change frequency
const staticPages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/ohjelmisto", priority: "0.9", changefreq: "weekly" },
  { path: "/kalenteri", priority: "0.9", changefreq: "weekly" },
  { path: "/yhteystiedot", priority: "0.7", changefreq: "monthly" },
  { path: "/tanssiteatteri", priority: "0.6", changefreq: "monthly" },
  { path: "/ihmiset", priority: "0.6", changefreq: "monthly" },
  { path: "/saapuminen", priority: "0.5", changefreq: "monthly" },
  { path: "/media", priority: "0.5", changefreq: "monthly" },
  { path: "/kiertueohjelmisto", priority: "0.5", changefreq: "monthly" },
  { path: "/myynti", priority: "0.4", changefreq: "monthly" },
  { path: "/tietosuojaseloste", priority: "0.2", changefreq: "yearly" },
  { path: "/saavutettavuus", priority: "0.2", changefreq: "yearly" },
];

// Read YAML files from a directory and return parsed data
function readYamlDir(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath)
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => yaml.load(fs.readFileSync(path.join(dirPath, f), "utf8")));
}

// Build URL entry for sitemap
function urlEntry(pagePath, priority, changefreq) {
  return `  <url>
    <loc>${SITE_URL}${pagePath}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function generate() {
  const urls = [];

  // Static pages
  for (const page of staticPages) {
    urls.push(urlEntry(page.path, page.priority, page.changefreq));
  }

  // Production pages: /ohjelmisto/[id]
  const productions = readYamlDir(path.join(contentDir, "productions"));
  for (const prod of productions) {
    if (prod.id) {
      urls.push(urlEntry(`/ohjelmisto/${prod.id}`, "0.7", "monthly"));
    }
  }

  // Sales pages: /myynti/[id]
  const sales = readYamlDir(path.join(contentDir, "sales"));
  for (const entry of sales) {
    if (entry.production_id) {
      urls.push(urlEntry(`/myynti/${entry.production_id}`, "0.4", "monthly"));
    }
  }

  // Touring pages: /kiertueohjelmisto/[id]
  const touring = productions.filter((p) => p.is_touring);
  for (const prod of touring) {
    if (prod.id) {
      urls.push(urlEntry(`/kiertueohjelmisto/${prod.id}`, "0.4", "monthly"));
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

  fs.writeFileSync(outputPath, sitemap, "utf8");
  const totalUrls = urls.length;
  console.log(`Sitemap generated: ${totalUrls} URLs → public/sitemap.xml`);
}

generate();
