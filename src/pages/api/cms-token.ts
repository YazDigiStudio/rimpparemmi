// src/pages/api/cms-token.ts
// Returns a short-lived Firebase ID token for the CMS service account.
// The browser adapter calls this before uploading — credentials never leave the server.
//
// This endpoint used to hand out that token to any POST request, with no check on who
// was asking. It now requires proof of a real, currently logged-in Netlify Identity
// session (the same login Decap's git-gateway backend already requires for editing
// content) before it will mint one.
//
// Required env variables (server-side only, no NEXT_PUBLIC_ prefix):
//   CMS_UPLOAD_EMAIL     — Firebase Auth email for the CMS service account
//   CMS_UPLOAD_PASSWORD  — Firebase Auth password for the CMS service account
//   NEXT_PUBLIC_FIREBASE_API_KEY — Firebase project API key (already set)
//   NETLIFY_IDENTITY_URL — the site's Netlify Identity base URL, e.g.
//                          https://rimpparemmi.netlify.app/.netlify/identity

import type { NextApiRequest, NextApiResponse } from "next";

type TokenResponse = { token: string } | { error: string };

type FirebaseSignInResponse = {
  idToken: string;
  error?: { message: string };
};

// Confirms the bearer token belongs to a real, currently logged-in Netlify Identity
// user, by asking Netlify Identity itself — no secret or JWT library needed here.
async function isLoggedInEditor(authHeader: string | undefined): Promise<boolean> {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const identityUrl = process.env.NETLIFY_IDENTITY_URL;
  if (!identityUrl) {
    console.error("Missing NETLIFY_IDENTITY_URL environment variable");
    return false;
  }
  try {
    const res = await fetch(`${identityUrl}/user`, {
      headers: { Authorization: authHeader },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authorized = await isLoggedInEditor(req.headers.authorization);
  if (!authorized) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const email = process.env.CMS_UPLOAD_EMAIL;
  const password = process.env.CMS_UPLOAD_PASSWORD;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!email || !password || !apiKey) {
    console.error("Missing CMS auth environment variables");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  try {
    // Sign in with email/password via Firebase Auth REST API
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    const data = (await response.json()) as FirebaseSignInResponse;

    if (!response.ok || !data.idToken) {
      console.error("Firebase sign-in failed:", data.error?.message);
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Token is valid for 1 hour — adapter caches it and reuses within that window
    return res.status(200).json({ token: data.idToken });
  } catch (err) {
    console.error("cms-token error:", err);
    return res.status(500).json({ error: "Authentication failed" });
  }
}
