import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  server: { port: 5173 },
  test: {
    environment: "jsdom", // a simulated browser DOM in Node
    globals: true, // describe/it/expect/vi without imports; enables RTL's automatic cleanup
    setupFiles: ["./src/test/setup.js"],
    css: false,
  },
});
