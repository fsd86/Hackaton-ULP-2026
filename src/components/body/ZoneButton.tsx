import type { CSSProperties } from "react";
import { useContent } from "../../content/ContentContext";
import type { BodyZoneId, ZoneStatus } from "../../logic/bodyZones";
import type { EvalStatus } from "../../logic/evaluate";
import { StatusIcon } from "../StatusIcon";

export interface FigureZoneItem {
  id: string;
  name: string;
  unit: string;
  /** Ultima lectura formateada, o null si todavia no hay ninguna. */
  valueText: string | null;
  status: EvalStatus;
  /** Notas del rango donde cayo la ultima lectura (data/indicators.json ranges[].notes). */
  notes?: string[];
}

export interface FigureZone {
  zone: BodyZoneId;
  worst: ZoneStatus;
  items: FigureZoneItem[];
}

/**
 * Punto de zona sobre el cuerpo: <button> nativo (foco, Enter/Espacio) de 44 px, posicionado en % del escenario.
 * Halo segun el peor estado de la zona; pulso solo en attention/critical (se apaga con reduced motion).
 * aria-pressed marca la zona elegida; aria-controls apunta al panel de detalle.
 */
export function ZoneButton({
  zone,
  left,
  top,
  selected,
  onSelect,
  controlsId,
}: {
  zone: FigureZone;
  /** Posicion en % del escenario. */
  left: number;
  top: number;
  selected: boolean;
  onSelect: (zone: BodyZoneId) => void;
  controlsId?: string;
}) {
  const { t, content } = useContent();
  const statusIcons = content.app.theme.status_icons;
  const label = t(`zone.${zone.zone}`);
  const items = zone.items
    .map((i) => (i.valueText === null ? `${i.name} ${t("zone.no_reading")}` : t("zone.item", { name: i.name, status: t(`status.${i.status}`) })))
    .join(", ");
  const alert = zone.worst === "attention" || zone.worst === "critical";
  const nodata = zone.worst === "nodata";
  const style = {
    left: `${left}%`,
    top: `${top}%`,
    "--zc": nodata ? "var(--color-muted)" : `var(--status-${zone.worst})`,
  } as CSSProperties;
  return (
    <button
      type="button"
      data-zone={zone.zone}
      aria-label={t("zone.button", { zone: label, items })}
      aria-pressed={selected}
      aria-controls={controlsId}
      onClick={() => onSelect(zone.zone)}
      style={style}
      className={`zone-btn ${selected ? "zone-btn-selected" : ""}`}
    >
      <span data-anchor-zone={zone.zone} className={`zone-dot ${nodata ? "opacity-70" : ""}`} style={nodata ? { borderStyle: "dashed" } : undefined}>
        <span aria-hidden="true" className="zone-halo" />
        {alert && (
          <>
            <span aria-hidden="true" className="zone-ring" />
            <span aria-hidden="true" className="zone-ring zone-ring-2" />
          </>
        )}
        {zone.worst !== "nodata" && <StatusIcon name={zone.worst === "unknown" ? "help-circle" : statusIcons[zone.worst]} className="h-3.5 w-3.5" />}
      </span>
      <span
        aria-hidden="true"
        className="zone-label pointer-events-none absolute left-[calc(50%+18px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm px-1.5 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-[var(--color-text)] sm:text-[0.66rem]"
      >
        {label}
      </span>
    </button>
  );
}
