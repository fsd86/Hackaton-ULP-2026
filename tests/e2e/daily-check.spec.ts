import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect, type Page } from "./fixtures";

const strings = JSON.parse(readFileSync(resolve("config/strings.en.json"), "utf8")) as Record<string, string>;
const indicators = (
  JSON.parse(readFileSync(resolve("data/indicators.json"), "utf8")) as {
    indicators: Array<{ id: string; name: string; input: { kind: string; min?: number; max?: number } }>;
  }
).indicators;
const first = indicators[0];

/** Carga un valor válido según input.kind (sin asumir umbrales). */
async function fillReading(page: Page): Promise<void> {
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

test("daily check: complete the wizard, see result + escalation, and find it in the history after reload", async ({ page }) => {
  await page.goto("/#/check");
  await page.getByRole("button", { name: strings["daily.start"], exact: true }).click();

  // Primer paso: contador y foco al título.
  await expect(page.getByText(strings["daily.step_of"].replace("{current}", "1").replace("{total}", String(indicators.length)))).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 })).toBeFocused();

  await fillReading(page);

  const resultHeading = page.getByRole("heading", { name: strings["daily.result"], exact: true });
  await expect(resultHeading).toBeVisible();
  // Tras guardar, el foco pasa al heading "Result" (no queda en <body>).
  await expect(resultHeading).toBeFocused();
  expect(await page.evaluate(() => document.activeElement?.textContent)).toBe(strings["daily.result"]);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: strings["daily.what_to_do"], exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: strings["escalation.label"], exact: true })).toBeVisible();
  // exact: true — "Crew" aparece como substring en otros textos (p. ej. el <details> del entorno, cerrado).
  const level = (k: string) => page.getByText(strings[k], { exact: true });
  await expect(level("escalation.level.self").or(level("escalation.level.crew")).or(level("escalation.level.ground")).first()).toBeVisible();

  // Recargar: la lectura persiste y aparece en el historial del indicador.
  await page.reload();
  await page.getByRole("button", { name: `${strings["daily.open_indicator"]}: ${first.name}` }).first().click();
  await expect(page.getByTestId("history-list").getByRole("listitem")).toHaveCount(1);
  await expect(page.getByText(strings["daily.history.empty"])).toHaveCount(0);
});

test("daily check: invalid input shows an associated error", async ({ page }) => {
  await page.goto("/#/check");
  await page.getByRole("button", { name: strings["daily.start"], exact: true }).click();
  await page.getByRole("button", { name: strings["daily.save"], exact: true }).click();
  const alert = page.getByRole("alert");
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(first.input.kind === "pair" ? strings["daily.pair_invalid"] : strings["daily.value_invalid"]);
});

// Los textos sin fuente de data/indicators.json ("PLACEHOLDER: ...") se muestran como nota "No verified source yet",
// nunca con el marcador crudo (lista, paso del wizard y resultado).
test("daily check: unsourced texts show the 'no verified source' note, never the raw PLACEHOLDER marker", async ({ page }) => {
  const raw = JSON.parse(readFileSync(resolve("data/indicators.json"), "utf8")) as {
    indicators: Array<{ id: string; name: string; frequency: { label: string } }>;
  };
  const target = raw.indicators.find((i) => i.frequency.label.startsWith("PLACEHOLDER"));
  test.skip(!target, "no indicator with an unsourced frequency label");
  await page.goto("/#/check");
  await expect(page.locator("#main")).not.toContainText("PLACEHOLDER");
  await page.getByRole("button", { name: `${strings["daily.open_indicator"]}: ${target!.name}` }).first().click();
  await expect(page.locator(`section[aria-labelledby="freq-${target!.id}"]`)).toContainText(strings["unverified.note"]);
  await expect(page.locator("#main")).not.toContainText("PLACEHOLDER");
});
