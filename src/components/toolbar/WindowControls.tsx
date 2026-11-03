/**
 * @file WindowControls.tsx
 * @description Desktop titlebar window management buttons (minimize, maximize/restore, close).
 */

import { Minus, Square, X } from "lucide-react";
import { useWindowControls } from "@/hooks/useWindowControls";

/**
 * Component rendering the native window action buttons for Tauri desktop mode.
 */
export function WindowControls() {
  const { isMaximized, handleMinimize, handleMaximize, handleClose } =
    useWindowControls();

  return (
    <div className="flex items-center gap-1 shrink-0 app-no-drag">
      <button
        onClick={handleMinimize}
        className="group flex items-center justify-center w-10 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80 transition-colors cursor-pointer"
        title="Minimize"
        aria-label="Minimize Window"
      >
        <Minus className="size-3.5 group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={handleMaximize}
        className="group flex items-center justify-center w-10 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80 transition-colors cursor-pointer"
        title={isMaximized ? "Restore" : "Maximize"}
        aria-label={isMaximized ? "Restore Window" : "Maximize Window"}
      >
        <Square className="size-3.5 group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={handleClose}
        className="group flex items-center justify-center w-10 h-8 rounded-md text-muted-foreground hover:text-destructive-foreground hover:bg-destructive active:bg-destructive/90 transition-colors cursor-pointer"
        title="Close"
        aria-label="Close Window"
      >
        <X className="size-3.5 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
