export interface PlatformDefinition {
  name: string;
  // Extracts unique ID or slug from a URL
  extractId: (url: string) => string | null;
  // Fetches metadata (title, author, thumbnail, etc.)
  fetchMetadata: (
    url: string,
    id: string,
    youtubeApiKey?: string,
  ) => Promise<{
    title?: string;
    author?: string;
    thumbnailUrl?: string;
    category?: string;
    tags?: string[];
  }>;
  // Renders the embed iframe
  EmbedComponent: ({
    url,
    title,
  }: {
    url: string;
    title?: string;
  }) => React.ReactNode;
}

// Registry dictionary
export const platforms: Record<string, PlatformDefinition> = {};

export function registerPlatform(key: string, definition: PlatformDefinition) {
  platforms[key] = definition;
}

// Detect which platform a URL belongs to
export function detectPlatform(
  url: string,
): { platformKey: string; id: string } | null {
  for (const [key, def] of Object.entries(platforms)) {
    const id = def.extractId(url);
    if (id) {
      return { platformKey: key, id };
    }
  }
  return null;
}
