import { useContent } from "../content/ContentContext";
import type { Indicator } from "../content/schemas";

/**
 * Aviso junto a rangos y acciones: el valor es una referencia de la Tierra sin valor especifico de vuelo
 * (indicador con earth_reference). Agrega la aclaracion propia del indicador (reference_note) si la hay.
 * Texto + icono (no solo color). No se muestra si el indicador no lo declara.
 */
export function EarthReferenceNote({
  indicator,
  compact = false,
  className = "",
}: {
  indicator: Indicator;
  compact?: boolean;
  className?: string;
}) {
  const { t } = useContent();
  if (!indicator.earth_reference && indicator.reference_note === undefined) return null;
  return (
    <p
      role="note"
      data-earth-reference
      className={`flex gap-2 rounded-sm border border-dashed border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-ink)_40%,transparent)] px-2.5 py-1.5 text-[var(--color-text)] ${compact ? "text-xs" : "text-sm"} ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 fill-none stroke-[var(--color-accent)] stroke-2">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
      </svg>
      <span>
        {indicator.earth_reference && <strong className="font-semibold">{t("indicator.earth_reference")}</strong>}
        {indicator.earth_reference && indicator.reference_note !== undefined && " "}
        {indicator.reference_note}
      </span>
    </p>
  );
}
