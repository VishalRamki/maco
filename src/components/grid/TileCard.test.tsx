import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TileCard } from "./TileCard";

vi.mock("./TileHeader", () => ({
  TileHeader: () => <div data-testid="tile-header" />,
}));

vi.mock("@/components/TileEmbed", () => ({
  TileEmbed: () => <div data-testid="tile-embed" />,
}));

describe("TileCard", () => {
  it("renders grid-injected children directly after the tile content", () => {
    const { container } = render(
      <TileCard
        tile={{
          id: 1,
          url: "https://example.com",
          platform: "generic",
          x: 0,
          y: 0,
          w: 4,
          h: 6,
        }}
        otherWorkspaces={[]}
        onMaximize={() => {}}
        onDeleteClick={() => {}}
        onCopyTile={() => {}}
        onMoveTile={() => {}}
      >
        <span className="react-resizable-handle" data-testid="resize-handle" />
      </TileCard>,
    );

    const root = container.firstElementChild;
    const handle = container.querySelector("[data-testid='resize-handle']");

    expect(handle?.parentElement).toBe(root);
    expect(root?.lastElementChild).toBe(handle);
  });
});