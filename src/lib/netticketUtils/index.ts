// netticketUtils — reusable Netticket.fi integration helpers.
// Pure functions, no Node.js dependencies — safe in browser and server contexts.

// Converts a netticket.fi ticket URL to embed.netticket.fi for the floating sidebar.
// All embed.netticket.fi links are intercepted by the Netticket embed script and
// opened in a floating sidebar instead of navigating away.
// Returns the original URL unchanged if it's not a netticket.fi link.
export function toEmbedUrl(url: string): string {
  return url.replace(
    /^https?:\/\/(www\.)?netticket\.fi\//,
    "https://embed.netticket.fi/"
  );
}
