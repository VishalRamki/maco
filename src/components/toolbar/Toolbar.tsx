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
import { FactoryResetDialog } from "./FactoryResetDialog";
import { AddUrlDialog } from "@/components/AddUrlDialog";
import { AddExistingTileDialog } from "@/components/AddExistingTileDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { SetupWizardDialog } from "@/components/SetupWizardDialog";
import { ConnectionStatusIndicator } from "@/components/ConnectionStatusIndicator";

/**
 * Props for the Toolbar component.
 */
export interface ToolbarProps {
  /** Callback to open the setup wizard for changing modes. */
  onOpenSetupWizard?: () => void;
  /** Callback to perform a factory reset of all app data. */
  onFactoryReset?: () => void;
}

/**
 * Top application header providing navigation, workspace selection, filtering, and desktop controls.
 */
export function Toolbar({ onOpenSetupWizard, onFactoryReset }: ToolbarProps) {
  const [addUrlOpen, setAddUrlOpen] = useState(false);
  const [addExistingOpen, setAddExistingOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [newWorkspaceModalOpen, setNewWorkspaceModalOpen] = useState(false);
  const [editWorkspaceModalOpen, setEditWorkspaceModalOpen] = useState(false);
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);
  const [factoryResetOpen, setFactoryResetOpen] = useState(false);

  const handleOpenSetupWizard = () => {
    if (onOpenSetupWizard) {
      onOpenSetupWizard();
    } else {
      setSetupWizardOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background app-drag">
        <div className="flex h-14 items-center justify-between px-4 gap-4">
          <div className="flex items-center gap-3 shrink-0 app-no-drag">
            <AppMenu
              onNewTile={() => setAddUrlOpen(true)}
              onAddExistingTile={() => setAddExistingOpen(true)}
              onResetLayout={() => setResetConfirmOpen(true)}
              onChangeMode={handleOpenSetupWizard}
              onFactoryReset={() => setFactoryResetOpen(true)}
            />
            <WorkspaceSelector
              onNewWorkspace={() => setNewWorkspaceModalOpen(true)}
              onEditWorkspace={() => setEditWorkspaceModalOpen(true)}
            />
          </div>

          <FilterBar />

          <div className="flex items-center gap-2 shrink-0 app-no-drag">
            <ConnectionStatusIndicator />
            <WindowControls />
          </div>
        </div>
      </header>

      {/* Global Dialogs */}
      <AddUrlDialog open={addUrlOpen} onOpenChange={setAddUrlOpen} />
      <AddExistingTileDialog
        open={addExistingOpen}
        onOpenChange={setAddExistingOpen}
      />
      <SettingsDialog />
      <SetupWizardDialog
        open={setupWizardOpen}
        onOpenChange={setSetupWizardOpen}
      />

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

      {/* Factory Reset Confirmation */}
      <FactoryResetDialog
        open={factoryResetOpen}
        onOpenChange={setFactoryResetOpen}
        onConfirm={() => {
          onFactoryReset?.();
          setFactoryResetOpen(false);
        }}
      />
    </>
  );
}
