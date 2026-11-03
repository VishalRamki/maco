/**
 * @file TileHeader.tsx
 * @description Card header bar with drag handle, title, copy/move workspace menu, maximize, and delete buttons.
 */

import {
  GripHorizontal,
  Maximize2,
  MoreVertical,
  Copy,
  ArrowRightLeft,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ActiveTileItem, Workspace } from "@/types";

/**
 * Prop interface for `TileHeader`.
 */
export interface TileHeaderProps {
  /** The tile item data being rendered. */
  tile: ActiveTileItem;
  /** List of other workspaces available for copy/move actions. */
  otherWorkspaces: Workspace[];
  /** Handler to maximize this tile into fullscreen overlay. */
  onMaximize: (tileId: number) => void;
  /** Handler when user clicks the delete button. */
  onDeleteClick: (tile: ActiveTileItem) => void;
  /** Handler to copy tile to a destination workspace. */
  onCopyTile: (tileId: number, targetWsId: string, wsName: string) => void;
  /** Handler to move tile to a destination workspace. */
  onMoveTile: (tileId: number, targetWsId: string, wsName: string) => void;
}

/**
 * Header component appearing on hover above each grid tile card.
 */
export function TileHeader({
  tile,
  otherWorkspaces,
  onMaximize,
  onDeleteClick,
  onCopyTile,
  onMoveTile,
}: TileHeaderProps) {
  return (
    <div className="drag-handle absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2 bg-background/80 backdrop-blur-md border-b border-border/40 shrink-0 gap-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <GripHorizontal className="size-4 text-muted-foreground shrink-0" />
      <span
        className="truncate text-xs font-medium text-muted-foreground flex-1"
        title={tile.url}
      >
        {tile.title ?? tile.url}
      </span>
      <div className="flex items-center gap-1">
        {/* Actions Dropdown for Copy/Move */}
        {otherWorkspaces.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center rounded-md size-6 text-muted-foreground hover:text-foreground shrink-0 bg-background/50 hover:bg-background cursor-pointer"
              aria-label="Tile actions"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 text-xs cursor-pointer">
                  <Copy className="size-3.5" /> Copy to Workspace
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {otherWorkspaces.map((ws) => (
                      <DropdownMenuItem
                        key={ws.id}
                        onClick={() => onCopyTile(tile.id, ws.id, ws.name)}
                        className="text-xs cursor-pointer"
                      >
                        {ws.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 text-xs cursor-pointer">
                  <ArrowRightLeft className="size-3.5" /> Move to Workspace
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {otherWorkspaces.map((ws) => (
                      <DropdownMenuItem
                        key={ws.id}
                        onClick={() => onMoveTile(tile.id, ws.id, ws.name)}
                        className="text-xs cursor-pointer"
                      >
                        {ws.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground hover:text-foreground shrink-0 bg-background/50 hover:bg-background cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onMaximize(tile.id);
          }}
          title="Maximize"
          aria-label="Maximize tile"
        >
          <Maximize2 className="size-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground hover:text-destructive shrink-0 bg-background/50 hover:bg-background cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick(tile);
          }}
          title="Delete"
          aria-label="Delete tile"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
