// editorAuth.ts
// Confirms a request comes from a logged-in CMS editor (Netlify Identity).
// Same check as /api/cms-token, shared by the link-management routes.

export async function isLoggedInEditor(
  authHeader: string | undefined
): Promise<boolean> {
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
