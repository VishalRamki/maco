/**
 * @file WorkspaceDialogs.tsx
 * @description Modal dialogs for creating a new workspace and renaming an existing active workspace.
 */

import { useState } from "react";
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
import { useUrlStore } from "@/store/useUrlStore";
import { toast } from "sonner";

/**
 * Prop interface for `WorkspaceDialogs`.
 */
export interface WorkspaceDialogsProps {
  /** Controlled open state for the Create Workspace dialog. */
  createOpen: boolean;
  /** State updater callback for the Create Workspace dialog. */
  onCreateOpenChange: (open: boolean) => void;
  /** Controlled open state for the Edit/Rename Workspace dialog. */
  editOpen: boolean;
  /** State updater callback for the Edit/Rename Workspace dialog. */
  onEditOpenChange: (open: boolean) => void;
}

interface EditWorkspaceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  activeWorkspaceId: string;
}

function EditWorkspaceForm({
  open,
  onOpenChange,
  currentName,
  activeWorkspaceId,
}: EditWorkspaceFormProps) {
  const [editWorkspaceName, setEditWorkspaceName] = useState(currentName);
  const renameWorkspace = useUrlStore((state) => state.renameWorkspace);

  const handleRenameWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editWorkspaceName.trim();
    if (!trimmed || !activeWorkspaceId) return;
    renameWorkspace(activeWorkspaceId, trimmed);
    onOpenChange(false);
    toast.success("Workspace renamed");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form onSubmit={handleRenameWorkspace}>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Workspace Name</AlertDialogTitle>
            <AlertDialogDescription>
              Change the name of the current active workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <input
              type="text"
              placeholder="Workspace name..."
              value={editWorkspaceName}
              onChange={(e) => setEditWorkspaceName(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit">Save</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Component housing the creation and rename modal forms for workspaces.
 */
export function WorkspaceDialogs({
  createOpen,
  onCreateOpenChange,
  editOpen,
  onEditOpenChange,
}: WorkspaceDialogsProps) {
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const workspaces = useUrlStore((state) => state.workspaces);
  const activeWorkspaceId = useUrlStore((state) => state.activeWorkspaceId);
  const createWorkspace = useUrlStore((state) => state.createWorkspace);

  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newWorkspaceName.trim();
    if (!trimmed) return;
    createWorkspace(trimmed);
    setNewWorkspaceName("");
    onCreateOpenChange(false);
    toast.success("Workspace created");
  };

  return (
    <>
      {/* New Workspace Modal */}
      <AlertDialog open={createOpen} onOpenChange={onCreateOpenChange}>
        <AlertDialogContent>
          <form onSubmit={handleCreateWorkspace}>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Workspace</AlertDialogTitle>
              <AlertDialogDescription>
                Give your new workspace a name to organize your tile layouts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <input
                type="text"
                placeholder="Workspace name..."
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit">Create</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Workspace Modal */}
      {editOpen && currentWorkspace && (
        <EditWorkspaceForm
          open={editOpen}
          onOpenChange={onEditOpenChange}
          currentName={currentWorkspace.name}
          activeWorkspaceId={activeWorkspaceId}
        />
      )}
    </>
  );
}
