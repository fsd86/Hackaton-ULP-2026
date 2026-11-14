import { test, expect } from "@playwright/test";
import { renderIndicatorText } from "../../src/logic/indicatorText";
import { isPlaceholderText } from "../../src/logic/placeholder";
import type { Indicator } from "../../src/content/schemas";
import {
  app,
  criticalValueFor,
  enterReading,
  environments,
  escapeRe,
  evalIndicator,
  indicators,
  protocols,
  ROUTES_TO_AUDIT,
  runRoute,
  sampleFor,
  sampleOf,
  sources,
  strings,
  type Health,
  type IndicatorJson,
  type ReadingValue,
} from "./helpers";

// Principio "nada hardcodeado": lo visible sale de data/*.json y config/*.json.
// Los JSON van empaquetados en el build, asi que estos tests leen los JSON del disco en cada run y
// comparan contra la UI. Procedimiento manual (editar un JSON, rebuild, volver a correr): ver docs/qa-report.md.

test("config/app.json: app_name, tagline, disclaimer, language and document title", async ({ page }) => {
  await page.goto("/#/");
  await page.getByRole("heading", { level: 1, name: strings["board.title"] }).waitFor();
  await expect(page.locator("header")).toContainText(app.app_name);
  await expect(page.locator("header")).toContainText(app.tagline);
  await expect(page.locator("footer")).toContainText(app.disclaimer);
  await expect.soft(page, "document.title is built from app_name").toHaveTitle(new RegExp(escapeRe(app.app_name)));
  const lang = await page.evaluate(() => document.documentElement.lang);
  expect.soft(lang, "html[lang] follows config default_language").toBe(app.default_language);
});

test("strings.en.json: nav labels, skip link, view titles", async ({ page }) => {
  await page.goto("/#/");
  const nav = page.getByRole("navigation", { name: strings["nav.main_label"] });
  for (const key of ["nav.home", "nav.daily_check", "nav.report", "nav.sources"]) {
    await expect.soft(nav.getByRole("link", { name: strings[key], exact: true }), key).toBeVisible();
  }
  await expect.soft(page.getByRole("link", { name: strings["emergency.button"], exact: true })).toBeVisible();
  await expect.soft(page.getByRole("link", { name: strings["nav.skip_to_content"], exact: true })).toHaveCount(1);

  const titles: Array<[string, string]> = [
    ["#/", strings["board.title"]],
    ["#/check", strings["daily.title"]],
    ["#/emergency", strings["emergency.title"]],
    ["#/report", strings["report.title"]],
    ["#/sources", strings["sources.title"]],
  ];
  for (const [hash, title] of titles) {
    await page.goto(`/${hash}`);
    await expect.soft(page.getByRole("heading", { level: 1, name: title }), hash).toBeVisible();
  }
});

test("environments.json: selector options = environment names, in order", async ({ page }) => {
  await page.goto("/#/");
  const options = await page.getByRole("combobox", { name: strings["environment.label"], exact: true }).locator("option").allInnerTexts();
  expect(options).toEqual(environments.map((e) => e.name));
});

test("indicators / protocols / sources: names and titles come from the JSON", async ({ page }) => {
  await page.goto("/#/check");
  for (const ind of indicators) {
    await expect.soft(page.getByRole("heading", { level: 3, name: ind.name }), `indicator ${ind.id}`).toBeVisible();
  }
  await page.goto("/#/");
  for (const ind of indicators) {
    await expect.soft(page.getByTestId("board-card").filter({ hasText: ind.name }), `board card ${ind.id}`).toHaveCount(1);
  }
  await page.goto("/#/emergency");
  for (const p of protocols) {
    await expect.soft(page.getByRole("button", { name: `${strings["emergency.start"]}: ${p.title}` }), `protocol ${p.id}`).toBeVisible();
    for (const line of p.trigger) await expect.soft(page.getByText(line, { exact: true }).first()).toBeVisible();
  }
  await page.goto("/#/sources");
  for (const s of sources) {
    await expect.soft(page.getByRole("heading", { level: 2, name: s.title, exact: true }), `source ${s.id}`).toBeVisible();
  }
});

// Los umbrales deben venir del JSON: para cada rango se carga un valor representativo y se compara
// el estado mostrado con el de un evaluador independiente que lee los mismos JSON.
test("thresholds come from indicators.json: status, escalation level and actions follow the ranges", async ({ page }) => {
  test.setTimeout(150_000);
  const cases: Array<{ ind: IndicatorJson; value: ReadingValue }> = [];
  for (const ind of indicators) {
    if (ind.input.kind === "number") {
      for (const r of ind.ranges) {
        const v = sampleOf(r);
        if (v !== null) cases.push({ ind, value: v });
      }
    } else if (ind.input.kind === "pair") {
      for (const s of ["normal", "attention", "critical"] as Health[]) {
        const a = sampleFor(ind.ranges, s);
        const b = sampleFor(ind.ranges_secondary ?? [], s);
        if (a !== null && b !== null) cases.push({ ind, value: [a, b] });
      }
      const crit = criticalValueFor(ind);
      if (crit !== null) cases.push({ ind, value: crit });
    }
  }
  expect(cases.length, "at least one threshold case derived from the JSON").toBeGreaterThan(0);

  for (const { ind, value } of cases) {
    const expected = evalIndicator(ind, value);
    await page.goto(`/#/check/${ind.id}`);
    await page.reload(); // remonta la vista: el mismo id no reinicia el formulario
    await enterReading(page, ind, value);
    const res = page.locator(`section[aria-labelledby="res-${ind.id}"]`);
    await expect(res, `${ind.id} ${JSON.stringify(value)}`).toBeVisible();
    const label = `${ind.id}=${JSON.stringify(value)} expected ${expected}`;
    console.log("THRESHOLD", label);
    await expect.soft(res, label).toContainText(strings[`status.${expected}`]);
    if (expected !== "unknown") {
      const action = ind.actions[expected];
      if (action) {
        await expect.soft(page.locator(`section[aria-labelledby="esc-${ind.id}"]`), `${label}: escalation level`).toContainText(strings[`escalation.level.${action.escalation}`]);
        // Plantillas {range...} (QA T10): comparar el texto ya renderizado desde los rangos, como lo muestra la app.
        // Textos sin fuente ("PLACEHOLDER: ...") ya no se muestran crudos: la UI muestra la nota "unverified.note".
        for (const line of action.text) {
          if (isPlaceholderText(line))
            await expect.soft(page.locator(`section[aria-labelledby="todo-${ind.id}"]`).getByText(strings["unverified.note"], { exact: true }).first(), `${label}: unverified note`).toBeVisible();
          else await expect.soft(page.getByText(renderIndicatorText(line, ind as unknown as Indicator), { exact: true }), `${label}: action text`).toBeVisible();
        }
      }
    }
  }
});

// Detector heuristico de texto literal: todo texto visible (nodos de texto + aria-label/title/placeholder)
// debe poder rastrearse a algun string de data/ o config/. Se loguea como UNMAPPED lo que no.
// Falsos positivos posibles (valores dinamicos); no son tickets hasta revisarlos.
function leaves(x: unknown, out: string[]): void {
  if (typeof x === "string") out.push(x);
  else if (Array.isArray(x)) x.forEach((v) => leaves(v, out));
  else if (x && typeof x === "object") {
    for (const [k, v] of Object.entries(x as Record<string, unknown>)) if (!k.startsWith("_")) leaves(v, out);
  }
}

test("visible text is traceable to the JSON (hardcode detector, all views)", async ({ page }) => {
  test.setTimeout(150_000);
  const corpus: string[] = [];
  leaves([app, indicators, environments, protocols, sources, strings], corpus);
  const regs = Object.values(strings)
    .filter((s) => s.includes("{"))
    .map((s) => new RegExp("^" + escapeRe(s).replace(/\\\{\w+\\\}/g, ".+?") + "$"));

  const isMapped = (s: string): boolean => {
    if (!/[A-Za-z]/.test(s)) return true; // numeros, horas, glifos
    if (corpus.some((c) => c === s || (s.length >= 6 && c.includes(s)))) return true;
    if (regs.some((r) => r.test(s))) return true;
    // " / " separa el estado de cada componente de un input pair (p. ej. "Normal / Normal").
    const parts = s.split(/\s[—·–\-/]\s|:\s|,\s/).filter((p) => p.length > 0);
    return parts.length > 1 && parts.every((p) => isMapped(p));
  };

  const unmapped = new Map<string, string[]>();
  for (const route of ROUTES_TO_AUDIT) {
    // pagina nueva por ruta con localStorage limpio (el sembrado, si corresponde, lo agrega runRoute)
    const p = await page.context().newPage();
    await p.addInitScript(() => window.localStorage.clear());
    await runRoute(p, route);
    await p.waitForTimeout(200);
    const texts = await p.evaluate(() => {
      const out: string[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null = walker.nextNode();
      while (node) {
        const parent = node.parentElement;
        if (parent && !["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) {
          const s = (node.textContent ?? "").replace(/\s+/g, " ").trim();
          if (s) out.push(s);
        }
        node = walker.nextNode();
      }
      for (const el of Array.from(document.querySelectorAll("[aria-label],[title],[placeholder]"))) {
        for (const a of ["aria-label", "title", "placeholder"]) {
          const v = el.getAttribute(a);
          if (v) out.push(v.trim());
        }
      }
      out.push(document.title);
      return Array.from(new Set(out));
    });
    for (const s of texts) {
      if (!isMapped(s)) unmapped.set(s, [...(unmapped.get(s) ?? []), route.name]);
    }
    await p.close();
  }
  for (const [text, routes] of unmapped) console.log("UNMAPPED", JSON.stringify(text), routes.join(","));
  console.log("UNMAPPED-COUNT", unmapped.size);
  expect.soft([...unmapped.keys()], "visible strings not found in any data/config JSON (see UNMAPPED lines)").toEqual([]);
});
