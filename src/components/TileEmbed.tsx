/**
 * @file TileEmbed.tsx
 * @description Dynamic tile player dispatcher rendering platform-specific embed components based on platform key.
 */

import { platforms } from "@/platforms";

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
 */
export function TileEmbed({ url, platform, title }: TileEmbedProps) {
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
