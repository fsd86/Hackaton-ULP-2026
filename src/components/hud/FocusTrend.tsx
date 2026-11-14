import { useId } from "react";
import { useContent } from "../../content/ContentContext";
import type { Indicator } from "../../content/schemas";
import { formatValue } from "../../logic/daily";
import type { Trend } from "../../logic/trend";

const W = 320;
const H = 116;
const PAD_X = 6;
const PAD_T = 10;
const PAD_B = 8;

/**
 * Tendencia destacada del panel izquierdo: area + linea del indicador elegido, con las franjas de rango del JSON
 * de fondo. Es un role="img" con resumen en texto; la tabla completa vive en la seccion Trends.
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
  const line = pts.map((p) => `${x(p.t)},${y(p.v)}`).join(" ");
  const area = `${x(pts[0]!.t)},${H - PAD_B} ${line} ${x(last.t)},${H - PAD_B}`;

  return (
    <svg role="img" aria-label={summary} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
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
      {pts.length > 1 && <polygon points={area} fill={`url(#${uid}-area)`} />}
      {pts.length > 1 && (
        <polyline points={line} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinejoin="round" className="focus-line" />
      )}
      {series[1] && series[1].points.length > 1 && (
        <polyline
          points={series[1].points.map((p) => `${x(p.t)},${y(p.v)}`).join(" ")}
          fill="none"
          stroke="var(--color-accent)"
          strokeOpacity="0.6"
          strokeWidth="1.6"
          strokeDasharray="5 4"
        />
      )}
      <circle cx={x(last.t)} cy={y(last.v)} r="4.5" fill={`var(--status-${last.status})`} stroke="var(--color-ink)" strokeWidth="1.5" />
    </svg>
  );
}
