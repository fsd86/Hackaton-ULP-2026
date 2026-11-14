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

// Etapa 3A: aviso fijo "prototipo educativo" visible en todas las vistas, sin tapar la barra de pestañas.
test("prototype notice is visible on every view and does not cover the tab bar", async ({ page }) => {
  const { readFileSync } = await import("node:fs");
  const strings = JSON.parse(readFileSync("config/strings.en.json", "utf8")) as Record<string, string>;
  for (const hash of ["#/", "#/check", "#/emergency", "#/report", "#/sources"]) {
    await page.goto(`/${hash}`);
    const notice = page.getByRole("note").filter({ hasText: strings["notice.prototype"] });
    await expect(notice, hash).toBeInViewport({ ratio: 1 });
    const overlap = await page.evaluate(() => {
      const n = document.querySelector("[data-prototype-notice]")!.getBoundingClientRect();
      const nav = document.querySelector("nav")!.getBoundingClientRect();
      return n.bottom > nav.top && n.top < nav.bottom && n.right > nav.left && n.left < nav.right;
    });
    expect(overlap, `${hash}: notice overlaps the nav`).toBe(false);
  }
});
