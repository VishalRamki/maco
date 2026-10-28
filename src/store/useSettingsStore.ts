import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Settings {
  youtubeApiKey: string;
}

interface SettingsState {
  settings: Settings;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  youtubeApiKey: "",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      isOpen: false,
      setIsOpen: (open) => set({ isOpen: open }),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: "maco-app-settings",
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
);
