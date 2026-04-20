// subscribe.ts — Adds a subscriber to Mailchimp audience.
// Env vars: MAILCHIMP_API_KEY, MAILCHIMP_AUDIENCE_ID, MAILCHIMP_SERVER_PREFIX

import type { NextApiRequest, NextApiResponse } from "next";

type MailchimpErrorResponse = {
  title: string;
  status: number;
  detail: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, name } = req.body as { email?: string; name?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const server = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!apiKey || !audienceId || !server) {
    console.error("Missing Mailchimp env vars");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const url = `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}/members`;

  const nameParts = (name ?? "").trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `apikey ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: email,
      status: "pending",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName,
      },
    }),
  });

  if (response.ok) {
    return res.status(200).json({ success: true });
  }

  const data = (await response.json()) as MailchimpErrorResponse;

  // Already subscribed — treat as success
  if (data.title === "Member Exists") {
    return res.status(200).json({ success: true, existing: true });
  }

  console.error("Mailchimp error:", data.title, data.detail);
  return res.status(500).json({ error: "Subscription failed" });
}
