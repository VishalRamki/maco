/**
 * @file ConnectionStatusIndicator.tsx
 * @description Small status badge in the toolbar showing server connection status.
 */

import { useModeStore } from "@/store/useModeStore";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

/**
 * Displays the current server connection status when in server mode.
 * Hidden when in client mode.
 */
export function ConnectionStatusIndicator() {
  const mode = useModeStore((state) => state.mode);
  const connectionStatus = useModeStore((state) => state.connectionStatus);

  // Only show in server mode
  if (mode !== "server") {
    return null;
  }

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case "connected":
        return {
          icon: <Wifi className="size-3.5 text-green-500" />,
          label: "Connected",
          className: "text-green-500",
        };
      case "disconnected":
        return {
          icon: <WifiOff className="size-3.5 text-destructive" />,
          label: "Disconnected",
          className: "text-destructive",
        };
      case "checking":
        return {
          icon: <Loader2 className="size-3.5 text-yellow-500 animate-spin" />,
          label: "Checking...",
          className: "text-yellow-500",
        };
    }
  };

  const status = getStatusInfo();

  return (
    <div
      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium"
      title={status.label}
    >
      {status.icon}
      <span className={status.className}>{status.label}</span>
    </div>
  );
}
