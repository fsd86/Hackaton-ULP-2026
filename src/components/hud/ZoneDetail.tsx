import { useContent } from "../../content/ContentContext";
import type { Environment, Indicator } from "../../content/schemas";
import { renderIndicatorText } from "../../logic/indicatorText";
import { EarthReferenceNote } from "../EarthReferenceNote";
import { SourceLinks } from "../SourceLinks";
import { StatusBadge } from "../StatusBadge";
import type { FigureZone } from "../body/ZoneButton";
import { ZoneZoom } from "./ZoneZoom";

/**
 * Detalle de la zona elegida: sus indicadores con valor y estado, los hazards de NASA ligados (con fuente) y
 * "qué hacer" segun el estado de la ultima lectura. Todo sale de indicators.json / hazards.json: nada de organos
 * ni cifras sin fuente.
 */
export function ZoneDetail({
  zone,
  indicators,
  environment,
}: {
  zone: FigureZone | undefined;
  indicators: Map<string, Indicator>;
  environment: Environment;
}) {
  const { t, content } = useContent();
  if (!zone) return <p className="text-sm text-[var(--color-muted)]">{t("hud.zone_detail.help")}</p>;
  const hazardSources = new Map(content.hazards.map((h) => [h.id, h.source_ids]));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-mono text-base font-semibold uppercase tracking-[0.14em]">{t(`zone.${zone.zone}`)}</h3>
        {zone.worst !== "nodata" && <StatusBadge status={zone.worst} live={false} size="sm" />}
      </div>
      <ZoneZoom zone={zone.zone} />
      <ul className="space-y-3">
        {zone.items.map((item) => {
          const ind = indicators.get(item.id);
          if (!ind) return null;
          const action = item.valueText !== null && item.status !== "unknown" ? ind.actions[item.status] : undefined;
          // Notas del rango donde cayo la ultima lectura + acciones del estado.
          const lines = [...(item.notes ?? []), ...(action?.text ?? [])];
          const sourceIds = [...ind.hazards.flatMap((h) => hazardSources.get(h) ?? []), ...ind.source_ids];
          return (
            <li key={item.id} className="rounded-sm border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--color-ink)_45%,transparent)] p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-semibold">{item.name}</h4>
                {item.valueText === null ? (
                  <span className="text-sm text-[var(--color-muted)]">{t("zone.no_reading")}</span>
                ) : (
                  <span className="font-mono text-lg font-semibold">
                    {item.valueText} <span className="text-xs font-normal text-[var(--color-muted)]">{item.unit}</span>
                  </span>
                )}
              </div>
              {item.valueText !== null && <StatusBadge status={item.status} live={false} size="sm" className="mt-1" />}

              <p className="eyebrow mt-3 !text-[0.62rem]">{t("hud.zone_detail.hazards")}</p>
              {ind.hazards.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">{t("hud.zone_detail.no_hazards")}</p>
              ) : (
                <ul className="mt-1 flex flex-wrap gap-1.5" aria-label={t("hud.zone_detail.hazards")}>
                  {ind.hazards.map((h) => (
                    <li key={h} className="hazard-chip">
                      {t(`hazard.${h}`)}
                    </li>
                  ))}
                </ul>
              )}

              {lines.length > 0 && (
                <>
                  <p className="eyebrow mt-3 !text-[0.62rem]">{t("hud.zone_detail.what_to_do")}</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-[0.82rem] leading-snug">
                    {lines.map((line, i) => (
                      <li key={i}>{renderIndicatorText(line, ind, environment)}</li>
                    ))}
                  </ul>
                </>
              )}
              {item.valueText !== null && item.status !== "unknown" && <EarthReferenceNote indicator={ind} compact className="mt-2" />}

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <SourceLinks compact ids={sourceIds} />
                <a href={`#/check/${encodeURIComponent(item.id)}`} className="inline-flex min-h-9 items-center text-sm font-semibold text-[var(--color-accent)] underline underline-offset-2">
                  {t("hud.zone_detail.open_check")}
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
