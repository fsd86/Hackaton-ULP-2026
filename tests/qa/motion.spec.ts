import { test, expect } from "@playwright/test";

// Con prefers-reduced-motion no debe quedar ninguna animacion corriendo. Se usa la primera visita real (sin la
// marca eif.demo_seeded, asi se siembra DEMO): es la vista con mas movimiento (estrellas, anillo, pulso, zonas,
// zoom). Se mira document.getAnimations(), asi cubre cualquier clase nueva sin listar selectores.
test.use({ reducedMotion: "reduce", storageState: { cookies: [], origins: [] } });

test("motion: reduced motion stops every animation on the seeded board", async ({ page }) => {
  await page.goto("/#/");
  await expect(page.locator("main")).not.toBeEmpty();
  await page.waitForTimeout(1500);
  const running = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === "running")
      .map((a) => (a as CSSAnimation).animationName ?? "transition"),
  );
  console.log("MOTION running:", running.length, [...new Set(running)].join(","));
  expect(running).toEqual([]);
});
