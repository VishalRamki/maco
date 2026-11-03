/**
 * @file platform.ts
 * @description Interfaces and contracts for platform detectors, metadata fetchers, and embed renderers.
 */

import type React from "react";

/**
 * Metadata resolved from external APIs or fallback scrapers for a tile.
 */
export interface PlatformMetadata {
  /** Resolved title of the stream or video. */
  title?: string;
  /** Resolved author, creator, or channel name. */
  author?: string;
  /** URL to the preview thumbnail image. */
  thumbnailUrl?: string;
  /** Primary category (e.g., 'Music', 'Gaming'). */
  category?: string;
  /** Extracted or resolved topic tags. */
  tags?: string[];
  /** Video or media duration formatted string. */
  duration?: string;
  /** Formatted view count string. */
  viewCount?: string;
  /** Formatted publication timestamp. */
  publishedAt?: string;
  /** Optional detailed description. */
  description?: string;
}

/**
 * Props passed to platform-specific embed components.
 */
export interface PlatformEmbedProps {
  /** Full stream/video URL to embed. */
  url: string;
  /** Optional title for accessibility and iframe labels. */
  title?: string;
}

/**
 * Definition contract implemented by each supported platform module.
 */
export interface PlatformDefinition {
  /** Display name of the platform (e.g., 'YouTube', 'Twitch'). */
  name: string;
  /** Extracts a unique content ID/slug from a given URL, or returns null if not matched. */
  extractId: (url: string) => string | null;
  /** Fetches metadata for the platform content. */
  fetchMetadata: (
    url: string,
    id: string,
    youtubeApiKey?: string,
  ) => Promise<PlatformMetadata>;
  /** React component rendering the embeddable video player or iframe. */
  EmbedComponent: React.ComponentType<PlatformEmbedProps>;
}

/**
 * Result returned by the platform detector.
 */
export interface PlatformDetectionResult {
  /** Identifier key registered in the platform registry (e.g., 'youtube'). */
  platformKey: string;
  /** Extracted unique identifier or slug. */
  id: string;
}
