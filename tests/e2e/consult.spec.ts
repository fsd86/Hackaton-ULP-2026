import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect } from "./fixtures";

// One-shot consult: textos y cifras se leen de los JSON (nada fijo en el test). El retardo sale SOLO de
// data/environments.json (entorno Mars transit = "spacecraft").
const strings = JSON.parse(readFileSync(resolve("config/strings.en.json"), "utf8")) as Record<string, string>;
const app = JSON.parse(readFileSync(resolve("config/app.json"), "utf8")) as {
  consult: { upper_round_trips_per_complete_set: number; lower_round_trips: number };
};
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

test("consult: chest pain → protocol first → only COMPLETE sets count → range from the Mars delay → report section", async ({ page }) => {
  await page.goto("/#/report");
  await page.getByRole("button", { name: strings["consult.start"], exact: true }).click();
  await page.getByRole("radio", { name: chest.label, exact: true }).check();

  // Primero, el enlace al protocolo de dolor de pecho.
  const protocol = protocols.find((p) => p.id === chest.open_protocol_id)!;
  const link = page.getByRole("link", { name: strings["consult.protocol_first.link"].replace("{title}", protocol.title) });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", `#/emergency/${protocol.id}`);

  const headline = page.getByTestId("consult-counter-headline");
  const choose = (id: string, option: string) =>
    page.getByRole("group", { name: question(id).text }).getByRole("radio", { name: option, exact: true }).check();

  // Respuestas sueltas (una por set) NO cuentan: un set cuenta solo cuando está completo.
  await page.getByLabel(question("q").text, { exact: true }).fill("Pressure, like a weight");
  await choose("o_how", question("o_how").answer.options![0]!);
  await page.locator('[data-question="pain_now"] label').filter({ hasText: /^6$/ }).click();
  await expect(headline).toHaveText(strings["consult.counter.none"]);

  // Completar OPQRST (6 preguntas) y la escala de dolor (2): N = 2 sets completos.
  await page.locator('[data-question="o_when"] input[type="datetime-local"]').fill("2026-01-01T10:00");
  await page.getByLabel(question("p").text, { exact: true }).fill("Nothing changes it");
  await page.getByLabel(question("r").text, { exact: true }).fill("Centre of the chest");
  await choose("t", question("t").answer.options![0]!);
  await expect(page.locator('[data-module="opqrst"]')).toContainText(strings["consult.module.complete"]);
  // Un set completo: exactamente 1 round trip.
  await expect(headline).toContainText(strings["consult.counter.trips_exact"].replace("{trips}", "1 round trip"));
  await choose("pain_words", question("pain_words").answer.options![1]!);

  // Rango: entre lower y N × upper round trips; minutos de lower × 2 × min a N × upper × 2 × max (solo retardo).
  const n = 2;
  const tripsMin = app.consult.lower_round_trips;
  const tripsMax = n * app.consult.upper_round_trips_per_complete_set;
  const loMin = minutes(tripsMin * 2 * mars.min!);
  const hiMin = minutes(tripsMax * 2 * mars.max!);
  await expect(headline).toContainText(`between ${tripsMin} and ${tripsMax} round trips`);
  await expect(headline).toContainText(`about ${loMin} min to ${hiMin} min`);
  const counter = page.getByTestId("consult-counter");
  await expect(counter).toContainText(strings["consult.counter.badge"]);
  await expect(counter).toContainText("one set per message");
  await expect(counter).toContainText("batch all its follow-up questions in one message");

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
  expect(text).toContain(`about ${loMin} min to ${hiMin} min`);
  expect(text).toContain("Only complete question sets count");
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
