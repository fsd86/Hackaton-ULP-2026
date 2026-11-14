import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Los headers de seguridad viven en vercel.json (producción). `vite preview` (usado por los e2e)
// aplica los mismos, así los tests verifican que la CSP no rompe la app. Una sola fuente de verdad.
type VercelHeaders = { headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }> };
const vercel = JSON.parse(readFileSync(new URL("./vercel.json", import.meta.url), "utf8")) as VercelHeaders;
const previewHeaders = Object.fromEntries(
  (vercel.headers ?? []).filter((h) => h.source === "/(.*)").flatMap((h) => h.headers.map((x) => [x.key, x.value])),
);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: { headers: previewHeaders },
  // Las fuentes nunca se incrustan como data: URI: la CSP (font-src 'self') las bloquearía.
  build: { assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined) },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
