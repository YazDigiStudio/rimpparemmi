// linkStore.ts
// Short-link records for the QR tool, one JSON file per link in Firebase
// Storage at links/{slug}.json. Server-side only (uses the Admin SDK).

import * as admin from "firebase-admin";
import { getAdminApp } from "@/lib/image-upload/firebaseStorage";

export type LinkRecord = {
  slug: string;
  url: string;          // where the short link redirects to
  kind: "file" | "url"; // uploaded file, or an external web address
  label: string;        // editor's own name for the link
  storagePath?: string; // only for uploaded files
  createdAt: string;    // ISO timestamp
  updatedAt: string;
};

const LINKS_PREFIX = "links/";
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Lowercase letters, digits and single hyphens, 3-60 characters
export function isValidSlug(slug: string): boolean {
  return slug.length >= 3 && slug.length <= 60 && SLUG_PATTERN.test(slug);
}

// Only https targets are allowed — checked again on every redirect
export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

// Validates data read from storage before trusting it
function parseLinkRecord(data: unknown): LinkRecord | null {
  if (typeof data !== "object" || data === null) return null;
  const r = data as Record<string, unknown>;
  if (
    typeof r.slug !== "string" ||
    typeof r.url !== "string" ||
    (r.kind !== "file" && r.kind !== "url") ||
    typeof r.label !== "string" ||
    typeof r.createdAt !== "string" ||
    typeof r.updatedAt !== "string"
  ) {
    return null;
  }
  return {
    slug: r.slug,
    url: r.url,
    kind: r.kind,
    label: r.label,
    storagePath: typeof r.storagePath === "string" ? r.storagePath : undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function getBucket() {
  return admin.storage(getAdminApp()).bucket();
}

function isPreconditionFailed(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === 412
  );
}

export async function getLink(slug: string): Promise<LinkRecord | null> {
  if (!isValidSlug(slug)) return null;
  const file = getBucket().file(`${LINKS_PREFIX}${slug}.json`);
  const [exists] = await file.exists();
  if (!exists) return null;
  const [buffer] = await file.download();
  return parseLinkRecord(JSON.parse(buffer.toString("utf8")));
}

// Returns false if the slug is already taken. The storage precondition makes
// the check-and-write atomic, so two editors can't claim the same slug.
export async function createLink(record: LinkRecord): Promise<boolean> {
  try {
    await getBucket()
      .file(`${LINKS_PREFIX}${record.slug}.json`)
      .save(JSON.stringify(record), {
        contentType: "application/json",
        resumable: false,
        preconditionOpts: { ifGenerationMatch: 0 }, // fail if it exists
      });
    return true;
  } catch (err) {
    if (isPreconditionFailed(err)) return false;
    throw err;
  }
}

// Overwrites an existing link, used by "replace file"
export async function updateLink(record: LinkRecord): Promise<void> {
  await getBucket()
    .file(`${LINKS_PREFIX}${record.slug}.json`)
    .save(JSON.stringify(record), {
      contentType: "application/json",
      resumable: false,
    });
}

export async function deleteLink(slug: string): Promise<void> {
  if (!isValidSlug(slug)) return;
  await getBucket()
    .file(`${LINKS_PREFIX}${slug}.json`)
    .delete({ ignoreNotFound: true });
}

// All links, newest first, for the admin list
export async function listLinks(): Promise<LinkRecord[]> {
  const [files] = await getBucket().getFiles({ prefix: LINKS_PREFIX });
  const records = await Promise.all(
    files
      .filter((f) => f.name.endsWith(".json"))
      .map(async (f) => {
        const [buffer] = await f.download();
        return parseLinkRecord(JSON.parse(buffer.toString("utf8")));
      })
  );
  return records
    .filter((r): r is LinkRecord => r !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
