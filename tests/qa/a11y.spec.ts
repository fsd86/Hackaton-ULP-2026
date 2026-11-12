import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import {
  focusInfo,
  hasVisibleFocus,
  indicators,
  must,
  ROUTES_TO_AUDIT,
  runRoute,
  strings,
  tabUntil,
  writeOut,
  type FocusInfo,
} from "./helpers";

// Auditoria de accesibilidad: axe por ruta/estado (NO falla por violaciones: las adjunta y las loguea)
// + pruebas de teclado (estas si usan expect.soft para marcar lo que no funciona).

interface AxeViolation {
  id: string;
  impact?: string | null;
  help: string;
  helpUrl: string;
  nodes: Array<{ target: unknown; html: string; failureSummary?: string }>;
}

function summarise(violations: readonly AxeViolation[]) {
  return violations.map((v) => ({
    id: v.id,
    impact: v.impact ?? null,
    help: v.help,
    helpUrl: v.helpUrl,
    nodeCount: v.nodes.length,
    nodes: v.nodes.map((n) => ({
      target: n.target,
      html: n.html.slice(0, 240),
      failureSummary: (n.failureSummary ?? "").replace(/\s+/g, " ").slice(0, 400),
    })),
  }));
}

// Etiquetas de la nav principal: salen de strings.en.json (claves nav.*), sin el boton Emergency.
const NAV_LABELS = Object.keys(strings)
  .filter((k) => k.startsWith("nav.") && !["nav.main_label", "nav.skip_to_content", "nav.emergency"].includes(k))
  .map((k) => strings[k]);

for (const route of ROUTES_TO_AUDIT) {
  test(`axe: ${route.name}`, async ({ page }, testInfo) => {
    await runRoute(page, route);
    await page.waitForTimeout(300);
    const label = `${route.name}@${testInfo.project.name}`;

    // 1) reglas WCAG 2.0/2.1 A y AA
    const wcag = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const violations = summarise(wcag.violations);
    const incomplete = summarise(wcag.incomplete);
    const body = JSON.stringify({ route: route.name, project: testInfo.project.name, url: page.url(), violations, incomplete }, null, 2);
    await testInfo.attach(`axe-${label}`, { body, contentType: "application/json" });
    const file = writeOut(`axe-${route.name}-${testInfo.project.name}.json`, body);
    if (violations.length === 0) console.log("AXE", label, "none", "-", 0);
    for (const v of violations) {
      console.log("AXE", label, v.id, v.impact, v.nodeCount, JSON.stringify(v.nodes.slice(0, 2).map((n) => n.target)));
    }
    for (const v of incomplete) console.log("AXE-REVIEW", label, v.id, v.impact, v.nodeCount);
    console.log("AXE-FILE", file);

    // 2) buenas practicas (heading-order, landmarks, region...) como informacion aparte
    const bp = await new AxeBuilder({ page }).withTags(["best-practice"]).analyze();
    const bpSummary = summarise(bp.violations);
    const bpBody = JSON.stringify(bpSummary, null, 2);
    await testInfo.attach(`axe-bestpractice-${label}`, { body: bpBody, contentType: "application/json" });
    writeOut(`axe-bp-${route.name}-${testInfo.project.name}.json`, bpBody);
    for (const v of bpSummary) console.log("AXE-BP", label, v.id, v.impact, v.nodeCount, JSON.stringify(v.nodes.slice(0, 1).map((n) => n.target)));
  });
}

test.describe("keyboard", () => {
  test("tab order: skip link, environment select, Emergency, nav; visible focus on every stop", async ({ page }, testInfo) => {
    await page.goto("/#/");
    await page.getByRole("heading", { level: 1, name: strings["board.title"] }).waitFor();
    const trail: FocusInfo[] = [];
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press("Tab");
      trail.push(await focusInfo(page));
    }
    console.log("KBD tab-order", testInfo.project.name, trail.map((f) => `${f.tag}:${f.name || f.id}`).join(" | "));
    const idx = (pred: (f: FocusInfo) => boolean) => trail.findIndex(pred);
    const skip = idx((f) => f.name === strings["nav.skip_to_content"]);
    const env = idx((f) => f.tag === "SELECT");
    const emergency = idx((f) => f.name.includes(strings["emergency.button"]));
    expect.soft(skip, "skip link is the first tab stop").toBe(0);
    expect.soft(env, "environment select reachable").toBeGreaterThan(skip);
    expect.soft(emergency, "Emergency button reachable after the select").toBeGreaterThan(env);
    for (const label of NAV_LABELS) {
      const i = idx((f) => f.name === label);
      expect.soft(i, `nav link "${label}" reachable within 14 tabs, after Emergency`).toBeGreaterThan(emergency);
    }
    const weak = trail.filter((f) => !hasVisibleFocus(f)).map((f) => f.name || f.tag);
    expect.soft(weak, "tab stops without a visible focus indicator").toEqual([]);
    const hidden = trail.filter((f) => f.obscured).map((f) => f.name || f.tag);
    expect.soft(hidden, "focused elements covered by another element").toEqual([]);
  });

  test("skip link becomes visible and moves focus to <main>", async ({ page }) => {
    await page.goto("/#/");
    await page.getByRole("heading", { level: 1, name: strings["board.title"] }).waitFor();
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: strings["nav.skip_to_content"], exact: true });
    await expect.soft(skip).toBeFocused();
    await expect.soft(skip).toBeInViewport();
    const box = await skip.boundingBox();
    expect.soft((box?.width ?? 0) > 20 && (box?.height ?? 0) > 20, "skip link is actually visible when focused").toBe(true);
    await page.keyboard.press("Enter");
    const active = await focusInfo(page);
    expect.soft(active.id, "Enter on the skip link focuses <main id=main>").toBe("main");
    expect.soft(new URL(page.url()).hash, "skip link must not break hash routing").toBe("#/");
    await page.keyboard.press("Tab");
    const next = await page.evaluate(() => !!document.activeElement?.closest("main"));
    expect.soft(next, "next Tab lands inside <main>").toBe(true);
  });

  test("Emergency button reachable and operable by keyboard", async ({ page }) => {
    await page.goto("/#/");
    await page.getByRole("heading", { level: 1, name: strings["board.title"] }).waitFor();
    const r = await tabUntil(page, (f) => f.name.includes(strings["emergency.button"]), 10);
    console.log("KBD emergency-tabs", r.tabs);
    expect.soft(r.found, "Emergency reachable within 10 tabs").toBe(true);
    await page.keyboard.press("Enter");
    await expect.soft(page).toHaveURL(/#\/emergency$/);
    await expect.soft(page.getByRole("heading", { level: 1, name: strings["emergency.title"] })).toBeVisible();
  });

  test("daily check wizard completed with the keyboard only", async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    const project = testInfo.project.name;
    await page.goto("/#/");
    await page.getByRole("heading", { level: 1, name: strings["board.title"] }).waitFor();

    const nav = await tabUntil(page, (f) => f.name === strings["nav.daily_check"], 30);
    console.log("KBD to-nav", project, nav.tabs);
    expect.soft(nav.found, "nav link Daily check reachable").toBe(true);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#\/check$/);

    const start = await tabUntil(page, (f) => f.name === strings["daily.start"], 15);
    console.log("KBD to-start", project, start.tabs);
    expect.soft(start.found, "Start daily check reachable").toBe(true);
    await page.keyboard.press("Enter");

    for (let i = 0; i < indicators.length; i++) {
      const ind = must(indicators[i], "indicator");
      const title = await focusInfo(page);
      expect.soft(title.name, `step ${i + 1}: focus moves to the indicator title`).toContain(ind.name);

      const input = await tabUntil(page, (f) => f.tag === "INPUT", 30);
      expect.soft(input.found, `${ind.name}: input reachable`).toBe(true);
      if (ind.input.kind === "scale") {
        await page.keyboard.press("Space");
      } else {
        await page.keyboard.type("1");
        if (ind.input.kind === "pair") {
          await page.keyboard.press("Tab");
          await page.keyboard.type("1");
        }
      }
      const save = await tabUntil(page, (f) => f.name === strings["daily.save"], 10);
      expect.soft(save.found, `${ind.name}: Save reachable`).toBe(true);
      await page.keyboard.press("Enter");
      await page.getByRole("heading", { name: strings["daily.result"], exact: true }).waitFor();

      // Tras guardar, el formulario se desmonta: donde queda el foco?
      const after = await focusInfo(page);
      console.log("KBD focus-after-save", project, ind.id, `${after.tag}:${after.name}`);
      expect.soft(after.tag, `${ind.name}: focus must not be lost to <body> after saving`).not.toBe("BODY");

      const last = i === indicators.length - 1;
      const nextLabel = last ? strings["daily.finish"] : strings["common.next"];
      const next = await tabUntil(page, (f) => f.name === nextLabel, 80);
      console.log("KBD tabs-to-next", project, ind.id, next.tabs);
      expect.soft(next.found, `${ind.name}: "${nextLabel}" reachable`).toBe(true);
      expect.soft(next.tabs, `${ind.name}: tabs needed to reach "${nextLabel}" after saving`).toBeLessThanOrEqual(8);
      await page.keyboard.press("Enter");
    }
    const done = await focusInfo(page);
    expect.soft(done.name).toContain(strings["daily.complete"]);
    await expect.soft(page.getByRole("heading", { name: strings["daily.complete"] })).toBeVisible();
  });
});
