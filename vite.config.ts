import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" keeps asset paths relative so the built app works when loaded from a
// file:// path inside a Steam desktop wrapper (Tauri/Electron) as well as a web server.
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { port: 5174, strictPort: true },
});
