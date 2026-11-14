import type { CSSProperties } from "react";
import { useContent } from "../content/ContentContext";
import type { HealthStatus } from "../content/schemas";
import { StatusIcon } from "./StatusIcon";

export type BadgeStatus = HealthStatus | "unknown";

/**
 * Estado = color + ícono + texto (nunca solo color). "unknown" explica que falta umbral verificado.
 * size "sm": etiqueta monoespaciada compacta para tarjetas y paneles del HUD (solo el texto del estado).
 */
export function StatusBadge({
  status,
  className = "",
  live = true,
  size = "md",
}: {
  status: BadgeStatus;
  className?: string;
  /** false en listas/informes: sin role="status" para no saturar a los lectores de pantalla. */
  live?: boolean;
  size?: "md" | "sm";
}) {
  const { t, content } = useContent();
  const icon = status === "unknown" ? "help-circle" : content.app.theme.status_icons[status];
  const style = { "--sc": `var(--status-${status})` } as CSSProperties;
  const small = size === "sm";
  return (
    <span
      role={live ? "status" : undefined}
      style={style}
      className={`inline-flex items-center gap-2 rounded-sm border border-[var(--sc)] bg-[color-mix(in_srgb,var(--sc)_14%,var(--color-panel))] text-[var(--color-text)] ${
        small
          ? "min-h-7 px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider"
          : "min-h-10 px-3 py-1 text-base font-bold"
      } ${className}`}
    >
      <span className="text-[var(--sc)]">
        <StatusIcon name={icon} className={small ? "h-4 w-4" : "h-6 w-6"} />
      </span>
      <span className="sr-only">{t("a11y.status_prefix")}</span>
      <span className="flex flex-col leading-tight">
        <span>{t(`status.${status}`)}</span>
        {status === "unknown" && !small && (
          <span className="text-sm font-normal text-[var(--color-muted)]">{t("status.unknown.help")}</span>
        )}
      </span>
    </span>
  );
}
