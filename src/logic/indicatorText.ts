import type { Environment, HealthStatus, Indicator, Range } from "../content/schemas";

// Plantillas en los textos de un indicador: {unit}, {range.<status>.min|max}, {range2.<status>.min|max}.
// range = rangos efectivos (override de entorno incluido); range2 = ranges_secondary.

const TOKEN_RE = /\{([^{}]*)\}/g;
const REF_RE = /^(range2?)\.(normal|attention|critical)\.(min|max)$/;

/** Número sin ceros de más: 70 → "70", 0.10 → "0.1", 36.6000000001 → "36.6". */
export function formatNumber(n: number): string {
  return String(Number.parseFloat(n.toPrecision(12)));
}

/** Tokens `{...}` de un texto (sin llaves). */
export function templateTokens(text: string): string[] {
  return [...text.matchAll(TOKEN_RE)].map((m) => m[1] ?? "");
}

type EnvOverrides = Pick<Environment, "indicator_overrides">;

function effectiveRanges(indicator: Indicator, environment?: EnvOverrides): Range[] {
  return environment?.indicator_overrides[indicator.id]?.ranges ?? indicator.ranges;
}

/**
 * Resuelve un token. Devuelve undefined si no es válido o no resuelve:
 * sintaxis desconocida, ningún rango de ese estado con ese borde, o más de uno (ambiguo).
 */
export function resolveToken(token: string, indicator: Indicator, environment?: EnvOverrides): string | undefined {
  if (token === "unit") return indicator.unit;
  const m = REF_RE.exec(token);
  if (!m) return undefined;
  const set = m[1] === "range2" ? (indicator.ranges_secondary ?? []) : effectiveRanges(indicator, environment);
  const status = m[2] as HealthStatus;
  const edge = m[3] as "min" | "max";
  const values = set.filter((r) => r.status === status && r[edge] !== null).map((r) => r[edge] as number);
  if (values.length !== 1) return undefined;
  return formatNumber(values[0]!);
}

/** Sustituye las plantillas con los rangos efectivos. Un token irresoluble se deja tal cual (el loader lo prohíbe). */
export function renderIndicatorText(text: string, indicator: Indicator, environment?: EnvOverrides): string {
  return text.replace(TOKEN_RE, (match, token: string) => resolveToken(token, indicator, environment) ?? match);
}
