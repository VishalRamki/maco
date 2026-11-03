/**
 * @file utils.ts
 * @description Common utility helper functions including class merging and string parsing.
 */

export { cn } from "cn";

/**
 * Extracts YouTube video ID from URL string.
 *
 * @param url - YouTube watch, embed, short, or youtu.be URL.
 * @returns {string | null} 11-character video ID, or null if not detected.
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
