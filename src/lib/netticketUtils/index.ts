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

// Returns true for netticket.fi slug-style short links (no query params).
// Used to detect when a fallback URL can be enhanced with performance date/time.
function isNetticketShortLink(url: string): boolean {
  return /^https?:\/\/(www\.)?netticket\.fi\/[a-z0-9-]+\/?$/.test(url);
}

// Builds a direct link to a specific performance from a production short link.
// date: "YYYY-MM-DD", time: "HH:MM"
// Uses -osta- (fi) or -buy- (en) suffix per Netticket documentation.
export function buildPerformanceUrl(
  shortLink: string,
  date: string,
  time: string,
  locale: "fi" | "en" = "fi"
): string {
  const langSuffix = locale === "en" ? "buy" : "osta";
  const datePart = date.replace(/-/g, "");   // "2026-04-16" → "20260416"
  const timePart = time.replace(":", "");     // "09:30" → "0930"
  return `${shortLink}-${langSuffix}-${datePart}-${timePart}`;
}

// Resolves the final ticket URL for a performance, applying the production-level
// fallback when the performance has no individual ticket URL, then converting to
// the embed format. Use this at every ticket button/link in the app.
// When using a short link fallback, date + time produce a performance-specific URL
// so the user lands directly on the correct show instead of the full listing.
export function resolveTicketUrl(
  ticketUrl: string | undefined,
  fallbackUrl?: string,
  date?: string,
  time?: string,
  locale: "fi" | "en" = "fi"
): string {
  if (ticketUrl) return toEmbedUrl(ticketUrl);
  if (!fallbackUrl) return "";
  if (date && time && isNetticketShortLink(fallbackUrl)) {
    return toEmbedUrl(buildPerformanceUrl(fallbackUrl, date, time, locale));
  }
  return toEmbedUrl(fallbackUrl);
}
