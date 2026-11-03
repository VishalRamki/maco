/**
 * @file useFilteredTiles.ts
 * @description Custom React hook managing tile filtering by search query, platform, category, and tags.
 */

import { useMemo } from "react";
import { useUrlStore } from "@/store/useUrlStore";
import type { ActiveTileItem, Workspace } from "@/types";

/**
 * Return type contract for the `useFilteredTiles` hook.
 */
export interface FilteredTilesResult {
  /** The currently selected active workspace. */
  currentWorkspace: Workspace | undefined;
  /** All valid tiles positioned in the active workspace before filtering. */
  allWorkspaceTiles: ActiveTileItem[];
  /** Tiles matching the active search query and multi-select filter criteria. */
  filteredTiles: ActiveTileItem[];
  /** Total count of tiles placed in the active workspace. */
  totalCount: number;
  /** Count of tiles after applying active filter criteria. */
  filteredCount: number;
  /** Whether any search query or category/platform/tag filters are active. */
  hasActiveFilters: boolean;
}

/**
 * Hook extracting tiles for the active workspace and applying all user-selected filter criteria.
 *
 * @returns {FilteredTilesResult} Processed list of filtered and unfiltered workspace tiles.
 */
export function useFilteredTiles(): FilteredTilesResult {
  const tiles = useUrlStore((state) => state.tiles);
  const workspaces = useUrlStore((state) => state.workspaces);
  const activeWorkspaceId = useUrlStore((state) => state.activeWorkspaceId);

  const searchQuery = useUrlStore((state) => state.searchQuery);
  const selectedCategories = useUrlStore((state) => state.selectedCategories);
  const selectedPlatforms = useUrlStore((state) => state.selectedPlatforms);
  const selectedTags = useUrlStore((state) => state.selectedTags);

  const currentWorkspace = useMemo(() => {
    return (
      workspaces.find((ws) => ws.id === activeWorkspaceId) || workspaces[0]
    );
  }, [workspaces, activeWorkspaceId]);

  const allWorkspaceTiles = useMemo(() => {
    const items = currentWorkspace?.items || [];
    return items
      .map((wi) => {
        const tileData = tiles[wi.id];
        if (!tileData || !tileData.url) return null;
        return {
          ...tileData,
          ...wi,
        } as ActiveTileItem;
      })
      .filter((item): item is ActiveTileItem => item !== null);
  }, [currentWorkspace, tiles]);

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      selectedCategories.length > 0 ||
      selectedPlatforms.length > 0 ||
      selectedTags.length > 0
    );
  }, [searchQuery, selectedCategories, selectedPlatforms, selectedTags]);

  const filteredTiles = useMemo(() => {
    return allWorkspaceTiles.filter((item) => {
      // Platform filter
      if (
        selectedPlatforms.length > 0 &&
        !selectedPlatforms.some(
          (p) => p.toLowerCase() === item.platform?.toLowerCase(),
        )
      ) {
        return false;
      }

      // Category filter
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.some(
          (c) => c.toLowerCase() === item.category?.toLowerCase(),
        )
      ) {
        return false;
      }

      // Tag filter
      if (
        selectedTags.length > 0 &&
        !item.tags?.some((t) =>
          selectedTags.some((st) => st.toLowerCase() === t.toLowerCase()),
        )
      ) {
        return false;
      }

      // Search query filter
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        item.title?.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.author?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [
    allWorkspaceTiles,
    selectedPlatforms,
    selectedCategories,
    selectedTags,
    searchQuery,
  ]);

  return {
    currentWorkspace,
    allWorkspaceTiles,
    filteredTiles,
    totalCount: allWorkspaceTiles.length,
    filteredCount: filteredTiles.length,
    hasActiveFilters,
  };
}
