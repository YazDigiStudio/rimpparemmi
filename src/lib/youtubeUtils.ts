// youtubeUtils — YouTube URL conversion helpers.
// Pure functions, safe in browser and server contexts.

// Converts any YouTube URL (watch, youtu.be, embed) to youtube-nocookie.com embed format.
// Returns the original URL unchanged if it is not a YouTube URL.
export function toNoCookiesEmbed(url: string): string {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname === "youtu.be") {
      videoId = u.pathname.slice(1);
    } else if (
      u.hostname === "www.youtube.com" ||
      u.hostname === "youtube.com" ||
      u.hostname === "www.youtube-nocookie.com"
    ) {
      videoId = u.searchParams.get("v") ?? u.pathname.replace("/embed/", "");
    }
    if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch {}
  return url;
}
