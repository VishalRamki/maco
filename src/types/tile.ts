/**
 * @file tile.ts
 * @description Core domain type definitions for tiles, tile placements, and filter parameters.
 */

/**
 * Represents a single URL tile in the global library.
 */
export interface UrlItem {
  /** Unique numeric identifier for the tile. */
  id: number;
  /** Full target URL (video stream, web link, etc.). */
  url: string;
  /** Key of the detected or assigned platform (e.g., 'youtube', 'twitch', 'generic'). */
  platform: string;
  /** Human-readable title of the content. */
  title?: string;
  /** Author or channel name. */
  author?: string;
  /** Extended text description. */
  description?: string;
  /** Preview thumbnail image URL. */
  thumbnailUrl?: string;
  /** Primary category classification. */
  category?: string;
  /** Array of associated topical tags. */
  tags?: string[];
  /** Video or media duration formatted string. */
  duration?: string;
  /** Human-formatted view count string. */
  viewCount?: string;
  /** Publication timestamp or date string. */
  publishedAt?: string;
  systemId?: string;
}

/**
 * Represents the position and dimensions of a tile within a grid layout.
 */
export interface WorkspaceItem {
  /** References the unique `UrlItem` id. */
  id: number;
  /** Horizontal column position in the grid (0 to 11). */
  x: number;
  /** Vertical row position in the grid. */
  y: number;
  /** Grid width in columns (default 6 for half-width). */
  w: number;
  /** Grid height in row units (default 4). */
  h: number;
}

/**
 * Represents an active tile combining metadata and grid position.
 */
export interface ActiveTileItem extends UrlItem, WorkspaceItem {}

/**
 * Filter state used across search and multi-select criteria.
 */
export interface FilterState {
  /** Text query matched against title, author, URL, description, category, and tags. */
  searchQuery: string;
  /** List of selected category filters (empty means all). */
  selectedCategories: string[];
  /** List of selected platform keys (empty means all). */
  selectedPlatforms: string[];
  /** List of selected tag filters (empty means all). */
  selectedTags: string[];
}
