/**
 * @file tauri.ts
 * @description Type-safe helper utilities for interacting with the Tauri desktop environment and window management.
 */

/**
 * Checks whether the application is currently running inside the Tauri native desktop wrapper.
 *
 * @returns `true` if Tauri runtime internals are present in the global window object, `false` otherwise.
 */
export function isTauriEnvironment(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const win = window as unknown as {
    __TAURI_INTERNALS__?: unknown;
    __TAURI__?: unknown;
  };
  return Boolean(win.__TAURI_INTERNALS__ || win.__TAURI__);
}

/**
 * Minimizes the current native application window.
 */
export async function minimizeWindow(): Promise<void> {
  if (!isTauriEnvironment()) return;
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().minimize();
  } catch (error) {
    console.error("Failed to minimize Tauri window:", error);
  }
}

/**
 * Toggles the maximized state of the current native application window.
 *
 * @param currentlyMaximized - Current known maximized state.
 * @returns The new maximized state after the toggle operation.
 */
export async function toggleMaximizeWindow(
  currentlyMaximized: boolean,
): Promise<boolean> {
  if (!isTauriEnvironment()) return false;
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    if (currentlyMaximized) {
      await win.unmaximize();
      return false;
    } else {
      await win.maximize();
      return true;
    }
  } catch (error) {
    console.error("Failed to toggle maximize Tauri window:", error);
    return currentlyMaximized;
  }
}

/**
 * Closes the native application window.
 */
export async function closeWindow(): Promise<void> {
  if (!isTauriEnvironment()) return;
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().close();
  } catch (error) {
    console.error("Failed to close Tauri window:", error);
  }
}

/**
 * Queries whether the native window is currently maximized.
 *
 * @returns A promise resolving to `true` if maximized, `false` otherwise.
 */
export async function queryWindowMaximized(): Promise<boolean> {
  if (!isTauriEnvironment()) return false;
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    return await getCurrentWindow().isMaximized();
  } catch (error) {
    console.error("Failed to query window maximized state:", error);
    return false;
  }
}
