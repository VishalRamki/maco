/**
 * @file FilterBar.tsx
 * @description Search input and multi-facet filtering bar for categories, platforms, and tags.
 */

import { useMemo } from "react";
import { Search, X } from "lucide-react";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";
import { useUrlStore } from "@/store/useUrlStore";

/**
 * Component providing search and multi-select filtering controls in the toolbar.
 */
export function FilterBar() {
  const tiles = useUrlStore((state) => state.tiles);
  const searchQuery = useUrlStore((state) => state.searchQuery);
  const setSearchQuery = useUrlStore((state) => state.setSearchQuery);

  const selectedCategories = useUrlStore((state) => state.selectedCategories);
  const setSelectedCategories = useUrlStore(
    (state) => state.setSelectedCategories,
  );

  const selectedPlatforms = useUrlStore((state) => state.selectedPlatforms);
  const setSelectedPlatforms = useUrlStore(
    (state) => state.setSelectedPlatforms,
  );

  const selectedTags = useUrlStore((state) => state.selectedTags);
  const setSelectedTags = useUrlStore((state) => state.setSelectedTags);

  const resetFilters = useUrlStore((state) => state.resetFilters);

  // Derive distinct options from all known tiles
  const { categories, platforms, tags } = useMemo(() => {
    const list = Object.values(tiles);
    return {
      categories: Array.from(
        new Set(list.map((u) => u.category).filter(Boolean)),
      ) as string[],
      platforms: Array.from(
        new Set(list.map((u) => u.platform).filter(Boolean)),
      ) as string[],
      tags: Array.from(
        new Set(list.flatMap((u) => u.tags || []).filter(Boolean)),
      ) as string[],
    };
  }, [tiles]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategories.length > 0 ||
    selectedPlatforms.length > 0 ||
    selectedTags.length > 0;

  return (
    <div className="flex items-center gap-2 flex-1 max-w-2xl mx-auto app-no-drag">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search title, author, tags, description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-8 pl-8 pr-8 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Search tiles"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Clear search text"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {platforms.length > 0 && (
        <MultiSelectFilter
          title="Platform"
          options={platforms}
          selected={selectedPlatforms}
          onChange={setSelectedPlatforms}
        />
      )}

      {categories.length > 0 && (
        <MultiSelectFilter
          title="Category"
          options={categories}
          selected={selectedCategories}
          onChange={setSelectedCategories}
        />
      )}

      {tags.length > 0 && (
        <MultiSelectFilter
          title="Tags"
          options={tags}
          selected={selectedTags}
          onChange={setSelectedTags}
        />
      )}

      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="text-xs text-muted-foreground hover:text-foreground underline shrink-0 cursor-pointer"
        >
          Clear
        </button>
      )}
    </div>
  );
}
