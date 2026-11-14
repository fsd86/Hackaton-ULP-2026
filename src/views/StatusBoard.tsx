import { useId, useMemo, useState, type CSSProperties } from "react";
import { useContent } from "../content/ContentContext";
import { HeroBody } from "../components/body/HeroBody";
import type { FigureZone } from "../components/body/ZoneButton";
import { FocusTrend } from "../components/hud/FocusTrend";
import { HazardsPanelBody } from "../components/hud/HazardsPanelBody";
import { StatusRing } from "../components/hud/StatusRing";
import { VitalRow } from "../components/hud/VitalRow";
import { ZoneDetail } from "../components/hud/ZoneDetail";
import { ZoneStatusList } from "../components/hud/ZoneStatusList";
import { DemoChip } from "../components/DemoChip";
import { PlaceholderBadge } from "../components/PlaceholderBadge";
import { EmptyState } from "../components/EmptyState";
import { EnvironmentDetails } from "../components/EnvironmentDetails";
import { FramePanel } from "../components/FramePanel";
import { SourceLinks } from "../components/SourceLinks";
import { StatusBadge, type BadgeStatus } from "../components/StatusBadge";
import { StatusIcon } from "../components/StatusIcon";
import { TrendChart } from "../components/TrendChart";
import { useEnvironment } from "../hooks/useEnvironment";
import { useStorageState } from "../hooks/useStorageState";
import { buildBoard } from "../logic/board";
import { groupByZone, worstZoneStatus, type BodyZoneId } from "../logic/bodyZones";
import { classifyDelay, formatDelay } from "../logic/delay";
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

const WEEK_MS = 7 * 24 * 3_600_000;

/**
 * Status board (#/): HUD de 3 columnas. Izquierda (inclinada hacia el centro): signos vitales, estado por zona y
 * tendencia destacada. Centro: el cuerpo con puntos de zona. Derecha: estado general, detalle de la zona elegida,
 * demora y respuesta de Tierra, y hazards de NASA. Debajo, las tendencias completas con tabla accesible.
 * En movil: cuerpo arriba y paneles en una columna.
 */
export function StatusBoard() {
  const { t, content } = useContent();
  const { environment } = useEnvironment();
  const { readingsRev } = useStorageState();
  const locale = content.app.default_language;
  // Foto de las lecturas y de "ahora". readingsRev cambia al cargar/quitar datos demo: se relee el almacenamiento.
  const [snap, setSnap] = useState(() => ({ rev: readingsRev, readings: getReadings(), now: Date.now() }));
  if (snap.rev !== readingsRev) setSnap({ rev: readingsRev, readings: getReadings(), now: Date.now() });
  const { readings, now } = snap;
  // Marca DEMO una vez por panel (no por valor) mientras haya lecturas sinteticas guardadas.
  const demoChip = readings.some((r) => r.demo === true) ? <DemoChip /> : null;
  const [period, setPeriod] = useState<PeriodId>("7d");
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

  const detailId = useId();
  const worstZone = useMemo(() => {
    const w = worstZoneStatus(zones.map((z) => z.worst));
    return (zones.find((z) => z.worst === w) ?? zones[0])?.zone ?? null;
  }, [zones]);
  const [picked, setPicked] = useState<BodyZoneId | null>(null);
  const selectedZone = picked ?? worstZone;
  const zoneOf = zones.find((z) => z.zone === selectedZone);

  const withData = board.entries.filter((e) => e.lastReading).map((e) => e.indicatorId);
  const [focusPick, setFocusPick] = useState<string | null>(null);
  const zoneFocus = zoneOf?.items.find((i) => i.valueText !== null)?.id;
  const focusId = (focusPick && byId.has(focusPick) ? focusPick : null) ?? zoneFocus ?? withData[0] ?? content.indicators[0]?.id ?? null;
  const focusInd = focusId ? byId.get(focusId) : undefined;

  function selectZone(zone: BodyZoneId): void {
    setPicked(zone);
    setFocusPick(null);
  }

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

  const delay = environment.comm_delay_one_way_s;
  const delayPlaceholder = environment.status === "PLACEHOLDER" || classifyDelay(delay) === "unknown";

  return (
    <div className="space-y-4">
      <h1 className="board-title font-mono text-base font-bold uppercase leading-7 tracking-[0.16em]">{t("board.title")}</h1>

      <div className={`hud-grid ${hasReadings ? "" : "hud-grid-empty"}`}>
        {/* Izquierda: signos vitales, estado por zona, tendencia destacada y demora / respuesta de Tierra. */}
        <div className="hud-col hud-col-left">
          <FramePanel title={t("hud.vitals")} corners delayMs={80} bodyClassName="!p-2" aside={demoChip}>
            <ul className="divide-y divide-[var(--glass-border)]">
              {board.entries.map((entry) => {
                const ind = byId.get(entry.indicatorId);
                if (!ind) return null;
                const trend = buildTrend({ indicator: ind, readings, environment, now, maxPoints: 12 });
                return <VitalRow
                    key={ind.id}
                    indicator={ind}
                    entry={entry}
                    sparkValues={trend.series[0]?.points.map((p) => p.v) ?? []}
                    pulse={ind.id === content.app.hud.pulse_trace.indicator_id}
                  />;
              })}
            </ul>
          </FramePanel>

          <FramePanel title={t("hud.zone_status")} corners delayMs={160}>
            <ZoneStatusList zones={zones} selected={selectedZone} onSelect={selectZone} controlsId={detailId} />
          </FramePanel>

          {focusInd && (
            <FramePanel
              title={t("hud.focus_trend")}
              corners
              delayMs={240}
              aside={
                <span className="flex items-center gap-2">
                {demoChip}
                <label className="flex items-center gap-2 text-xs">
                  <span className="sr-only">{t("hud.focus_trend.pick")}</span>
                  <select
                    value={focusInd.id}
                    onChange={(e) => setFocusPick(e.target.value)}
                    className="min-h-9 max-w-[11rem] rounded-sm border border-[var(--color-line)] bg-[var(--color-panel-2)] px-2 text-xs font-semibold text-[var(--color-text)]"
                  >
                    {content.indicators.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </label>
                </span>
              }
            >
              <FocusTrend indicator={focusInd} trend={buildTrend({ indicator: focusInd, readings, environment, sinceMs: WEEK_MS, now })} />
            </FramePanel>
          )}

          <FramePanel title={t("hud.ground_answer")} corners delayMs={280}>
            <p className="eyebrow !text-[0.62rem]">{t("hud.ground_answer.delay")}</p>
            <p className="flex flex-wrap items-center gap-2 font-mono text-xl font-semibold leading-tight text-[var(--color-warm)]">
              {formatDelay(delay, t)}
              {delayPlaceholder && <PlaceholderBadge short />}
            </p>
            <p className="mt-3 text-sm text-[var(--color-muted)]">{t("hud.ground_answer.help")}</p>
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
            <SourceLinks ids={delay.source_ids} label={t("sources.delay_sources")} className="mt-3 block" />
            <div className="mt-2 border-t border-[var(--glass-border)] pt-2">
              <p className="text-sm font-semibold">{environment.name}</p>
              <EnvironmentDetails />
            </div>
          </FramePanel>

        </div>

        {/* Centro: el cuerpo (en movil va arriba de todo). */}
        <section aria-labelledby="board-body" className="hud-center">
          <h2 id="board-body" className="sr-only">
            {t("hud.body_map")}
          </h2>
          <HeroBody zones={zones} selected={selectedZone} onSelect={selectZone} controlsId={detailId} />
        </section>

        {/* Estado general: bajo el cuerpo (en movil, justo despues del cuerpo). */}
        <div className="hud-overall">
          <FramePanel title={t("board.overall")} corners delayMs={120} aside={hasReadings ? demoChip : null}>
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
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                <StatusRing counts={board.counts} order={COUNT_ORDER} />
                <div className="min-w-0 flex-1 space-y-2">
                <StatusBadge
                  live={false}
                  status={board.overall === "noData" ? "unknown" : board.overall}
                  className="min-h-11 px-4 text-lg"
                />
                <ul aria-label={t("board.counts_label")} className="grid grid-cols-2 gap-1.5">
                  {COUNT_ORDER.map((s) => (
                    <li
                      key={s}
                      style={{ "--sc": `var(--status-${s})` } as CSSProperties}
                      className="flex items-center gap-1.5 rounded-sm border border-[var(--sc)] bg-[color-mix(in_srgb,var(--sc)_8%,var(--color-panel))] px-1.5 py-1"
                    >
                      <span className="text-[var(--sc)]">
                        <StatusIcon name={s === "unknown" ? "help-circle" : content.app.theme.status_icons[s]} className="h-4 w-4" />
                      </span>
                      <span className="font-mono text-lg font-semibold leading-none">{board.counts[s]}</span>
                      <span className="text-sm">{t(`status.${s}`)}</span>
                    </li>
                  ))}
                </ul>
                </div>
                </div>
                {board.needsAttention.length > 0 && (
                  <div>
                    <h3 className="eyebrow !text-[0.62rem]">{t("board.needs_attention")}</h3>
                    <ul className="mt-1 space-y-1">
                      {board.needsAttention.map((id) => (
                        <li key={id} className="flex flex-wrap items-center justify-between gap-2">
                          <span className="flex min-w-0 flex-wrap items-center gap-2">
                            <StatusBadge live={false} size="sm" status={entryById.get(id)?.status ?? "unknown"} />
                            <span className="text-sm font-semibold">{nameOf(id)}</span>
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
                  </div>
                )}
              </div>
            )}
            {remindersOn && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--glass-border)] pt-3">
                <div>
                  <h3 className="eyebrow !text-[0.62rem]">{t("board.due_now")}</h3>
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

        </div>

        {/* Derecha: detalle de la zona elegida y hazards de NASA. */}
        <div className="hud-col hud-col-right">
          <FramePanel title={t("hud.zone_detail")} corners delayMs={200} id={detailId} aside={demoChip}>
            <div aria-live="polite">
              <ZoneDetail zone={zoneOf} indicators={byId} environment={environment} />
            </div>
          </FramePanel>

          {content.hazards.length > 0 && (
            <FramePanel title={t("hud.hazards")} corners delayMs={360}>
              <HazardsPanelBody />
            </FramePanel>
          )}
        </div>
      </div>

      {chartsOn && (
        <FramePanel
          title={t("hud.trends")}
          delayMs={200}
          aside={
            <div className="flex flex-wrap items-center justify-end gap-2">
            {demoChip}
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
