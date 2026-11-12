import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect } from "@playwright/test";

const strings = JSON.parse(readFileSync(resolve("config/strings.en.json"), "utf8")) as Record<string, string>;
const protocol = (
  JSON.parse(readFileSync(resolve("data/protocols.json"), "utf8")) as {
    protocols: Array<{ id: string; title: string; steps: Array<{ text: string }> }>;
  }
).protocols[0];
const total = protocol.steps.length;
const stepOf = (n: number) => strings["emergency.step_of"].replace("{current}", String(n)).replace("{total}", String(total));

test("emergency: open protocol from header, mark 2 steps, log persists after reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: strings["emergency.button"], exact: true }).click();
  await expect(page.getByRole("link", { name: strings["emergency.button"], exact: true })).toHaveAttribute("aria-current", "page");

  await page.getByRole("button", { name: `${strings["emergency.start"]}: ${protocol.title}` }).click();
  await expect(page.getByText(stepOf(1))).toBeVisible();
  await expect(page.getByRole("heading", { name: protocol.steps[0].text })).toBeVisible();

  const done = page.getByRole("button", { name: strings["emergency.mark_done"], exact: true });
  await done.click();
  await expect(page.getByText(stepOf(2))).toBeVisible();
  await done.click();
  await expect(page.getByText(stepOf(3))).toBeVisible();

  const log = page.getByTestId("emergency-log");
  await expect(log.getByRole("listitem")).toHaveCount(2);

  await page.reload();
  await expect(page.getByText(stepOf(3))).toBeVisible();
  await expect(page.getByTestId("emergency-log").getByRole("listitem")).toHaveCount(2);
});

test("emergency: unknown protocol id shows the list with a notice", async ({ page }) => {
  await page.goto("/#/emergency/does_not_exist");
  await expect(page.getByRole("alert")).toContainText(strings["emergency.invalid_protocol"]);
  await expect(page.getByRole("button", { name: `${strings["emergency.start"]}: ${protocol.title}` })).toBeVisible();
});

test("emergency: exit asks for confirmation while steps are pending", async ({ page }) => {
  await page.goto("/#/emergency");
  await page.getByRole("button", { name: `${strings["emergency.start"]}: ${protocol.title}` }).click();
  await page.getByRole("button", { name: strings["emergency.exit"], exact: true }).click();
  await expect(page.getByRole("dialog", { name: strings["emergency.exit_confirm.title"] })).toBeVisible();
  await page.getByRole("button", { name: strings["emergency.exit_confirm.stay"], exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
