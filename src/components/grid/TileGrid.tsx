/**
 * @file TileGrid.tsx
 * @description Main grid orchestrator wiring ReactGridLayout with tile cards, modal overlays, and empty states.
 */

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import ReactGridLayout, { WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { TileCard } from "./TileCard";
import { MaximizedTileModal } from "./MaximizedTileModal";
import { DeleteTileDialog, type TileToDeleteInfo } from "./DeleteTileDialog";
import { TileGridEmptyState } from "./TileGridEmptyState";
import { useUrlStore } from "@/store/useUrlStore";
import { useModeStore } from "@/store/useModeStore";
import { useFilteredTiles } from "@/hooks/useFilteredTiles";
import { toast } from "sonner";
import type { GridLayoutItem } from "@/types";

const ResponsiveReactGridLayout = WidthProvider(ReactGridLayout);

/**
 * Grid component responsible for multi-column responsive layout rendering and tile interactions.
 */
export function TileGrid() {
  const workspaces = useUrlStore((state) => state.workspaces);
  const activeWorkspaceId = useUrlStore((state) => state.activeWorkspaceId);
  const removeUrl = useUrlStore((state) => state.removeUrl);
  const removeTileFromWorkspace = useUrlStore(
    (state) => state.removeTileFromWorkspace,
  );
  const updateLayouts = useUrlStore((state) => state.updateLayouts);
  const copyTileToWorkspace = useUrlStore((state) => state.copyTileToWorkspace);
  const moveTileToWorkspace = useUrlStore((state) => state.moveTileToWorkspace);
  const resetFilters = useUrlStore((state) => state.resetFilters);

  const mode = useModeStore((state) => state.mode);
  const connectionStatus = useModeStore((state) => state.connectionStatus);
  const isServerDisconnected = mode === "server" && connectionStatus === "disconnected";

  const { allWorkspaceTiles, filteredTiles, totalCount, filteredCount } =
    useFilteredTiles();

  const [maximizedId, setMaximizedId] = useState<number | null>(null);
  const [tileToDelete, setTileToDelete] = useState<TileToDeleteInfo | null>(
    null,
  );

  const otherWorkspaces = workspaces.filter(
    (ws) => ws.id !== activeWorkspaceId,
  );

  // Derive typed layout contracts for react-grid-layout
  const layout: GridLayoutItem[] = filteredTiles.map((item) => ({
    i: item.id.toString(),
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: 2,
    minH: 3,
  }));

  const handleLayoutChange = (newLayout: readonly GridLayoutItem[]) => {
    if (isServerDisconnected) {
      toast.error("Cannot save layout: server is unreachable");
      return;
    }
    updateLayouts(newLayout);
  };

  const handleCopyTile = (
    tileId: number,
    targetWsId: string,
    wsName: string,
  ) => {
    copyTileToWorkspace(tileId, targetWsId);
    toast.success(`Copied tile to "${wsName}"`);
  };

  const handleMoveTile = (
    tileId: number,
    targetWsId: string,
    wsName: string,
  ) => {
    moveTileToWorkspace(tileId, targetWsId);
    toast.success(`Moved tile to "${wsName}"`);
  };

  const maximizedItem =
    allWorkspaceTiles.find((item) => item.id === maximizedId) || null;

  const handleRemoveFromWorkspace = () => {
    if (!tileToDelete) return;
    removeTileFromWorkspace(tileToDelete.id, activeWorkspaceId);
    if (tileToDelete.isMaximized) {
      setMaximizedId(null);
    }
    setTileToDelete(null);
    toast.success("Removed tile from workspace");
  };

  const handleDeleteCompletely = () => {
    if (!tileToDelete) return;
    removeUrl(tileToDelete.id);
    if (tileToDelete.isMaximized) {
      setMaximizedId(null);
    }
    setTileToDelete(null);
    toast.success("Deleted tile completely");
  };

  return (
    <main className="w-full min-h-137.5 flex-1 bg-muted/30 p-4 relative overflow-y-auto">
      {/* Server Disconnected Warning Banner */}
      {isServerDisconnected && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            Server is unreachable. Changes cannot be synced until the connection is restored.
          </span>
        </div>
      )}

      {/* Fullscreen Maximized Modal */}
      <MaximizedTileModal
        tile={maximizedItem}
        onClose={() => setMaximizedId(null)}
        onDeleteClick={(tile) =>
          setTileToDelete({
            id: tile.id,
            titleOrUrl: tile.title ?? tile.url,
            isMaximized: true,
          })
        }
      />

      {/* Empty States */}
      <TileGridEmptyState
        totalCount={totalCount}
        filteredCount={filteredCount}
        onResetFilters={resetFilters}
      />

      {/* Grid Layout Canvas */}
      {filteredCount > 0 && (
        <ResponsiveReactGridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={60}
          draggableHandle=".drag-handle"
          onLayoutChange={handleLayoutChange}
          isResizable={!isServerDisconnected}
          isDraggable={!isServerDisconnected}
        >
          {filteredTiles.map((item) => (
            <TileCard
              key={item.id.toString()}
              tile={item}
              otherWorkspaces={otherWorkspaces}
              onMaximize={(id) => setMaximizedId(id)}
              onDeleteClick={(tile) =>
                setTileToDelete({
                  id: tile.id,
                  titleOrUrl: tile.title ?? tile.url,
                  isMaximized: false,
                })
              }
              onCopyTile={handleCopyTile}
              onMoveTile={handleMoveTile}
            />
          ))}
        </ResponsiveReactGridLayout>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteTileDialog
        tileToDelete={tileToDelete}
        onClose={() => setTileToDelete(null)}
        onRemoveFromWorkspace={handleRemoveFromWorkspace}
        onDeleteCompletely={handleDeleteCompletely}
      />
    </main>
  );
}
