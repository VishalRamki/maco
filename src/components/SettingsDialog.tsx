import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Settings, RotateCcw, Key } from "lucide-react";

export function SettingsDialog() {
  const isOpen = useSettingsStore((state) => state.isOpen);
  const setIsOpen = useSettingsStore((state) => state.setIsOpen);
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const resetSettings = useSettingsStore((state) => state.resetSettings);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="size-5" /> Settings
          </DialogTitle>
          <DialogDescription>
            Configure your application preferences and API keys.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* YouTube Data API v3 Key Input */}
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
              onChange={(e) =>
                updateSettings({ youtubeApiKey: e.target.value })
              }
            />
            <span className="text-xs text-muted-foreground">
              Required for fetching YouTube video metadata and playlist details.
            </span>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetSettings}
            className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="size-3.5" /> Reset Defaults
          </Button>
          <Button type="button" onClick={() => setIsOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
