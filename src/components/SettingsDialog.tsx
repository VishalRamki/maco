/**
 * @file SettingsDialog.tsx
 * @description Application settings modal with sidebar navigation for configuring API credentials, mode, and performing a factory reset.
 */

import { useState } from "react";
import {
  Settings,
  Key,
  SlidersHorizontal,
  AlertTriangle,
  LifeBuoy,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useModeStore } from "@/store/useModeStore";

type SectionKey = "general" | "api-keys" | "mode" | "danger";

interface SettingsDialogProps {
  onOpenSetupWizard?: () => void;
  onFactoryReset?: () => void;
}

const sections: { key: SectionKey; label: string; icon: typeof LifeBuoy }[] = [
  { key: "general", label: "General", icon: LifeBuoy },
  { key: "api-keys", label: "API Keys", icon: Key },
  { key: "mode", label: "Mode", icon: SlidersHorizontal },
  { key: "danger", label: "Danger Zone", icon: AlertTriangle },
];

/**
 * General section placeholder.
 */
function GeneralSection() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-medium">General Settings</h3>
      <p className="text-sm text-muted-foreground">
        General application settings will appear here in a future release.
      </p>
    </div>
  );
}

/**
 * API Keys section with the YouTube API key input.
 */
function ApiKeysSection() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-medium">API Keys</h3>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="youtube-api-key"
          className="flex items-center gap-1.5 font-medium"
        >
          <Key className="size-4 text-muted-foreground" />
          YouTube Data API v3 Key
        </Label>
        <Input
          id="youtube-api-key"
          type="password"
          placeholder="AIzaSy..."
          value={settings.youtubeApiKey || ""}
          onChange={(e) => updateSettings({ youtubeApiKey: e.target.value })}
        />
        <span className="text-xs text-muted-foreground">
          Required for fetching YouTube video metadata and playlist details.
        </span>
      </div>
    </div>
  );
}

/**
 * Mode section showing the current mode and a button to change it.
 */
function ModeSection({
  onOpenSetupWizard,
}: {
  onOpenSetupWizard?: () => void;
}) {
  const mode = useModeStore((state) => state.mode);

  const modeLabel = mode === "server" ? "Server Mode" : "Client Mode";
  const modeDescription =
    mode === "server"
      ? "Running as a server. Other clients can connect to this instance."
      : "Running as a client. Connects to a remote server instance.";

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-medium">Application Mode</h3>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">{modeLabel}</p>
            <p className="text-sm text-muted-foreground">{modeDescription}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenSetupWizard?.()}
            className="gap-1.5 cursor-pointer"
          >
            Change Mode
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Danger Zone section with the factory reset button.
 */
function DangerSection({ onFactoryReset }: { onFactoryReset?: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">Danger Zone</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
            <div>
              <p className="font-medium text-destructive">Factory Reset</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete all data: tiles, workspaces, settings, and
                mode configuration. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              className="cursor-pointer"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Factory Reset?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your data: tiles, workspaces,
              settings, and mode configuration. The app will return to its
              first-run state. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onFactoryReset?.();
                setConfirmOpen(false);
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

/**
 * Settings configuration modal dialog with sidebar navigation.
 */
export function SettingsDialog({
  onOpenSetupWizard,
  onFactoryReset,
}: SettingsDialogProps = {}) {
  const isOpen = useSettingsStore((state) => state.isOpen);
  const setIsOpen = useSettingsStore((state) => state.setIsOpen);
  const [activeSection, setActiveSection] = useState<SectionKey>("general");

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return <GeneralSection />;
      case "api-keys":
        return <ApiKeysSection />;
      case "mode":
        return <ModeSection onOpenSetupWizard={onOpenSetupWizard} />;
      case "danger":
        return <DangerSection onFactoryReset={onFactoryReset} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[750px] h-[600px] flex flex-col overflow-hidden">
        <DialogHeader className="pb-4 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="size-5" /> Settings
          </DialogTitle>
          <DialogDescription>
            Configure your application preferences and options.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 gap-6 min-h-0 pt-2">
          {/* Sidebar Navigation */}
          <nav className="w-40 shrink-0 flex flex-col gap-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.key;
              return (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors cursor-pointer ${
                    isActive
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  {section.label}
                </button>
              );
            })}
          </nav>

          {/* Content Pane */}
          <div className="flex-1 min-w-0 overflow-y-auto pr-2">
            {renderSection()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
