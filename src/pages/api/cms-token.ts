// src/pages/api/cms-token.ts
// Returns a short-lived Firebase ID token for the CMS service account.
// The browser adapter calls this before uploading — credentials never leave the server.
//
// Required env variables (server-side only, no NEXT_PUBLIC_ prefix):
//   CMS_UPLOAD_EMAIL     — Firebase Auth email for the CMS service account
//   CMS_UPLOAD_PASSWORD  — Firebase Auth password for the CMS service account
//   NEXT_PUBLIC_FIREBASE_API_KEY — Firebase project API key (already set)

import type { NextApiRequest, NextApiResponse } from "next";

type TokenResponse = { token: string } | { error: string };

type FirebaseSignInResponse = {
  idToken: string;
  error?: { message: string };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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
