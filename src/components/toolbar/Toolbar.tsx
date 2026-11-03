/**
 * @file Toolbar.tsx
 * @description Main top toolbar orchestrator coordinating menus, workspaces, search, filters, and window controls.
 */

import { useState } from "react";
import { AppMenu } from "./AppMenu";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { FilterBar } from "./FilterBar";
import { WindowControls } from "./WindowControls";
import { WorkspaceDialogs } from "./WorkspaceDialogs";
import { ResetLayoutDialog } from "./ResetLayoutDialog";
import { AddUrlDialog } from "@/components/AddUrlDialog";
import { AddExistingTileDialog } from "@/components/AddExistingTileDialog";
import { SettingsDialog } from "@/components/SettingsDialog";

/**
 * Top application header providing navigation, workspace selection, filtering, and desktop controls.
 */
export function Toolbar() {
  const [addUrlOpen, setAddUrlOpen] = useState(false);
  const [addExistingOpen, setAddExistingOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [newWorkspaceModalOpen, setNewWorkspaceModalOpen] = useState(false);
  const [editWorkspaceModalOpen, setEditWorkspaceModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background app-drag">
        <div className="flex h-14 items-center justify-between px-4 gap-4">
          <div className="flex items-center gap-3 shrink-0 app-no-drag">
            <AppMenu
              onNewTile={() => setAddUrlOpen(true)}
              onAddExistingTile={() => setAddExistingOpen(true)}
              onResetLayout={() => setResetConfirmOpen(true)}
            />
            <WorkspaceSelector
              onNewWorkspace={() => setNewWorkspaceModalOpen(true)}
              onEditWorkspace={() => setEditWorkspaceModalOpen(true)}
            />
          </div>

          <FilterBar />

          <WindowControls />
        </div>
      </header>

      {/* Global Dialogs */}
      <AddUrlDialog open={addUrlOpen} onOpenChange={setAddUrlOpen} />
      <AddExistingTileDialog
        open={addExistingOpen}
        onOpenChange={setAddExistingOpen}
      />
      <SettingsDialog />

      {/* Workspace Dialogs */}
      <WorkspaceDialogs
        createOpen={newWorkspaceModalOpen}
        onCreateOpenChange={setNewWorkspaceModalOpen}
        editOpen={editWorkspaceModalOpen}
        onEditOpenChange={setEditWorkspaceModalOpen}
      />

      {/* Reset Layout Confirmation */}
      <ResetLayoutDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
      />
    </>
  );
}
