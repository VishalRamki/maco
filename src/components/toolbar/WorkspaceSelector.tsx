/**
 * @file WorkspaceSelector.tsx
 * @description Workspace switcher dropdown allowing switching, deleting, renaming, and creating workspaces.
 */

import { LayoutGrid, X, Pencil, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUrlStore } from "@/store/useUrlStore";

/**
 * Prop interface for `WorkspaceSelector`.
 */
export interface WorkspaceSelectorProps {
  /** Callback to open the new workspace dialog modal. */
  onNewWorkspace: () => void;
  /** Callback to open the edit/rename workspace dialog modal. */
  onEditWorkspace: () => void;
}

/**
 * Component displaying the current workspace dropdown and management options.
 */
export function WorkspaceSelector({
  onNewWorkspace,
  onEditWorkspace,
}: WorkspaceSelectorProps) {
  const workspaces = useUrlStore((state) => state.workspaces);
  const activeWorkspaceId = useUrlStore((state) => state.activeWorkspaceId);
  const setActiveWorkspace = useUrlStore((state) => state.setActiveWorkspace);
  const deleteWorkspace = useUrlStore((state) => state.deleteWorkspace);

  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-8 text-xs font-medium shadow-xs hover:bg-accent hover:text-accent-foreground gap-2 cursor-pointer"
        aria-label="Select Workspace"
      >
        <LayoutGrid className="size-3.5 text-muted-foreground" />
        <span className="max-w-30 truncate">
          {currentWorkspace?.name || "Workspace"}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuGroup>
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => setActiveWorkspace(ws.id)}
              className={`justify-between text-xs cursor-pointer ${
                ws.id === activeWorkspaceId ? "font-bold bg-muted/50" : ""
              }`}
            >
              <span className="truncate">{ws.name}</span>
              {workspaces.length > 1 && ws.id === activeWorkspaceId && (
                <span
                  role="button"
                  tabIndex={0}
                  className="text-muted-foreground hover:text-destructive ml-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteWorkspace(ws.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      deleteWorkspace(ws.id);
                    }
                  }}
                  aria-label={`Delete workspace ${ws.name}`}
                >
                  <X className="size-3" />
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onEditWorkspace}
          className="gap-2 text-xs cursor-pointer"
        >
          <Pencil className="size-3.5" /> Edit Current Workspace
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onNewWorkspace}
          className="gap-2 text-xs cursor-pointer"
        >
          <Plus className="size-3.5" /> New Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
