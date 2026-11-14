import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect, type Page } from "./fixtures";

// Guided demo: recorre el guion de data/guided-demo.json con Next (sin esperar los temporizadores), verifica ruta,
// caption y destacado de cada paso, sale con Esc y comprueba que el foco vuelve al boton y que no quedan efectos.
const read = <T,>(p: string) => JSON.parse(readFileSync(resolve(p), "utf8")) as T;
const strings = read<Record<string, string>>("config/strings.en.json");
const demo = read<{
  scenario: {
    environment_id: string;
    alert_indicator_id: string;
    protocol_id: string;
    consult?: { symptom_id: string; demo_answers: Array<{ question_id: string; value?: string | number; text?: string; minutes_ago?: number }> };
  };
  steps: Array<{ id: string; route: string; target: string | null; caption_key: string; duration_ms: number }>;
}>("data/guided-demo.json");
const env = read<{ environments: Array<{ id: string; name: string }> }>("data/environments.json").environments.find(
  (e) => e.id === demo.scenario.environment_id,
)!;
const ind = read<{ indicators: Array<{ id: string; name: string; body_zone?: string }> }>("data/indicators.json").indicators.find(
  (i) => i.id === demo.scenario.alert_indicator_id,
)!;
const protocol = read<{ protocols: Array<{ id: string; title: string }> }>("data/protocols.json").protocols.find(
  (p) => p.id === demo.scenario.protocol_id,
)!;
const symptom = read<{ symptoms: Array<{ id: string; label: string }> }>("data/consult.json").symptoms.find(
  (s) => s.id === demo.scenario.consult?.symptom_id,
);
const total = demo.steps.length;
const zone = ind.body_zone ?? "body";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Caption esperado: {status} depende de la evaluacion (attention o critical); el resto sale de los datos. */
function captionRe(key: string): RegExp {
  const vars: Record<string, string> = {
    environment: env.name,
    indicator: ind.name,
    zone: strings[`zone.${zone}`]!,
    protocol: protocol.title,
    symptom: symptom?.label ?? "",
  };
  const parts = strings[key]!.split(/(\{\w+\})/).map((part) => {
    const m = /^\{(\w+)\}$/.exec(part);
    if (!m) return esc(part);
    if (m[1] === "status") return `(${esc(strings["status.attention"]!)}|${esc(strings["status.critical"]!)})`;
    return esc(vars[m[1]!] ?? part);
  });
  return new RegExp(`^${parts.join("")}$`);
}
const stepOf = (n: number) => strings["guided_demo.step_of"]!.replace("{current}", String(n)).replace("{total}", String(total));

async function startDemo(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: strings["guided_demo.button"], exact: true }).click();
  await expect(page.locator("[data-gd-panel]")).toBeVisible();
}

test("guided demo: Next through every step, then Esc restores focus and leaves no side effects", async ({ page }) => {
  // Reduced motion: la demo arranca en pausa (sin avance automatico), asi el recorrido con Next es deterministico.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await startDemo(page);
  const panel = page.locator("[data-gd-panel]");
  const caption = panel.locator("[data-gd-caption]");
  await expect(caption).toHaveAttribute("aria-live", "polite");
  await expect(panel).toContainText(strings["guided_demo.reduced_motion"]!);
  // El almacenamiento empezo limpio (fixture): la demo carga las lecturas DEMO y lo avisa.
  await expect(panel).toContainText(strings["guided_demo.demo_loaded"]!);
  await expect(page.locator("[data-demo-banner]")).toBeVisible();

  for (const [i, step] of demo.steps.entries()) {
    await expect(caption.getByText(stepOf(i + 1), { exact: true }), step.id).toBeVisible();
    await expect(caption.locator("p").nth(1), step.id).toHaveText(captionRe(step.caption_key));
    await expect.poll(() => page.evaluate(() => window.location.hash), { message: step.id }).toBe(step.route);
    if (step.target) {
      const selector = step.target.replace("{zone}", zone).replace("{indicator}", ind.id);
      await expect(page.locator(selector).first(), step.id).toBeVisible();
      await expect(page.locator("[data-gd-spotlight]"), step.id).toBeVisible();
    }
    if (step.id === "environment") {
      await expect(page.locator('[data-gd="environment"] select')).toHaveValue(env.id);
    }
    if (step.id === "consult_symptom") {
      await expect(page.locator(`input[name="consult-symptom"][value="${symptom!.id}"]`)).toBeChecked();
    }
    if (step.id === "consult_counter") {
      // Las respuestas DEMO (del tripulante consciente) quedaron completadas y el contador ya cuenta round trips.
      for (const a of demo.scenario.consult!.demo_answers) {
        const q = page.locator(`[data-question="${a.question_id}"]`);
        if (a.value !== undefined) await expect(q.locator(`input[value="${a.value}"]`), a.question_id).toBeChecked();
        if (a.text !== undefined) await expect(q.locator("textarea"), a.question_id).toHaveValue(a.text);
        if (a.minutes_ago !== undefined) await expect(q.locator('input[type="datetime-local"]'), a.question_id).not.toHaveValue("");
      }
      await expect(page.getByTestId("consult-counter-headline")).not.toHaveText(strings["consult.counter.none"]!);
      // Todavia no hubo colapso: no hay sesion de emergencia de la demo.
      expect(await page.evaluate(() => localStorage.getItem("eif.emergency_session"))).toBeNull();
    }
    if (step.id === "report") {
      // El informe final lleva el consult (respondido antes del colapso) y el log del protocolo.
      await expect(page.getByTestId("consult")).toBeVisible();
      await expect(page.locator(`input[name="consult-symptom"][value="${symptom!.id}"]`)).toBeChecked();
    }
    if (i < total - 1) await panel.getByRole("button", { name: strings["guided_demo.next"], exact: true }).click();
  }
  // Los pasos marcados quedaron en el log de la sesion de demo; recargar a mitad de la demo la termina y la deshace.
  expect(await page.evaluate(() => (JSON.parse(localStorage.getItem("eif.emergency_log") ?? "[]") as unknown[]).length)).toBe(2);
  await page.reload();
  await expect(page.locator("[data-gd-panel]")).toHaveCount(0);
  expect(
    await page.evaluate(() => [localStorage.getItem("eif.emergency_log"), localStorage.getItem("eif.guided_demo_sandbox"), localStorage.getItem("eif.consult_draft")]),
  ).toEqual([null, null, null]);

  // Segunda pasada, ahora saliendo con Esc desde el ultimo paso.
  await startDemo(page);
  for (let i = 1; i < total; i++) {
    await panel.getByRole("button", { name: strings["guided_demo.next"], exact: true }).click();
    await expect(caption.getByText(stepOf(i + 1), { exact: true })).toBeVisible();
  }
  await expect(panel.getByRole("button", { name: strings["guided_demo.finish"], exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("#/");
  await expect(page.getByRole("button", { name: strings["guided_demo.button"], exact: true })).toBeFocused();

  // Sin efectos reales: log y sesion de emergencia, entorno y lecturas DEMO vuelven a como estaban (vacio).
  const stored = await page.evaluate(() => ({
    log: localStorage.getItem("eif.emergency_log"),
    session: localStorage.getItem("eif.emergency_session"),
    env: localStorage.getItem("eif.environment"),
    readings: JSON.parse(localStorage.getItem("eif.readings") ?? "[]") as unknown[],
    sandbox: localStorage.getItem("eif.guided_demo_sandbox"),
    consult: localStorage.getItem("eif.consult_draft"),
  }));
  expect(stored).toEqual({ log: null, session: null, env: null, readings: [], sandbox: null, consult: null });
  await expect(page.locator("[data-demo-banner]")).toHaveCount(0);
});

test("guided demo: advances on its own (timers) and Pause stops it", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  await startDemo(page);
  const caption = page.locator("[data-gd-caption]");
  await expect(caption.getByText(stepOf(1), { exact: true })).toBeVisible();
  await page.clock.runFor(demo.steps[0]!.duration_ms + 100);
  await expect(caption.getByText(stepOf(2), { exact: true })).toBeVisible();
  await page.getByRole("button", { name: strings["guided_demo.pause"], exact: true }).click();
  await page.clock.runFor(demo.steps[1]!.duration_ms + 100);
  await expect(caption.getByText(stepOf(2), { exact: true })).toBeVisible();
  await page.getByRole("button", { name: strings["guided_demo.exit"], exact: true }).click();
  await expect(page.getByRole("button", { name: strings["guided_demo.button"], exact: true })).toBeFocused();
});

test("guided demo: a consult draft saved before the demo comes back unchanged after it", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const before = JSON.stringify({ symptomId: "headache", answers: { p: { text: "kept" } }, updatedAt: 1 });
  await page.evaluate((v) => localStorage.setItem("eif.consult_draft", v), before);
  await startDemo(page);
  const panel = page.locator("[data-gd-panel]");
  const counterStep = demo.steps.findIndex((s) => s.id === "consult_counter");
  for (let i = 0; i < counterStep; i++) {
    await panel.getByRole("button", { name: strings["guided_demo.next"], exact: true }).click();
    await expect(panel.locator("[data-gd-caption]").getByText(stepOf(i + 2), { exact: true })).toBeVisible();
  }
  // Durante la demo el borrador es el de la demo (sintoma del escenario), no el guardado.
  await expect(page.locator(`input[name="consult-symptom"][value="${symptom!.id}"]`)).toBeChecked();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("eif.consult_draft"))).toBe(before);
});
