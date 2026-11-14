import type { CSSProperties } from "react";
import { useContent } from "../../content/ContentContext";
import type { Indicator } from "../../content/schemas";
import type { BoardEntry } from "../../logic/board";
import { formatValue } from "../../logic/daily";
import { IndicatorIcon } from "../IndicatorIcon";
import { Sparkline } from "../Sparkline";
import { StatusBadge } from "../StatusBadge";

/**
 * Fila compacta de "Vital signs": icono, nombre, valor grande monoespaciado + unidad, mini tendencia y estado.
 * El estado es borde + icono + texto (StatusBadge), nunca solo color.
 */
export function VitalRow({ indicator, entry, sparkValues }: { indicator: Indicator; entry: BoardEntry; sparkValues: number[] }) {
  const { t } = useContent();
  const last = entry.lastReading;
  const style = { "--sc": `var(--status-${entry.status})` } as CSSProperties;
  return (
    <li data-testid="vital-row" data-vital-id={indicator.id} style={style} className="vital-row">
      <span className="vital-icon" aria-hidden="true">
        <IndicatorIcon name={indicator.icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h3 className="eyebrow truncate !text-[0.62rem]">{indicator.name}</h3>
        {last ? (
          <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
            <span
              className={`whitespace-nowrap font-mono font-semibold leading-none tracking-tight ${Array.isArray(last.value) ? "text-[1.3rem]" : "text-[1.65rem]"}`}
            >
              {formatValue(last.value)}
            </span>
            <span className="font-mono text-xs text-[var(--color-muted)]">{indicator.unit}</span>
          </p>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">{t("board.no_reading")}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <StatusBadge status={entry.status} live={false} size="sm" />
        <Sparkline values={sparkValues} status={entry.status} />
      </div>
    </li>
  );
}
