import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";
import base from "../../playwright.config";

// Config de QA: mismos proyectos (desktop / mobile) y mismo webServer que la config base,
// pero con otro testDir, capturas siempre activas y salida separada de los e2e.
// Correr desde la raiz del repo:
//   npx playwright test -c tests/qa/playwright.qa.config.ts
const root = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  ...base,
  testDir: ".",
  testMatch: /.*\.spec\.ts$/,
  outputDir: resolve(root, "test-results/qa"),
  reporter: [["list"], ["html", { open: "never", outputFolder: resolve(root, "playwright-report/qa") }]],
  use: { ...base.use, screenshot: "on", trace: "off" },
  webServer: {
    command: "npm run build && npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: true,
    timeout: 120_000,
    cwd: root,
  },
});
