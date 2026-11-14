import { useId, type ReactNode } from "react";
import { useContent } from "../content/ContentContext";
import type { Indicator } from "../content/schemas";
import type { EvalStatus } from "../logic/evaluate";
import { formatDateTime, formatTime, formatValue } from "../logic/daily";
import { DemoChip } from "./DemoChip";
import { ReferenceNote } from "./EarthReferenceNote";
import { StatusIcon } from "./StatusIcon";
import type { Trend, TrendPoint } from "../logic/trend";
import { projectSeries } from "../logic/projection";

// Geometría interna del viewBox (el SVG escala al 100% del ancho del contenedor).
const W = 360;
const H = 190;
const ML = 40;
const MR = 12;
const MT = 10;
const MB = 24;

/** Forma por estado: la forma, no solo el color, distingue el estado. */
function Marker({ status, x, y, dashed }: { status: EvalStatus; x: number; y: number; dashed: boolean }) {
  const color = `var(--status-${status})`;
  const common = { fill: dashed ? "var(--color-panel)" : color, stroke: color, strokeWidth: 2 };
  const r = 5;
  if (status === "attention") {
    return <polygon points={`${x},${y - r - 1} ${x + r + 1},${y + r} ${x - r - 1},${y + r}`} {...common} />;
  }
  if (status === "critical") {
    return <polygon points={`${x},${y - r - 2} ${x + r + 2},${y} ${x},${y + r + 2} ${x - r - 2},${y}`} {...common} />;
  }
  if (status === "unknown") {
    return <rect x={x - r + 1} y={y - r + 1} width={(r - 1) * 2} height={(r - 1) * 2} {...common} fill="var(--color-panel)" />;
  }
  return <circle cx={x} cy={y} r={r} {...common} />;
}

const DAY_MS = 24 * 3_600_000;
const HOUR_MS = 3_600_000;
const STATUS_ORDER: EvalStatus[] = ["critical", "attention", "normal", "unknown"];

interface Tick {
  t: number;
  label: string;
}

/**
 * Marcas del eje X: medianoches locales (etiqueta "Nov 14") si la ventana supera 2 dias, cada 6/12 h si es mas corta.
 * Con ventanas largas ("All") se espacian para no superar ~8 marcas.
 */
function timeTicks(tMin: number, tMax: number, locale: string): Tick[] {
  const span = tMax - tMin;
  if (span <= 0) return [];
  const out: Tick[] = [];
  if (span > 2 * DAY_MS) {
    const stepDays = Math.max(1, Math.ceil(span / DAY_MS / 8));
    const d = new Date(tMin);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    for (let i = 0; d.getTime() <= tMax && i < 400; i++) {
      if (i % stepDays === 0) out.push({ t: d.getTime(), label: d.toLocaleDateString(locale, { month: "short", day: "numeric" }) });
      d.setDate(d.getDate() + 1);
    }
  } else {
    const stepH = span > DAY_MS ? 12 : 6;
    const d = new Date(tMin);
    d.setMinutes(0, 0, 0);
    if (d.getTime() < tMin) d.setHours(d.getHours() + 1);
    d.setHours(Math.ceil(d.getHours() / stepH) * stepH);
    for (let i = 0; d.getTime() <= tMax && i < 50; i++) {
      out.push({ t: d.getTime(), label: formatTime(d, locale) });
      d.setTime(d.getTime() + stepH * HOUR_MS);
    }
  }
  return out;
}

/** Muestra de forma de marcador para la leyenda (misma forma que en el grafico). */
function MarkerSwatch({ status }: { status: EvalStatus }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="h-4 w-4 shrink-0">
      <Marker status={status} x={9} y={9} dashed={false} />
    </svg>
  );
}

export function TrendChart({
  indicator,
  trend,
  locale,
  windowMs = null,
  demo = false,
}: {
  indicator: Indicator;
  trend: Trend;
  locale: string;
  /** Ventana fija del eje X en ms (24 h, 7 dias); null = el tramo con datos ("All"). */
  windowMs?: number | null;
  /** true = las lecturas graficadas son DEMO (sinteticas). */
  demo?: boolean;
}) {
  const { t, content } = useContent();
  const clipId = useId();
  const windowLabel =
    windowMs === null
      ? null
      : windowMs >= 2 * DAY_MS
        ? t("board.chart_window", { days: Math.round(windowMs / DAY_MS) })
        : t("board.chart_window_hours", { hours: Math.round(windowMs / HOUR_MS) });
  const header =
    windowLabel || demo ? (
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        {windowLabel ? <p className="eyebrow !text-[0.62rem]">{windowLabel}</p> : <span />}
        {demo && <DemoChip />}
      </div>
    ) : null;

  if (trend.empty) {
    return (
      <div>
        {header}
        <p className="text-[var(--color-muted)]">{t("board.no_data")}</p>
      </div>
    );
  }

  const { domain, series, bands } = trend;
  const isPair = indicator.input.kind === "pair";
  const pairLabels = indicator.input.kind === "pair" ? indicator.input.labels : null;
  // Extrapolacion lineal (DISENO, no medico): color neutro, sin marcadores ni estado. El eje X se extiende hasta el horizonte.
  const projCfg = content.app.hud.projection;
  const projections = projectSeries(series, projCfg);
  const tEnd = Math.max(domain.tMax, ...projections.map((pr) => pr.to.t));
  const projNote = demo ? t("board.chart_projection_demo") : t("board.chart_projection");
  const tSpan = tEnd - domain.tMin || 1;
  const vSpan = domain.vMax - domain.vMin || 1;
  const x = (tt: number) => ML + ((tt - domain.tMin) / tSpan) * (W - ML - MR);
  const y = (v: number) => MT + (1 - (v - domain.vMin) / vSpan) * (H - MT - MB);
  const clampY = (v: number) => Math.min(H - MB, Math.max(MT, y(v)));
  const axisNum = (v: number) => String(Number(v.toFixed(1)));

  const primary = series[0]!.points;
  const last = primary[primary.length - 1]!;
  const lastValue = isPair ? formatValue([primary[primary.length - 1]!.v, series[1]!.points[primary.length - 1]?.v ?? 0]) : String(last.v);
  const lastStatus = isPair ? worstOf(series.map((s) => s.points[s.points.length - 1]?.status ?? "unknown")) : last.status;
  const summary = t("board.chart_summary", {
    name: indicator.name,
    count: primary.length,
    value: lastValue,
    unit: indicator.unit,
    status: t(`status.${lastStatus}`),
  }) + (projections.length > 0 ? `. ${t("board.chart_projection_summary", { note: projNote, hours: projCfg.horizon_hours })}` : "");

  const bandOpacity = isPair ? 0.07 : 0.14;
  // Solo bandas de rangos con fuente (buildTrend descarta los no citados); los huecos quedan sin sombrear.
  const drawnBands = isPair ? bands : [bands[0] ?? []];
  const hasBands = drawnBands.some((set) => set.length > 0);
  const present = STATUS_ORDER.filter((s) => series.some((ser) => ser.points.some((p) => p.status === s)));
  const iconOf = (s: EvalStatus) => (s === "unknown" ? "help-circle" : content.app.theme.status_icons[s]);

  const ticks = timeTicks(domain.tMin, tEnd, locale);
  const nowX = x(domain.tMax);
  // Etiqueta de estado junto al ultimo punto (texto, ademas del color y la forma del marcador).
  const lx = x(last.t);
  const ly = y(last.v);
  const labelBelow = ly - 12 < MT + 10;
  const labelRight = lx < (W + ML) / 2;

  return (
    <div>
      {header}
      {isPair && pairLabels && (
        <ul className="mb-1 flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label={t("board.chart_series")}>
          {pairLabels.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <svg aria-hidden="true" viewBox="0 0 28 6" className="h-2 w-7">
                <line x1="0" y1="3" x2="28" y2="3" stroke="var(--color-text)" strokeWidth="2.5" strokeDasharray={i === 1 ? "5 3" : undefined} />
              </svg>
              {label} <span className="text-[var(--color-muted)]">({i === 1 ? t("board.chart_dashed") : t("board.chart_solid")})</span>
            </li>
          ))}
        </ul>
      )}

      <svg role="img" aria-label={summary} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full max-w-full">
        {drawnBands.flatMap((set, si) =>
          set.map((b, bi) => {
            const top = clampY(b.to);
            const bottom = clampY(b.from);
            return (
              <rect
                key={`${si}-${bi}`}
                x={ML}
                y={top}
                width={W - ML - MR}
                height={Math.max(0, bottom - top)}
                fill={`var(--status-${b.status})`}
                opacity={bandOpacity}
              />
            );
          }),
        )}
        {ticks.map((tk) => (
          <line key={tk.t} x1={x(tk.t)} x2={x(tk.t)} y1={MT} y2={H - MB + 4} stroke="var(--color-line)" strokeWidth="1" opacity="0.6" />
        ))}
        <rect x={ML} y={MT} width={W - ML - MR} height={H - MT - MB} fill="none" stroke="var(--color-line)" />
        {projections.length > 0 && (
          <g>
            <clipPath id={clipId}>
              <rect x={ML} y={MT} width={W - ML - MR} height={H - MT - MB} />
            </clipPath>
            {/* Divisor sutil entre lo medido y lo extrapolado. */}
            <line x1={nowX} x2={nowX} y1={MT} y2={H - MB} stroke="var(--color-muted)" strokeWidth="1" strokeDasharray="1 3" opacity="0.8" />
            {windowMs !== null && (
              <text x={nowX + 3} y={MT + 9} fontSize="9" fill="var(--color-muted)" fontFamily="inherit">
                {t("board.chart_now")}
              </text>
            )}
            <g clipPath={`url(#${clipId})`}>
              {projections.map((pr) => (
                <line
                  key={pr.index}
                  data-testid="trend-projection"
                  x1={x(pr.from.t)}
                  y1={y(pr.from.v)}
                  x2={x(pr.to.t)}
                  y2={y(pr.to.v)}
                  stroke="var(--color-accent)"
                  strokeWidth="2"
                  strokeDasharray="0.5 4"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              ))}
            </g>
          </g>
        )}

        <g fill="var(--color-muted)" fontSize="11" fontFamily="inherit">
          <text x={ML - 4} y={MT + 8} textAnchor="end">
            <title>{t("board.axis_max")}</title>
            {axisNum(domain.vMax)}
          </text>
          <text x={ML - 4} y={H - MB} textAnchor="end">
            <title>{t("board.axis_min")}</title>
            {axisNum(domain.vMin)}
          </text>
          {ticks
            .filter((tk) => x(tk.t) <= W - MR - 14)
            .map((tk) => (
              <text key={tk.t} x={x(tk.t)} y={H - 7} textAnchor="middle">
                {tk.label}
              </text>
            ))}
        </g>

        {series.map((s) => (
          <g key={s.index}>
            {s.points.length > 1 && (
              <polyline
                points={s.points.map((p) => `${x(p.t)},${y(p.v)}`).join(" ")}
                fill="none"
                stroke="var(--color-text)"
                strokeWidth="2"
                strokeDasharray={s.index === 1 ? "6 4" : undefined}
                strokeLinejoin="round"
              />
            )}
            {s.points.map((p, i) => (
              <Marker key={i} status={p.status} x={x(p.t)} y={y(p.v)} dashed={s.index === 1} />
            ))}
          </g>
        ))}

        <text
          x={labelRight ? lx + 9 : lx - 9}
          y={labelBelow ? ly + 20 : ly - 11}
          textAnchor={labelRight ? "start" : "end"}
          fontSize="11"
          fontWeight="600"
          fontFamily="inherit"
          fill="var(--color-text)"
          stroke="var(--color-panel)"
          strokeWidth="3"
          paintOrder="stroke"
        >
          {t(`status.${lastStatus}`)}
        </text>
      </svg>

      <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs" aria-label={t("board.chart_legend")}>
        {present.map((s) => (
          <li key={s} className="flex items-center gap-1">
            <MarkerSwatch status={s} />
            <span style={{ color: `var(--status-${s})` }}>
              <StatusIcon name={iconOf(s)} className="h-4 w-4" />
            </span>
            <span>{t(`status.${s}`)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
        {hasBands && (
          <svg aria-hidden="true" viewBox="0 0 14 10" className="h-2.5 w-3.5 shrink-0">
            <rect x="0" y="0" width="14" height="10" fill="var(--color-text)" opacity="0.25" stroke="var(--color-line)" />
          </svg>
        )}
        {hasBands
          ? indicator.earth_reference === true
            ? t("board.chart_bands_earth")
            : t("board.chart_bands")
          : t("board.chart_no_bands")}
      </p>
      {projections.length > 0 && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-muted)]" data-testid="trend-projection-note">
          <svg aria-hidden="true" viewBox="0 0 22 6" className="h-1.5 w-5 shrink-0">
            <line x1="2" y1="3" x2="20" y2="3" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="0.5 4" strokeLinecap="round" />
          </svg>
          {projNote}
        </p>
      )}
      {indicator.earth_reference === true && <ReferenceNote earth compact className="mt-1" />}

      <details className="mt-2">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-[var(--color-accent)]">
          {t("board.chart_table")}
        </summary>
        <div className="overflow-x-auto">
          <table className="mt-1 w-full text-left text-sm">
            <caption className="sr-only">{t("board.chart_table_caption", { name: indicator.name })}</caption>
            <thead>
              <tr className="border-b border-[var(--color-line)] text-[var(--color-muted)]">
                <th scope="col" className="py-1 pr-2 font-semibold">{t("board.col_time")}</th>
                <th scope="col" className="py-1 pr-2 font-semibold">{t("board.col_value")}</th>
                <th scope="col" className="py-1 font-semibold">{t("board.col_status")}</th>
              </tr>
            </thead>
            <tbody>
              {primary.map((p, i) => (
                <Row key={i} indicator={indicator} point={p} second={isPair ? series[1]!.points[i] : undefined} locale={locale} />
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

const SEVERITY: Record<EvalStatus, number> = { normal: 0, unknown: 1, attention: 2, critical: 3 };
function worstOf(list: EvalStatus[]): EvalStatus {
  return list.reduce((a, b) => (SEVERITY[b] > SEVERITY[a] ? b : a), "normal" as EvalStatus);
}

function Row({
  indicator,
  point,
  second,
  locale,
}: {
  indicator: Indicator;
  point: TrendPoint;
  second: TrendPoint | undefined;
  locale: string;
}): ReactNode {
  const { t } = useContent();
  const value = second ? formatValue([point.v, second.v]) : String(point.v);
  const status = second
    ? `${t(`status.${point.status}`)} / ${t(`status.${second.status}`)}`
    : t(`status.${point.status}`);
  return (
    <tr className="border-b border-[var(--color-line)]">
      <td className="py-1 pr-2">{formatDateTime(point.t, locale)}</td>
      <td className="py-1 pr-2 font-mono">
        {value} {indicator.unit}
      </td>
      <td className="py-1">{status}</td>
    </tr>
  );
}
