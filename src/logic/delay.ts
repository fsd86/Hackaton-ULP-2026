import type { TFunction } from "../content/t";

export interface DelayRange {
  min: number | null;
  max: number | null;
}

export type DelayKind = "unknown" | "near_realtime" | "single" | "range";

/** Segundos → minutos legibles: 1 decimal bajo 10 min (sin ".0"), entero desde 10 min. */
export function formatMinutes(seconds: number): string {
  const m = seconds / 60;
  if (m >= 10) return String(Math.round(m));
  return String(Number(m.toFixed(1)));
}

/** Clasifica la demora (segundos, solo ida). Función pura. */
export function classifyDelay(delay: DelayRange): DelayKind {
  const { min, max } = delay;
  if (min === null && max === null) return "unknown";
  const lo = min ?? max;
  const hi = max ?? min;
  if (lo === null || hi === null) return "unknown";
  if (hi < 60) return "near_realtime";
  if (formatMinutes(lo) === formatMinutes(hi)) return "single";
  return "range";
}

/** Texto de la demora usando las claves environment.delay.*. */
export function formatDelay(delay: DelayRange, t: TFunction): string {
  const kind = classifyDelay(delay);
  const lo = delay.min ?? delay.max;
  const hi = delay.max ?? delay.min;
  switch (kind) {
    case "unknown":
      return t("environment.delay.unknown");
    case "near_realtime":
      return t("environment.delay.near_realtime");
    case "single":
      return t("environment.delay.single", { min: formatMinutes(lo as number) });
    case "range":
      return t("environment.delay.range", { min: formatMinutes(lo as number), max: formatMinutes(hi as number) });
  }
}
