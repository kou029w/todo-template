import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs/promises";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: await Array.fromAsync(
        fs.glob("**/*.html", {
          exclude: ["node_modules/**", "dist/**"],
        }),
      ),
    },
  },
});
