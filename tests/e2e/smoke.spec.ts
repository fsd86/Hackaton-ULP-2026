import { test, expect } from "./fixtures";

// Humo: la app carga, no muestra la pantalla de error de contenido y no tira errores de consola.
test("app loads without content errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/");
  await expect(page.locator("body")).not.toContainText("Content error");
  await expect(page.locator("main")).toBeVisible();
  expect(errors).toEqual([]);
});
