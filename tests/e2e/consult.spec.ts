import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect } from "./fixtures";

// One-shot consult: textos y cifras se leen de los JSON (nada fijo en el test). El retardo sale SOLO de
// data/environments.json (entorno Mars transit = "spacecraft").
const strings = JSON.parse(readFileSync(resolve("config/strings.en.json"), "utf8")) as Record<string, string>;
const app = JSON.parse(readFileSync(resolve("config/app.json"), "utf8")) as { consult: { round_trips_per_answered_set: number } };
const consult = JSON.parse(readFileSync(resolve("data/consult.json"), "utf8")) as {
  symptoms: Array<{ id: string; label: string; open_protocol_id?: string }>;
  question_sets: Array<{ id: string; title: string; questions: Array<{ id: string; text: string; answer: { type: string; options?: string[] } }> }>;
};
const protocols = (JSON.parse(readFileSync(resolve("data/protocols.json"), "utf8")) as { protocols: Array<{ id: string; title: string }> }).protocols;
const mars = (
  JSON.parse(readFileSync(resolve("data/environments.json"), "utf8")) as {
    environments: Array<{ id: string; comm_delay_one_way_s: { min: number | null; max: number | null } }>;
  }
).environments.find((e) => e.id === "spacecraft")!.comm_delay_one_way_s;

const chest = consult.symptoms.find((s) => s.id === "chest_pain")!;
const question = (id: string) => consult.question_sets.flatMap((s) => s.questions).find((q) => q.id === id)!;
const minutes = (s: number) => (s / 60 >= 10 ? String(Math.round(s / 60)) : String(Number((s / 60).toFixed(1))));

test("consult: chest pain → protocol first → answers → counter from the Mars delay → report section", async ({ page }) => {
  await page.goto("/#/report");
  await page.getByRole("button", { name: strings["consult.start"], exact: true }).click();
  await page.getByRole("radio", { name: chest.label, exact: true }).check();

  // Primero, el enlace al protocolo de dolor de pecho.
  const protocol = protocols.find((p) => p.id === chest.open_protocol_id)!;
  const link = page.getByRole("link", { name: strings["consult.protocol_first.link"].replace("{title}", protocol.title) });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", `#/emergency/${protocol.id}`);

  // Responder dos módulos: OPQRST (q, o_how) y escala de dolor.
  await page.getByLabel(question("q").text, { exact: true }).fill("Pressure, like a weight");
  await page.getByRole("group", { name: question("o_how").text }).getByRole("radio", { name: question("o_how").answer.options![0], exact: true }).check();
  await page.locator('[data-question="pain_now"] label').filter({ hasText: /^6$/ }).click();

  const n = 2 * app.consult.round_trips_per_answered_set;
  const maxMin = minutes(n * 2 * mars.max!);
  const minMin = minutes(n * 2 * mars.min!);
  const headline = page.getByTestId("consult-counter-headline");
  await expect(headline).toContainText(`${n} round trips`);
  await expect(headline).toContainText(`${maxMin} min`);
  await expect(page.getByTestId("consult-counter")).toContainText(`${minMin} min`);

  // El borrador sobrevive a una recarga.
  await page.reload();
  await expect(page.getByLabel(question("q").text, { exact: true })).toHaveValue("Pressure, like a weight");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: strings["report.download_txt"], exact: true }).click(),
  ]);
  const text = readFileSync(await download.path(), "utf8");
  expect(text).toContain(strings["consult.report.title"].toUpperCase());
  expect(text).toContain(chest.label);
  expect(text).toContain("Pressure, like a weight");
  expect(text).toContain(`A: ${strings["consult.not_answered"]}`);
  expect(text).toContain(`${maxMin} min`);
});

test("consult: Clear saved data removes the draft", async ({ page }) => {
  await page.goto("/#/report");
  await page.getByRole("button", { name: strings["consult.start"], exact: true }).click();
  await page.getByRole("radio", { name: consult.symptoms.at(-1)!.label, exact: true }).check();
  expect(await page.evaluate(() => localStorage.getItem("eif.consult_draft"))).not.toBeNull();
  await page.getByRole("button", { name: strings["storage.clear"], exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: strings["storage.clear.confirm"], exact: true }).click();
  await expect(page.getByRole("button", { name: strings["consult.start"], exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("eif.consult_draft"))).toBeNull();
});
