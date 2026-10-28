import { registerPlatform } from "./index";

function extractKickChannel(url: string): string | null {
  const match = url.match(/(?:kick\.com\/)([a-zA-Z0-9_]+)/);
  return match ? match[1] : null;
}

registerPlatform("kick", {
  name: "Kick",
  extractId: extractKickChannel,
  fetchMetadata: async (_url, channel) => {
    return {
      title: `Kick Stream: ${channel}`,
      author: channel,
      category: "Streaming",
      tags: ["kick", "stream"],
    };
  },
  EmbedComponent: ({ url, title }) => {
    const channel = extractKickChannel(url);
    if (!channel) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground p-4">
          Invalid Kick URL
        </div>
      );
    }
    return (
      <iframe
        src={`https://player.kick.com/${channel}?muted=true`}
        title={title || `Kick Stream - ${channel}`}
        allow="autoplay; fullscreen"
        allowFullScreen
        className="h-full w-full border-0"
      />
    );
  },
});
