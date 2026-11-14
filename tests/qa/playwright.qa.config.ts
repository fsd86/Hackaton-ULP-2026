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
  // La app siembra DEMO en la primera visita: QA parte de una visita ya sembrada (marca eif.demo_seeded),
  // con el almacenamiento limpio, como asumen los guiones (inicio vacio, "Load demo data", lecturas propias).
  use: {
    ...base.use,
    screenshot: "on",
    trace: "off",
    storageState: { cookies: [], origins: [{ origin: "http://localhost:4173", localStorage: [{ name: "eif.demo_seeded", value: "1" }] }] },
  },
  webServer: {
    command: "npm run build && npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: true,
    timeout: 120_000,
    cwd: root,
  },
});
