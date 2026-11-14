import { test as base, expect } from "@playwright/test";

// La app siembra datos DEMO en la primera visita (config features.demo_on_first_visit). Los tests e2e parten
// de una visita "ya sembrada" con el almacenamiento limpio (marca eif.demo_seeded puesta), para probar el
// tablero vacio y los flujos con lecturas propias. La siembra en si se prueba en board.spec.ts con el test base.
export const DEMO_SEEDED_KEY = "eif.demo_seeded";

export const test = base.extend<{ demoSeeded: void }>({
  demoSeeded: [
    async ({ page }, use) => {
      await page.addInitScript((k) => {
        if (window.localStorage.getItem(k) === null) window.localStorage.setItem(k, "1");
      }, DEMO_SEEDED_KEY);
      await use();
    },
    { auto: true },
  ],
});

export { expect };
export type { Page } from "@playwright/test";
