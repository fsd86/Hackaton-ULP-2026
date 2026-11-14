import type { CSSProperties } from "react";
import { useContent } from "../../content/ContentContext";
import type { BodyZoneId } from "../../logic/bodyZones";
import { StatusBadge } from "../StatusBadge";
import { StatusIcon } from "../StatusIcon";
import type { FigureZone } from "../body/ZoneButton";

// Orden de los segmentos de la barra (peor primero). "nodata" = indicador sin lectura.
const SEGMENTS = ["critical", "attention", "unknown", "normal", "nodata"] as const;

/**
 * Estado por zona del cuerpo: una fila-boton por zona con barra segmentada (cuantos indicadores de la zona estan
 * en cada estado: datos reales, sin porcentajes inventados) y el peor estado como chip. Elegir una fila equivale a
 * tocar el punto de la zona en el cuerpo.
 */
export function ZoneStatusList({
  zones,
  selected,
  onSelect,
  controlsId,
}: {
  zones: FigureZone[];
  selected: BodyZoneId | null;
  onSelect: (zone: BodyZoneId) => void;
  controlsId?: string;
}) {
  const { t, content } = useContent();
  const icons = content.app.theme.status_icons;
  const legend = ["critical", "attention", "normal", "unknown"] as const;
  return (
    <>
    <ul className="space-y-1.5">
      {zones.map((z) => {
        const counts = SEGMENTS.map((s) => ({
          s,
          n: z.items.filter((i) => (s === "nodata" ? i.valueText === null : i.valueText !== null && i.status === s)).length,
        })).filter((c) => c.n > 0);
        const summary = counts.map((c) => `${c.n} ${c.s === "nodata" ? t("zone.no_reading") : t(`status.${c.s}`)}`).join(", ");
        return (
          <li key={z.zone}>
            <button
              type="button"
              aria-pressed={selected === z.zone}
              aria-controls={controlsId}
              aria-label={t("hud.zone_status.bar", { zone: t(`zone.${z.zone}`), summary })}
              onClick={() => onSelect(z.zone)}
              className="zone-row"
            >
              <span className="flex min-w-0 items-center justify-between gap-2">
                <span className="truncate font-mono text-xs font-semibold uppercase tracking-wider">{t(`zone.${z.zone}`)}</span>
                {z.worst === "nodata" ? (
                  <span className="text-xs text-[var(--color-muted)]">{t("zone.no_reading")}</span>
                ) : (
                  <StatusBadge status={z.worst} live={false} size="sm" />
                )}
              </span>
              <span aria-hidden="true" className="zone-bar">
                {counts.map((c) => (
                  <span
                    key={c.s}
                    className={`zone-bar-seg ${c.s === "nodata" ? "zone-bar-nodata" : ""}`}
                    style={{ flexGrow: c.n, "--sc": c.s === "nodata" ? "var(--color-line)" : `var(--status-${c.s})` } as CSSProperties}
                  />
                ))}
              </span>
              <span className="text-[0.7rem] text-[var(--color-muted)]">{t("hud.zone_status.count", { n: z.items.length })}</span>
            </button>
          </li>
        );
      })}
    </ul>
    {/* Leyenda del mapa de calor del cuerpo: icono + texto por estado (nunca solo color). */}
    {content.app.hero && (
      <div className="mt-3 border-t border-[var(--glass-border)] pt-2">
        <p className="text-[0.7rem] text-[var(--color-muted)]">{t("hud.heatmap.legend")}</p>
        <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
          {legend.map((s) => (
            <li key={s} className="heat-legend-item" style={{ "--sc": `var(--status-${s})` } as CSSProperties}>
              <span aria-hidden="true" className="heat-legend-swatch">
                <StatusIcon name={s === "unknown" ? "help-circle" : icons[s]} className="h-3 w-3" />
              </span>
              {t(`status.${s}`)}
            </li>
          ))}
          <li className="heat-legend-item" style={{ "--sc": "var(--color-line)" } as CSSProperties}>
            <span aria-hidden="true" className="heat-legend-swatch heat-legend-nodata" />
            {t("hud.heatmap.nodata")}
          </li>
        </ul>
      </div>
    )}
    </>
  );
}
