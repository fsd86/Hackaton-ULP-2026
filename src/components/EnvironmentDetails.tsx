import { useContent } from "../content/ContentContext";
import { useEnvironment } from "../hooks/useEnvironment";
import { PlaceholderBadge } from "./PlaceholderBadge";

/** "About this environment": descripcion y equipo disponible del entorno actual (desplegable accesible). */
export function EnvironmentDetails() {
  const { t } = useContent();
  const { environment } = useEnvironment();
  return (
    <details>
      <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 font-semibold text-[var(--color-accent)]">
        {t("environment.description")}
      </summary>
      <div className="space-y-2 pb-2">
        {environment.status === "PLACEHOLDER" && <PlaceholderBadge />}
        <p>{environment.description}</p>
        <p className="eyebrow">{t("environment.equipment")}</p>
        {environment.available_equipment.length === 0 ? (
          <p className="text-[var(--color-muted)]">{t("environment.equipment.none")}</p>
        ) : (
          <ul className="list-disc pl-6">
            {environment.available_equipment.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
