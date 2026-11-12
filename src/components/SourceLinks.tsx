import { useContent } from "../content/ContentContext";

/** Enlaces cortos a #/sources/<id> para las afirmaciones que citan fuentes. No renderiza nada si no hay ids. */
export function SourceLinks({ ids, label, className = "" }: { ids: readonly string[]; label?: string; className?: string }) {
  const { t, content } = useContent();
  const unique = [...new Set(ids)];
  if (unique.length === 0) return null;
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
