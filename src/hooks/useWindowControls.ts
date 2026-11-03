/**
 * @file useWindowControls.ts
 * @description Custom React hook managing desktop window state and actions (minimize, maximize/restore, close).
 */

import { useState, useEffect, useCallback } from "react";
import {
  isTauriEnvironment,
  minimizeWindow,
  toggleMaximizeWindow,
  closeWindow,
  queryWindowMaximized,
} from "@/lib/tauri";

/**
 * Return type contract for the `useWindowControls` hook.
 */
export interface WindowControlsState {
  /** Whether the application is running in the native Tauri desktop environment. */
  isTauri: boolean;
  /** Whether the native window is currently in a maximized state. */
  isMaximized: boolean;
  /** Minimizes the desktop application window. */
  handleMinimize: () => void;
  /** Toggles between maximized and restored desktop window states. */
  handleMaximize: () => void;
  /** Closes the desktop application window. */
  handleClose: () => void;
}

/**
 * Hook providing window state and window management handlers for desktop titlebars.
 *
 * @returns {WindowControlsState} Object containing environment status and control handlers.
 */
export function useWindowControls(): WindowControlsState {
  const [isTauri] = useState(() => isTauriEnvironment());
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (isTauri) {
      queryWindowMaximized().then(setIsMaximized);

      let unlistenFn: (() => void) | null = null;
      import("@tauri-apps/api/window")
        .then(({ getCurrentWindow }) => {
          const win = getCurrentWindow();
          return win.onResized(() => {
            win.isMaximized().then(setIsMaximized);
          });
        })
        .then((cleanup) => {
          unlistenFn = cleanup;
        })
        .catch((err) => {
          console.error("Failed to attach Tauri window resize listener:", err);
        });

      return () => {
        if (unlistenFn) {
          unlistenFn();
        }
      };
    }
  }, [isTauri]);

  const handleMinimize = useCallback(() => {
    minimizeWindow();
  }, []);

  const handleMaximize = useCallback(() => {
    toggleMaximizeWindow(isMaximized).then(setIsMaximized);
  }, [isMaximized]);

  const handleClose = useCallback(() => {
    closeWindow();
  }, []);

  return {
    isTauri,
    isMaximized,
    handleMinimize,
    handleMaximize,
    handleClose,
  };
}
