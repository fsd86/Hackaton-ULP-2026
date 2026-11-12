import type { CSSProperties } from "react";
import { useContent } from "../content/ContentContext";
import type { HealthStatus } from "../content/schemas";
import { StatusIcon } from "./StatusIcon";

export type BadgeStatus = HealthStatus | "unknown";

/** Estado = color + ícono + texto (nunca solo color). "unknown" explica que falta umbral verificado. */
export function StatusBadge({
  status,
  className = "",
  live = true,
}: {
  status: BadgeStatus;
  className?: string;
  /** false en listas/informes: sin role="status" para no saturar a los lectores de pantalla. */
  live?: boolean;
}) {
  const { t, content } = useContent();
  const icon = status === "unknown" ? "help-circle" : content.app.theme.status_icons[status];
  const style = { "--sc": `var(--status-${status})` } as CSSProperties;
  return (
    <span
      role={live ? "status" : undefined}
      style={style}
      className={`inline-flex min-h-11 items-center gap-2 rounded-md border-2 border-[var(--sc)] bg-[color-mix(in_srgb,var(--sc)_16%,var(--color-panel))] px-3 py-1 text-base font-bold text-[var(--color-text)] ${className}`}
    >
      <span className="text-[var(--sc)]">
        <StatusIcon name={icon} className="h-6 w-6" />
      </span>
      <span className="sr-only">{t("a11y.status_prefix")}</span>
      <span className="flex flex-col leading-tight">
        <span>{t(`status.${status}`)}</span>
        {status === "unknown" && <span className="text-sm font-normal text-[var(--color-muted)]">{t("status.unknown.help")}</span>}
      </span>
    </span>
  );
}
