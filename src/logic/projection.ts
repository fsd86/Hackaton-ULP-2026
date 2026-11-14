import type { TrendSeries } from "./trend";

/**
 * Extrapolacion lineal de una tendencia (DEMO visual, NO es una prediccion medica).
 * Ajuste por minimos cuadrados sobre los puntos graficados y prolongacion recta hasta horizon_hours
 * despues de la ultima lectura. No compara con umbrales ni calcula cruces: solo devuelve dos puntos.
 */

export interface ProjectionParams {
  enabled: boolean;
  /** Horas a extrapolar despues de la ultima lectura (parametro de DISENO, no medico). */
  horizon_hours: number;
  /** Minimo de puntos para dibujar la extrapolacion (parametro de DISENO, no medico). */
  min_points: number;
}

export interface LinearFit {
  /** Pendiente en unidades del valor por ms. */
  slope: number;
  /** Valor ajustado en t = 0 (epoch). Se calcula centrado para evitar perdida de precision. */
  at: (t: number) => number;
}

export interface ProjectedSegment {
  index: 0 | 1;
  from: { t: number; v: number };
  to: { t: number; v: number };
}

const HOUR_MS = 3_600_000;

/** Minimos cuadrados v = a + b·t. null si hay menos de 2 puntos o todos en el mismo instante. */
export function linearFit(points: { t: number; v: number }[]): LinearFit | null {
  const n = points.length;
  if (n < 2) return null;
  const tMean = points.reduce((s, p) => s + p.t, 0) / n;
  const vMean = points.reduce((s, p) => s + p.v, 0) / n;
  let sxx = 0;
  let sxy = 0;
  for (const p of points) {
    const dt = p.t - tMean;
    sxx += dt * dt;
    sxy += dt * (p.v - vMean);
  }
  if (sxx === 0) return null;
  const slope = sxy / sxx;
  return { slope, at: (t: number) => vMean + slope * (t - tMean) };
}

/**
 * Un segmento por serie (pair = ambas), desde el valor ajustado en la ultima lectura hasta
 * ultima lectura + horizon_hours. Vacio si esta desactivado o hay menos de min_points puntos.
 */
export function projectSeries(series: TrendSeries[], params: ProjectionParams): ProjectedSegment[] {
  if (!params.enabled || params.horizon_hours <= 0) return [];
  const out: ProjectedSegment[] = [];
  for (const s of series) {
    if (s.points.length < Math.max(2, params.min_points)) continue;
    const fit = linearFit(s.points);
    if (!fit) continue;
    const tLast = s.points[s.points.length - 1]!.t;
    const tEnd = tLast + params.horizon_hours * HOUR_MS;
    out.push({ index: s.index, from: { t: tLast, v: fit.at(tLast) }, to: { t: tEnd, v: fit.at(tEnd) } });
  }
  return out;
}
