/**
 * @file index.ts
 * @description Central registry and detection engine for supported video and streaming platforms.
 */

import type {
  PlatformDefinition,
  PlatformMetadata,
  PlatformEmbedProps,
  PlatformDetectionResult,
} from "@/types";

export type {
  PlatformDefinition,
  PlatformMetadata,
  PlatformEmbedProps,
  PlatformDetectionResult,
};

/**
 * Global registry dictionary mapping platform keys (e.g. 'youtube', 'twitch') to platform adapters.
 */
export const platforms: Record<string, PlatformDefinition> = {};

/**
 * Registers a new platform definition module in the runtime platform registry.
 *
 * @param key - Unique lowercase identifier key for the platform (e.g., 'youtube').
 * @param definition - Complete platform definition contract implementation.
 */
export function registerPlatform(
  key: string,
  definition: PlatformDefinition,
): void {
  platforms[key] = definition;
}

/**
 * Detects which registered platform a given content URL belongs to by testing extractors.
 *
 * @param url - The input URL to evaluate against all registered platform extractors.
 * @returns {PlatformDetectionResult | null} The matched platform key and content ID, or null if unsupported.
 */
export function detectPlatform(url: string): PlatformDetectionResult | null {
  for (const [key, def] of Object.entries(platforms)) {
    const id = def.extractId(url);
    if (id) {
      return { platformKey: key, id };
    }
  }
  return null;
}
