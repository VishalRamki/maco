// src/platforms/youtube.tsx
import { registerPlatform } from "./index";

export function extractYouTubeVideoId(url: string): string | null {
  // Direct regex checks for common short/embed links
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

  // Fallback URL parser for parameter-heavy or modified links
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1, 12);
    }
    const videoParam = parsed.searchParams.get("v");
    if (videoParam) {
      return videoParam.slice(0, 11);
    }
  } catch {
    // Return null if URL is completely invalid
  }

  return null;
}

registerPlatform("youtube", {
  name: "YouTube",
  extractId: extractYouTubeVideoId,
  fetchMetadata: async (url, videoId, youtubeApiKey) => {
    let metadata = {};
    let dataFetched = false;

    if (youtubeApiKey) {
      try {
        const res = await fetch(
          `/youtube-api/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${youtubeApiKey}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            const item = data.items[0];
            const snippet = item.snippet;
            metadata = {
              title: snippet.title,
              author: snippet.channelTitle,
              thumbnailUrl:
                snippet.thumbnails?.high?.url ||
                snippet.thumbnails?.medium?.url ||
                snippet.thumbnails?.default?.url,
              category: snippet.categoryId,
              tags: snippet.tags || [],
            };
            dataFetched = true;
          }
        }
      } catch (error) {
        console.warn("YouTube Data API failed:", error);
      }
    }

    if (!dataFetched) {
      try {
        const response = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(
            url,
          )}&format=json`,
        );
        if (response.ok) {
          const data = await response.json();
          metadata = {
            title: data.title,
            author: data.author_name,
            thumbnailUrl: data.thumbnail_url,
          };
        }
      } catch (error) {
        console.error("YouTube oEmbed failed:", error);
      }
    }

    return metadata;
  },
  EmbedComponent: ({ url, title }) => {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground p-4">
          Invalid YouTube URL
        </div>
      );
    }
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
        title={title || "YouTube video"}
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="h-full w-full border-0"
      />
    );
  },
});
