import { registerPlatform } from "./index";

function extractRtspUrl(url: string): string | null {
  if (
    url.trim().toLowerCase().startsWith("rtsp://") ||
    url.trim().toLowerCase().startsWith("rtsps://")
  ) {
    return url.trim();
  }
  return null;
}

registerPlatform("rtsp", {
  name: "RTSP Camera",
  extractId: extractRtspUrl,

  fetchMetadata: async (url) => {
    // RTSP streams don't support oEmbed, so we generate clean fallback metadata
    return {
      title: `RTSP Stream: ${new URL(url).hostname || "Camera Feed"}`,
      author: "IP Camera / NVR",
      category: "Security / Live Feed",
      tags: ["rtsp", "camera", "live"],
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

    /* 
      NOTE: Browsers do not play raw rtsp:// URLs natively. 
      If you are using a gateway like go2rtc or rtsp-to-web, you would typically 
      transform the streamUrl here into your WebRTC/HLS playback URL.
      For direct integration or if your setup handles it, you can render an 
      appropriate video player or iframe stream wrapper below:
    */
    return (
      <div className="flex flex-col h-full w-full bg-black relative items-center justify-center">
        <video
          src={streamUrl}
          autoPlay
          muted
          playsInline
          controls
          className="h-full w-full object-contain"
          onError={(e) => {
            console.warn(
              "Direct RTSP video playback note: Browsers require an RTSP-to-WebRTC/HLS gateway (like go2rtc) to render rtsp:// streams.",
              e,
            );
          }}
        />
        <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-foreground font-mono truncate max-w-[80%] pointer-events-none">
          {title || streamUrl}
        </div>
      </div>
    );
  },
});
