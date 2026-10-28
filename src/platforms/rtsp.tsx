import { registerPlatform } from "./index";

function extractRtspUrl(url: string): string | null {
  const trimmed = url.trim();
  if (
    trimmed.toLowerCase().startsWith("rtsp://") ||
    trimmed.toLowerCase().startsWith("rtsps://")
  ) {
    return trimmed;
  }
  return null;
}

// Safely generate a deterministic stream name without throwing errors on special characters
function getSafeStreamName(url: string): string {
  try {
    const encoded = btoa(encodeURIComponent(url));
    return "cam_" + encoded.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
  } catch {
    return "cam_" + Math.random().toString(36).substring(2, 10);
  }
}

registerPlatform("rtsp", {
  name: "RTSP Camera",
  extractId: extractRtspUrl,

  // Fully isolated async metadata fetch that never throws or crashes the app
  fetchMetadata: async (url) => {
    let cameraName = "Camera Feed";
    try {
      const parsed = new URL(url);
      cameraName = parsed.hostname || "Camera Feed";
    } catch {
      // fallback
    }

    const streamName = getSafeStreamName(url);

    // Non-blocking background registration attempt
    try {
      await fetch(
        `/go2rtc-api/api/streams?src=${encodeURIComponent(url)}&name=${streamName}`,
        { method: "PUT" },
      );
    } catch (err) {
      console.warn(
        "[Maco] Background go2rtc stream registration skipped:",
        err,
      );
    }

    return {
      title: `RTSP Stream: ${cameraName}`,
      author: "Local / IP Camera",
      category: "Security / Live Feed",
      tags: ["rtsp", "camera", "webrtc"],
    };
  },

  EmbedComponent: ({ url, title }) => {
    const streamUrl = extractRtspUrl(url);

    if (!streamUrl) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground p-4">
          Invalid RTSP URL
        </div>
      );
    }

    const streamName = getSafeStreamName(streamUrl);
    const gatewayPort = 1984;
    const embedSrc = `http://127.0.0.1:${gatewayPort}/stream.html?src=${streamName}&autoplay=1&muted=1&webrtc=smooth`;

    return (
      <div className="flex flex-col h-full w-full bg-black relative overflow-hidden">
        <iframe
          src={embedSrc}
          title={title || "RTSP Stream"}
          allow="autoplay; fullscreen; encrypted-media"
          className="h-full w-full border-0"
        />
        <div className="absolute bottom-2 left-2 bg-background/85 backdrop-blur-md px-2 py-1 rounded text-[10px] text-foreground font-mono truncate max-w-[80%] pointer-events-none shadow-sm">
          {title || streamUrl}
        </div>
      </div>
    );
  },
});
