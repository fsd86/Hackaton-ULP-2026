import type { ReactNode } from "react";
import { useContent } from "../content/ContentContext";
import type { Indicator } from "../content/schemas";
import type { EvalStatus } from "../logic/evaluate";
import { formatDateTime, formatValue } from "../logic/daily";
import type { Trend, TrendPoint } from "../logic/trend";

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

export function TrendChart({ indicator, trend, locale }: { indicator: Indicator; trend: Trend; locale: string }) {
  const { t } = useContent();
  if (trend.empty) {
    return <p className="text-[var(--color-muted)]">{t("board.no_data")}</p>;
  }

  const { domain, series, bands } = trend;
  const isPair = indicator.input.kind === "pair";
  const pairLabels = indicator.input.kind === "pair" ? indicator.input.labels : null;
  const tSpan = domain.tMax - domain.tMin || 1;
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
  });

  const first = primary[0]!;
  const bandOpacity = isPair ? 0.07 : 0.14;

  return (
    <div>
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
        {(isPair ? bands : [bands[0]!]).flatMap((set, si) =>
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
        <rect x={ML} y={MT} width={W - ML - MR} height={H - MT - MB} fill="none" stroke="var(--color-line)" />

        <g fill="var(--color-muted)" fontSize="11" fontFamily="inherit">
          <text x={ML - 4} y={MT + 8} textAnchor="end">
            <title>{t("board.axis_max")}</title>
            {axisNum(domain.vMax)}
          </text>
          <text x={ML - 4} y={H - MB} textAnchor="end">
            <title>{t("board.axis_min")}</title>
            {axisNum(domain.vMin)}
          </text>
          <text x={ML} y={H - 7} textAnchor="start">
            {formatDateTime(first.t, locale)}
          </text>
          <text x={W - MR} y={H - 7} textAnchor="end">
            {formatDateTime(last.t, locale)}
          </text>
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
              <Marker key={i}status={p.status} x={x(p.t)} y={y(p.v)} dashed={s.index === 1} />
            ))}
          </g>
        ))}
      </svg>

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
                <Row key={i}indicator={indicator} point={p} second={isPair ? series[1]!.points[i] : undefined} locale={locale} />
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
