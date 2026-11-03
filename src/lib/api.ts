/**
 * @file api.ts
 * @description HTTP helper functions for server-mode data synchronization.
 */

import type { UrlItem, Workspace } from "@/types";
import { useModeStore } from "@/store/useModeStore";

/** Data payload synced to the server */
export interface SyncPayload {
  tiles: Record<number, UrlItem>;
  workspaces: Workspace[];
  activeWorkspaceId: string;
}

/** Response from the server sync endpoint */
export interface SyncResponse {
  tiles: Record<number, UrlItem>;
  workspaces: Workspace[];
  activeWorkspaceId: string;
}

/**
 * Get the base URL for API calls, stripping trailing slashes.
 */
function getBaseUrl(): string {
  const endpointUrl = useModeStore.getState().endpointUrl;
  return endpointUrl.replace(/\/+$/, "");
}

/**
 * Get the authorization headers for API calls.
 */
function getAuthHeaders(): Record<string, string> {
  const apiKey = useModeStore.getState().apiKey;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

/**
 * Test the server connection by hitting the health endpoint.
 * Returns false immediately if the endpoint URL is empty or invalid.
 */
export async function testConnection(): Promise<boolean> {
  const endpointUrl = useModeStore.getState().endpointUrl;
  if (!endpointUrl || !endpointUrl.trim()) {
    return false;
  }
  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(endpointUrl);
  } catch {
    return false;
  }
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return false;
  }
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/health`, {
      method: "HEAD",
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch all tiles from the server.
 */
export async function fetchTiles(): Promise<Record<number, UrlItem> | null> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/tiles`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.tiles ?? {};
  } catch {
    return null;
  }
}

/**
 * Fetch all workspaces from the server.
 */
export async function fetchWorkspaces(): Promise<Workspace[] | null> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/workspaces`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.workspaces ?? [];
  } catch {
    return null;
  }
}

/**
 * Fetch the active workspace ID from the server.
 */
export async function fetchActiveWorkspaceId(): Promise<string | null> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/active-workspace`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.activeWorkspaceId ?? "default";
  } catch {
    return null;
  }
}

/**
 * Sync all data (tiles, workspaces, active workspace) to the server.
 */
export async function syncData(payload: SyncPayload): Promise<boolean> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/sync`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch all data from the server in a single call.
 */
export async function fetchAllData(): Promise<SyncResponse | null> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/data`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      tiles: data.tiles ?? {},
      workspaces: data.workspaces ?? [],
      activeWorkspaceId: data.activeWorkspaceId ?? "default",
    };
  } catch {
    return null;
  }
}
