import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Any fetch request starting with /youtube-api will be proxied
      "/youtube-api": {
        target: "https://www.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/youtube-api/, ""),
      },
      "/go2rtc-api": {
        target: "http://127.0.0.1:1984",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/go2rtc-api/, ""),
      },
    },
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
});
