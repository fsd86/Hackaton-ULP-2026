import { useId, type CSSProperties } from "react";
import { useContent } from "../../content/ContentContext";
import type { Indicator } from "../../content/schemas";
import { formatValue } from "../../logic/daily";
import { smoothPath } from "../../logic/curve";
import type { Trend } from "../../logic/trend";

const W = 320;
const H = 116; // alto del area de la linea
const PAD_X = 6;
const PAD_T = 10;
const PAD_B = 8;
// Barras de lecturas debajo de la linea: una barra por lectura guardada, alto segun su valor.
const BARS_TOP = H + 10;
const BARS_H = 30;
const TOTAL_H = BARS_TOP + BARS_H + 2;

/**
 * Tendencia destacada del panel izquierdo: area + linea suave del indicador elegido, con las franjas de rango del
 * JSON de fondo, y debajo una barra por lectura (color + forma del ultimo punto segun estado). Es un role="img" con
 * resumen en texto (incluye el estado); la tabla completa vive en la seccion Trends.
 */
export function FocusTrend({ indicator, trend }: { indicator: Indicator; trend: Trend }) {
  const { t } = useContent();
  const uid = useId().replace(/:/g, "");
  if (trend.empty) return <p className="text-sm text-[var(--color-muted)]">{t("hud.focus_trend.empty")}</p>;

  const { domain, series, bands } = trend;
  const pts = series[0]!.points;
  const tSpan = domain.tMax - domain.tMin || 1;
  const vSpan = domain.vMax - domain.vMin || 1;
  const x = (tt: number) => (pts.length === 1 ? W / 2 : PAD_X + ((tt - domain.tMin) / tSpan) * (W - 2 * PAD_X));
  const y = (v: number) => PAD_T + (1 - (v - domain.vMin) / vSpan) * (H - PAD_T - PAD_B);
  const clampY = (v: number) => Math.min(H - PAD_B, Math.max(PAD_T, y(v)));
  const last = pts[pts.length - 1]!;
  const isPair = indicator.input.kind === "pair";
  const lastValue = isPair ? formatValue([last.v, series[1]?.points[series[1].points.length - 1]?.v ?? 0]) : formatValue(last.v);
  const summary = t("hud.focus_trend.summary", {
    name: indicator.name,
    count: pts.length,
    value: lastValue,
    unit: indicator.unit,
    status: t(`status.${last.status}`),
  });
  const line = smoothPath(pts.map((p) => [x(p.t), y(p.v)] as const));
  const area = `${line} L${x(last.t)},${H - PAD_B} L${x(pts[0]!.t)},${H - PAD_B} Z`;
  const barW = Math.max(3, Math.min(12, ((W - 2 * PAD_X) / pts.length) * 0.55));
  const barX = (tt: number) => Math.min(W - PAD_X - barW / 2, Math.max(PAD_X + barW / 2, x(tt)));

  return (
    <svg role="img" aria-label={summary} viewBox={`0 0 ${W} ${TOTAL_H}`} className="block h-auto w-full">
      <defs>
        <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.45 }} />
          <stop offset="1" style={{ stopColor: "var(--color-accent)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      {(bands[0] ?? []).map((b, i) => {
        const top = clampY(b.to);
        return (
          <rect key={i} x="0" y={top} width={W} height={Math.max(0, clampY(b.from) - top)} fill={`var(--status-${b.status})`} opacity="0.1" />
        );
      })}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={W} y1={PAD_T + f * (H - PAD_T - PAD_B)} y2={PAD_T + f * (H - PAD_T - PAD_B)} stroke="var(--color-line)" strokeOpacity="0.45" strokeDasharray="2 4" />
      ))}
      {pts.length > 1 && <path d={area} fill={`url(#${uid}-area)`} />}
      {pts.length > 1 && (
        <path d={line} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinejoin="round" className="focus-line" />
      )}
      {series[1] && series[1].points.length > 1 && (
        <path
          d={smoothPath(series[1].points.map((p) => [x(p.t), y(p.v)] as const))}
          fill="none"
          stroke="var(--color-accent)"
          strokeOpacity="0.6"
          strokeWidth="1.6"
          strokeDasharray="5 4"
        />
      )}
      <line x1="0" x2={W} y1={BARS_TOP + BARS_H} y2={BARS_TOP + BARS_H} stroke="var(--color-line)" strokeOpacity="0.7" />
      <text x={PAD_X} y={BARS_TOP - 2} className="trend-bars-label">
        {t("hud.trend_bars.label")}
      </text>
      {pts.map((p, i) => {
        const frac = Math.min(1, Math.max(0, (p.v - domain.vMin) / vSpan));
        const h = 3 + frac * (BARS_H - 3);
        return (
          <rect
            key={i}
            x={barX(p.t) - barW / 2}
            y={BARS_TOP + BARS_H - h}
            width={barW}
            height={h}
            rx="1"
            className="trend-bar"
            style={{ "--sc": `var(--status-${p.status})` } as CSSProperties}
          />
        );
      })}
      <circle cx={x(last.t)} cy={y(last.v)} r="4.5" fill={`var(--status-${last.status})`} stroke="var(--color-ink)" strokeWidth="1.5" />
    </svg>
  );
}
