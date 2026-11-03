/**
 * @file SetupWizardDialog.tsx
 * @description First-run setup wizard that asks users to choose between Client Mode and Server Mode.
 */

import { useState } from "react";
import { Server, Monitor, Loader2, CheckCircle2, XCircle } from "lucide-react";
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
import { useModeStore } from "@/store/useModeStore";
import type { AppMode } from "@/types";

type Step = "mode-select" | "server-config";
type TestStatus = "idle" | "testing" | "success" | "failed";

export function SetupWizardDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const setMode = useModeStore((state) => state.setMode);
  const setEndpointUrl = useModeStore((state) => state.setEndpointUrl);
  const setApiKey = useModeStore((state) => state.setApiKey);

  const [step, setStep] = useState<Step>("mode-select");
  const [endpointUrl, setEndpointUrlLocal] = useState("");
  const [apiKey, setApiKeyLocal] = useState("");
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [urlError, setUrlError] = useState("");

  const resetWizard = () => {
    setStep("mode-select");
    setEndpointUrlLocal("");
    setApiKeyLocal("");
    setTestStatus("idle");
    setErrorMessage("");
    setUrlError("");
  };

  const handleModeSelect = (mode: AppMode) => {
    if (mode === "client") {
      // Client mode is ready to go
      setMode("client");
      onOpenChange(false);
    } else {
      // Server mode needs config first — don't persist mode yet
      setStep("server-config");
    }
  };

  const handleTestConnection = async () => {
    setTestStatus("testing");
    setErrorMessage("");
    try {
      const cleanUrl = endpointUrl.replace(/\/+$/, "");
      const response = await fetch(`${cleanUrl}/api/health`, {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      if (response.ok) {
        setTestStatus("success");
      } else {
        setTestStatus("failed");
        setErrorMessage(`Server responded with status ${response.status}`);
      }
    } catch {
      setTestStatus("failed");
      setErrorMessage(
        "Unable to reach the server. Please check the URL and try again.",
      );
    }
  };

  const handleServerComplete = () => {
    // Validate URL format
    try {
      const url = new URL(endpointUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        setUrlError("Endpoint URL must use http:// or https://");
        return;
      }
    } catch {
      setUrlError("Please enter a valid URL (e.g., https://api.example.com)");
      return;
    }
    setUrlError("");
    setMode("server");
    setEndpointUrl(endpointUrl);
    setApiKey(apiKey);
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === "server-config") {
      setStep("mode-select");
      setTestStatus("idle");
      setErrorMessage("");
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetWizard();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {step === "mode-select"
              ? "Choose Your Setup"
              : "Server Configuration"}
          </DialogTitle>
          <DialogDescription>
            {step === "mode-select"
              ? "Select how you want to use this application. You can change this later in settings."
              : "Enter your server details to enable data synchronization."}
          </DialogDescription>
        </DialogHeader>

        {step === "mode-select" ? (
          <>
            <div className="grid gap-4 py-4">
              {/* Client Mode Option */}
              <button
                type="button"
                onClick={() => handleModeSelect("client")}
                className="group flex items-start gap-4 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-muted hover:border-ring"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-muted/80">
                  <Monitor className="size-5 text-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Client Mode</span>
                  <span className="text-sm text-muted-foreground">
                    All data is stored locally on your device. No server
                    required.
                  </span>
                </div>
              </button>

              {/* Server Mode Option */}
              <button
                type="button"
                onClick={() => handleModeSelect("server")}
                className="group flex items-start gap-4 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-muted hover:border-ring"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-muted/80">
                  <Server className="size-5 text-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Server Mode</span>
                  <span className="text-sm text-muted-foreground">
                    Data is synced to a remote server. Requires an endpoint URL
                    and API key.
                  </span>
                </div>
              </button>
            </div>

            <DialogFooter>
              <span className="text-xs text-muted-foreground">
                You can change your mode later from the app menu.
              </span>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              {/* Endpoint URL */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="endpoint-url" className="font-medium">
                  Endpoint URL
                </Label>
                <Input
                  id="endpoint-url"
                  type="url"
                  placeholder="https://api.example.com"
                  value={endpointUrl}
                  onChange={(e) => {
                    setEndpointUrlLocal(e.target.value);
                    if (urlError) setUrlError("");
                  }}
                />
                {urlError ? (
                  <span className="text-xs text-destructive">{urlError}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    The base URL of your sync server endpoint.
                  </span>
                )}
              </div>

              {/* API Key */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="api-key" className="font-medium">
                  API Key
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="mc-..."
                  value={apiKey}
                  onChange={(e) => setApiKeyLocal(e.target.value)}
                />
                <span className="text-xs text-muted-foreground">
                  Your authentication key for the server. This is kept in memory
                  only.
                </span>
              </div>

              {/* Test Connection */}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testStatus === "testing" || !endpointUrl || !apiKey}
                  className="gap-2 self-start"
                >
                  {testStatus === "testing" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Testing
                      Connection...
                    </>
                  ) : testStatus === "success" ? (
                    <>
                      <CheckCircle2 className="size-4 text-green-500" />{" "}
                      Connected
                    </>
                  ) : testStatus === "failed" ? (
                    <>
                      <XCircle className="size-4 text-destructive" /> Connection
                      Failed
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>
                {testStatus === "failed" && errorMessage && (
                  <span className="text-xs text-destructive">
                    {errorMessage}
                  </span>
                )}
                {testStatus === "success" && (
                  <span className="text-xs text-green-500">
                    Server is reachable and authenticated successfully.
                  </span>
                )}
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="cursor-pointer"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleServerComplete}
                disabled={!endpointUrl || !apiKey}
                className="cursor-pointer"
              >
                Complete Setup
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
