import type { CSSProperties } from "react";
import { useContent } from "../../content/ContentContext";
import type { BadgeStatus } from "../StatusBadge";

const R = 40;
const C = 2 * Math.PI * R;
const GAP = 3; // separacion entre segmentos (unidades del trazo)

/**
 * Anillo de estado: cuantos indicadores hay en cada estado (board.counts: conteos reales, sin porcentajes).
 * aria-hidden: la lista de conteos con icono + texto que lo acompana es su alternativa accesible.
 */
export function StatusRing({ counts, order }: { counts: Record<BadgeStatus, number>; order: BadgeStatus[] }) {
  const { t } = useContent();
  const total = order.reduce((n, s) => n + counts[s], 0);
  const parts = order.filter((s) => counts[s] > 0);
  let offset = 0;
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 100 100" className="status-ring">
      <circle cx="50" cy="50" r={R} className="status-ring-track" />
      {total > 0 &&
        parts.map((s) => {
          const len = (counts[s] / total) * C;
          const dash = Math.max(0.5, len - (parts.length > 1 ? GAP : 0));
          const seg = (
            <circle
              key={s}
              cx="50"
              cy="50"
              r={R}
              className="status-ring-seg"
              style={{ "--sc": `var(--status-${s})` } as CSSProperties}
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return seg;
        })}
      <text x="50" y="50" textAnchor="middle" className="status-ring-num">
        {total}
      </text>
      <text x="50" y="64" textAnchor="middle" className="status-ring-label">
        {t("hud.ring.total")}
      </text>
    </svg>
  );
}
