/**
 * @file AppMenu.tsx
 * @description Main application branding menu with file import/export, tile creation triggers, layout reset, and settings.
 */

import { useRef } from "react";
import {
  Save,
  FolderOpen,
  ImagePlus,
  Settings,
  RotateCcw,
  Library,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUrlStore } from "@/store/useUrlStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { toast } from "sonner";

/**
 * Prop interface for `AppMenu`.
 */
export interface AppMenuProps {
  /** Callback triggered when user chooses to create a new URL tile. */
  onNewTile: () => void;
  /** Callback triggered when user chooses to add a tile from the existing library. */
  onAddExistingTile: () => void;
  /** Callback triggered when user requests layout reset confirmation. */
  onResetLayout: () => void;
  /** Callback triggered when user wants to change the app mode. */
  onChangeMode: () => void;
  /** Callback triggered when user requests factory reset confirmation. */
  onFactoryReset: () => void;
}

/**
 * Component rendering the logo dropdown menu and handling workspace import/export.
 */
export function AppMenu({
  onNewTile,
  onAddExistingTile,
  onResetLayout,
  onChangeMode,
  onFactoryReset,
}: AppMenuProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToJson = useUrlStore((state) => state.exportToJson);
  const importFromJson = useUrlStore((state) => state.importFromJson);
  const setSettingsOpen = useSettingsStore((state) => state.setIsOpen);

  const handleExport = () => {
    try {
      const jsonString = exportToJson();
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `maco-workspaces-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Workspaces exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export workspaces");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const success = importFromJson(content);
        if (success) {
          toast.success("Workspaces imported successfully");
        } else {
          toast.error("Failed to import: Invalid JSON structure.");
        }
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer" aria-label="Application Menu">
          <img
            src="/maco_brand_asset.png"
            alt="Maco Logo"
            className="h-8 w-auto object-contain"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={onNewTile}
              className="gap-2 text-xs cursor-pointer"
            >
              <ImagePlus className="size-3.5" /> New URL
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onAddExistingTile}
              className="gap-2 text-xs cursor-pointer"
            >
              <Library className="size-3.5" /> Add from Existing
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={handleExport}
              className="gap-2 text-xs cursor-pointer"
            >
              <Save className="size-3.5" /> Export Workspaces
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 text-xs cursor-pointer"
            >
              <FolderOpen className="size-3.5" /> Import Workspaces
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onResetLayout}
              className="gap-2 text-xs cursor-pointer"
            >
              <RotateCcw className="size-3.5" /> Reset Layout
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSettingsOpen(true)}
              className="gap-2 text-xs cursor-pointer"
            >
              <Settings className="size-3.5" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onChangeMode}
              className="gap-2 text-xs cursor-pointer"
            >
              <SlidersHorizontal className="size-3.5" /> Change Mode
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onFactoryReset}
              className="gap-2 text-xs cursor-pointer text-destructive"
            >
              <Trash2 className="size-3.5" /> Factory Reset
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
        aria-hidden="true"
      />
    </>
  );
}
