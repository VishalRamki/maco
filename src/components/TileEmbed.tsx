/**
 * @file TileEmbed.tsx
 * @description Dynamic tile player dispatcher rendering platform-specific embed components based on platform key.
 */

import { platforms } from "@/platforms";
import { useModeStore } from "@/store/useModeStore";
import { getSafeStreamName } from "@/platforms/rtsp";

/**
 * Prop interface for `TileEmbed`.
 */
export interface TileEmbedProps {
  /** Full video or stream URL to embed. */
  url: string;
  /** Platform identifier key registered in the platform registry (e.g. 'youtube', 'twitch'). */
  platform: string;
  /** Optional title for accessibility and iframe labels. */
  title?: string;
}

/**
 * Component that looks up the registered platform embedder and renders the appropriate player iframe.
 * In server mode, all tiles route through the local go2rtc WebRTC gateway instead of platform embeds.
 */
export function TileEmbed({ url, platform, title }: TileEmbedProps) {
  const mode = useModeStore((s) => s.mode);

  // In server mode, route all tiles through the local go2rtc iframe
  if (mode === "server") {
    const key = getSafeStreamName(url);
    const embedSrc = `http://localhost:1984/stream.html?src=${key}&autoplay=1&muted=1&webrtc=smooth`;
    return (
      <div className="flex flex-col h-full w-full bg-black relative overflow-hidden">
        <iframe
          src={embedSrc}
          title={title || url}
          allow="autoplay; fullscreen; encrypted-media"
          className="h-full w-full border-0"
        />
        <div className="absolute bottom-2 left-2 bg-background/85 backdrop-blur-md px-2 py-1 rounded text-[10px] text-foreground font-mono truncate max-w-[80%] pointer-events-none shadow-sm">
          {title || url}
        </div>
      </div>
    );
  }

  const platformDef = platforms[platform];

  if (!platformDef || !platformDef.EmbedComponent) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground p-4">
        Unsupported platform: {platform}
      </div>
    );
  }

  const { EmbedComponent } = platformDef;
  return <EmbedComponent url={url} title={title} />;
}
