import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppMode, ServerConnectionStatus } from "@/types";

export type { AppMode, ServerConnectionStatus };

interface ModeState {
  mode: AppMode | null;
  endpointUrl: string;
  apiKey: string;
  connectionStatus: ServerConnectionStatus;
  hydrated: boolean;
  setMode: (mode: AppMode) => void;
  setEndpointUrl: (url: string) => void;
  setApiKey: (key: string) => void;
  setConnectionStatus: (status: ServerConnectionStatus) => void;
  isConfigured: () => boolean;
  reset: () => void;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set, get) => ({
      mode: null,
      endpointUrl: "",
      apiKey: "",
      connectionStatus: "disconnected",
      hydrated: false,
      setMode: (mode) => set({ mode }),
      setEndpointUrl: (url) => set({ endpointUrl: url }),
      setApiKey: (key) => set({ apiKey: key }),
      setConnectionStatus: (status) => set({ connectionStatus: status }),
      isConfigured: () => get().mode !== null,
      reset: () => set({ mode: null, endpointUrl: "", apiKey: "", connectionStatus: "disconnected" }),
    }),
    {
      name: "maco-mode-config",
      partialize: (state) => ({ mode: state.mode, endpointUrl: state.endpointUrl }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
        }
      },
    },
  ),
);
