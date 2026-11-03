/**
 * @file TileGridEmptyState.tsx
 * @description Empty state views for empty workspaces and zero filter matches.
 */

import { Button } from "@/components/ui/button";

/**
 * Prop interface for `TileGridEmptyState`.
 */
export interface TileGridEmptyStateProps {
  /** Total count of tiles placed in the active workspace. */
  totalCount: number;
  /** Count of tiles after applying active filter and search criteria. */
  filteredCount: number;
  /** Callback to clear/reset all active search and filter criteria. */
  onResetFilters: () => void;
}

/**
 * Component handling empty workspace and empty search result illustrations.
 */
export function TileGridEmptyState({
  totalCount,
  filteredCount,
  onResetFilters,
}: TileGridEmptyStateProps) {
  // Empty workspace (no tiles added yet)
  if (totalCount === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">No tiles in this workspace</h2>
          <p className="mt-2 text-muted-foreground">
            Click &quot;New URL&quot; in the toolbar to add a URL and create a
            tile.
          </p>
        </div>
      </div>
    );
  }

  // Workspace has tiles, but current filters matched none
  if (filteredCount === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold">No matching tiles</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No tiles matched your search criteria or active filters.
          </p>
          <Button
            variant="outline"
            className="mt-4 cursor-pointer"
            onClick={onResetFilters}
          >
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
