import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentType, ReactElement, ReactNode } from "react";
import { useModeStore } from "@/store/useModeStore";
import { useUrlStore } from "@/store/useUrlStore";
import { TileGrid } from "./TileGrid";

vi.mock("react-grid-layout/legacy", async () => {
  const React = await import("react");

  const Grid = ({
    children,
    isResizable,
    isDraggable,
    layout,
  }: {
    children?: ReactNode;
    isResizable?: boolean;
    isDraggable?: boolean;
    layout: { minW?: number; minH?: number }[];
  }) => (
    <div
      data-testid="grid"
      data-resizable={String(isResizable)}
      data-draggable={String(isDraggable)}
      data-min-w={layout[0]?.minW}
      data-min-h={layout[0]?.minH}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(
          child as ReactElement<{ children?: ReactNode }>,
          {
            children: isResizable
              ? React.createElement("span", {
                  className:
                    "react-resizable-handle react-resizable-handle-se",
                  "data-testid": "resize-handle",
                })
              : undefined,
          },
        );
      })}
    </div>
  );

  return {
    default: Grid,
    WidthProvider: (component: ComponentType) => component,
  };
});

vi.mock("./TileHeader", () => ({
  TileHeader: () => <div data-testid="tile-header" />,
}));

vi.mock("@/components/TileEmbed", () => ({
  TileEmbed: () => <div data-testid="tile-embed" />,
}));

vi.mock("./MaximizedTileModal", () => ({
  MaximizedTileModal: () => null,
}));

vi.mock("./DeleteTileDialog", () => ({
  DeleteTileDialog: () => null,
}));

vi.mock("./TileGridEmptyState", () => ({
  TileGridEmptyState: () => null,
}));

const makeLayoutItem = (id: number, x: number, y: number, w: number, h: number) =>
  ({ id, x, y, w, h });

beforeEach(() => {
  window.localStorage.clear();
  useUrlStore.setState({
    tiles: {
      1: { id: 1, url: "https://example.com/one", platform: "generic" },
      2: { id: 2, url: "https://example.com/two", platform: "generic" },
    },
    workspaces: [
      {
        id: "active",
        name: "Active",
        items: [makeLayoutItem(1, 0, 0, 4, 6), makeLayoutItem(2, 4, 0, 4, 6)],
      },
      {
        id: "other",
        name: "Other",
        items: [makeLayoutItem(1, 1, 2, 3, 4)],
      },
    ],
    activeWorkspaceId: "active",
    searchQuery: "",
    selectedCategories: [],
    selectedPlatforms: [],
    selectedTags: [],
  });
  useModeStore.setState({ mode: "client", connectionStatus: "connected" });
});

afterEach(() => cleanup());

describe("TileGrid resizing", () => {
  it.each([
    { mode: "client" as const, connectionStatus: "connected" as const, canResize: true },
    { mode: "server" as const, connectionStatus: "connected" as const, canResize: true },
    { mode: "server" as const, connectionStatus: "disconnected" as const, canResize: false },
  ])(
    "shows the resize handle in $mode mode when resizing is enabled",
    ({ mode, connectionStatus, canResize }) => {
      useModeStore.setState({ mode, connectionStatus });

      render(<TileGrid />);

      const grid = screen.getByTestId("grid");
      expect(grid.getAttribute("data-resizable")).toBe(String(canResize));
      expect(grid.getAttribute("data-draggable")).toBe(String(canResize));
      expect(grid.getAttribute("data-min-w")).toBe("2");
      expect(grid.getAttribute("data-min-h")).toBe("3");
      expect(screen.queryAllByTestId("resize-handle")).toHaveLength(
        canResize ? 2 : 0,
      );
    },
  );

  it("persists resized dimensions only in the active workspace", () => {
    useUrlStore.getState().updateLayouts([
      { i: "1", x: 3, y: 4, w: 5, h: 7, minW: 2, minH: 3 },
    ]);

    const workspaces = useUrlStore.getState().workspaces;
    expect(workspaces[0].items).toEqual([
      makeLayoutItem(1, 3, 4, 5, 7),
      makeLayoutItem(2, 4, 0, 4, 6),
    ]);
    expect(workspaces[1].items).toEqual([makeLayoutItem(1, 1, 2, 3, 4)]);

    const persisted = JSON.parse(
      window.localStorage.getItem("maco-url-storage") ?? "{}",
    ) as { state?: { workspaces?: unknown } };
    expect(persisted.state?.workspaces).toEqual(workspaces);
  });
});