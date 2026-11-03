import {
  Save,
  FolderOpen,
  ImagePlus,
  Settings,
  RotateCcw,
  Search,
  X,
  Plus,
  LayoutGrid,
  Pencil,
  Library,
  Minus,
  Square,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { AddUrlDialog } from "@/components/AddUrlDialog";
import { AddExistingTileDialog } from "@/components/AddExistingTileDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";
import { useUrlStore } from "@/store/useUrlStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { toast } from "sonner";

export function Toolbar() {
  const [addUrlOpen, setAddUrlOpen] = useState(false);
  const [addExistingOpen, setAddExistingOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [newWorkspaceModalOpen, setNewWorkspaceModalOpen] = useState(false);
  const [editWorkspaceModalOpen, setEditWorkspaceModalOpen] = useState(false);

  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [editWorkspaceName, setEditWorkspaceName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tauri window controls state
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTauri, setIsTauri] = useState(false);

  // Check if running in Tauri and get window reference
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).__TAURI__) {
      setIsTauri(true);
      import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
        const win = getCurrentWindow();
        win.isMaximized().then((maximized: boolean) => {
          setIsMaximized(maximized);
        });
      });
    }
  }, []);

  const handleMinimize = () => {
    if (!isTauri) return;
    import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
      getCurrentWindow().minimize();
    });
  };

  const handleMaximize = () => {
    if (!isTauri) return;
    import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
      const win = getCurrentWindow();
      if (isMaximized) {
        win.unmaximize();
      } else {
        win.maximize();
      }
      const newMaximized = !isMaximized;
      setIsMaximized(newMaximized);
    });
  };

  const handleClose = () => {
    if (!isTauri) return;
    import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
      getCurrentWindow().close();
    });
  };

  const tiles = useUrlStore((state) => state.tiles);
  const workspaces = useUrlStore((state) => state.workspaces);
  const activeWorkspaceId = useUrlStore((state) => state.activeWorkspaceId);
  const setActiveWorkspace = useUrlStore((state) => state.setActiveWorkspace);
  const createWorkspace = useUrlStore((state) => state.createWorkspace);
  const renameWorkspace = useUrlStore((state) => state.renameWorkspace);
  const deleteWorkspace = useUrlStore((state) => state.deleteWorkspace);

  const exportToJson = useUrlStore((state) => state.exportToJson);
  const importFromJson = useUrlStore((state) => state.importFromJson);
  const resetLayout = useUrlStore((state) => state.resetLayout);

  const searchQuery = useUrlStore((state) => state.searchQuery);
  const setSearchQuery = useUrlStore((state) => state.setSearchQuery);

  const selectedCategories = useUrlStore((state) => state.selectedCategories);
  const setSelectedCategories = useUrlStore(
    (state) => state.setSelectedCategories,
  );

  const selectedPlatforms = useUrlStore((state) => state.selectedPlatforms);
  const setSelectedPlatforms = useUrlStore(
    (state) => state.setSelectedPlatforms,
  );

  const selectedTags = useUrlStore((state) => state.selectedTags);
  const setSelectedTags = useUrlStore((state) => state.setSelectedTags);

  const resetFilters = useUrlStore((state) => state.resetFilters);
  const setSettingsOpen = useSettingsStore((state) => state.setIsOpen);

  const allTilesList = Object.values(tiles);
  const categories = Array.from(
    new Set(allTilesList.map((u) => u.category).filter(Boolean)),
  ) as string[];
  const platforms = Array.from(
    new Set(allTilesList.map((u) => u.platform).filter(Boolean)),
  ) as string[];
  const tags = Array.from(
    new Set(allTilesList.flatMap((u) => u.tags || []).filter(Boolean)),
  ) as string[];

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategories.length > 0 ||
    selectedPlatforms.length > 0 ||
    selectedTags.length > 0;

  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const handleExport = () => {
    const jsonString = exportToJson();
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `maco-workspaces-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Workspaces exported successfully");
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

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    createWorkspace(newWorkspaceName.trim());
    setNewWorkspaceName("");
    setNewWorkspaceModalOpen(false);
    toast.success("Workspace created");
  };

  const handleRenameWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWorkspaceName.trim() || !activeWorkspaceId) return;
    renameWorkspace(activeWorkspaceId, editWorkspaceName.trim());
    setEditWorkspaceModalOpen(false);
    toast.success("Workspace renamed");
  };

  const openEditModal = () => {
    if (currentWorkspace) {
      setEditWorkspaceName(currentWorkspace.name);
      setEditWorkspaceModalOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background app-drag">
        <div className="flex h-14 items-center justify-between px-4 gap-4">
          <div className="flex items-center gap-3 shrink-0 app-no-drag">
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer">
                <img
                  src="/maco_brand_asset.png"
                  alt="Maco Logo"
                  className="h-8 w-auto object-contain"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => setAddUrlOpen(true)}
                    className="gap-2 text-xs cursor-pointer"
                  >
                    <ImagePlus className="size-3.5" /> New URL
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setAddExistingOpen(true)}
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
                    onClick={() => setResetConfirmOpen(true)}
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
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Workspace Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-8 text-xs font-medium shadow-xs hover:bg-accent hover:text-accent-foreground gap-2 cursor-pointer">
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
                        ws.id === activeWorkspaceId
                          ? "font-bold bg-muted/50"
                          : ""
                      }`}
                    >
                      <span className="truncate">{ws.name}</span>
                      {workspaces.length > 1 && ws.id === activeWorkspaceId && (
                        <span
                          role="button"
                          className="text-muted-foreground hover:text-destructive ml-2 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWorkspace(ws.id);
                          }}
                        >
                          <X className="size-3" />
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={openEditModal}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <Pencil className="size-3.5" /> Edit Current Workspace
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setNewWorkspaceModalOpen(true)}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <Plus className="size-3.5" /> New Workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 flex-1 max-w-2xl mx-auto app-no-drag">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search title, author, tags, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-8 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {platforms.length > 0 && (
              <MultiSelectFilter
                title="Platform"
                options={platforms}
                selected={selectedPlatforms}
                onChange={setSelectedPlatforms}
              />
            )}
            {categories.length > 0 && (
              <MultiSelectFilter
                title="Category"
                options={categories}
                selected={selectedCategories}
                onChange={setSelectedCategories}
              />
            )}
            {tags.length > 0 && (
              <MultiSelectFilter
                title="Tags"
                options={tags}
                selected={selectedTags}
                onChange={setSelectedTags}
              />
            )}

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-muted-foreground hover:text-foreground underline shrink-0 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Window controls */}
          <div className="flex items-center gap-1 shrink-0 app-no-drag">
            <button
              onClick={handleMinimize}
              className="group flex items-center justify-center w-10 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80 transition-colors cursor-pointer"
              title="Minimize"
            >
              <Minus className="size-3.5 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleMaximize}
              className="group flex items-center justify-center w-10 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80 transition-colors cursor-pointer"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <Square className="size-3.5 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleClose}
              className="group flex items-center justify-center w-10 h-8 rounded-md text-muted-foreground hover:text-destructive-foreground hover:bg-destructive active:bg-destructive/90 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="size-3.5 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </header>

      <AddUrlDialog open={addUrlOpen} onOpenChange={setAddUrlOpen} />
      <AddExistingTileDialog
        open={addExistingOpen}
        onOpenChange={setAddExistingOpen}
      />
      <SettingsDialog />

      {/* New Workspace Modal */}
      <AlertDialog
        open={newWorkspaceModalOpen}
        onOpenChange={setNewWorkspaceModalOpen}
      >
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
      <AlertDialog
        open={editWorkspaceModalOpen}
        onOpenChange={setEditWorkspaceModalOpen}
      >
        <AlertDialogContent>
          <form onSubmit={handleRenameWorkspace}>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Workspace Name</AlertDialogTitle>
              <AlertDialogDescription>
                Enter a new name for this workspace.
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

      <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Layout Positions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the positions and dimensions of all tiles in the
              current workspace back to default.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetLayout();
                setResetConfirmOpen(false);
                toast.success("Layout reset");
              }}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
