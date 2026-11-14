import type { Environment, HealthStatus, Indicator, Range } from "../content/schemas";
import type { Reading } from "../storage/local";
import { evaluate, evaluateRanges, type EvalStatus } from "./evaluate";

export interface TrendPoint {
  t: number; // epoch ms
  v: number;
  status: EvalStatus;
}

export interface TrendSeries {
  index: 0 | 1;
  /** Índice en input.labels (solo relevante para pair). */
  labelIndex: 0 | 1;
  points: TrendPoint[];
}

export interface TrendBand {
  status: HealthStatus;
  from: number;
  to: number;
}

export interface TrendDomain {
  tMin: number;
  tMax: number;
  vMin: number;
  vMax: number;
}

export interface Trend {
  series: TrendSeries[];
  /** bands[i] = franjas de la serie i (comparten el dominio vertical). */
  bands: TrendBand[][];
  domain: TrendDomain;
  empty: boolean;
}

export interface BuildTrendInput {
  indicator: Indicator;
  readings: Reading[];
  environment?: Pick<Environment, "indicator_overrides">;
  sinceMs?: number;
  now: number;
  maxPoints?: number;
  /** true = el eje X cubre la ventana completa [now - sinceMs, now] (p. ej. 7 dias), no solo el tramo con datos. */
  fixedWindow?: boolean;
}

export const DEFAULT_SINCE_MS = 7 * 24 * 3_600_000;
export const DEFAULT_MAX_POINTS = 30;

interface RawBand {
  status: HealthStatus;
  from: number | null;
  to: number | null;
}

/**
 * Ordena e ignora rangos nulos/nulos y rangos SIN fuente (source_ids vacio): nunca se sombrea un rango no citado.
 * Los bordes son los reales de la fuente (sin normalizar). Los huecos entre rangos quedan sin sombrear.
 */
function normalizeRanges(ranges: Range[]): RawBand[] {
  return ranges
    .filter((r) => (r.min !== null || r.max !== null) && r.source_ids.length > 0)
    .map((r) => ({ status: r.status, from: r.min, to: r.max }))
    .sort((a, b) => (a.from ?? -Infinity) - (b.from ?? -Infinity));
}

export function buildTrend({
  indicator,
  readings,
  environment,
  sinceMs = DEFAULT_SINCE_MS,
  now,
  maxPoints = DEFAULT_MAX_POINTS,
  fixedWindow = false,
}: BuildTrendInput): Trend {
  const isPair = indicator.input.kind === "pair";
  const primary = environment?.indicator_overrides[indicator.id]?.ranges ?? indicator.ranges;
  const rangeSets: Range[][] = isPair ? [primary, indicator.ranges_secondary ?? []] : [primary];

  const cutoff = now - sinceMs;
  const selected = readings
    .filter((r) => r.indicatorId === indicator.id && r.timestamp >= cutoff)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-Math.max(0, maxPoints));

  const series: TrendSeries[] = rangeSets.map((_, i) => ({
    index: i as 0 | 1,
    labelIndex: i as 0 | 1,
    points: [],
  }));

  for (const r of selected) {
    if (isPair) {
      if (!Array.isArray(r.value) || r.value.length !== 2) continue;
      for (let i = 0; i < 2; i++) {
        const v = r.value[i]!;
        series[i]!.points.push({ t: r.timestamp, v, status: evaluateRanges(rangeSets[i]!, v) });
      }
    } else {
      if (Array.isArray(r.value)) continue;
      series[0]!.points.push({ t: r.timestamp, v: r.value, status: evaluate(indicator, r.value, environment) });
    }
  }

  const allPoints = series.flatMap((s) => s.points);
  if (allPoints.length === 0) {
    return {
      series,
      bands: series.map(() => []),
      domain: { tMin: now - sinceMs, tMax: now, vMin: 0, vMax: 0 },
      empty: true,
    };
  }

  const rawBands = rangeSets.map(normalizeRanges);

  // Dominio vertical: valores + bordes finitos de bandas, con 10% de padding.
  const vs: number[] = allPoints.map((p) => p.v);
  for (const set of rawBands) {
    for (const b of set) {
      if (b.from !== null) vs.push(b.from);
      if (b.to !== null) vs.push(b.to);
    }
  }
  const lo = Math.min(...vs);
  const hi = Math.max(...vs);
  const pad = hi > lo ? (hi - lo) * 0.1 : 1;
  const vMin = lo - pad;
  const vMax = hi + pad;

  const ts = allPoints.map((p) => p.t);
  let tMin = Math.min(...ts);
  let tMax = Math.max(...ts);
  if (fixedWindow) {
    tMin = now - sinceMs;
    tMax = now;
  } else if (tMin === tMax) {
    tMin -= sinceMs / 2;
    tMax += sinceMs / 2;
  }

  const bands: TrendBand[][] = rawBands.map((set) =>
    set.map((b) => ({ status: b.status, from: b.from ?? vMin, to: b.to ?? vMax })),
  );

  return { series, bands, domain: { tMin, tMax, vMin, vMax }, empty: false };
}
