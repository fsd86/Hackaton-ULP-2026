import type { Indicator } from "../content/schemas";
import type { ReadingValue } from "./evaluate";
import { formatNumber } from "./indicatorText";

// Validación de entrada de una lectura. Los límites (min/max/step) vienen de indicators.json y son
// límites de plausibilidad del formulario (diseño), no umbrales médicos.

export type RawReading = string | number | null | undefined | readonly [string, string];

export type ValidationResult =
  | { ok: true; value: ReadingValue }
  | { ok: false; errorKey: string; vars: Record<string, string | number> };

const DECIMAL_RE = /^[+-]?(\d+\.?\d*|\.\d+)$/; // rechaza "1e5", "abc", "Infinity", "0x10"
const STEP_TOLERANCE = 1e-6; // tolerancia de coma flotante (en unidades de step)

function fail(errorKey: string, vars: Record<string, string | number> = {}): ValidationResult {
  return { ok: false, errorKey, vars };
}

function parseDecimal(s: string): number | null {
  const trimmed = s.trim();
  if (!DECIMAL_RE.test(trimmed)) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

interface Limits {
  min?: number;
  max?: number;
  step?: number;
}

/** Chequea rango y step de un número ya parseado. Devuelve null si es válido. */
function checkLimits(n: number, limits: Limits, unit: string): ValidationResult | null {
  const { min, max, step } = limits;
  if ((min !== undefined && n < min) || (max !== undefined && n > max)) {
    if (min !== undefined && max !== undefined) {
      return fail("daily.value_out_of_range", { min: formatNumber(min), max: formatNumber(max), unit });
    }
    return fail("daily.value_invalid");
  }
  if (step !== undefined && step > 0) {
    const k = (n - (min ?? 0)) / step;
    if (Math.abs(k - Math.round(k)) > STEP_TOLERANCE) return fail("daily.value_step", { step: formatNumber(step) });
  }
  return null;
}

/** Valida y tipa la entrada cruda según indicator.input.kind. Función pura. */
export function validateReading(indicator: Indicator, raw: RawReading): ValidationResult {
  const input = indicator.input;

  if (input.kind === "number") {
    if (typeof raw !== "string" && typeof raw !== "number") return fail("daily.value_invalid");
    const n = typeof raw === "number" ? (Number.isFinite(raw) ? raw : null) : parseDecimal(raw);
    if (n === null) return fail("daily.value_invalid");
    return checkLimits(n, input, indicator.unit) ?? { ok: true, value: n };
  }

  if (input.kind === "pair") {
    if (!Array.isArray(raw) || raw.length !== 2) return fail("daily.pair_invalid");
    const [sa, sb] = raw as readonly [string, string];
    const a = parseDecimal(String(sa));
    const b = parseDecimal(String(sb));
    if (a === null || b === null) return fail("daily.pair_invalid");
    const bad = checkLimits(a, input, indicator.unit) ?? checkLimits(b, input, indicator.unit);
    if (bad) return bad;
    if (input.second_lower_than_first && !(b < a)) {
      return fail("daily.pair_order", { first: input.labels[0], second: input.labels[1] });
    }
    return { ok: true, value: [a, b] };
  }

  // scale: entero dentro de [min, max]
  if (typeof raw !== "number" || !Number.isInteger(raw) || raw < input.min || raw > input.max) {
    return fail("daily.value_invalid");
  }
  return { ok: true, value: raw };
}
