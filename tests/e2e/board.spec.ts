import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect } from "@playwright/test";

const strings = JSON.parse(readFileSync(resolve("config/strings.en.json"), "utf8")) as Record<string, string>;
const indicators = (
  JSON.parse(readFileSync(resolve("data/indicators.json"), "utf8")) as {
    indicators: Array<{ id: string; name: string; input: { kind: string; min?: number; max?: number } }>;
  }
).indicators;
const environments = (JSON.parse(readFileSync(resolve("data/environments.json"), "utf8")) as { environments: Array<{ id: string }> })
  .environments;
const numeric = indicators.find((i) => i.input.kind === "number") ?? indicators[0];

/** Valor válido según input.kind (sin asumir umbrales). */
function validValue(): number | [number, number] {
  const { input } = numeric;
  if (input.kind === "pair") return [1, 1];
  return input.min ?? input.max ?? 1;
}

test("board: empty state offers a link to the daily check", async ({ page }) => {
  await page.goto("/#/");
  await expect(page.getByRole("heading", { name: strings["board.title"], level: 1 })).toBeVisible();
  await expect(page.getByText(strings["board.no_reading"]).first()).toBeVisible();
  await page.getByRole("link", { name: strings["board.go_to_check"], exact: true }).click();
  await expect(page).toHaveURL(/#\/check$/);
});

test("board: card with trend chart and data table after two readings", async ({ page }) => {
  const now = Date.now();
  const readings = [now - 2 * 3_600_000, now - 3_600_000].map((timestamp, i) => ({
    id: `seed-${i}`,
    indicatorId: numeric.id,
    value: validValue(),
    environmentId: environments[0].id,
    timestamp,
  }));
  await page.addInitScript((r) => window.localStorage.setItem("eif.readings", JSON.stringify(r)), readings);

  await page.goto("/#/");
  const card = page.getByTestId("board-card").filter({ hasText: numeric.name }).first();
  await expect(card).toBeVisible();
  await expect(card.getByRole("img", { name: new RegExp(numeric.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) })).toBeVisible();

  await card.getByText(strings["board.chart_table"]).click();
  await expect(card.getByRole("table").locator("tbody tr")).toHaveCount(2);
});
