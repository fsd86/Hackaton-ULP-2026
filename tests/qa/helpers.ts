import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Page, TestInfo } from "@playwright/test";

// Utilidades compartidas de los tests de QA. Todo el contenido se lee de data/ y config/
// (nunca se copian textos ni umbrales a mano), para que un cambio en un JSON no rompa el oracle.

export type Health = "normal" | "attention" | "critical";
export type ReadingValue = number | [number, number];

export interface RangeJson {
  status: Health;
  min: number | null;
  max: number | null;
  source_ids: string[];
}
export interface ActionJson {
  text: string[];
  escalation: "self" | "crew" | "ground";
  protocol_id?: string;
}
export interface IndicatorJson {
  id: string;
  name: string;
  unit: string;
  category: string;
  input: {
    kind: "number" | "pair" | "scale";
    step?: number;
    min?: number;
    max?: number;
    labels?: string[] | Record<string, string>;
  };
  how_to_measure: string[];
  why_it_matters: string;
  frequency: { every_hours: number | null; label: string };
  ranges: RangeJson[];
  ranges_secondary?: RangeJson[];
  actions: Partial<Record<Health, ActionJson>>;
  source_ids: string[];
  status: "VERIFIED" | "PLACEHOLDER";
}
export interface DelayJson {
  min: number | null;
  max: number | null;
  source_ids: string[];
}
export interface EnvironmentJson {
  id: string;
  name: string;
  description: string;
  comm_delay_one_way_s: DelayJson;
  status: "VERIFIED" | "PLACEHOLDER";
}
export interface ProtocolJson {
  id: string;
  title: string;
  trigger: string[];
  escalation: "self" | "crew" | "ground";
  steps: Array<{ text: string; detail?: string; timer_s?: number; source_ids: string[] }>;
  report_fields: string[];
  source_ids: string[];
  status: "VERIFIED" | "PLACEHOLDER";
}
export interface SourceJson {
  id: string;
  title: string;
  publisher: string;
  url: string;
  accessed: string;
  license?: string;
  notes?: string;
  status: "VERIFIED" | "PLACEHOLDER";
}
export interface AppJson {
  app_name: string;
  tagline: string;
  default_language: string;
  default_environment: string;
  disclaimer: string;
  realtime_threshold_s: number;
  features: Record<string, boolean>;
}

function load<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(path), "utf8")) as T;
}

export const strings = load<Record<string, string>>("config/strings.en.json");
export const app = load<AppJson>("config/app.json");
export const indicators = load<{ indicators: IndicatorJson[] }>("data/indicators.json").indicators;
export const environments = load<{ environments: EnvironmentJson[] }>("data/environments.json").environments;
export const protocols = load<{ protocols: ProtocolJson[] }>("data/protocols.json").protocols;
export const sources = load<{ sources: SourceJson[] }>("data/sources.json").sources;

export function must<T>(value: T | undefined | null, what: string): T {
  if (value === undefined || value === null) throw new Error(`QA setup: ${what} not found in the JSON files`);
  return value;
}

/** Reemplaza {var} en una plantilla de strings.en.json. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Plantilla "{a} to {b}" -> RegExp anclada; cada {var} pasa a `sub`. */
export function templateRegex(template: string, sub = "(.+?)"): RegExp {
  return new RegExp("^" + escapeRe(template).replace(/\\\{\w+\\\}/g, sub) + "$");
}

// ---------- oracle independiente de la logica de la app (src/logic/evaluate.ts) ----------

const SEV: Record<Health, number> = { normal: 0, attention: 1, critical: 2 };

export function evalRanges(ranges: RangeJson[], v: number): Health | "unknown" {
  const hits = ranges.filter(
    (r) => (r.min !== null || r.max !== null) && (r.min === null || v >= r.min) && (r.max === null || v <= r.max),
  );
  if (hits.length === 0) return "unknown";
  return hits.reduce((a, b) => (SEV[b.status] > SEV[a.status] ? b : a)).status;
}

export function evalIndicator(ind: IndicatorJson, value: ReadingValue): Health | "unknown" {
  if (ind.input.kind === "pair") {
    if (!Array.isArray(value)) return "unknown";
    const known = [evalRanges(ind.ranges, value[0]), evalRanges(ind.ranges_secondary ?? [], value[1])].filter(
      (s): s is Health => s !== "unknown",
    );
    if (known.length === 0) return "unknown";
    const worst = known.reduce((a, b) => (SEV[b] > SEV[a] ? b : a));
    if (known.length < 2 && worst === "normal") return "unknown";
    return worst;
  }
  if (Array.isArray(value)) return "unknown";
  return evalRanges(ind.ranges, value);
}

/** Un valor "tipico" dentro de un rango, sin inventar umbrales: sale de los limites del propio JSON. */
export function sampleOf(r: RangeJson): number | null {
  if (r.min !== null && r.max !== null) return Math.round((r.min + r.max) / 2);
  if (r.min !== null) return Math.ceil(r.min) + 1;
  if (r.max !== null) return Math.floor(r.max) - 1;
  return null;
}

export function sampleFor(ranges: RangeJson[], status: Health): number | null {
  const exact = ranges.find((r) => r.status === status && sampleOf(r) !== null);
  if (exact) return sampleOf(exact);
  const any = ranges.find((r) => sampleOf(r) !== null);
  return any ? sampleOf(any) : null;
}

/** Valor con estado critical segun el JSON (p. ej. 190/125 para la presion con las fuentes cargadas). */
export function criticalValueFor(ind: IndicatorJson): ReadingValue | null {
  const crit = ind.ranges.find((r) => r.status === "critical" && r.min !== null);
  if (ind.input.kind === "pair") {
    if (!crit) return null;
    const crit2 = (ind.ranges_secondary ?? []).find((r) => r.status === "critical" && r.min !== null);
    return [Math.ceil(crit.min as number) + 9, crit2 ? Math.ceil(crit2.min as number) + 4 : 80];
  }
  if (ind.input.kind === "number" && crit) return Math.ceil(crit.min as number) + 9;
  return null;
}

// ---------- demora de comunicacion (mismo formato que src/logic/delay.ts, reimplementado) ----------

export function fmtMinutes(seconds: number): string {
  const m = seconds / 60;
  return m >= 10 ? String(Math.round(m)) : String(Number(m.toFixed(1)));
}

export function expectedDelayText(d: { min: number | null; max: number | null }): string {
  if (d.min === null && d.max === null) return strings["environment.delay.unknown"];
  const lo = (d.min ?? d.max) as number;
  const hi = (d.max ?? d.min) as number;
  if (hi < 60) return strings["environment.delay.near_realtime"];
  if (fmtMinutes(lo) === fmtMinutes(hi)) return fill(strings["environment.delay.single"], { min: fmtMinutes(lo) });
  return fill(strings["environment.delay.range"], { min: fmtMinutes(lo), max: fmtMinutes(hi) });
}

export function fmtHM(ms: number): string {
  return new Date(ms).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
}

// ---------- salidas (capturas y archivos) ----------

const OUT = "test-results/qa";

export function writeOut(file: string, content: string): string {
  const full = resolve(OUT, file);
  mkdirSync(resolve(full, ".."), { recursive: true });
  writeFileSync(full, content, "utf8");
  return full;
}

export async function shot(page: Page, testInfo: TestInfo, name: string, fullPage = false): Promise<string> {
  const dir = resolve(OUT, "shots");
  mkdirSync(dir, { recursive: true });
  const path = resolve(dir, `${name}-${testInfo.project.name}.png`);
  await page.screenshot({ path, fullPage });
  await testInfo.attach(`${name}-${testInfo.project.name}`, { path, contentType: "image/png" });
  console.log("SHOT", path);
  return path;
}

/** Errores de pagina, de consola y requests fallidas, para listarlos al final. */
export function watchPage(page: Page): string[] {
  const issues: string[] = [];
  page.on("pageerror", (e) => issues.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") issues.push(`console.${m.type()}: ${m.text()}`);
  });
  page.on("requestfailed", (r) => issues.push(`requestfailed: ${r.url()}`));
  return issues;
}

/** true si el documento no desborda horizontalmente (layout movil). */
export async function noHorizontalOverflow(page: Page): Promise<{ ok: boolean; scrollWidth: number; innerWidth: number }> {
  return page.evaluate(() => ({
    ok: document.documentElement.scrollWidth <= window.innerWidth + 1,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
}

// ---------- datos de prueba en localStorage ----------

/** Escribe claves de localStorage solo si todavia no existen (el init script corre en cada navegacion). */
export async function seedStorage(page: Page, entries: Record<string, string>): Promise<void> {
  await page.addInitScript((e: Record<string, string>) => {
    for (const [k, v] of Object.entries(e)) {
      if (window.localStorage.getItem(k) === null) window.localStorage.setItem(k, v);
    }
  }, entries);
}

export interface SeedReading {
  id: string;
  indicatorId: string;
  value: ReadingValue;
  environmentId: string;
  timestamp: number;
}

const SEED_STATUSES: Health[] = ["normal", "normal", "attention", "normal", "critical"];
const SEED_HOURS_AGO = [100, 50, 20, 6, 1];

/** 5 lecturas por indicador (entre 100 h y 1 h atras) con valores derivados de los rangos del JSON. */
export function buildSeed(now: number = Date.now()): SeedReading[] {
  const out: SeedReading[] = [];
  for (const ind of indicators) {
    SEED_STATUSES.forEach((status, k) => {
      let value: ReadingValue;
      if (ind.input.kind === "scale") {
        const lo = ind.input.min ?? 1;
        const span = (ind.input.max ?? 5) - lo + 1;
        value = lo + (k % span);
      } else if (ind.input.kind === "pair") {
        value = [sampleFor(ind.ranges, status) ?? k + 1, sampleFor(ind.ranges_secondary ?? [], status) ?? k + 1];
      } else {
        value = sampleFor(ind.ranges, status) ?? k + 1;
      }
      out.push({
        id: `qa-${ind.id}-${k}`,
        indicatorId: ind.id,
        value,
        environmentId: app.default_environment,
        timestamp: now - SEED_HOURS_AGO[k] * 3_600_000,
      });
    });
  }
  return out;
}

export const SEED_KEY = "eif.readings";

// ---------- pasos reutilizables de UI ----------

export const pairIndicator = (): IndicatorJson => must(indicators.find((i) => i.input.kind === "pair"), "a pair indicator");
export const mainProtocol = (): ProtocolJson => must(protocols[0], "a protocol");

export async function openIndicator(page: Page, ind: IndicatorJson): Promise<void> {
  await page.goto("/#/check");
  await page.getByRole("button", { name: `${strings["daily.open_indicator"]}: ${ind.name}` }).click();
  await page.getByRole("heading", { level: 2, name: ind.name }).first().waitFor();
}

export async function enterReading(page: Page, ind: IndicatorJson, value: ReadingValue | null): Promise<void> {
  if (ind.input.kind === "pair" && Array.isArray(value)) {
    await page.getByRole("spinbutton").nth(0).fill(String(value[0]));
    await page.getByRole("spinbutton").nth(1).fill(String(value[1]));
  } else if (ind.input.kind === "number" && typeof value === "number") {
    await page.getByRole("spinbutton").fill(String(value));
  } else {
    await page.getByRole("radio").first().check();
  }
  await page.getByRole("button", { name: strings["daily.save"], exact: true }).click();
}

export async function startProtocol(page: Page, protocol: ProtocolJson): Promise<void> {
  await page.goto("/#/emergency");
  await page.getByRole("button", { name: `${strings["emergency.start"]}: ${protocol.title}` }).click();
  await page.locator("#em-step-title").waitFor();
}

export interface RouteSetup {
  name: string;
  seeded?: boolean;
  run: (page: Page) => Promise<void>;
}

/** Las vistas/estados que se auditan (a11y y texto hardcodeado). */
export const ROUTES_TO_AUDIT: RouteSetup[] = [
  {
    name: "home",
    run: async (p) => {
      await p.goto("/#/");
      await p.getByRole("heading", { level: 1, name: strings["board.title"] }).waitFor();
    },
  },
  {
    name: "home-seeded",
    seeded: true,
    run: async (p) => {
      await p.goto("/#/");
      await p.getByRole("heading", { level: 1, name: strings["board.title"] }).waitFor();
    },
  },
  {
    name: "check",
    run: async (p) => {
      await p.goto("/#/check");
      await p.getByRole("heading", { level: 1, name: strings["daily.title"] }).waitFor();
    },
  },
  {
    name: "wizard",
    run: async (p) => {
      await p.goto("/#/check");
      await p.getByRole("button", { name: strings["daily.start"], exact: true }).click();
      await p.getByRole("heading", { level: 2, name: must(indicators[0], "an indicator").name }).waitFor();
    },
  },
  {
    name: "result",
    run: async (p) => {
      const ind = pairIndicator();
      await openIndicator(p, ind);
      await enterReading(p, ind, criticalValueFor(ind));
      await p.getByRole("heading", { name: strings["daily.result"], exact: true }).waitFor();
    },
  },
  {
    name: "emergency",
    run: async (p) => {
      await p.goto("/#/emergency");
      await p.getByRole("heading", { level: 1, name: strings["emergency.title"] }).waitFor();
    },
  },
  {
    name: "protocol",
    run: async (p) => {
      await startProtocol(p, mainProtocol());
    },
  },
  {
    name: "exit-dialog",
    run: async (p) => {
      await startProtocol(p, mainProtocol());
      await p.getByRole("button", { name: strings["emergency.exit"], exact: true }).click();
      await p.getByRole("dialog").waitFor();
    },
  },
  {
    name: "report",
    seeded: true,
    run: async (p) => {
      await p.goto("/#/report");
      await p.getByRole("heading", { level: 1, name: strings["report.title"] }).waitFor();
    },
  },
  {
    name: "sources",
    run: async (p) => {
      await p.goto("/#/sources");
      await p.getByRole("heading", { level: 1, name: strings["sources.title"] }).waitFor();
    },
  },
];

export async function runRoute(page: Page, route: RouteSetup): Promise<void> {
  if (route.seeded) await seedStorage(page, { [SEED_KEY]: JSON.stringify(buildSeed()) });
  await route.run(page);
}

// ---------- teclado ----------

export interface FocusInfo {
  tag: string;
  id: string;
  type: string;
  name: string;
  outlineStyle: string;
  outlineWidth: number;
  boxShadow: boolean;
  inViewport: boolean;
  obscured: boolean;
}

export async function focusInfo(page: Page): Promise<FocusInfo> {
  return page.evaluate((): FocusInfo => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) {
      return { tag: "BODY", id: "", type: "", name: "", outlineStyle: "none", outlineWidth: 0, boxShadow: false, inViewport: false, obscured: false };
    }
    const labels = (el as HTMLInputElement).labels;
    const labelText = labels ? Array.from(labels).map((l) => l.textContent ?? "").join(" ") : "";
    const raw = el.getAttribute("aria-label") || labelText || el.textContent || "";
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const inViewport = r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= window.innerHeight;
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {
      tag: el.tagName,
      id: el.id,
      type: el.getAttribute("type") ?? "",
      name: raw.replace(/\s+/g, " ").trim().slice(0, 80),
      outlineStyle: cs.outlineStyle,
      outlineWidth: parseFloat(cs.outlineWidth) || 0,
      boxShadow: cs.boxShadow !== "none",
      inViewport,
      obscured: inViewport && !(hit !== null && (hit === el || el.contains(hit))),
    };
  });
}

export function hasVisibleFocus(f: FocusInfo): boolean {
  return (f.outlineStyle !== "none" && f.outlineWidth >= 2) || f.boxShadow;
}

/** Pulsa Tab hasta que el foco cumpla `pred`. Devuelve cuantos Tab hicieron falta y el recorrido. */
export async function tabUntil(
  page: Page,
  pred: (f: FocusInfo) => boolean,
  max = 80,
): Promise<{ found: boolean; tabs: number; trail: FocusInfo[] }> {
  const trail: FocusInfo[] = [];
  for (let i = 1; i <= max; i++) {
    await page.keyboard.press("Tab");
    const f = await focusInfo(page);
    trail.push(f);
    if (pred(f)) return { found: true, tabs: i, trail };
  }
  return { found: false, tabs: max, trail };
}
