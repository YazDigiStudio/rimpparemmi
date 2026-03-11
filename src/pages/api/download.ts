// src/pages/api/download.ts
// Proxies a Firebase Storage file and streams it to the browser as a download.
// Using a server-side proxy (instead of client-side blob fetch) means the browser
// shows the save dialog immediately when headers arrive — no waiting for full file.

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.query;
  if (typeof url !== "string") return res.status(400).end();

  const upstream = await fetch(url);
  if (!upstream.ok || !upstream.body) return res.status(502).end();

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const filename = decodeURIComponent(url.split("/").pop()?.split("?")[0] ?? "image");

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const reader = upstream.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
}
