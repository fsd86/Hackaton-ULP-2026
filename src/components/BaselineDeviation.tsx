import { useContent } from "../content/ContentContext";
import type { Indicator } from "../content/schemas";
import {
  deviationFromBaseline,
  findBaselineEntry,
  formatDeviation,
  type Baseline,
} from "../logic/baseline";
import type { ReadingValue } from "../logic/evaluate";

/** Fecha corta ("Nov 8") en el idioma de la UI. */
export function formatShortDate(ts: number, locale = "en"): string {
  return new Date(ts).toLocaleDateString(locale, { month: "short", day: "numeric" });
}

/**
 * Desvio de la ultima lectura respecto de la linea de base personal. NEUTRAL a proposito: texto apagado, sin
 * colores de estado y sin "normal/anormal"; el estado por rangos con fuente se muestra aparte y no cambia.
 * variant "short": tablero (fila de signos vitales); "full": con media, cantidad y fechas.
 */
export function BaselineDeviation({
  indicator,
  value,
  baseline,
  variant = "full",
  className = "",
}: {
  indicator: Indicator;
  value: ReadingValue;
  baseline: Baseline | null;
  variant?: "short" | "full";
  className?: string;
}) {
  const { t, content } = useContent();
  const entry = findBaselineEntry(baseline, indicator.id);
  if (!baseline || !entry) return null;
  const devs = deviationFromBaseline(entry, value);
  if (!devs) return null;
  const locale = content.app.default_language;
  const pctOf = (p: number | null): string => (p === null ? t("baseline.deviation.na") : formatDeviation(p));
  const pct =
    devs.length === 2 && indicator.input.kind === "pair"
      ? t("baseline.deviation.pair", { a: indicator.input.labels[0], pa: pctOf(devs[0] ?? null), b: indicator.input.labels[1], pb: pctOf(devs[1] ?? null) })
      : pctOf(devs[0] ?? null);
  const demo = baseline.source === "demo";
  const detail = t("baseline.deviation.detail", {
    n: entry.n,
    from: formatShortDate(entry.from, locale),
    to: formatShortDate(entry.to, locale),
  });

  return (
    <p
      data-testid="baseline-deviation"
      data-baseline-source={baseline.source}
      className={`min-w-0 text-[var(--color-muted)] ${variant === "short" ? "text-[0.68rem] leading-tight" : "text-sm"} ${className}`}
      title={variant === "short" ? `${t(demo ? "baseline.deviation.demo" : "baseline.deviation", { pct })} (${detail})` : undefined}
    >
      <span className="min-w-0">
        {variant === "short"
          ? t(demo ? "baseline.vital_short.demo" : "baseline.vital_short", { pct })
          : `${t(demo ? "baseline.deviation.demo" : "baseline.deviation", { pct })} (${detail})`}
      </span>
    </p>
  );
}

/** Aviso fijo junto a los desvios: solo como referencia, no es un juicio medico. */
export function BaselineAwarenessNote({ className = "" }: { className?: string }) {
  const { t } = useContent();
  return (
    <p role="note" className={`text-xs text-[var(--color-muted)] ${className}`}>
      {t("baseline.awareness")}
    </p>
  );
}
