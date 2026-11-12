import type { Environment, HealthStatus, Indicator, Range } from "../content/schemas";

export type EvalStatus = HealthStatus | "unknown";
export type ReadingValue = number | [number, number];

const SEVERITY: Record<HealthStatus, number> = { normal: 0, attention: 1, critical: 2 };

function worst(statuses: HealthStatus[]): HealthStatus {
  return statuses.reduce((a, b) => (SEVERITY[b] > SEVERITY[a] ? b : a));
}

/**
 * Evalúa un número contra una lista de rangos. Límites inclusivos; null = sin límite.
 * Rangos con min y max nulos (pendientes) se ignoran. Si ninguno aplica → "unknown".
 * Si el valor cae justo en un borde compartido, gana el estado más severo (conservador).
 */
export function evaluateRanges(ranges: Range[], value: number): EvalStatus {
  if (typeof value !== "number" || Number.isNaN(value)) return "unknown";
  const usable = ranges.filter((r) => r.min !== null || r.max !== null);
  const matches = usable.filter(
    (r) => (r.min === null || value >= r.min) && (r.max === null || value <= r.max),
  );
  if (matches.length === 0) return "unknown";
  return worst(matches.map((r) => r.status));
}

/** valor + rangos (+ override de entorno) → estado. Para "pair" devuelve el peor de ambos componentes. */
export function evaluate(
  indicator: Indicator,
  value: ReadingValue,
  env?: Pick<Environment, "indicator_overrides">,
): EvalStatus {
  const primary = env?.indicator_overrides[indicator.id]?.ranges ?? indicator.ranges;

  if (indicator.input.kind === "pair") {
    if (!Array.isArray(value) || value.length !== 2) return "unknown";
    const a = evaluateRanges(primary, value[0]);
    const b = evaluateRanges(indicator.ranges_secondary ?? [], value[1]);
    const known = [a, b].filter((s): s is HealthStatus => s !== "unknown");
    if (known.length === 0) return "unknown";
    const w = worst(known);
    // Un componente sin umbral no puede dejar pasar un "normal" del otro.
    if (known.length < 2 && w === "normal") return "unknown";
    return w;
  }

  if (Array.isArray(value)) return "unknown";
  return evaluateRanges(primary, value);
}
