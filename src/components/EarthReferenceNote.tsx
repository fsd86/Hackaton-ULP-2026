import { useContent } from "../content/ContentContext";
import type { Indicator } from "../content/schemas";

/**
 * Aviso "referencia de la Tierra, sin valor especifico de vuelo" (strings "reference.earth") y, opcional,
 * una aclaracion propia del contenido (note, con fuente en data/). Texto + icono (no solo color).
 */
export function ReferenceNote({
  earth,
  note,
  compact = false,
  className = "",
  inline = false,
}: {
  earth: boolean;
  note?: string;
  /** true: <span> sin role (dentro de un <button>, donde un <p> no es valido). */
  inline?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const { t } = useContent();
  if (!earth && note === undefined) return null;
  const Tag = inline ? "span" : "p";
  return (
    <Tag
      role={inline ? undefined : "note"}
      data-earth-reference
      className={`flex gap-2 rounded-sm border border-dashed border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-ink)_40%,transparent)] px-2.5 py-1.5 text-left font-normal normal-case tracking-normal text-[var(--color-text)] ${compact ? "text-xs" : "text-sm"} ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 fill-none stroke-[var(--color-accent)] stroke-2">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
      </svg>
      <span>
        {earth && <strong className="font-semibold">{t("reference.earth")}</strong>}
        {earth && note !== undefined && " "}
        {note}
      </span>
    </Tag>
  );
}

/** Aviso de un indicador: earth_reference + reference_note de data/indicators.json. */
export function EarthReferenceNote({
  indicator,
  compact = false,
  className = "",
}: {
  indicator: Indicator;
  compact?: boolean;
  className?: string;
}) {
  return <ReferenceNote earth={indicator.earth_reference === true} note={indicator.reference_note} compact={compact} className={className} />;
}
