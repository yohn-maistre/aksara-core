import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { copyFile, mkdir } from "node:fs/promises";
export default defineConfig(({ mode }) => ({
  define: {
    "import.meta.env.VITE_AKSARA_PREVIEW": JSON.stringify(
      mode === "preview" ? "true" : "false",
    ),
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "pages-preview-files",
      async closeBundle() {
        if (mode !== "preview") return;
        const target = fileURLToPath(
          new URL("./dist-preview/", import.meta.url),
        );
        await mkdir(target, { recursive: true });
        for (const file of ["_headers", "_worker.js", "_routes.json"])
          await copyFile(
            fileURLToPath(
              new URL(`../../deploy/pages/${file}`, import.meta.url),
            ),
            target + file,
          );
      },
    },
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: {
    outDir: mode === "preview" ? "dist-preview" : "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-dom/client"],
          motion: ["motion/react"],
          openui: ["@openuidev/react-lang", "zod"],
        },
      },
    },
  },
  server: { proxy: { "/api": "http://127.0.0.1:7341" } },
}));
