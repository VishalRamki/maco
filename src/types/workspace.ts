/**
 * @file workspace.ts
 * @description Domain types for named workspaces and grid layout persistence.
 */

import type { WorkspaceItem } from "./tile";

/**
 * Represents a workspace containing an isolated set of positioned tiles.
 */
export interface Workspace {
  /** Unique workspace identifier (e.g., 'default' or 'ws-1700000000000'). */
  id: string;
  /** User-defined display name for the workspace. */
  name: string;
  /** Collection of positioned tile references inside this workspace. */
  items: WorkspaceItem[];
}

/**
 * Grid layout change item representation aligned with react-grid-layout contracts.
 */
export interface GridLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
}
