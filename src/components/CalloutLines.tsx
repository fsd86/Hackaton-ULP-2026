import { useCallback, useEffect, useState, type RefObject } from "react";

export interface CalloutLink {
  /** data-vital-id de la tarjeta de origen. */
  cardId: string;
  /** data-anchor-zone del punto de destino en la figura. */
  zone: string;
  /** Estado del indicador (solo decide el color del trazo; el estado ya esta dicho en la tarjeta). */
  status: string;
}

interface Line {
  key: string;
  d: string;
  x2: number;
  y2: number;
  status: string;
}

/** Tramo horizontal antes de girar hacia el punto de la figura. */
const ELBOW = 22;
/** Ancho minimo (px) desde el cual se dibujan las lineas (breakpoint lg). */
const MIN_WIDTH = 1024;

/**
 * Lineas finas desde cada tarjeta hasta su punto en la figura, terminando en un punto (ref2/ref4).
 * Overlay SVG decorativo (aria-hidden, sin eventos): mide con getBoundingClientRect y se recalcula con
 * ResizeObserver, al terminar las animaciones de entrada y al cargar las fuentes. Solo >= lg.
 */
export function CalloutLines({ containerRef, links }: { containerRef: RefObject<HTMLElement | null>; links: CalloutLink[] }) {
  const [lines, setLines] = useState<Line[]>([]);

  const measure = useCallback(() => {
    const root = containerRef.current;
    if (!root || window.innerWidth < MIN_WIDTH) {
      setLines((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    const base = root.getBoundingClientRect();
    const next: Line[] = [];
    for (const link of links) {
      const card = root.querySelector<HTMLElement>(`[data-vital-id="${CSS.escape(link.cardId)}"]`);
      const anchor = root.querySelector<HTMLElement>(`[data-anchor-zone="${CSS.escape(link.zone)}"]`);
      if (!card || !anchor) continue;
      const c = card.getBoundingClientRect();
      const a = anchor.getBoundingClientRect();
      const x1 = c.right - base.left;
      const y1 = c.top + c.height / 2 - base.top;
      const x2 = a.left + a.width / 2 - base.left;
      const y2 = a.top + a.height / 2 - base.top;
      if (x2 <= x1) continue; // el punto debe quedar a la derecha de la tarjeta
      next.push({ key: `${link.cardId}-${link.zone}`, d: `M${x1} ${y1} H${x1 + ELBOW} L${x2} ${y2}`, x2, y2, status: link.status });
    }
    setLines(next);
  }, [containerRef, links]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    root.querySelectorAll("[data-vital-id], [data-anchor-zone]").forEach((el) => ro.observe(el));
    window.addEventListener("resize", measure);
    root.addEventListener("animationend", measure);
    void document.fonts?.ready.then(measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      root.removeEventListener("animationend", measure);
    };
  }, [containerRef, measure]);

  return (
    <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full overflow-visible lg:block">
      {lines.map((l) => (
        <g key={l.key} style={{ color: `var(--status-${l.status})` }}>
          <path d={l.d} fill="none" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1" />
          <circle cx={l.x2} cy={l.y2} r="3" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}
