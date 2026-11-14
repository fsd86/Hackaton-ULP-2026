import type { CSSProperties } from "react";
import { useContent } from "../../content/ContentContext";

// Geometria de un latido estilizado (unidades del viewBox). Es un dibujo, no una derivacion de ECG.
const BEAT = 40;
const BEATS = 6;
const H = 24;
const BASE = 15;

function beat(x0: number): string {
  const p = (dx: number, dy: number) => `${x0 + dx},${BASE + dy}`;
  return [p(0, 0), p(8, 0), p(10, -2), p(12, 0), p(15, 0), p(16, 2), p(18, -12), p(20, 5), p(21, 0), p(26, 0), p(29, -3), p(32, 0), p(BEAT, 0)].join(" L");
}
// Dos tramos iguales: se desplaza uno completo y el bucle no tiene saltos.
const PATH = `M${Array.from({ length: BEATS * 2 }, (_, i) => beat(i * BEAT)).join(" L")}`;

/**
 * Traza de pulso animada de la fila de frecuencia cardiaca. DECORATIVA (aria-hidden) y rotulada como tal: no es
 * un ECG ni muestra ningun dato medico. Solo el ritmo del dibujo sigue la ultima lectura guardada (latidos/min);
 * sin lectura usa config hud.pulse_trace.idle_bpm. Se detiene con prefers-reduced-motion.
 */
export function PulseTrace({ bpm }: { bpm: number | null }) {
  const { t, content } = useContent();
  const cfg = content.app.hud.pulse_trace;
  const rate = Math.min(cfg.max_bpm, Math.max(cfg.min_bpm, bpm ?? cfg.idle_bpm));
  const style = { "--pulse-dur": `${((BEATS * 60) / rate).toFixed(2)}s` } as CSSProperties;
  return (
    <div aria-hidden="true" className="pulse-trace" style={style}>
      {/* El SVG mide el doble del contenedor (dos tramos) y se desplaza medio ancho en bucle. */}
      <div className="pulse-window">
      <svg viewBox={`0 0 ${BEAT * BEATS * 2} ${H}`} preserveAspectRatio="none" className="pulse-svg pulse-track">
        <path d={PATH} className="pulse-line" fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      </div>
      <span className="pulse-caption">{t("hud.pulse_trace.caption")}</span>
    </div>
  );
}
