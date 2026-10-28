import { registerPlatform } from "./index";

function extractTwitchInfo(url: string): string | null {
  const videoMatch = url.match(/twitch\.tv\/videos\/([0-9]+)/);
  const clipMatch =
    url.match(/clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/) ||
    url.match(/twitch\.tv\/[a-zA-Z0-9_]+\/clip\/([a-zA-Z0-9_-]+)/);
  const channelMatch = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);

  if (videoMatch || clipMatch || channelMatch) {
    return channelMatch?.[1] || videoMatch?.[1] || clipMatch?.[1] || null;
  }
  return null;
}

registerPlatform("twitch", {
  name: "Twitch",
  extractId: extractTwitchInfo,
  fetchMetadata: async (url, id) => {
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
      // Fallback
    }
    return {
      title: `Twitch Stream (${id})`,
      author: id,
      category: "Streaming",
      tags: ["twitch"],
    };
  },
  EmbedComponent: ({ url, title }) => {
    const parentDomain = window.location.hostname || "localhost";
    const videoMatch = url.match(/twitch\.tv\/videos\/([0-9]+)/);
    const clipMatch = url.match(/clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/);
    const channelMatch = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);

    let embedSrc = "";
    if (videoMatch) {
      embedSrc = `https://player.twitch.tv/?video=${videoMatch[1]}&parent=${parentDomain}&muted=true`;
    } else if (clipMatch) {
      embedSrc = `https://clips.twitch.tv/embed?clip=${clipMatch[1]}&parent=${parentDomain}&muted=true`;
    } else if (channelMatch) {
      embedSrc = `https://player.twitch.tv/?channel=${channelMatch[1]}&parent=${parentDomain}&muted=true`;
    }

    return (
      <iframe
        src={embedSrc}
        title={title || "Twitch Stream"}
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="h-full w-full border-0"
      />
    );
  },
});
