// youtubeUtils — YouTube URL conversion helpers.
// Pure functions, safe in browser and server contexts.

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "www.youtube-nocookie.com",
]);

// Reads the video ID from watch, youtu.be, embed, shorts and live URLs.
function getVideoId(u: URL): string | null {
  if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
  if (!YOUTUBE_HOSTS.has(u.hostname)) return null;
  const fromPath = u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/);
  return fromPath?.[1] ?? u.searchParams.get("v");
}

// Converts any YouTube URL to youtube-nocookie.com embed format.
// Returns the original URL unchanged if it is not a YouTube URL.
export function toNoCookiesEmbed(url: string): string {
  try {
    const videoId = getVideoId(new URL(url));
    if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch {}
  return url;
}

// True for YouTube Shorts links — these are portrait (9:16) videos.
export function isYoutubeShort(url: string): boolean {
  try {
    const u = new URL(url);
    return YOUTUBE_HOSTS.has(u.hostname) && u.pathname.startsWith("/shorts/");
  } catch {
    return false;
  }
}
