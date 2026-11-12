import { useMemo, useState, type CSSProperties } from "react";
import { useContent } from "../content/ContentContext";
import { EmptyState } from "../components/EmptyState";
import { PlaceholderBadge } from "../components/PlaceholderBadge";
import { StatusBadge, type BadgeStatus } from "../components/StatusBadge";
import { StatusIcon } from "../components/StatusIcon";
import { TrendChart } from "../components/TrendChart";
import { useEnvironment } from "../hooks/useEnvironment";
import { buildBoard } from "../logic/board";
import { formatDateTime, formatValue } from "../logic/daily";
import { buildTrend } from "../logic/trend";
import { getReadings } from "../storage/local";
import { btnPrimary, btnSecondary, panel } from "./daily/ui";

/** Opciones de período (estructura, no contenido: el texto sale de strings). null = todo el historial. */
const PERIODS = [
  { id: "24h", hours: 24 },
  { id: "7d", hours: 168 },
  { id: "all", hours: null },
] as const;
type PeriodId = (typeof PERIODS)[number]["id"];

const COUNT_ORDER: BadgeStatus[] = ["critical", "attention", "normal", "unknown"];

/** Status board (#/): resumen de un vistazo + tarjeta por indicador con tendencia. */
export function StatusBoard() {
  const { t, content } = useContent();
  const { environment } = useEnvironment();
  const locale = content.app.default_language;
  const [now] = useState(() => Date.now());
  const [readings] = useState(() => getReadings());
  const [period, setPeriod] = useState<PeriodId>("7d");
  const chartsOn = content.app.features.charts;

  const board = useMemo(
    () =>
      buildBoard({
        content: { indicators: content.indicators, environments: content.environments },
        environmentId: environment.id,
        readings,
        now,
      }),
    [content.indicators, content.environments, environment.id, readings, now],
  );

  const byId = new Map(content.indicators.map((i) => [i.id, i]));
  const nameOf = (id: string) => byId.get(id)?.name ?? id;

  if (content.indicators.length === 0) {
    return (
      <section>
        <h1 className="mb-4 text-3xl font-extrabold">{t("board.title")}</h1>
        <EmptyState title={t("board.no_indicators")} help={t("board.no_indicators.help")} />
      </section>
    );
  }

  const hasReadings = board.overall !== "noData";
  const sinceMs = (() => {
    const hours = PERIODS.find((p) => p.id === period)?.hours ?? null;
    return hours === null ? now : hours * 3_600_000;
  })();

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-extrabold">{t("board.title")}</h1>

      <section aria-labelledby="board-summary" className={`${panel} space-y-5`}>
        <h2 id="board-summary" className="sr-only">
          {t("board.overall")}
        </h2>
        {!hasReadings ? (
          <EmptyState title={t("board.no_reading")} help={t("board.empty.help")}>
            <a href="#/check" className={`${btnPrimary} mt-4`}>
              {t("board.go_to_check")}
            </a>
          </EmptyState>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)]">{t("board.overall")}</span>
              <StatusBadge
                live={false}
                status={board.overall === "noData" ? "unknown" : board.overall}
                className="min-h-14 px-5 text-2xl"
              />
            </div>

            <ul aria-label={t("board.counts_label")} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {COUNT_ORDER.map((s) => (
                <li
                  key={s}
                  style={{ "--sc": `var(--status-${s})` } as CSSProperties}
                  className="flex items-center gap-2 rounded-md border-2 border-[var(--sc)] bg-[var(--color-panel-2)] p-2"
                >
                  <span className="text-[var(--sc)]">
                    <StatusIcon name={s === "unknown" ? "help-circle" : content.app.theme.status_icons[s]} className="h-6 w-6" />
                  </span>
                  <span className="font-mono text-2xl font-extrabold">{board.counts[s]}</span>
                  <span className="text-sm font-semibold">{t(`status.${s}`)}</span>
                </li>
              ))}
            </ul>

            <div>
              <h3 className="mb-2 text-xl font-bold">{t("board.needs_attention")}</h3>
              {board.needsAttention.length === 0 ? (
                <p className="text-[var(--color-muted)]">{t("board.needs_attention.none")}</p>
              ) : (
                <ul className="space-y-2">
                  {board.needsAttention.map((id) => {
                    const entry = board.entries.find((e) => e.indicatorId === id);
                    return (
                      <li key={id} className="flex flex-wrap items-center justify-between gap-2">
                        <span className="flex flex-wrap items-center gap-2">
                          <StatusBadge live={false} status={entry?.status ?? "unknown"} />
                          <span className="text-lg font-bold">{nameOf(id)}</span>
                        </span>
                        <a
                          href={`#/check/${encodeURIComponent(id)}`}
                          aria-label={t("board.open_in_check", { name: nameOf(id) })}
                          className={btnSecondary}
                        >
                          {t("board.open_short")}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-line)] pt-4">
          <div>
            <h3 className="text-xl font-bold">{t("board.due_now")}</h3>
            <p className="text-[var(--color-muted)]">
              {board.dueNow.length === 0 ? t("board.all_ok") : board.dueNow.map(nameOf).join(", ")}
            </p>
          </div>
          {board.dueNow.length > 0 && hasReadings && (
            <a href="#/check" className={btnPrimary}>
              {t("board.due_cta")}
            </a>
          )}
        </div>
      </section>

      <section aria-labelledby="board-indicators">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="board-indicators" className="text-2xl font-bold">
            {t("board.indicators")}
          </h2>
          {chartsOn && (
            <div role="group" aria-label={t("board.period_label")} className="flex gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={period === p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`inline-flex min-h-11 items-center justify-center rounded-md border-2 px-4 font-bold ${
                    period === p.id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[#070b14]"
                      : "border-[var(--color-line)] bg-[var(--color-panel-2)] text-[var(--color-text)] hover:border-[var(--color-accent)]"
                  }`}
                >
                  {period === p.id && <span aria-hidden="true">✓ </span>}
                  {t(`board.period.${p.id}`)}
                </button>
              ))}
            </div>
          )}
        </div>

        <ul className="grid gap-3 md:grid-cols-2">
          {board.entries.map((entry) => {
            const ind = byId.get(entry.indicatorId);
            if (!ind) return null;
            const last = entry.lastReading;
            return (
              <li key={ind.id} data-testid="board-card" className={`${panel} flex min-w-0 flex-col gap-3`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-xl font-bold">
                    {ind.name} <span className="text-base font-normal text-[var(--color-muted)]">({ind.unit})</span>
                  </h3>
                  {entry.placeholder && <PlaceholderBadge short />}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {last ? (
                    <>
                      <span className="font-mono text-2xl font-bold">{formatValue(last.value)}</span>
                      <StatusBadge status={entry.status} live={false} />
                      <span className="text-sm text-[var(--color-muted)]">
                        {t("board.last_reading")}:{" "}
                        <time dateTime={new Date(last.timestamp).toISOString()}>{formatDateTime(last.timestamp, locale)}</time>
                      </span>
                    </>
                  ) : (
                    <>
                      <StatusBadge status="unknown" live={false} />
                      <span className="text-[var(--color-muted)]">{t("board.no_reading")}</span>
                    </>
                  )}
                </div>
                <span
                  className={`inline-flex min-h-7 w-fit items-center rounded border px-2 text-sm font-bold ${
                    entry.due
                      ? "border-[var(--status-attention)] bg-[color-mix(in_srgb,var(--status-attention)_16%,var(--color-panel))]"
                      : "border-[var(--color-line)] text-[var(--color-muted)]"
                  }`}
                >
                  {entry.due ? `⏱ ${t("board.due_now")}` : `✓ ${t("board.up_to_date")}`}
                </span>
                {chartsOn && (
                  <div>
                    <h4 className="mb-1 text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">{t("board.trend")}</h4>
                    <TrendChart
                      indicator={ind}
                      locale={locale}
                      trend={buildTrend({ indicator: ind, readings, environment, sinceMs, now })}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </section>
  );
}
