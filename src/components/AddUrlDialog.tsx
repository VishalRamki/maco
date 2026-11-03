/**
 * @file AddUrlDialog.tsx
 * @description Dialog modal for inputting a URL, auto-detecting platform, fetching metadata, and placing tile in a workspace.
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUrlStore } from "@/store/useUrlStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { detectPlatform, platforms } from "@/platforms";
import type { PlatformMetadata } from "@/types";

/**
 * Prop interface for `AddUrlDialog`.
 */
export interface AddUrlDialogProps {
  /** Controlled open state of the dialog. */
  open: boolean;
  /** State updater callback for the dialog. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog allowing users to paste a URL and add it to an existing or active workspace.
 */
export function AddUrlDialog({ open, onOpenChange }: AddUrlDialogProps) {
  const [url, setUrl] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const addUrl = useUrlStore((state) => state.addUrl);
  const workspaces = useUrlStore((state) => state.workspaces);
  const activeWorkspaceId = useUrlStore((state) => state.activeWorkspaceId);
  const youtubeApiKey = useSettingsStore(
    (state) => state.settings.youtubeApiKey,
  );

  const targetWorkspaceId = selectedWorkspaceId || activeWorkspaceId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    setIsLoading(true);
    const detected = detectPlatform(trimmedUrl);
    const platform = detected ? detected.platformKey : "unknown";

    let metadata: PlatformMetadata = {};
    if (detected && platforms[platform]) {
      try {
        metadata = await platforms[platform].fetchMetadata(
          trimmedUrl,
          detected.id,
          youtubeApiKey,
        );
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    }

    addUrl(
      {
        url: trimmedUrl,
        platform,
        ...metadata,
      },
      targetWorkspaceId,
    );

    setIsLoading(false);
    setUrl("");
    setSelectedWorkspaceId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add URL</DialogTitle>
          <DialogDescription>
            Enter a supported video or stream URL and select a workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://www.youtube.com/... or https://www.twitch.tv/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="workspace">Target Workspace</Label>
              <select
                id="workspace"
                value={targetWorkspaceId}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                disabled={isLoading}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!url.trim() || isLoading}>
              {isLoading ? "Fetching..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
