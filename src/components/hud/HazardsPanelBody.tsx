import { useContent } from "../../content/ContentContext";
import { PlaceholderBadge } from "../PlaceholderBadge";
import { SourceLinks } from "../SourceLinks";

/** Los 5 hazards de NASA (data/hazards.json): resumen con fuente y qué indicadores de la app los vigilan. */
export function HazardsPanelBody() {
  const { t, content } = useContent();
  const { hazards, indicators } = content;
  const sourceIds = hazards.flatMap((h) => h.source_ids);
  return (
    <div>
      <ul className="space-y-2.5">
        {hazards.map((h) => {
          const watchers = indicators.filter((i) => i.hazards.includes(h.id)).map((i) => i.name);
          return (
            <li key={h.id} className="hazard-row">
              <div className="flex flex-wrap items-center gap-2">
                <span className="hazard-chip">{t(`hazard.${h.id}`)}</span>
                {h.status === "PLACEHOLDER" && <PlaceholderBadge short />}
              </div>
              <p className="mt-1 text-[0.82rem] leading-snug">{h.summary}</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                <span className="font-semibold">{t("hud.hazards.watched_by")}:</span>{" "}
                {watchers.length > 0 ? watchers.join(", ") : t("hud.hazards.none_watched")}
              </p>
            </li>
          );
        })}
      </ul>
      <SourceLinks compact ids={sourceIds} className="mt-3" />
    </div>
  );
}
