import { smoothPath } from "../logic/curve";
import type { EvalStatus } from "../logic/evaluate";

const W = 120;
const H = 28;
const PAD = 3;

/** Mini tendencia decorativa (el grafico accesible completo esta en la seccion Trends). Ultimo punto: forma segun estado. */
export function Sparkline({ values, status }: { values: number[]; status: EvalStatus }) {
  if (values.length === 0) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const x = (i: number) => (values.length === 1 ? W / 2 : PAD + (i / (values.length - 1)) * (W - 2 * PAD));
  const y = (v: number) => H - PAD - ((v - lo) / span) * (H - 2 * PAD);
  const lastX = x(values.length - 1);
  const lastY = y(values[values.length - 1]!);
  const color = `var(--status-${status})`;
  const r = 3.2;
  return (
    <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${W} ${H}`} className="block h-7 w-[120px] max-w-full">
      {values.length > 1 && (
        <path
          className="spark-line"
          d={smoothPath(values.map((v, i) => [x(i), y(v)] as const))}
          fill="none"
          stroke="var(--color-accent)"
          strokeOpacity="0.75"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}
      {status === "attention" ? (
        <polygon points={`${lastX},${lastY - r - 1} ${lastX + r + 1},${lastY + r} ${lastX - r - 1},${lastY + r}`} fill={color} />
      ) : status === "critical" ? (
        <polygon points={`${lastX},${lastY - r - 1} ${lastX + r + 1},${lastY} ${lastX},${lastY + r + 1} ${lastX - r - 1},${lastY}`} fill={color} />
      ) : status === "unknown" ? (
        <rect x={lastX - r + 0.5} y={lastY - r + 0.5} width={(r - 0.5) * 2} height={(r - 0.5) * 2} fill="var(--color-ink)" stroke={color} strokeWidth="1.5" />
      ) : (
        <circle cx={lastX} cy={lastY} r={r} fill={color} />
      )}
    </svg>
  );
}
