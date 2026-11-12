import type { Environment, Frequency, Indicator } from "../content/schemas";
import type { Reading } from "../storage/local";
import { evaluate, type EvalStatus, type ReadingValue } from "./evaluate";

/** Frecuencia efectiva: el override del entorno (si existe) gana sobre la del indicador. */
export function effectiveFrequency(ind: Indicator, env: Pick<Environment, "indicator_overrides">): Frequency {
  return env.indicator_overrides[ind.id]?.frequency ?? ind.frequency;
}

/** Lecturas de un indicador, la más reciente primero. */
export function readingsFor(readings: Reading[], indicatorId: string): Reading[] {
  return readings.filter((r) => r.indicatorId === indicatorId).sort((a, b) => b.timestamp - a.timestamp);
}

export type DueState = "due" | "ok" | "no_frequency";

/**
 * Estado de vencimiento. every_hours efectivo null (sin fuente) → "no_frequency", haya o no lecturas:
 * no se puede afirmar ni "vencido" ni "al día". Si hay frecuencia: sin lecturas o pasado every_hours → "due".
 */
export function dueState(
  ind: Indicator,
  env: Pick<Environment, "indicator_overrides">,
  readings: Reading[],
  now: number = Date.now(),
): DueState {
  const hours = effectiveFrequency(ind, env).every_hours;
  if (hours === null) return "no_frequency";
  const last = readingsFor(readings, ind.id)[0];
  if (!last) return "due";
  return now - last.timestamp >= hours * 3_600_000 ? "due" : "ok";
}

/** Estado de una lectura guardada, evaluada con el entorno en que se tomó (o el actual si ya no existe). */
export function statusOfReading(
  ind: Indicator,
  reading: Reading,
  environments: Environment[],
  fallback: Environment,
): EvalStatus {
  const env = environments.find((e) => e.id === reading.environmentId) ?? fallback;
  return evaluate(ind, reading.value, env);
}

export function formatValue(value: ReadingValue): string {
  return Array.isArray(value) ? `${value[0]} / ${value[1]}` : String(value);
}

/** HH:MM en hora local. `locale` = config.default_language (la UI es en inglés, no el idioma del sistema). */
export function formatTime(ts: number | Date, locale = "en"): string {
  return new Date(ts).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
}

export function formatDateTime(ts: number, locale = "en"): string {
  return new Date(ts).toLocaleString(locale, { dateStyle: "short", timeStyle: "short", hourCycle: "h23" });
}

export function groupByCategory(indicators: Indicator[]): Array<[string, Indicator[]]> {
  const map = new Map<string, Indicator[]>();
  for (const ind of indicators) {
    const list = map.get(ind.category);
    if (list) list.push(ind);
    else map.set(ind.category, [ind]);
  }
  return [...map.entries()];
}
