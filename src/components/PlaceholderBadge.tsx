import { useContent } from "../content/ContentContext";

/** Marca visible (texto + borde punteado + ícono, no solo color) para cualquier entidad con status "PLACEHOLDER". */
export function PlaceholderBadge({ short = false, className = "" }: { short?: boolean; className?: string }) {
  const { t } = useContent();
  return (
    <span
      className={`inline-flex min-h-6 items-center gap-1.5 rounded-sm border border-dashed border-[var(--status-attention)] bg-[color-mix(in_srgb,var(--status-attention)_10%,var(--color-panel))] px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-text)] ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-[var(--status-attention)] stroke-2">
        <path d="M12 3 2 21h20L12 3Z" strokeLinejoin="round" />
        <path d="M12 10v5M12 18h.01" strokeLinecap="round" />
      </svg>
      {short ? t("badge.placeholder.short") : t("badge.placeholder")}
    </span>
  );
}
