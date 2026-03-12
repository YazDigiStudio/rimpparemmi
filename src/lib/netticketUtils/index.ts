// netticketUtils — reusable Netticket.fi integration helpers.
// Pure functions, no Node.js dependencies — safe in browser and server contexts.

// Converts a netticket.fi ticket URL to embed.netticket.fi for the floating sidebar.
// All embed.netticket.fi links are intercepted by the Netticket embed script and
// opened in a floating sidebar instead of navigating away.
// product_info.php URLs are not supported by embed.netticket.fi — returned unchanged
// so they open normally. Short links and event listing URLs are converted.
// Returns the original URL unchanged if it's not a netticket.fi link.
export function toEmbedUrl(url: string): string {
  if (url.includes("product_info.php")) return url;
  return url.replace(
    /^https?:\/\/(www\.)?netticket\.fi\//,
    "https://embed.netticket.fi/"
  );
}

// Resolves the final ticket URL for a performance, applying the production-level
// fallback when the performance has no individual ticket URL, then converting to
// the embed format. Use this at every ticket button/link in the app.
export function resolveTicketUrl(
  ticketUrl: string | undefined,
  fallbackUrl?: string
): string {
  return toEmbedUrl(ticketUrl ?? fallbackUrl ?? "");
}
