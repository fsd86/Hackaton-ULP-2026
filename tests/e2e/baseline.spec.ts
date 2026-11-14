import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect } from "./fixtures";

// Linea de base personal: textos y cifras salen de los JSON (nada fijo en el test). El desvio esperado se calcula
// con data/demo-readings.json y config/app.json baseline (ventana y minimo de lecturas).
const strings = JSON.parse(readFileSync(resolve("config/strings.en.json"), "utf8")) as Record<string, string>;
const app = JSON.parse(readFileSync(resolve("config/app.json"), "utf8")) as { baseline: { window_days: number } };
const demo = (
  JSON.parse(readFileSync(resolve("data/demo-readings.json"), "utf8")) as {
    readings: Array<{ indicator_id: string; value: number | [number, number]; minutes_ago: number }>;
  }
).readings;

/** "+37%": ultima lectura demo de heart_rate vs media de las previas dentro de la ventana. */
function expectedHeartRatePct(): string {
  const hr = demo.filter((r) => r.indicator_id === "heart_rate").sort((a, b) => a.minutes_ago - b.minutes_ago);
  const [latest, ...prev] = hr;
  const inWindow = prev.filter((r) => r.minutes_ago <= app.baseline.window_days * 24 * 60).map((r) => r.value as number);
  const mean = inWindow.reduce((s, v) => s + v, 0) / inWindow.length;
  const pct = Math.round((((latest!.value as number) - mean) / mean) * 100);
  return `${pct > 0 ? "+" : pct < 0 ? "-" : ""}${Math.abs(pct)}%`;
}

test("baseline: simulate a demo baseline, see a neutral deviation, then Clear saved data removes it", async ({ page }) => {
  // Lecturas demo en el tablero (la ultima de cada indicador es la que se compara).
  await page.goto("/#/");
  await page.getByRole("button", { name: strings["demo.load"], exact: true }).click();

  await page.getByRole("navigation", { name: strings["nav.main_label"] }).getByRole("link", { name: strings["nav.baseline"] }).click();
  await expect(page.getByRole("heading", { level: 1, name: strings["baseline.title"] })).toBeVisible();
  await expect(page.getByText(strings["baseline.current.empty"])).toBeVisible();
  // Cita de la fuente CCISS en "why a personal baseline".
  await expect(page.locator('a[href="#/sources/csa_cciss"]')).toBeVisible();

  // Calcular "de mis lecturas" con solo lecturas demo: no hay lecturas propias, no se guarda nada.
  await page.getByRole("button", { name: strings["baseline.calculate"], exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: strings["baseline.saved.none"]!.slice(0, 30) })).toBeVisible();

  await page.getByRole("button", { name: strings["baseline.simulate"], exact: true }).click();
  const pct = expectedHeartRatePct();
  const hrEntry = page.locator('[data-testid="baseline-entry"][data-indicator-id="heart_rate"]');
  await expect(hrEntry.getByTestId("baseline-deviation")).toContainText(strings["baseline.deviation.demo"]!.replace("{pct}", pct));
  // Etiquetado demo y aviso de "solo como referencia".
  await expect(page.getByTestId("baseline-current").getByText(strings["demo.tag"]!, { exact: true })).toBeVisible();
  await expect(page.getByText(strings["baseline.awareness"]!).first()).toBeVisible();
  // Mood (escala ordinal) queda fuera y se explica por que.
  await expect(page.getByText(strings["baseline.excluded.scale"]!)).toBeVisible();

  // Tablero: desvio compacto en la fila de signos vitales, sin cambiar el estado por rangos.
  await page.goto("/#/");
  const row = page.locator('[data-testid="vital-row"][data-vital-id="heart_rate"]');
  await expect(row.getByTestId("baseline-deviation")).toContainText(strings["baseline.vital_short.demo"]!.replace("{pct}", pct));

  // Clear saved data: la linea de base desaparece.
  await page.getByRole("button", { name: strings["storage.clear"], exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: strings["storage.clear.confirm"], exact: true }).click();
  await page.goto("/#/baseline");
  await expect(page.getByText(strings["baseline.current.empty"])).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("eif.baseline"))).toBeNull();
});

test("baseline: deviation of a new reading appears in the Daily check result", async ({ page }) => {
  await page.goto("/#/");
  await page.getByRole("button", { name: strings["demo.load"], exact: true }).click();
  await page.goto("/#/baseline");
  await page.getByRole("button", { name: strings["baseline.simulate"], exact: true }).click();
  await expect(page.getByTestId("baseline-entry").first()).toBeVisible();

  await page.goto("/#/check/heart_rate");
  await page.getByRole("spinbutton").first().fill("76");
  await page.getByRole("button", { name: strings["daily.save"], exact: true }).click();
  const dev = page.getByTestId("baseline-deviation");
  await expect(dev).toBeVisible();
  await expect(dev).toContainText(strings["baseline.deviation.demo"]!.replace("{pct}", "").trim());
  await expect(page.getByText(strings["baseline.awareness"]!)).toBeVisible();
});
