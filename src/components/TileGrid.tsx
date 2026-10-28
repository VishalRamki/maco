import { useState } from "react";
import { useUrlStore } from "@/store/useUrlStore";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import {
  X,
  GripHorizontal,
  Maximize2,
  Minimize2,
  MoreVertical,
  Copy,
  ArrowRightLeft,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ReactGridLayout, { WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { TileEmbed } from "./TileEmbed";
import { toast } from "sonner";

const ResponsiveReactGridLayout = WidthProvider(ReactGridLayout);

export function TileGrid() {
  const tiles = useUrlStore((state) => state.tiles);
  const workspaces = useUrlStore((state) => state.workspaces);
  const activeWorkspaceId = useUrlStore((state) => state.activeWorkspaceId);
  const removeUrl = useUrlStore((state) => state.removeUrl);
  const updateLayouts = useUrlStore((state) => state.updateLayouts);
  const copyTileToWorkspace = useUrlStore((state) => state.copyTileToWorkspace);
  const moveTileToWorkspace = useUrlStore((state) => state.moveTileToWorkspace);

  const searchQuery = useUrlStore((state) => state.searchQuery);
  const selectedCategories = useUrlStore((state) => state.selectedCategories);
  const selectedPlatforms = useUrlStore((state) => state.selectedPlatforms);
  const selectedTags = useUrlStore((state) => state.selectedTags);
  const resetFilters = useUrlStore((state) => state.resetFilters);

  const [maximizedId, setMaximizedId] = useState<string | number | null>(null);
  const [tileToDelete, setTileToDelete] = useState<{
    id: number;
    titleOrUrl: string;
    isMaximized?: boolean;
  } | null>(null);

  const currentWorkspace =
    workspaces.find((ws) => ws.id === activeWorkspaceId) || workspaces[0];
  const workspaceItems = currentWorkspace?.items || [];
  const otherWorkspaces = workspaces.filter(
    (ws) => ws.id !== activeWorkspaceId,
  );

  const activeUrls = workspaceItems
    .map((wi) => ({ ...tiles[wi.id], ...wi }))
    .filter((item) => item && item.url);

  const filteredUrls = activeUrls.filter((item) => {
    if (
      selectedPlatforms.length > 0 &&
      !selectedPlatforms.some(
        (p) => p.toLowerCase() === item.platform?.toLowerCase(),
      )
    ) {
      return false;
    }

    if (
      selectedCategories.length > 0 &&
      !selectedCategories.some(
        (c) => c.toLowerCase() === item.category?.toLowerCase(),
      )
    ) {
      return false;
    }

    if (
      selectedTags.length > 0 &&
      !item.tags?.some((t) =>
        selectedTags.some((st) => st.toLowerCase() === t.toLowerCase()),
      )
    ) {
      return false;
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      item.title?.toLowerCase().includes(q) ||
      item.url.toLowerCase().includes(q) ||
      item.author?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.platform?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const layout = filteredUrls.map((item) => ({
    i: item.id.toString(),
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: 2,
    minH: 3,
  }));

  const handleLayoutChange = (newLayout: any) => {
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

  const maximizedItem = activeUrls.find((item) => item.id === maximizedId);

  const handleDeleteConfirmed = () => {
    if (!tileToDelete) return;
    removeUrl(tileToDelete.id);
    if (tileToDelete.isMaximized) {
      setMaximizedId(null);
    }
    setTileToDelete(null);
  };

  return (
    <main className="w-full min-h-137.5 flex-1 bg-muted/30 p-4 relative overflow-y-auto">
      {maximizedItem && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
          <div className="w-full h-full max-w-7xl max-h-[90vh] flex flex-col bg-card text-card-foreground rounded-2xl border border-border overflow-hidden shadow-2xl relative group">
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between border-b border-border/40 px-4 py-3 bg-background/80 backdrop-blur-md shrink-0 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span
                className="truncate font-semibold text-sm text-foreground"
                title={maximizedItem.url}
              >
                {maximizedItem.title ?? maximizedItem.url}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 bg-background/50 hover:bg-background cursor-pointer"
                  onClick={() => setMaximizedId(null)}
                >
                  <Minimize2 className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 bg-background/50 hover:bg-background cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTileToDelete({
                      id: maximizedItem.id,
                      titleOrUrl: maximizedItem.title ?? maximizedItem.url,
                      isMaximized: true,
                    });
                  }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
            <div className="bg-background flex-1 overflow-hidden flex flex-col w-full h-full">
              <TileEmbed
                url={maximizedItem.url}
                platform={maximizedItem.platform}
                title={maximizedItem.title}
              />
            </div>
          </div>
        </div>
      )}

      {workspaceItems.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">
              No tiles in this workspace
            </h2>
            <p className="mt-2 text-muted-foreground">
              Click &quot;Add&quot; in the toolbar to add a URL and create a
              tile.
            </p>
          </div>
        </div>
      ) : filteredUrls.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center max-w-sm">
            <h2 className="text-xl font-semibold">No matching tiles</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              No tiles matched your search criteria or active filters.
            </p>
            <Button
              variant="outline"
              className="mt-4 cursor-pointer"
              onClick={resetFilters}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      ) : (
        <ResponsiveReactGridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={60}
          draggableHandle=".drag-handle"
          onLayoutChange={handleLayoutChange}
          isResizable={true}
          isDraggable={true}
        >
          {filteredUrls.map((item) => (
            <div
              key={item.id.toString()}
              className="group relative flex flex-col bg-card text-card-foreground rounded-xl border border-border overflow-hidden shadow-md"
            >
              <div className="drag-handle absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2 bg-background/80 backdrop-blur-md border-b border-border/40 shrink-0 gap-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <GripHorizontal className="size-4 text-muted-foreground shrink-0" />
                <span
                  className="truncate text-xs font-medium text-muted-foreground flex-1"
                  title={item.url}
                >
                  {item.title ?? item.url}
                </span>
                <div className="flex items-center gap-1">
                  {/* Actions Dropdown for Copy/Move */}
                  {otherWorkspaces.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md size-6 text-muted-foreground hover:text-foreground shrink-0 bg-background/50 hover:bg-background cursor-pointer">
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
                                  onClick={() =>
                                    handleCopyTile(item.id, ws.id, ws.name)
                                  }
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
                            <ArrowRightLeft className="size-3.5" /> Move to
                            Workspace
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              {otherWorkspaces.map((ws) => (
                                <DropdownMenuItem
                                  key={ws.id}
                                  onClick={() =>
                                    handleMoveTile(item.id, ws.id, ws.name)
                                  }
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
                    className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0 bg-background/50 hover:bg-background cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMaximizedId(item.id);
                    }}
                  >
                    <Maximize2 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0 bg-background/50 hover:bg-background cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTileToDelete({
                        id: item.id,
                        titleOrUrl: item.title ?? item.url,
                      });
                    }}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="bg-background flex-1 overflow-hidden flex flex-col w-full h-full">
                <TileEmbed
                  url={item.url}
                  platform={item.platform}
                  title={item.title}
                />
              </div>
            </div>
          ))}
        </ResponsiveReactGridLayout>
      )}

      <AlertDialog
        open={!!tileToDelete}
        onOpenChange={(open) => !open && setTileToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this tile?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the tile{" "}
              <span className="font-semibold text-foreground">
                &quot;{tileToDelete?.titleOrUrl}&quot;
              </span>{" "}
              from this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirmed}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
