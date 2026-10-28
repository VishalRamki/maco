import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUrlStore } from "@/store/useUrlStore";
import { Search, Plus, Check } from "lucide-react";
import { toast } from "sonner";

interface AddExistingTileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddExistingTileDialog({
  open,
  onOpenChange,
}: AddExistingTileDialogProps) {
  const [search, setSearch] = useState("");
  const tiles = useUrlStore((state) => state.tiles);
  const workspaces = useUrlStore((state) => state.workspaces);
  const activeWorkspaceId = useUrlStore((state) => state.activeWorkspaceId);
  const copyTileToWorkspace = useUrlStore((state) => state.copyTileToWorkspace);

  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const activeWorkspaceItemIds = new Set(
    currentWorkspace?.items.map((i) => i.id) || [],
  );

  const allTiles = Object.values(tiles);

  const filteredTiles = allTiles.filter((tile) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      tile.title?.toLowerCase().includes(q) ||
      tile.url.toLowerCase().includes(q) ||
      tile.author?.toLowerCase().includes(q) ||
      tile.category?.toLowerCase().includes(q)
    );
  });

  const handleAddExisting = (tileId: number, title?: string) => {
    if (activeWorkspaceItemIds.has(tileId)) {
      toast.info("This tile is already in the current workspace");
      return;
    }
    copyTileToWorkspace(tileId, activeWorkspaceId);
    toast.success(`Added "${title || "Tile"}" to workspace`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add from Existing Library</DialogTitle>
          <DialogDescription>
            Select saved tiles from your global library to add to &quot;
            {currentWorkspace?.name}&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search existing tiles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-3 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[50vh] divide-y divide-border/40 pr-1">
          {allTiles.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No tiles exist in your global library yet.
            </div>
          ) : filteredTiles.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No tiles match your search.
            </div>
          ) : (
            filteredTiles.map((tile) => {
              const isInWorkspace = activeWorkspaceItemIds.has(tile.id);
              return (
                <div
                  key={tile.id}
                  className="flex items-center justify-between py-3 gap-3 hover:bg-muted/30 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {tile.thumbnailUrl ? (
                      <img
                        src={tile.thumbnailUrl}
                        alt=""
                        className="size-10 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="size-10 rounded bg-muted flex items-center justify-center shrink-0 text-xs font-semibold">
                        {tile.platform?.toUpperCase().slice(0, 3) || "URL"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">
                        {tile.title || tile.url}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {tile.author || tile.platform}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant={isInWorkspace ? "outline" : "default"}
                    size="sm"
                    className="h-8 text-xs gap-1.5 shrink-0 cursor-pointer"
                    onClick={() => handleAddExisting(tile.id, tile.title)}
                    disabled={isInWorkspace}
                  >
                    {isInWorkspace ? (
                      <>
                        <Check className="size-3.5" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="size-3.5" /> Add
                      </>
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
