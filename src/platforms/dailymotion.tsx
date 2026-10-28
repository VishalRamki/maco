import { registerPlatform } from "./index";

function extractDailymotionId(url: string): string | null {
  const match = url.match(
    /(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/,
  );
  return match ? match[1] : null;
}

registerPlatform("dailymotion", {
  name: "Dailymotion",
  extractId: extractDailymotionId,
  fetchMetadata: async (url) => {
    try {
      const res = await fetch(
        `https://www.dailymotion.com/services/oembed?url=${encodeURIComponent(url)}`,
      );
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title,
          author: data.author_name,
          thumbnailUrl: data.thumbnail_url,
          category: "Video",
          tags: ["dailymotion"],
        };
      }
    } catch (e) {
      console.warn("Dailymotion oEmbed failed:", e);
    }
    return { title: "Dailymotion Video", tags: ["dailymotion"] };
  },
  EmbedComponent: ({ url, title }) => {
    const videoId = extractDailymotionId(url);
    if (!videoId) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground p-4">
          Invalid Dailymotion URL
        </div>
      );
    }
    return (
      <iframe
        src={`https://www.dailymotion.com/embed/video/${videoId}?autoplay=1&mute=1`}
        title={title || "Dailymotion Video"}
        allow="autoplay; fullscreen"
        allowFullScreen
        className="h-full w-full border-0"
      />
    );
  },
});
