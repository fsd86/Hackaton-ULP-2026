import type { CSSProperties } from "react";
import { useContent } from "../content/ContentContext";
import type { Indicator } from "../content/schemas";
import type { BoardEntry } from "../logic/board";
import { formatDateTime, formatValue } from "../logic/daily";
import { DueBadge } from "./DueBadge";
import { IndicatorIcon } from "./IndicatorIcon";
import { PlaceholderBadge } from "./PlaceholderBadge";
import { Sparkline } from "./Sparkline";
import { StatusBadge } from "./StatusBadge";

/**
 * Tarjeta de vidrio de un indicador: icono + numero grande + unidad + estado + mini tendencia.
 * El estado es borde + icono + texto; el resplandor lento (solo attention/critical) se apaga con reduced motion.
 */
export function VitalCard({
  indicator,
  entry,
  sparkValues,
  locale,
  delayMs = 0,
}: {
  indicator: Indicator;
  entry: BoardEntry;
  /** Serie principal del indicador (ya ordenada por tiempo) para la mini tendencia. */
  sparkValues: number[];
  locale: string;
  delayMs?: number;
}) {
  const { t } = useContent();
  const last = entry.lastReading;
  const alert = entry.status === "attention" || entry.status === "critical";
  const style = { "--sc": `var(--status-${entry.status})`, animationDelay: `${delayMs}ms` } as CSSProperties;
  return (
    <li
      data-testid="vital-card"
      data-vital-id={indicator.id}
      style={style}
      className={`glass appear relative min-w-0 rounded-sm border-l-[3px] border-l-[var(--sc)] p-3 ${alert ? "glow-alert" : ""}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] text-[var(--color-accent)]">
          <IndicatorIcon name={indicator.icon} className="h-5 w-5" />
        </span>
        <h3 className="eyebrow min-w-0 flex-1 leading-snug">{indicator.name}</h3>
        {last?.demo === true && (
          <span className="rounded-sm border border-dashed border-[var(--color-line)] px-1.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {t("demo.tag")}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        {last ? (
          <p className="flex min-w-0 items-baseline gap-1.5">
            <span className="font-mono text-3xl font-semibold leading-none tracking-tight">{formatValue(last.value)}</span>
            <span className="font-mono text-xs text-[var(--color-muted)]">{indicator.unit}</span>
          </p>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">{t("board.no_reading")}</p>
        )}
        <StatusBadge status={entry.status} live={false} size="sm" />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <Sparkline values={sparkValues} status={entry.status} />
        {last && (
          <p className="text-right text-xs text-[var(--color-muted)]">
            {t("hud.last")} <time dateTime={new Date(last.timestamp).toISOString()}>{formatDateTime(last.timestamp, locale)}</time>
          </p>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 empty:hidden">
        <DueBadge state={entry.due} />
        {entry.placeholder && entry.due !== "no_frequency" && <PlaceholderBadge short />}
      </div>
    </li>
  );
}
