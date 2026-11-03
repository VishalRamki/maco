/**
 * @file App.tsx
 * @description Root application component assembling the top navigation toolbar, grid canvas, and platform adapters.
 */

import { useState, useEffect, useCallback } from "react";
import { Toolbar } from "./components/Toolbar";
import { TileGrid } from "./components/TileGrid";
import { SetupWizardDialog } from "./components/SetupWizardDialog";
import { useModeStore } from "./store/useModeStore";
import { loadFromServerIfEnabled } from "./store/useUrlStore";
import { testConnection } from "./lib/api";
import { useUrlStore } from "./store/useUrlStore";
import { useSettingsStore } from "./store/useSettingsStore";
import { toast } from "sonner";
// Register all supported media and streaming platform adapters
import "@/platforms/youtube";
import "@/platforms/twitch";
import "@/platforms/vimeo";
import "@/platforms/kick";
import "@/platforms/dailymotion";
import "@/platforms/rtsp";

const CONNECTION_POLL_INTERVAL_MS = 30_000;

/**
 * Root component rendering the Maco multi-tile layout interface.
 */
function App() {
  const isConfigured = useModeStore((state) => state.isConfigured());
  const hydrated = useModeStore((state) => state.hydrated);
  const mode = useModeStore((state) => state.mode);
  const endpointUrl = useModeStore((state) => state.endpointUrl);
  const setConnectionStatus = useModeStore((state) => state.setConnectionStatus);
  const reset = useModeStore((state) => state.reset);
  const [showWizard, setShowWizard] = useState(false);

  // Update wizard state after the store has hydrated from localStorage
  useEffect(() => {
    if (hydrated) {
      setShowWizard(!isConfigured);
    }
  }, [hydrated, isConfigured]);

  const handleOpenSetupWizard = () => {
    // Clear stale config so the wizard starts fresh
    reset();
    setShowWizard(true);
  };

  const handleFactoryReset = useCallback(() => {
    // Clear all persisted localStorage keys
    localStorage.removeItem("maco-url-storage");
    localStorage.removeItem("maco-app-settings");
    localStorage.removeItem("maco-mode-config");

    // Reset all stores to their default state
    useModeStore.getState().reset();
    useUrlStore.setState({
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
    });
    useSettingsStore.setState({
      settings: { youtubeApiKey: "" },
      isOpen: false,
    });

    // Show the setup wizard again
    setShowWizard(true);
    toast.success("App has been reset to factory defaults");
  }, []);

  // Load data from server on mount when in server mode
  useEffect(() => {
    if (mode === "server") {
      loadFromServerIfEnabled();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial connection check for server mode
  useEffect(() => {
    if (mode !== "server" || !endpointUrl) return;

    setConnectionStatus("checking");
    testConnection().then((ok) => {
      setConnectionStatus(ok ? "connected" : "disconnected");
    });
  }, [mode, endpointUrl, setConnectionStatus]);

  // Poll connection status every 30 seconds in server mode
  useEffect(() => {
    if (mode !== "server" || !endpointUrl) return;

    const interval = setInterval(() => {
      setConnectionStatus("checking");
      testConnection().then((ok) => {
        setConnectionStatus(ok ? "connected" : "disconnected");
      });
    }, CONNECTION_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [mode, endpointUrl, setConnectionStatus]);

  // While hydrating, show the main UI to avoid a flash; the wizard will
  // appear in the next render if no mode is configured after hydration.
  if (showWizard && !isConfigured) {
    return (
      <SetupWizardDialog
        open={showWizard}
        onOpenChange={setShowWizard}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toolbar onOpenSetupWizard={handleOpenSetupWizard} onFactoryReset={handleFactoryReset} />
      <TileGrid />
    </div>
  );
}

export default App;
