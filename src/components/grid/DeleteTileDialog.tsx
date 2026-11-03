/**
 * @file DeleteTileDialog.tsx
 * @description Confirmation dialog for removing a tile from the active workspace or deleting it entirely.
 */

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * Information describing the tile queued for deletion.
 */
export interface TileToDeleteInfo {
  /** Numeric ID of the target tile. */
  id: number;
  /** Title or URL of the target tile for modal display. */
  titleOrUrl: string;
  /** Whether the tile was currently viewed in maximized overlay. */
  isMaximized?: boolean;
}

/**
 * Prop interface for `DeleteTileDialog`.
 */
export interface DeleteTileDialogProps {
  /** Target tile information or null if closed. */
  tileToDelete: TileToDeleteInfo | null;
  /** Callback to close the deletion dialog without making changes. */
  onClose: () => void;
  /** Handler to remove tile from the active workspace only. */
  onRemoveFromWorkspace: () => void;
  /** Handler to delete tile completely from all workspaces and library. */
  onDeleteCompletely: () => void;
}

/**
 * Dialog prompting user to choose between workspace removal and global tile deletion.
 */
export function DeleteTileDialog({
  tileToDelete,
  onClose,
  onRemoveFromWorkspace,
  onDeleteCompletely,
}: DeleteTileDialogProps) {
  return (
    <AlertDialog
      open={!!tileToDelete}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent className="w-[90vw] max-w-md p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">Delete Tile</AlertDialogTitle>
          <AlertDialogDescription className="text-sm sm:text-base mt-2">
            Are you sure you want to delete &quot;{tileToDelete?.titleOrUrl}
            &quot;?
            <br />
            <br />
            You can remove it just from this workspace or delete it completely
            from all workspaces.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Custom vertical button stack to prevent overflow */}
        <div className="flex flex-col gap-2.5 mt-6">
          <Button
            variant="destructive"
            onClick={onDeleteCompletely}
            className="w-full cursor-pointer"
          >
            Delete Completely
          </Button>
          <Button
            variant="outline"
            onClick={onRemoveFromWorkspace}
            className="w-full cursor-pointer"
          >
            Remove from Workspace
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full cursor-pointer"
          >
            Cancel
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
