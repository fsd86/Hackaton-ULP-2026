import { useContent } from "../../content/ContentContext";
import type { Environment, Indicator } from "../../content/schemas";
import { PlaceholderBadge } from "../../components/PlaceholderBadge";
import { StatusBadge } from "../../components/StatusBadge";
import {
  effectiveFrequency,
  formatDateTime,
  formatValue,
  groupByCategory,
  isDue,
  readingsFor,
  statusOfReading,
} from "../../logic/daily";
import type { Reading } from "../../storage/local";
import { btnPrimary, btnSecondary, panel } from "./ui";

export function IndicatorList({
  indicators,
  readings,
  environments,
  env,
  onStartAll,
  onOpen,
}: {
  indicators: Indicator[];
  readings: Reading[];
  environments: Environment[];
  env: Environment;
  onStartAll: () => void;
  onOpen: (id: string) => void;
}) {
  const { t } = useContent();
  const groups = groupByCategory(indicators);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">{t("daily.title")}</h1>
        <p className="mt-2 text-[var(--color-muted)]">{t("daily.intro")}</p>
        <button type="button" onClick={onStartAll} className={`${btnPrimary} mt-4`}>
          {t("daily.start")}
        </button>
      </div>

      {groups.map(([category, items]) => (
        <section key={category} aria-labelledby={`cat-${category}`}>
          <h2 id={`cat-${category}`} className="mb-2 text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">
            {category}
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {items.map((ind) => {
              const last = readingsFor(readings, ind.id)[0];
              const due = isDue(ind, env, readings);
              const freq = effectiveFrequency(ind, env);
              return (
                <li key={ind.id} className={`${panel} flex flex-col gap-3`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-xl font-bold">
                      {ind.name} <span className="text-base font-normal text-[var(--color-muted)]">({ind.unit})</span>
                    </h3>
                    {ind.status === "PLACEHOLDER" && <PlaceholderBadge short />}
                  </div>
                  <p className="text-sm text-[var(--color-muted)]">
                    {t("daily.frequency")}: {freq.label}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {last ? (
                      <>
                        <span className="text-sm text-[var(--color-muted)]">{t("board.last_reading")}:</span>
                        <span className="font-mono font-bold">{formatValue(last.value)}</span>
                        <StatusBadge status={statusOfReading(ind, last, environments, env)} />
                        <span className="text-sm text-[var(--color-muted)]">{formatDateTime(last.timestamp)}</span>
                      </>
                    ) : (
                      <span className="text-[var(--color-muted)]">{t("board.no_reading")}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex min-h-7 items-center rounded border px-2 text-sm font-bold ${
                        due
                          ? "border-[var(--status-attention)] bg-[color-mix(in_srgb,var(--status-attention)_16%,var(--color-panel))]"
                          : "border-[var(--color-line)] text-[var(--color-muted)]"
                      }`}
                    >
                      {due ? `⏱ ${t("board.due_now")}` : `✓ ${t("daily.up_to_date")}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpen(ind.id)}
                      aria-label={`${t("daily.open_indicator")}: ${ind.name}`}
                      className={btnSecondary}
                    >
                      {t("daily.open_indicator")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
