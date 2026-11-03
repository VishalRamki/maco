/**
 * @file MaximizedTileModal.tsx
 * @description Fullscreen overlay modal viewer for inspecting an active tile.
 */

import { X, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TileEmbed } from "@/components/TileEmbed";
import type { ActiveTileItem } from "@/types";

/**
 * Prop interface for `MaximizedTileModal`.
 */
export interface MaximizedTileModalProps {
  /** The currently maximized tile, or null if no tile is maximized. */
  tile: ActiveTileItem | null;
  /** Callback to close the maximized view overlay. */
  onClose: () => void;
  /** Callback when user clicks the delete button in the maximized overlay. */
  onDeleteClick: (tile: ActiveTileItem) => void;
}

/**
 * Overlay component displaying a single tile in maximized view with quick controls.
 */
export function MaximizedTileModal({
  tile,
  onClose,
  onDeleteClick,
}: MaximizedTileModalProps) {
  if (!tile) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
      <div className="w-full h-full max-w-7xl max-h-[90vh] flex flex-col bg-card text-card-foreground rounded-2xl border border-border overflow-hidden shadow-2xl relative group">
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between border-b border-border/40 px-4 py-3 bg-background/80 backdrop-blur-md shrink-0 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span
            className="truncate font-semibold text-sm text-foreground"
            title={tile.url}
          >
            {tile.title ?? tile.url}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 bg-background/50 hover:bg-background cursor-pointer"
              onClick={onClose}
              title="Restore"
              aria-label="Restore tile view"
            >
              <Minimize2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 bg-background/50 hover:bg-background cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(tile);
              }}
              title="Delete"
              aria-label="Delete tile"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
        <div className="bg-background flex-1 overflow-hidden flex flex-col w-full h-full">
          <TileEmbed
            url={tile.url}
            platform={tile.platform}
            title={tile.title}
          />
        </div>
      </div>
    </div>
  );
}
