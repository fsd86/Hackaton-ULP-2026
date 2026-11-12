import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect, type Page } from "@playwright/test";

const strings = JSON.parse(readFileSync(resolve("config/strings.en.json"), "utf8")) as Record<string, string>;
const indicators = (
  JSON.parse(readFileSync(resolve("data/indicators.json"), "utf8")) as {
    indicators: Array<{ id: string; name: string; input: { kind: string; min?: number; max?: number } }>;
  }
).indicators;
const first = indicators[0];

/** Carga un valor válido según input.kind (sin asumir umbrales). */
async function saveReading(page: Page): Promise<void> {
  const { input } = first;
  if (input.kind === "number") {
    await page.getByRole("spinbutton").fill(String(input.min ?? input.max ?? 1));
  } else if (input.kind === "pair") {
    await page.getByRole("spinbutton").nth(0).fill("1");
    await page.getByRole("spinbutton").nth(1).fill("1");
  } else {
    await page.getByRole("radio").first().check();
  }
  await page.getByRole("button", { name: strings["daily.save"], exact: true }).click();
}

test("report: shows the saved reading and the answer window, and downloads the text file", async ({ page }) => {
  await page.goto("/#/check");
  await page.getByRole("button", { name: `${strings["daily.open_indicator"]}: ${first.name}` }).first().click();
  await saveReading(page);
  await expect(page.getByRole("heading", { name: strings["daily.result"], exact: true })).toBeVisible();

  await page.goto("/#/report");
  await expect(page.getByRole("heading", { level: 1, name: strings["report.title"] })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: first.name })).toBeVisible();
  await expect(page.getByText(strings["report.readings.empty"])).toHaveCount(0);

  // La ventana de respuesta esperada (o su alternativa si la demora es desconocida) siempre se muestra.
  const eta = page.getByTestId("report-eta");
  await expect(eta).toBeVisible();
  await expect(eta).not.toBeEmpty();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: strings["report.download_txt"], exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^[a-z0-9-]+-report-\d{8}-\d{4}\.txt$/);
  const path = await download.path();
  const text = readFileSync(path, "utf8");
  expect(text).toContain(first.name);
});

test("report: empty state still allows generating the report", async ({ page }) => {
  await page.goto("/#/report");
  await expect(page.getByText(strings["report.empty.hint"])).toBeVisible();
  await expect(page.getByRole("button", { name: strings["report.copy"], exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: strings["report.download_json"], exact: true })).toBeEnabled();
});
