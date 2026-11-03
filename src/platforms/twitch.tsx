/**
 * @file twitch.tsx
 * @description Twitch platform adapter for livestreams, clips, and past broadcasts.
 */

import { registerPlatform } from "./index";
import type { PlatformMetadata } from "@/types";

/**
 * Extracts a Twitch channel name, clip slug, or video ID from various Twitch URL patterns.
 *
 * @param url - Twitch live stream, video, or clip URL.
 * @returns {string | null} Extracted channel or identifier, or null if not matched.
 */
export function extractTwitchInfo(url: string): string | null {
  const videoMatch = url.match(/twitch\.tv\/videos\/([0-9]+)/);
  const clipMatch =
    url.match(/clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/) ||
    url.match(/twitch\.tv\/[a-zA-Z0-9_]+\/clip\/([a-zA-Z0-9_-]+)/);
  const channelMatch = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);

  if (videoMatch?.[1]) return videoMatch[1];
  if (clipMatch?.[1]) return clipMatch[1];

  if (
    channelMatch?.[1] &&
    channelMatch[1] !== "videos" &&
    channelMatch[1] !== "clips"
  ) {
    return channelMatch[1];
  }

  return null;
}

registerPlatform("twitch", {
  name: "Twitch",
  extractId: extractTwitchInfo,
  fetchMetadata: async (url, id): Promise<PlatformMetadata> => {
    try {
      const response = await fetch(
        `https://api.twitch.tv/v5/oembed?url=${encodeURIComponent(url)}`,
      );
      if (response.ok) {
        const data = await response.json();
        return {
          title: data.title || `Twitch Stream: ${id}`,
          author: data.author_name || id,
          thumbnailUrl: data.thumbnail_url,
          category: "Streaming",
          tags: ["twitch"],
        };
      }
    } catch {
      // Fallback below
    }
    return {
      title: `Twitch Stream (${id})`,
      author: id,
      category: "Streaming",
      tags: ["twitch"],
    };
  },
  EmbedComponent: ({ url, title }) => {
    const parentDomain =
      typeof window !== "undefined"
        ? window.location.hostname || "localhost"
        : "localhost";

    const videoMatch = url.match(/twitch\.tv\/videos\/([0-9]+)/);
    const clipMatch =
      url.match(/clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/) ||
      url.match(/twitch\.tv\/[a-zA-Z0-9_]+\/clip\/([a-zA-Z0-9_-]+)/);
    const channelMatch = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);

    let embedSrc = "";
    if (videoMatch) {
      embedSrc = `https://player.twitch.tv/?video=${videoMatch[1]}&parent=${parentDomain}&muted=true&popout=true`;
    } else if (clipMatch) {
      embedSrc = `https://clips.twitch.tv/embed?clip=${clipMatch[1]}&parent=${parentDomain}&muted=true&popout=true`;
    } else if (channelMatch) {
      const channelName = channelMatch[1];
      if (channelName !== "videos" && channelName !== "clips") {
        embedSrc = `https://player.twitch.tv/?channel=${channelName}&parent=${parentDomain}&muted=true&popout=true`;
      }
    }

    return (
      <div className="w-full h-[450px] min-h-[350px]">
        <iframe
          src={embedSrc}
          title={title || "Twitch Stream"}
          sandbox="allow-scripts allow-same-origin allow-popups allow-modals"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  },
});
