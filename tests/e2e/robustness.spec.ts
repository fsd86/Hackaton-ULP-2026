import { test, expect } from "@playwright/test";
import { environments, indicators, must, protocols, seedStorage, strings, watchPage } from "../qa/helpers";

const indicator = must(indicators[0], "indicator");
const env = must(environments[0], "environment");
const protocol = must(protocols[0], "protocol");
const validReading = { id: "ok-1", indicatorId: indicator.id, value: 1, environmentId: env.id, timestamp: Date.now() - 60_000 };

test("robustness: corrupted readings are discarded, valid ones kept, notice shown and dismissible", async ({ page }) => {
  const issues = watchPage(page);
  // string / objeto no se prueban juntos en una clave: se siembra un array con basura mezclada
  await seedStorage(page, { "eif.readings": JSON.stringify([null, "x", { value: "abc" }, validReading]) });
  for (const hash of ["#/", "#/check", "#/report"]) {
    await page.goto(`/${hash}`);
    const main = page.locator("main");
    await expect(main).not.toBeEmpty();
    expect((await main.innerText()).trim().length).toBeGreaterThan(20);
  }
  await expect(page.getByRole("status").filter({ hasText: strings["storage.corrupt"].replace("{count}", "3") })).toBeVisible();
  expect(issues.filter((i) => i.startsWith("pageerror"))).toEqual([]);

  const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem("eif.readings") ?? "null") as unknown[]);
  expect(stored).toHaveLength(1);

  await page.getByRole("button", { name: strings["storage.corrupt.dismiss"] }).click();
  await expect(page.getByText(strings["storage.corrupt"].replace("{count}", "3"))).toHaveCount(0);
});

for (const [name, raw] of [
  ["string", '"abc"'],
  ["object", '{"a":1}'],
  ["invalid json", "{not json"],
] as const) {
  test(`robustness: readings stored as ${name} do not break the views`, async ({ page }) => {
    const issues = watchPage(page);
    await seedStorage(page, { "eif.readings": raw });
    for (const hash of ["#/", "#/check", "#/report"]) {
      await page.goto(`/${hash}`);
      expect((await page.locator("main").innerText()).trim().length).toBeGreaterThan(20);
    }
    await expect(page.getByRole("status").filter({ hasText: strings["storage.corrupt"].replace("{count}", "1") })).toBeVisible();
    expect(issues.filter((i) => i.startsWith("pageerror"))).toEqual([]);
  });
}

test("robustness: a 3-day-old emergency session asks before resuming; Start over opens step 1", async ({ page }) => {
  await seedStorage(page, {
    "eif.emergency_session": JSON.stringify({ sessionId: "old", protocolId: protocol.id, startedAt: Date.now() - 3 * 86_400_000 }),
  });
  await page.goto("/#/emergency");
  await expect(page.getByRole("heading", { name: strings["emergency.stale.title"] })).toBeVisible();
  await expect(page.getByRole("timer")).toHaveCount(0);
  await expect(page.getByRole("button", { name: strings["emergency.stale.continue"], exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: strings["emergency.stale.back"], exact: true })).toBeVisible();

  await page.getByRole("button", { name: strings["emergency.stale.start_over"], exact: true }).click();
  const total = protocol.steps.length;
  await expect(
    page.getByText(strings["emergency.step_of"].replace("{current}", "1").replace("{total}", String(total))),
  ).toBeVisible();
  await expect(page.getByRole("timer")).toHaveText(/^00:0\d$/);
});

test("robustness: Clear saved data with confirmation deletes the readings", async ({ page }) => {
  await seedStorage(page, { "eif.readings": JSON.stringify([validReading]) });
  await page.goto("/#/");
  expect(await page.evaluate(() => window.localStorage.getItem("eif.readings"))).not.toBeNull();

  await page.getByRole("button", { name: strings["storage.clear"], exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: strings["storage.clear.confirm"], exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => window.localStorage.getItem("eif.readings"))).toBeNull();
});
