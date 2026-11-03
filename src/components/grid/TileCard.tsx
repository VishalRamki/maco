/**
 * @file TileCard.tsx
 * @description Grid item container component wrapping tile header controls and media embedding.
 */

import React from "react";
import { TileHeader } from "./TileHeader";
import { TileEmbed } from "@/components/TileEmbed";
import { cn } from "@/lib/utils";
import type { ActiveTileItem, Workspace } from "@/types";

/**
 * Prop interface for `TileCard`.
 */
export interface TileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The tile data to render. */
  tile: ActiveTileItem;
  /** Available alternative workspaces for copy/move actions. */
  otherWorkspaces: Workspace[];
  /** Handler to maximize the tile. */
  onMaximize: (tileId: number) => void;
  /** Handler when clicking the delete button. */
  onDeleteClick: (tile: ActiveTileItem) => void;
  /** Handler to copy tile to a destination workspace. */
  onCopyTile: (tileId: number, targetWsId: string, wsName: string) => void;
  /** Handler to move tile to a destination workspace. */
  onMoveTile: (tileId: number, targetWsId: string, wsName: string) => void;
}

/**
 * Individual tile card rendered inside the ReactGridLayout container.
 */
export const TileCard = React.forwardRef<HTMLDivElement, TileCardProps>(
  (
    {
      tile,
      otherWorkspaces,
      onMaximize,
      onDeleteClick,
      onCopyTile,
      onMoveTile,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          "group relative flex flex-col bg-card text-card-foreground rounded-xl border border-border overflow-hidden shadow-md",
          className,
        )}
        {...rest}
      >
        <TileHeader
          tile={tile}
          otherWorkspaces={otherWorkspaces}
          onMaximize={onMaximize}
          onDeleteClick={onDeleteClick}
          onCopyTile={onCopyTile}
          onMoveTile={onMoveTile}
        />
        <div className="bg-background flex-1 overflow-hidden flex flex-col w-full h-full">
          <TileEmbed
            url={tile.url}
            platform={tile.platform}
            title={tile.title}
          />
        </div>
      </div>
    );
  },
);

TileCard.displayName = "TileCard";
