import type { Indicator } from "../content/schemas";
import type { ReadingValue } from "./evaluate";

// Linea de base personal ("Your own normal"). Funciones puras: reciben lecturas y "ahora", no leen storage ni reloj.
// window_days / min_readings son parametros de DISENO (config/app.json baseline), no umbrales medicos.
// El desvio se muestra solo como referencia: nunca cambia el estado por rangos con fuente.

export type BaselineSource = "readings" | "demo";

/** Media por indicador: numero (kind number) o par por componente (kind pair). */
export type BaselineMean = number | [number, number];

export interface BaselineEntry {
  indicatorId: string;
  mean: BaselineMean;
  /** Cantidad de lecturas promediadas. */
  n: number;
  /** Primera y ultima lectura promediada (epoch ms). */
  from: number;
  to: number;
}

export interface Baseline {
  source: BaselineSource;
  createdAt: number; // epoch ms
  windowDays: number;
  minReadings: number;
  entries: BaselineEntry[];
}

export interface BaselineParams {
  windowDays: number;
  minReadings: number;
}

/** Lectura minima que necesita el calculo (Reading de storage o lectura demo resuelta). */
export interface BaselineReading {
  indicatorId: string;
  value: ReadingValue;
  timestamp: number;
}

/** Motivo por el que un indicador queda sin linea de base. */
export type BaselineSkip = "scale" | "insufficient";

export interface BaselineResult {
  entries: BaselineEntry[];
  skipped: Array<{ indicatorId: string; reason: BaselineSkip; n: number }>;
}

const DAY_MS = 24 * 3_600_000;

/** Solo indicadores numericos: en una escala ordinal (mood 1-5) un % de cambio no tiene sentido. */
export function isBaselineEligible(ind: Pick<Indicator, "input">): boolean {
  return ind.input.kind === "number" || ind.input.kind === "pair";
}

function shapeMatches(ind: Pick<Indicator, "input">, value: ReadingValue): boolean {
  return ind.input.kind === "pair" ? Array.isArray(value) : typeof value === "number";
}

/** Lecturas previas que entran en la media: ventana [now - windowDays, now], sin la mas reciente del indicador. */
export function baselineWindowReadings<R extends BaselineReading>(
  ind: Pick<Indicator, "id" | "input">,
  readings: R[],
  params: BaselineParams,
  now: number,
): R[] {
  const since = now - params.windowDays * DAY_MS;
  const own = readings
    .filter((r) => r.indicatorId === ind.id && r.timestamp <= now && shapeMatches(ind, r.value))
    .sort((a, b) => a.timestamp - b.timestamp);
  // La mas reciente (aunque este fuera de la ventana) es la que se compara: nunca se promedia consigo misma.
  return own.slice(0, -1).filter((r) => r.timestamp >= since);
}

function mean(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/** Linea de base de un indicador, o null si no es elegible o hay menos de minReadings lecturas previas. */
export function computeIndicatorBaseline(
  ind: Pick<Indicator, "id" | "input">,
  readings: BaselineReading[],
  params: BaselineParams,
  now: number,
): BaselineEntry | null {
  if (!isBaselineEligible(ind)) return null;
  const used = baselineWindowReadings(ind, readings, params, now);
  if (used.length === 0 || used.length < params.minReadings) return null;
  const m: BaselineMean =
    ind.input.kind === "pair"
      ? [mean(used.map((r) => (r.value as [number, number])[0])), mean(used.map((r) => (r.value as [number, number])[1]))]
      : mean(used.map((r) => r.value as number));
  return { indicatorId: ind.id, mean: m, n: used.length, from: used[0]!.timestamp, to: used[used.length - 1]!.timestamp };
}

/** Linea de base de todos los indicadores + los que quedaron fuera y por que. */
export function computeBaseline(
  indicators: Array<Pick<Indicator, "id" | "input">>,
  readings: BaselineReading[],
  params: BaselineParams,
  now: number,
): BaselineResult {
  const out: BaselineResult = { entries: [], skipped: [] };
  for (const ind of indicators) {
    if (!isBaselineEligible(ind)) {
      out.skipped.push({ indicatorId: ind.id, reason: "scale", n: 0 });
      continue;
    }
    const entry = computeIndicatorBaseline(ind, readings, params, now);
    if (entry) out.entries.push(entry);
    else out.skipped.push({ indicatorId: ind.id, reason: "insufficient", n: baselineWindowReadings(ind, readings, params, now).length });
  }
  return out;
}

/** Desvio relativo en %: (valor - media) / |media| x 100. null si la media es 0 (no hay % definido). */
export function relativeDeviation(value: number, base: number): number | null {
  if (!Number.isFinite(value) || !Number.isFinite(base) || base === 0) return null;
  return ((value - base) / Math.abs(base)) * 100;
}

/** Desvio por componente (1 para number, 2 para pair); null si la forma no coincide o no se puede calcular. */
export function deviationFromBaseline(entry: Pick<BaselineEntry, "mean">, value: ReadingValue): Array<number | null> | null {
  if (Array.isArray(entry.mean) !== Array.isArray(value)) return null;
  if (Array.isArray(entry.mean) && Array.isArray(value)) {
    return [relativeDeviation(value[0], entry.mean[0]), relativeDeviation(value[1], entry.mean[1])];
  }
  return [relativeDeviation(value as number, entry.mean as number)];
}

/** "+12%", "-5%", "0%" (redondeado al entero; nunca "-0%"). */
export function formatDeviation(pct: number): string {
  const r = Math.round(pct);
  if (r === 0) return "0%";
  return `${r > 0 ? "+" : "-"}${Math.abs(r)}%`;
}

/** Media legible: hasta 1 decimal ("75.9", "116 / 74.3"). */
export function formatMean(m: BaselineMean): string {
  const one = (v: number): string => String(Math.round(v * 10) / 10);
  return Array.isArray(m) ? `${one(m[0])} / ${one(m[1])}` : one(m);
}

export function findBaselineEntry(baseline: Baseline | null, indicatorId: string): BaselineEntry | undefined {
  return baseline?.entries.find((e) => e.indicatorId === indicatorId);
}
