/**
 * YouTube utility helpers.
 * Pure functions — no network calls, no side effects.
 */

/**
 * Extract a YouTube video ID from any common YouTube URL format.
 *
 * Handles:
 *   https://youtu.be/dQw4w9WgXcQ
 *   https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *   https://youtube.com/watch?v=dQw4w9WgXcQ&t=30s
 *   https://www.youtube.com/embed/dQw4w9WgXcQ
 *   https://www.youtube.com/shorts/dQw4w9WgXcQ
 *   https://www.youtube.com/v/dQw4w9WgXcQ
 *
 * Returns `null` if no valid ID can be found.
 */
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  // Normalise — trim whitespace
  const trimmed = url.trim();

  // Try to parse as a URL; if it fails it might be a bare ID
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    // Not a URL — treat as a bare video ID if it looks like one
    return isValidYouTubeId(trimmed) ? trimmed : null;
  }

  const { hostname, pathname, searchParams } = parsed;

  // youtu.be/<id>
  if (hostname === "youtu.be") {
    const id = pathname.slice(1).split("?")[0];
    return isValidYouTubeId(id) ? id : null;
  }

  if (hostname === "www.youtube.com" || hostname === "youtube.com") {
    // /watch?v=<id>
    const vParam = searchParams.get("v");
    if (vParam && isValidYouTubeId(vParam)) return vParam;

    // /embed/<id>  |  /shorts/<id>  |  /v/<id>
    const match = pathname.match(/^\/(embed|shorts|v)\/([^/?#]+)/);
    if (match) {
      const id = match[2];
      return isValidYouTubeId(id) ? id : null;
    }
  }

  return null;
}

/**
 * Validate a candidate YouTube video ID.
 * YouTube IDs are exactly 11 characters from the base-64 URL alphabet.
 */
function isValidYouTubeId(id: string): boolean {
  return /^[A-Za-z0-9_-]{11}$/.test(id);
}

/**
 * Build the standard YouTube thumbnail URL for a given video ID.
 * Uses the high-quality (hqdefault) variant — always available unlike maxres.
 */
export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Build a canonical YouTube watch URL from a video ID.
 */
export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
