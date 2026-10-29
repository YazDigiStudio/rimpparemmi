// src/pages/api/links.ts
// Admin API for the QR tool, editors only (Netlify Identity login).
//   GET            → list all links
//   POST           → create { slug, label, kind, url }
//   PUT            → replace the target of an existing slug
//   DELETE ?slug=  → remove the short link (the uploaded file is kept)

import type { NextApiRequest, NextApiResponse } from "next";
import { isLoggedInEditor } from "@/lib/links/editorAuth";
import {
  createLink,
  deleteLink,
  getLink,
  isHttpsUrl,
  isValidSlug,
  listLinks,
  updateLink,
  type LinkRecord,
} from "@/lib/links/linkStore";

type ApiResponse =
  | { links: LinkRecord[] }
  | { link: LinkRecord }
  | { ok: true }
  | { error: string };

type Target = { kind: LinkRecord["kind"]; url: string };

// Uploaded files must be in our own bucket's cms/ folder — where CMS uploads land
function isOwnFileUrl(url: string): boolean {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucket) return false;
  const prefix = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/cms%2F`;
  return url.startsWith(prefix);
}

// Validates the request body's target; returns it or an error message
function parseTarget(kind: unknown, url: unknown): Target | string {
  if (typeof url !== "string") return "Missing url";
  if (kind === "file") {
    return isOwnFileUrl(url) ? { kind, url } : "File is not in storage";
  }
  if (kind === "url") {
    return isHttpsUrl(url) ? { kind, url } : "Address must start with https://";
  }
  return "Invalid kind";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (!(await isLoggedInEditor(req.headers.authorization))) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (req.method === "GET") {
      return res.status(200).json({ links: await listLinks() });
    }

    if (req.method === "DELETE") {
      const slug = typeof req.query.slug === "string" ? req.query.slug : "";
      if (!isValidSlug(slug)) {
        return res.status(400).json({ error: "Invalid link name" });
      }
      await deleteLink(slug);
      return res.status(200).json({ ok: true });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const body: Record<string, unknown> = req.body ?? {};
      const slug = typeof body.slug === "string" ? body.slug : "";
      if (!isValidSlug(slug)) {
        return res.status(400).json({
          error: "Link name: 3-60 characters, a-z, 0-9 and hyphens only",
        });
      }
      const target = parseTarget(body.kind, body.url);
      if (typeof target === "string") {
        return res.status(400).json({ error: target });
      }
      const label =
        typeof body.label === "string" && body.label.trim()
          ? body.label.trim().slice(0, 100)
          : slug;
      const now = new Date().toISOString();

      if (req.method === "POST") {
        const link: LinkRecord = {
          slug,
          label,
          ...target,
          createdAt: now,
          updatedAt: now,
        };
        const created = await createLink(link);
        if (!created) {
          return res.status(409).json({ error: "Link name is already in use" });
        }
        return res.status(201).json({ link });
      }

      // PUT — keep the original label unless a new one was sent
      const existing = await getLink(slug);
      if (!existing) return res.status(404).json({ error: "Link not found" });
      const link: LinkRecord = {
        ...existing,
        ...target,
        label: typeof body.label === "string" ? label : existing.label,
        updatedAt: now,
      };
      await updateLink(link);
      return res.status(200).json({ link });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("links API error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
