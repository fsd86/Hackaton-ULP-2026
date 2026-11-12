import { useEffect, useRef } from "react";
import { useContent } from "../../content/ContentContext";
import type { Indicator } from "../../content/schemas";
import { StatusBadge } from "../../components/StatusBadge";
import { formatValue } from "../../logic/daily";
import type { StepResult } from "./ResultPanel";
import { btnPrimary, btnSecondary, panel } from "./ui";

export function Summary({
  indicators,
  results,
  skipped,
  onBackToList,
}: {
  indicators: Indicator[];
  results: Record<string, StepResult>;
  skipped: number;
  onBackToList: () => void;
}) {
  const { t } = useContent();
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);

  const done = indicators.filter((i) => results[i.id] !== undefined);
  const attention = done.filter((i) => {
    const s = results[i.id]?.status;
    return s === "attention" || s === "critical";
  });

  return (
    <div className="space-y-4">
      <h2 ref={ref} tabIndex={-1} className="text-3xl font-extrabold outline-none">
        {t("daily.complete")}
      </h2>
      <p className="text-lg">
        {t("daily.summary", { saved: done.length, total: indicators.length })}
        {skipped > 0 && <span className="text-[var(--color-muted)]"> · {t("daily.skipped_count", { count: skipped })}</span>}
      </p>

      <section aria-labelledby="sum-att" className={panel}>
        <h3 id="sum-att" className="mb-2 text-xl font-bold">
          {t("daily.needs_attention")}
        </h3>
        {attention.length === 0 ? (
          <p>{t("daily.all_clear")}</p>
        ) : (
          <ul className="space-y-2">
            {attention.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  <span className="font-bold">{i.name}</span>{" "}
                  <span className="font-mono">
                    {formatValue(results[i.id]!.reading.value)} {i.unit}
                  </span>
                </span>
                <StatusBadge status={results[i.id]!.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <a href="#/" className={btnPrimary}>
          {t("daily.view_board")}
        </a>
        <button type="button" onClick={onBackToList} className={btnSecondary}>
          {t("daily.back_to_list")}
        </button>
      </div>
    </div>
  );
}
