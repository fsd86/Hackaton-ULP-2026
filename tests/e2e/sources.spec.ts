import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect } from "@playwright/test";

const strings = JSON.parse(readFileSync(resolve("config/strings.en.json"), "utf8")) as Record<string, string>;
const sources = (JSON.parse(readFileSync(resolve("data/sources.json"), "utf8")) as { sources: Array<{ id: string; title: string }> })
  .sources;
const indicators = (
  JSON.parse(readFileSync(resolve("data/indicators.json"), "utf8")) as {
    indicators: Array<{ id: string; name: string; source_ids: string[] }>;
  }
).indicators;
const cited = indicators.find((i) => i.source_ids.length > 0);

test("sources: lists every source from data/sources.json with its verification summary", async ({ page }) => {
  await page.goto("/#/sources");
  await expect(page.getByRole("heading", { level: 1, name: strings["sources.title"] })).toBeVisible();
  await expect(page.getByTestId("summary-sources")).toBeVisible();
  for (const s of sources) {
    const card = page.locator(`#source-${s.id}`);
    await expect(card).toHaveCount(1);
    await expect(card.getByRole("heading", { level: 2, name: s.title })).toBeVisible();
  }
});

test("sources: a source link from daily check lands on that source, focused", async ({ page }) => {
  test.skip(!cited, "no indicator with source_ids in data/indicators.json");
  await page.goto("/#/check");
  await page.getByRole("button", { name: `${strings["daily.open_indicator"]}: ${cited!.name}` }).first().click();

  const link = page.locator('#main a[href^="#/sources/"]').first();
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  const id = decodeURIComponent((href ?? "").replace("#/sources/", ""));
  expect(sources.map((s) => s.id)).toContain(id);

  await link.click();
  await expect(page).toHaveURL(new RegExp(`#/sources/${id}$`));
  const card = page.locator(`#source-${id}`);
  await expect(card).toBeVisible();
  await expect(card).toBeFocused();
});
