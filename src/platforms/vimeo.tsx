import { registerPlatform } from "./index";

function extractVimeoId(url: string): string | null {
  const match = url.match(
    /(?:vimeo\.com\/)(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/,
  );
  return match ? match[1] : null;
}

registerPlatform("vimeo", {
  name: "Vimeo",
  extractId: extractVimeoId,
  fetchMetadata: async (url) => {
    try {
      const res = await fetch(
        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
      );
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title,
          author: data.author_name,
          thumbnailUrl: data.thumbnail_url,
          category: "Video",
          tags: ["vimeo"],
        };
      }
    } catch (e) {
      console.warn("Vimeo oEmbed failed:", e);
    }
    return { title: "Vimeo Video", tags: ["vimeo"] };
  },
  EmbedComponent: ({ url, title }) => {
    const videoId = extractVimeoId(url);
    if (!videoId) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground p-4">
          Invalid Vimeo URL
        </div>
      );
    }
    return (
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1`}
        title={title || "Vimeo Video"}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
    );
  },
});
