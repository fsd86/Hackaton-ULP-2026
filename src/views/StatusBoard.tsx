import { useMemo, useRef, useState, type CSSProperties } from "react";
import { useContent } from "../content/ContentContext";
import { BodyFigure, type FigureZone } from "../components/body/BodyFigure";
import { CalloutLines, type CalloutLink } from "../components/CalloutLines";
import { EmptyState } from "../components/EmptyState";
import { EnvironmentDetails } from "../components/EnvironmentDetails";
import { FramePanel } from "../components/FramePanel";
import { SourceLinks } from "../components/SourceLinks";
import { StatusBadge, type BadgeStatus } from "../components/StatusBadge";
import { StatusIcon } from "../components/StatusIcon";
import { TrendChart } from "../components/TrendChart";
import { VitalCard } from "../components/VitalCard";
import { useEnvironment } from "../hooks/useEnvironment";
import { useStorageState } from "../hooks/useStorageState";
import { buildBoard } from "../logic/board";
import { groupByZone } from "../logic/bodyZones";
import { formatDateTime, formatTime, formatValue } from "../logic/daily";
import { escalate } from "../logic/escalation";
import { buildTrend } from "../logic/trend";
import { addDemoReadings, getReadings } from "../storage/local";
import { escalationVars } from "./daily/ResultPanel";
import { btnPrimary, btnSecondary } from "./daily/ui";

/** Opciones de período (estructura, no contenido: el texto sale de strings). null = todo el historial. */
const PERIODS = [
  { id: "24h", hours: 24 },
  { id: "7d", hours: 168 },
  { id: "all", hours: null },
] as const;
type PeriodId = (typeof PERIODS)[number]["id"];

const COUNT_ORDER: BadgeStatus[] = ["critical", "attention", "normal", "unknown"];

/** Escalar "ahora" a tierra: solo se usa para estimar la ventana de respuesta segun la demora del entorno. */
const ESCALATE_TO_GROUND = { attention: { text: [], escalation: "ground" as const } };

/** Status board (#/): tablero HUD de 3 columnas (tarjetas · figura del cuerpo · estado) + tendencias completas. */
export function StatusBoard() {
  const { t, content } = useContent();
  const { environment } = useEnvironment();
  const { readingsRev } = useStorageState();
  const locale = content.app.default_language;
  // Foto de las lecturas y de "ahora". readingsRev cambia al cargar/quitar datos demo: se relee el almacenamiento.
  const [snap, setSnap] = useState(() => ({ rev: readingsRev, readings: getReadings(), now: Date.now() }));
  if (snap.rev !== readingsRev) setSnap({ rev: readingsRev, readings: getReadings(), now: Date.now() });
  const { readings, now } = snap;
  const [period, setPeriod] = useState<PeriodId>("7d");
  const gridRef = useRef<HTMLDivElement>(null);
  const chartsOn = content.app.features.charts;
  const remindersOn = content.app.features.reminders;

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

  const byId = useMemo(() => new Map(content.indicators.map((i) => [i.id, i])), [content.indicators]);
  const entryById = useMemo(() => new Map(board.entries.map((e) => [e.indicatorId, e])), [board.entries]);
  const nameOf = (id: string) => byId.get(id)?.name ?? id;

  const zones = useMemo<FigureZone[]>(
    () =>
      groupByZone(content.indicators, (id) => {
        const e = entryById.get(id);
        return e?.lastReading ? e.status : "nodata";
      }).map((z) => ({
        zone: z.zone,
        worst: z.worst,
        items: z.indicatorIds.flatMap((id) => {
          const ind = byId.get(id);
          const e = entryById.get(id);
          if (!ind || !e) return [];
          return [{ id, name: ind.name, unit: ind.unit, valueText: e.lastReading ? formatValue(e.lastReading.value) : null, status: e.status }];
        }),
      })),
    [content.indicators, entryById, byId],
  );

  const links = useMemo<CalloutLink[]>(
    () =>
      board.entries.flatMap((e) => {
        const zone = byId.get(e.indicatorId)?.body_zone;
        return zone && zones.some((z) => z.zone === zone) ? [{ cardId: e.indicatorId, zone, status: e.status }] : [];
      }),
    [board.entries, byId, zones],
  );

  if (content.indicators.length === 0) {
    return (
      <section>
        <h1 className="mb-4 font-mono text-xl font-bold uppercase tracking-[0.16em]">{t("board.title")}</h1>
        <EmptyState title={t("board.no_indicators")} help={t("board.no_indicators.help")} />
      </section>
    );
  }

  const hasReadings = board.overall !== "noData";
  const sinceMs = (() => {
    const hours = PERIODS.find((p) => p.id === period)?.hours ?? null;
    return hours === null ? now : hours * 3_600_000;
  })();

  const escalation = escalate("attention", ESCALATE_TO_GROUND, environment, content.app, new Date(now));

  function loadDemo(): void {
    const at = Date.now();
    addDemoReadings(
      content.demoReadings.map((r) => ({
        indicatorId: r.indicator_id,
        value: r.value,
        environmentId: environment.id,
        timestamp: at - r.minutes_ago * 60_000,
      })),
    );
    document.getElementById("main")?.focus();
  }

  return (
    <div className="space-y-5">
      <h1 className="font-mono text-lg font-bold uppercase tracking-[0.16em]">{t("board.title")}</h1>

      <div
        ref={gridRef}
        className="relative grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)_19rem] xl:grid-cols-[19rem_minmax(0,1fr)_22rem] 2xl:grid-cols-[21rem_minmax(0,1fr)_25rem]"
      >
        <CalloutLines containerRef={gridRef} links={links} />

        {/* Izquierda: tarjetas de indicadores (en movil van despues del estado general). */}
        <section aria-labelledby="board-vitals" className="order-3 min-w-0 lg:order-1">
          <h2 id="board-vitals" className="eyebrow mb-2 flex items-center gap-2">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-[var(--color-accent)]" />
            {t("hud.vitals")}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {board.entries.map((entry, i) => {
              const ind = byId.get(entry.indicatorId);
              if (!ind) return null;
              const trend = buildTrend({ indicator: ind, readings, environment, now, maxPoints: 12 });
              return (
                <VitalCard
                  key={ind.id}
                  indicator={ind}
                  entry={entry}
                  sparkValues={trend.series[0]?.points.map((p) => p.v) ?? []}
                  locale={locale}
                  delayMs={80 + i * 60}
                />
              );
            })}
          </ul>
        </section>

        {/* Centro: figura del cuerpo (en movil va arriba de todo). */}
        <FramePanel title={t("hud.body_map")} corners className="order-1 min-w-0 lg:order-2" bodyClassName="py-5">
          <BodyFigure zones={zones} />
        </FramePanel>

        {/* Derecha: en movil los hijos se reparten alrededor de las tarjetas (contents). */}
        <div className="contents min-w-0 lg:order-3 lg:flex lg:flex-col lg:gap-4">
          <FramePanel title={t("board.overall")} className="order-2 lg:order-none" delayMs={120}>
            {!hasReadings ? (
              <EmptyState title={t("board.no_reading")} help={t("board.empty.help")}>
                <div className="mt-4 flex flex-col items-center gap-3">
                  <a href="#/check" className={btnPrimary}>
                    {t("board.go_to_check")}
                  </a>
                  <p className="text-sm text-[var(--color-muted)]">{t("demo.load.help")}</p>
                  <button type="button" onClick={loadDemo} className={btnSecondary}>
                    {t("demo.load")}
                  </button>
                </div>
              </EmptyState>
            ) : (
              <div className="space-y-4">
                <StatusBadge
                  live={false}
                  status={board.overall === "noData" ? "unknown" : board.overall}
                  className="min-h-12 px-4 text-xl"
                />
                <ul aria-label={t("board.counts_label")} className="grid grid-cols-2 gap-2">
                  {COUNT_ORDER.map((s) => (
                    <li
                      key={s}
                      style={{ "--sc": `var(--status-${s})` } as CSSProperties}
                      className="flex items-center gap-2 rounded-sm border border-[var(--sc)] bg-[color-mix(in_srgb,var(--sc)_8%,var(--color-panel))] px-2 py-1.5"
                    >
                      <span className="text-[var(--sc)]">
                        <StatusIcon name={s === "unknown" ? "help-circle" : content.app.theme.status_icons[s]} className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-xl font-semibold leading-none">{board.counts[s]}</span>
                      <span className="text-sm">{t(`status.${s}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {remindersOn && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--glass-border)] pt-3">
                <div>
                  <h3 className="eyebrow">{t("board.due_now")}</h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    {board.dueNow.length > 0
                      ? board.dueNow.map(nameOf).join(", ")
                      : board.noFrequency.length === content.indicators.length
                        ? t("board.no_frequency_all")
                        : t("board.all_ok")}
                  </p>
                </div>
                {board.dueNow.length > 0 && hasReadings && (
                  <a href="#/check" className={btnPrimary}>
                    {t("board.due_cta")}
                  </a>
                )}
              </div>
            )}
          </FramePanel>

          {hasReadings && (
            <FramePanel title={t("board.needs_attention")} className="order-4 lg:order-none" delayMs={200}>
              {board.needsAttention.length === 0 ? (
                <p className="text-[var(--color-muted)]">{t("board.needs_attention.none")}</p>
              ) : (
                <ul className="space-y-2">
                  {board.needsAttention.map((id) => (
                    <li key={id} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex min-w-0 flex-wrap items-center gap-2">
                        <StatusBadge live={false} size="sm" status={entryById.get(id)?.status ?? "unknown"} />
                        <span className="font-semibold">{nameOf(id)}</span>
                      </span>
                      <a
                        href={`#/check/${encodeURIComponent(id)}`}
                        aria-label={t("board.open_in_check", { name: nameOf(id) })}
                        className={`${btnSecondary} !min-h-9 !px-3 !text-sm`}
                      >
                        {t("board.open_short")}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </FramePanel>
          )}

          <FramePanel title={t("hud.ground_answer")} className="order-5 lg:order-none" delayMs={280}>
            <p className="text-sm text-[var(--color-muted)]">{t("hud.ground_answer.help")}</p>
            <p className="mt-1">{t(escalation.messageKey, escalationVars(escalation))}</p>
            {escalation.eta && (
              <dl className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-sm border border-[var(--glass-border)] p-2">
                  <dt className="eyebrow !text-[0.62rem]">{t("escalation.eta.earliest")}</dt>
                  <dd className="font-mono text-xl font-semibold">
                    <time dateTime={escalation.eta.earliest.toISOString()}>{formatTime(escalation.eta.earliest)}</time>
                  </dd>
                </div>
                <div className="rounded-sm border border-[var(--glass-border)] p-2">
                  <dt className="eyebrow !text-[0.62rem]">{t("escalation.eta.latest")}</dt>
                  <dd className="font-mono text-xl font-semibold">
                    <time dateTime={escalation.eta.latest.toISOString()}>{formatTime(escalation.eta.latest)}</time>
                  </dd>
                </div>
              </dl>
            )}
            <SourceLinks ids={environment.comm_delay_one_way_s.source_ids} label={t("sources.delay_sources")} className="mt-3 block" />
          </FramePanel>

          <FramePanel title={t("hud.environment")} className="order-6 lg:order-none" delayMs={360}>
            <p className="font-semibold">{environment.name}</p>
            <EnvironmentDetails />
          </FramePanel>
        </div>
      </div>

      {chartsOn && (
        <FramePanel
          title={t("hud.trends")}
          delayMs={200}
          aside={
            <div role="group" aria-label={t("board.period_label")} className="flex gap-1.5">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={period === p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-sm border px-3 font-mono text-xs font-semibold uppercase tracking-wider ${
                    period === p.id
                      ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)] text-[var(--color-accent)]"
                      : "border-[var(--color-line)] text-[var(--color-text)] hover:border-[var(--color-accent)]"
                  }`}
                >
                  {period === p.id && <span aria-hidden="true">✓</span>}
                  {t(`board.period.${p.id}`)}
                </button>
              ))}
            </div>
          }
        >
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {board.entries.map((entry) => {
              const ind = byId.get(entry.indicatorId);
              if (!ind) return null;
              const last = entry.lastReading;
              return (
                <li key={ind.id} data-testid="board-card" className="min-w-0 rounded-sm border border-[var(--glass-border)] p-3">
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold">
                      {ind.name} <span className="font-mono text-xs font-normal text-[var(--color-muted)]">({ind.unit})</span>
                    </h3>
                    <StatusBadge status={entry.status} live={false} size="sm" />
                  </div>
                  {last && (
                    <p className="mb-2 text-xs text-[var(--color-muted)]">
                      {t("board.last_reading")}:{" "}
                      <time dateTime={new Date(last.timestamp).toISOString()}>{formatDateTime(last.timestamp, locale)}</time>
                    </p>
                  )}
                  <TrendChart
                    indicator={ind}
                    locale={locale}
                    trend={buildTrend({ indicator: ind, readings, environment, sinceMs, now })}
                  />
                </li>
              );
            })}
          </ul>
        </FramePanel>
      )}
    </div>
  );
}
