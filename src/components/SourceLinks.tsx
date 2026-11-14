import { useContent } from "../content/ContentContext";

/**
 * Enlaces cortos a #/sources/<id> para las afirmaciones que citan fuentes. No renderiza nada si no hay ids.
 * `compact`: para espacios chicos (header). Enlaces numerados de 24 px como mínimo; el nombre accesible
 * ("Source 1: NASA Science") contiene el número visible.
 */
export function SourceLinks({
  ids,
  label,
  className = "",
  compact = false,
}: {
  ids: readonly string[];
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  const { t, content } = useContent();
  const unique = [...new Set(ids)];
  if (unique.length === 0) return null;
  if (compact) {
    return (
      <span className={`inline-flex flex-wrap items-center gap-1.5 text-xs ${className}`}>
        <span className="text-[var(--color-muted)]">{label ?? t("sources.links.label")}</span>
        {unique.map((id, i) => {
          const source = content.sources.find((s) => s.id === id);
          return (
            <a
              key={id}
              href={`#/sources/${encodeURIComponent(id)}`}
              title={source?.title}
              aria-label={t("sources.links.compact_item", { n: i + 1, publisher: source?.publisher ?? id })}
              className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-sm border border-[var(--color-line)] px-1 font-mono font-semibold underline underline-offset-2 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              {i + 1}
            </a>
          );
        })}
      </span>
    );
  }
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${className}`}>
      <span className="font-bold">{label ?? t("sources.links.label")}:</span>
      {unique.map((id) => {
        const source = content.sources.find((s) => s.id === id);
        return (
          <a
            key={id}
            href={`#/sources/${encodeURIComponent(id)}`}
            title={source?.title}
            className="inline-flex min-h-8 items-center underline underline-offset-2 hover:text-[var(--color-accent)]"
          >
            {source?.publisher ?? id}
          </a>
        );
      })}
    </span>
  );
}
