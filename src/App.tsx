import { Toolbar } from "./components/Toolbar";
import { TileGrid } from "./components/TileGrid";
import "@/platforms/youtube";
import "@/platforms/twitch";
import "@/platforms/vimeo";
import "@/platforms/kick";
import "@/platforms/dailymotion";
import "@/platforms/rtsp";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Toolbar />
      <TileGrid />
    </div>
  );
}

export default App;
