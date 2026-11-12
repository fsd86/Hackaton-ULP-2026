import { useContent } from "../content/ContentContext";
import { StatusIcon } from "./StatusIcon";

/** Marca de fuente verificada: ícono + texto + borde sólido (el color no es la única señal). */
export function VerifiedBadge({ className = "" }: { className?: string }) {
  const { t } = useContent();
  return (
    <span
      className={`inline-flex min-h-7 items-center gap-1.5 rounded border-2 border-[var(--status-normal)] bg-[color-mix(in_srgb,var(--status-normal)_12%,var(--color-panel))] px-2 py-0.5 text-sm font-semibold text-[var(--color-text)] ${className}`}
    >
      <span className="text-[var(--status-normal)]">
        <StatusIcon name="check-circle" className="h-4 w-4" />
      </span>
      {t("badge.verified")}
    </span>
  );
}
