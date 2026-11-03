/**
 * @file App.tsx
 * @description Root application component assembling the top navigation toolbar, grid canvas, and platform adapters.
 */

import { Toolbar } from "./components/Toolbar";
import { TileGrid } from "./components/TileGrid";
// Register all supported media and streaming platform adapters
import "@/platforms/youtube";
import "@/platforms/twitch";
import "@/platforms/vimeo";
import "@/platforms/kick";
import "@/platforms/dailymotion";
import "@/platforms/rtsp";

/**
 * Root component rendering the Maco multi-tile layout interface.
 */
function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Toolbar />
      <TileGrid />
    </div>
  );
}

export default App;
