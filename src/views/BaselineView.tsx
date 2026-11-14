import { useMemo, useState } from "react";
import { useContent } from "../content/ContentContext";
import { BaselineAwarenessNote, BaselineDeviation, formatShortDate } from "../components/BaselineDeviation";
import { DemoChip } from "../components/DemoChip";
import { SourceLinks } from "../components/SourceLinks";
import { useBaseline } from "../hooks/useBaseline";
import { useStorageState } from "../hooks/useStorageState";
import { computeBaseline, formatMean, type BaselineReading, type BaselineSource } from "../logic/baseline";
import { formatDateTime, formatValue, readingsFor } from "../logic/daily";
import { clearBaseline, getReadings, setBaseline } from "../storage/local";
import { btnPrimary, btnSecondary, panel } from "./daily/ui";

/**
 * Baseline (#/baseline): "Your own normal". Calcula la media de las lecturas previas propias (o una demo con
 * data/demo-readings.json) y compara la ultima lectura de cada indicador con ella, en tono NEUTRAL. Los parametros
 * (ventana, minimo de lecturas) vienen de config/app.json baseline y son de diseno, no medicos.
 */
export function BaselineView() {
  const { t, content } = useContent();
  const { readingsRev } = useStorageState();
  const baseline = useBaseline();
  const locale = content.app.default_language;
  const params = { windowDays: content.app.baseline.window_days, minReadings: content.app.baseline.min_readings };
  const methodVars = { days: params.windowDays, min: params.minReadings };
  const [feedback, setFeedback] = useState("");
  // readingsRev cambia al cargar o quitar la demo: se relee el almacenamiento.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const readings = useMemo(() => getReadings(), [readingsRev]);
  const byId = useMemo(() => new Map(content.indicators.map((i) => [i.id, i])), [content.indicators]);

  function save(source: BaselineSource): void {
    const now = Date.now();
    const input: BaselineReading[] =
      source === "demo"
        ? content.demoReadings.map((r) => ({ indicatorId: r.indicator_id, value: r.value, timestamp: now - r.minutes_ago * 60_000 }))
        : // "Calculate from my readings": solo lecturas propias, nunca las sinteticas.
          getReadings().filter((r) => r.demo !== true);
    const result = computeBaseline(content.indicators, input, params, now);
    if (result.entries.length === 0) {
      setFeedback(t("baseline.saved.none", methodVars));
      return;
    }
    setBaseline({ source, createdAt: now, windowDays: params.windowDays, minReadings: params.minReadings, entries: result.entries });
    setFeedback(t(source === "demo" ? "baseline.saved.demo" : "baseline.saved.readings", { count: result.entries.length }));
  }

  // Indicadores sin linea de base guardada y por que (escala ordinal o pocas lecturas al calcularla).
  const excluded = content.indicators.filter((i) => !baseline?.entries.some((e) => e.indicatorId === i.id));

  return (
    <section aria-labelledby="baseline-title" className="space-y-6">
      <header>
        <h1 id="baseline-title" className="text-3xl font-extrabold">
          {t("baseline.title")}
        </h1>
        <p className="mt-1 max-w-3xl text-[var(--color-muted)]">{t("baseline.intro")}</p>
      </header>

      <section aria-labelledby="baseline-why" className={panel}>
        <h2 id="baseline-why" className="mb-2 text-xl font-bold">
          {t("baseline.why.title")}
        </h2>
        <p className="max-w-3xl">{t("baseline.why.text")}</p>
        <SourceLinks ids={content.app.baseline.source_ids} className="mt-2" />
        <h3 className="mt-4 font-bold">{t("baseline.method.title")}</h3>
        <p className="max-w-3xl text-sm text-[var(--color-muted)]">{t("baseline.method.text", methodVars)}</p>
      </section>

      <section aria-labelledby="baseline-actions" className={panel}>
        <h2 id="baseline-actions" className="mb-3 text-xl font-bold">
          {t("baseline.actions.title")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <button type="button" onClick={() => save("readings")} className={`${btnPrimary} w-full sm:w-auto`}>
              {t("baseline.calculate")}
            </button>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{t("baseline.calculate.help")}</p>
          </div>
          <div>
            <button type="button" onClick={() => save("demo")} className={`${btnSecondary} w-full sm:w-auto`}>
              {t("baseline.simulate")}
            </button>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{t("baseline.simulate.help")}</p>
          </div>
        </div>
        <p role="status" aria-live="polite" className="mt-3 min-h-6 font-semibold">
          {feedback}
        </p>
      </section>

      <section aria-labelledby="baseline-current" className={panel} data-testid="baseline-current">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 id="baseline-current" className="text-xl font-bold">
            {t("baseline.current.title")}
          </h2>
          {baseline?.source === "demo" && <DemoChip />}
        </div>
        {!baseline ? (
          <p className="text-[var(--color-muted)]">{t("baseline.current.empty")}</p>
        ) : (
          <>
            <p
              className={
                baseline.source === "demo"
                  ? "rounded border border-dashed border-[var(--color-line)] p-2 text-sm font-semibold"
                  : "text-sm text-[var(--color-muted)]"
              }
            >
              {t(`baseline.current.source.${baseline.source}`, { date: formatDateTime(baseline.createdAt, locale) })}
            </p>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {baseline.entries.map((e) => {
                const ind = byId.get(e.indicatorId);
                if (!ind) return null;
                const latest = readingsFor(readings, ind.id)[0];
                return (
                  <li key={e.indicatorId} data-testid="baseline-entry" data-indicator-id={ind.id} className="rounded-sm border border-[var(--glass-border)] p-3">
                    <h3 className="font-semibold">{ind.name}</h3>
                    <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                      <dt className="text-[var(--color-muted)]">{t("baseline.col.mean")}</dt>
                      <dd className="font-mono font-semibold">
                        {formatMean(e.mean)} <span className="font-normal text-[var(--color-muted)]">{ind.unit}</span>
                      </dd>
                      <dt className="text-[var(--color-muted)]">{t("baseline.col.based_on")}</dt>
                      <dd>{t("baseline.based_on", { n: e.n, from: formatShortDate(e.from, locale), to: formatShortDate(e.to, locale) })}</dd>
                      <dt className="text-[var(--color-muted)]">{t("baseline.col.latest")}</dt>
                      <dd className="font-mono">
                        {latest ? (
                          <>
                            {formatValue(latest.value)} <span className="text-[var(--color-muted)]">{ind.unit}</span>
                          </>
                        ) : (
                          <span className="font-sans text-[var(--color-muted)]">{t("baseline.no_latest")}</span>
                        )}
                      </dd>
                    </dl>
                    {latest && <BaselineDeviation indicator={ind} value={latest.value} baseline={baseline} className="mt-2" />}
                  </li>
                );
              })}
            </ul>
            <BaselineAwarenessNote className="mt-3 !text-sm" />
            {excluded.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold">{t("baseline.excluded.title")}</h3>
                <ul className="mt-1 list-disc space-y-1 pl-6 text-sm">
                  {excluded.map((i) => (
                    <li key={i.id}>
                      <span className="font-semibold">{i.name}</span>
                      {": "}
                      {i.input.kind === "scale"
                        ? t("baseline.excluded.scale")
                        : t("baseline.excluded.insufficient", { min: baseline.minReadings, days: baseline.windowDays })}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                clearBaseline();
                setFeedback(t("baseline.removed"));
              }}
              className={`${btnSecondary} mt-4`}
            >
              {t("baseline.remove")}
            </button>
          </>
        )}
      </section>
    </section>
  );
}
