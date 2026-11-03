/**
 * @file AddUrlDialog.tsx
 * @description Dialog modal for inputting a URL, auto-detecting platform, fetching metadata, and placing tile in a workspace.
 */

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreatableMultiSelect } from "@/components/CreatableMultiSelect";
import { useUrlStore } from "@/store/useUrlStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { detectPlatform, platforms } from "@/platforms";
import type { PlatformMetadata } from "@/types";

/**
 * Prop interface for `AddUrlDialog`.
 */
export interface AddUrlDialogProps {
  /** Controlled open state of the dialog. */
  open: boolean;
  /** State updater callback for the dialog. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog allowing users to paste a URL and add it to an existing or active workspace.
 */
export function AddUrlDialog({ open, onOpenChange }: AddUrlDialogProps) {
  const [url, setUrl] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);

  const addUrl = useUrlStore((state) => state.addUrl);
  const workspaces = useUrlStore((state) => state.workspaces);
  const activeWorkspaceId = useUrlStore((state) => state.activeWorkspaceId);
  const tiles = useUrlStore((state) => state.tiles);
  const youtubeApiKey = useSettingsStore(
    (state) => state.settings.youtubeApiKey,
  );

  const targetWorkspaceId = selectedWorkspaceId || activeWorkspaceId;

  // Derive existing categories and tags from all tiles for dropdown options
  const { existingCategories, existingTags } = useMemo(() => {
    const list = Object.values(tiles);
    return {
      existingCategories: Array.from(
        new Set(list.map((u) => u.category).filter(Boolean)),
      ) as string[],
      existingTags: Array.from(
        new Set(list.flatMap((u) => u.tags || []).filter(Boolean)),
      ) as string[],
    };
  }, [tiles]);

  // Reset custom selections when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setCustomCategories([]);
      setCustomTags([]);
      setUrl("");
      setSelectedWorkspaceId(null);
    }
    onOpenChange(isOpen);
  };

  /**
   * Merge custom categories/tags with metadata-provided ones.
   * Custom values take priority: first custom category becomes the main category,
   * remaining custom categories and all custom tags are deduplicated with metadata.
   */
  const mergeMetadata = (
    metadata: PlatformMetadata,
  ): { category?: string; tags?: string[] } => {
    // Category: first custom category, or fall back to metadata's category
    const category = customCategories[0] || metadata.category;

    // Tags: combine remaining custom categories (beyond the first), custom tags, and metadata tags
    const allTags = [
      ...customCategories.slice(1),
      ...customTags,
      ...(metadata.tags || []),
    ];

    // Deduplicate case-insensitively, preserving original casing of the first occurrence
    const seen = new Set<string>();
    const deduplicatedTags = allTags.filter((tag) => {
      const lower = tag.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });

    return {
      category,
      tags: deduplicatedTags.length > 0 ? deduplicatedTags : undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    setIsLoading(true);
    const detected = detectPlatform(trimmedUrl);
    const platform = detected ? detected.platformKey : "unknown";

    let metadata: PlatformMetadata = {};
    if (detected && platforms[platform]) {
      try {
        metadata = await platforms[platform].fetchMetadata(
          trimmedUrl,
          detected.id,
          youtubeApiKey,
        );
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    }

    const merged = mergeMetadata(metadata);

    addUrl(
      {
        url: trimmedUrl,
        platform,
        ...metadata,
        ...merged,
      },
      targetWorkspaceId,
    );

    setIsLoading(false);
    setUrl("");
    setSelectedWorkspaceId(null);
    setCustomCategories([]);
    setCustomTags([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add URL</DialogTitle>
          <DialogDescription>
            Enter a supported video or stream URL and select a workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://www.youtube.com/... or https://www.twitch.tv/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label>Categories</Label>
              <CreatableMultiSelect
                title="Category"
                options={existingCategories}
                selected={customCategories}
                onChange={setCustomCategories}
              />
            </div>

            <div className="grid gap-2">
              <Label>Tags</Label>
              <CreatableMultiSelect
                title="Tags"
                options={existingTags}
                selected={customTags}
                onChange={setCustomTags}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="workspace">Target Workspace</Label>
              <select
                id="workspace"
                value={targetWorkspaceId}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                disabled={isLoading}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!url.trim() || isLoading}>
              {isLoading ? "Fetching..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
