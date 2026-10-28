import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UrlItem {
  id: number;
  url: string;
  platform: string;
  title?: string;
  author?: string;
  description?: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string[];
  duration?: string;
  viewCount?: string;
  publishedAt?: string;
}

export interface WorkspaceItem {
  id: number; // references UrlItem id
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Workspace {
  id: string;
  name: string;
  items: WorkspaceItem[];
}

interface UrlStore {
  // Global deduplicated tile library and workspaces
  tiles: Record<number, UrlItem>;
  workspaces: Workspace[];
  activeWorkspaceId: string;

  // Filters
  searchQuery: string;
  selectedCategories: string[];
  selectedPlatforms: string[];
  selectedTags: string[];

  // Filter actions
  setSearchQuery: (query: string) => void;
  setSelectedCategories: (categories: string[]) => void;
  setSelectedPlatforms: (platforms: string[]) => void;
  setSelectedTags: (tags: string[]) => void;
  resetFilters: () => void;

  // Workspace actions
  setActiveWorkspace: (id: string) => void;
  createWorkspace: (name: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  deleteWorkspace: (id: string) => void;
  copyTileToWorkspace: (tileId: number, targetWorkspaceId: string) => void;
  moveTileToWorkspace: (tileId: number, targetWorkspaceId: string) => void;

  // Tile & Layout actions
  addUrl: (item: Omit<UrlItem, "id">, targetWorkspaceId?: string) => void;
  removeUrl: (id: number) => void;
  removeTileFromWorkspace: (tileId: number, workspaceId: string) => void;
  updateLayouts: (layout: any) => void;
  resetLayout: () => void;

  // Import / Export
  exportToJson: () => string;
  importFromJson: (jsonData: string) => boolean;
}

export const useUrlStore = create<UrlStore>()(
  persist(
    (set, get) => ({
      tiles: {},
      workspaces: [
        {
          id: "default",
          name: "Default Workspace",
          items: [],
        },
      ],
      activeWorkspaceId: "default",

      searchQuery: "",
      selectedCategories: [],
      selectedPlatforms: [],
      selectedTags: [],

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategories: (selectedCategories) =>
        set({ selectedCategories }),
      setSelectedPlatforms: (selectedPlatforms) => set({ selectedPlatforms }),
      setSelectedTags: (selectedTags) => set({ selectedTags }),

      resetFilters: () =>
        set({
          searchQuery: "",
          selectedCategories: [],
          selectedPlatforms: [],
          selectedTags: [],
        }),

      setActiveWorkspace: (activeWorkspaceId) => set({ activeWorkspaceId }),

      createWorkspace: (name) => {
        const newId = `ws-${Date.now()}`;
        set((state) => ({
          workspaces: [...state.workspaces, { id: newId, name, items: [] }],
          activeWorkspaceId: newId,
        }));
      },

      renameWorkspace: (id, name) =>
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === id ? { ...ws, name } : ws,
          ),
        })),

      deleteWorkspace: (id) =>
        set((state) => {
          if (state.workspaces.length <= 1) return state; // Keep at least one workspace
          const remaining = state.workspaces.filter((ws) => ws.id !== id);
          const newActiveId =
            state.activeWorkspaceId === id
              ? remaining[0].id
              : state.activeWorkspaceId;
          return {
            workspaces: remaining,
            activeWorkspaceId: newActiveId,
          };
        }),

      copyTileToWorkspace: (tileId, targetWorkspaceId) =>
        set((state) => {
          const updatedWorkspaces = state.workspaces.map((ws) => {
            if (ws.id === targetWorkspaceId) {
              // Prevent duplicate tile references inside the same target workspace
              if (ws.items.some((item) => item.id === tileId)) return ws;

              const newItemPosition: WorkspaceItem = {
                id: tileId,
                x: (ws.items.length * 4) % 12,
                y: Infinity,
                w: 4,
                h: 6,
              };
              return { ...ws, items: [...ws.items, newItemPosition] };
            }
            return ws;
          });

          return { workspaces: updatedWorkspaces };
        }),

      moveTileToWorkspace: (tileId, targetWorkspaceId) =>
        set((state) => {
          const currentWsId = state.activeWorkspaceId;
          if (currentWsId === targetWorkspaceId) return state;

          const updatedWorkspaces = state.workspaces.map((ws) => {
            // Remove tile from source workspace
            if (ws.id === currentWsId) {
              return {
                ...ws,
                items: ws.items.filter((item) => item.id !== tileId),
              };
            }
            // Add tile to target workspace (if not already present)
            if (ws.id === targetWorkspaceId) {
              if (ws.items.some((item) => item.id === tileId)) return ws;

              const newItemPosition: WorkspaceItem = {
                id: tileId,
                x: (ws.items.length * 4) % 12,
                y: Infinity,
                w: 4,
                h: 6,
              };
              return { ...ws, items: [...ws.items, newItemPosition] };
            }
            return ws;
          });

          return { workspaces: updatedWorkspaces };
        }),

      addUrl: (item, targetWorkspaceId) =>
        set((state) => {
          const newId = Date.now();
          const newItem: UrlItem = {
            ...item,
            id: newId,
            tags: item.tags || [],
          };

          const wsId = targetWorkspaceId || state.activeWorkspaceId;

          const updatedWorkspaces = state.workspaces.map((ws) => {
            if (ws.id === wsId) {
              const newItemPosition: WorkspaceItem = {
                id: newId,
                x: (ws.items.length * 4) % 12,
                y: Infinity,
                w: 4,
                h: 6,
              };
              return {
                ...ws,
                items: [...ws.items, newItemPosition],
              };
            }
            return ws;
          });

          return {
            tiles: { ...state.tiles, [newId]: newItem },
            workspaces: updatedWorkspaces,
          };
        }),

      removeTileFromWorkspace: (tileId, workspaceId) =>
        set((state) => {
          const updatedWorkspaces = state.workspaces.map((ws) => {
            if (ws.id === workspaceId) {
              return {
                ...ws,
                items: ws.items.filter((item) => item.id !== tileId),
              };
            }
            return ws;
          });

          return {
            workspaces: updatedWorkspaces,
          };
        }),

      // Completely deletes the tile from global tiles and ALL workspaces
      removeUrl: (id) =>
        set((state) => {
          const updatedWorkspaces = state.workspaces.map((ws) => ({
            ...ws,
            items: ws.items.filter((item) => item.id !== id),
          }));

          const newTiles = { ...state.tiles };
          delete newTiles[id];

          return {
            tiles: newTiles,
            workspaces: updatedWorkspaces,
          };
        }),

      updateLayouts: (layout) =>
        set((state) => {
          const updatedWorkspaces = state.workspaces.map((ws) => {
            if (ws.id === state.activeWorkspaceId) {
              const updatedItems = ws.items.map((item) => {
                const itemLayout = (layout as any[]).find(
                  (l: any) => l.i === item.id.toString(),
                );
                if (itemLayout) {
                  return {
                    ...item,
                    x: itemLayout.x,
                    y: itemLayout.y,
                    w: itemLayout.w,
                    h: itemLayout.h,
                  };
                }
                return item;
              });
              return { ...ws, items: updatedItems };
            }
            return ws;
          });

          return { workspaces: updatedWorkspaces };
        }),

      resetLayout: () =>
        set((state) => {
          const updatedWorkspaces = state.workspaces.map((ws) => {
            if (ws.id === state.activeWorkspaceId) {
              const resetItems = ws.items.map((item, index) => ({
                ...item,
                x: (index * 4) % 12,
                y: Infinity,
                w: 4,
                h: 6,
              }));
              return { ...ws, items: resetItems };
            }
            return ws;
          });
          return { workspaces: updatedWorkspaces };
        }),

      exportToJson: () =>
        JSON.stringify(
          {
            tiles: get().tiles,
            workspaces: get().workspaces,
          },
          null,
          2,
        ),

      importFromJson: (jsonData) => {
        try {
          const parsed = JSON.parse(jsonData);
          // Support both new structure and legacy array format
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            if (parsed.tiles && parsed.workspaces) {
              set({
                tiles: parsed.tiles,
                workspaces: parsed.workspaces,
                activeWorkspaceId: parsed.workspaces[0]?.id || "default",
              });
              return true;
            }
          }
          // Fallback legacy import format handling
          if (Array.isArray(parsed)) {
            const tiles: Record<number, UrlItem> = {};
            const items: WorkspaceItem[] = parsed.map((item, index) => {
              tiles[item.id] = item;
              return {
                id: item.id,
                x: item.x ?? (index * 4) % 12,
                y: item.y ?? Infinity,
                w: item.w ?? 4,
                h: item.h ?? 6,
              };
            });
            set({
              tiles,
              workspaces: [{ id: "default", name: "Default Workspace", items }],
              activeWorkspaceId: "default",
            });
            return true;
          }
          return false;
        } catch (e) {
          console.error("Invalid JSON format", e);
          return false;
        }
      },
    }),
    {
      name: "maco-url-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tiles: state.tiles,
        workspaces: state.workspaces,
        activeWorkspaceId: state.activeWorkspaceId,
      }),
    },
  ),
);
