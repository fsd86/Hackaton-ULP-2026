import type { Environment, HealthStatus, Indicator, Range } from "../content/schemas";

export type EvalStatus = HealthStatus | "unknown";
export type ReadingValue = number | [number, number];

const SEVERITY: Record<HealthStatus, number> = { normal: 0, attention: 1, critical: 2 };

function worst(statuses: HealthStatus[]): HealthStatus {
  return statuses.reduce((a, b) => (SEVERITY[b] > SEVERITY[a] ? b : a));
}

/** ¿El valor cae dentro del rango? Límites inclusivos salvo min_exclusive / max_exclusive; null = sin límite. */
export function inRange(r: Range, value: number): boolean {
  const aboveMin = r.min === null || (r.min_exclusive ? value > r.min : value >= r.min);
  const belowMax = r.max === null || (r.max_exclusive ? value < r.max : value <= r.max);
  return aboveMin && belowMax;
}

/**
 * Evalúa un número contra una lista de rangos. Límites inclusivos salvo que el rango declare
 * min_exclusive / max_exclusive; null = sin límite. Rangos con min y max nulos (pendientes) se ignoran.
 * Si ninguno aplica → "unknown". Si varios aplican (bordes inclusivos compartidos), gana el más severo.
 */
export function evaluateRanges(ranges: Range[], value: number): EvalStatus {
  if (typeof value !== "number" || Number.isNaN(value)) return "unknown";
  const usable = ranges.filter((r) => r.min !== null || r.max !== null);
  const matches = usable.filter((r) => inRange(r, value));
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

/**
 * Notas de los rangos donde cae la lectura, solo de los rangos con el estado final (p. ej. la nota "bajo" o "alto"
 * dentro de attention). Para "pair": rangos principales con el primer valor y secundarios con el segundo.
 */
export function rangeNotes(
  indicator: Indicator,
  value: ReadingValue,
  status: EvalStatus,
  env?: Pick<Environment, "indicator_overrides">,
): string[] {
  if (status === "unknown") return [];
  const primary = env?.indicator_overrides[indicator.id]?.ranges ?? indicator.ranges;
  const pairs: Array<[Range[], number]> = Array.isArray(value)
    ? [
        [primary, value[0]],
        [indicator.ranges_secondary ?? [], value[1]],
      ]
    : [[primary, value]];
  const out: string[] = [];
  for (const [ranges, v] of pairs) {
    for (const r of ranges) {
      if (r.status !== status || (r.min === null && r.max === null) || !inRange(r, v)) continue;
      for (const n of r.notes ?? []) if (!out.includes(n)) out.push(n);
    }
  }
  return out;
}
