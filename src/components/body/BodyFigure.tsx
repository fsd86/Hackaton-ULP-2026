import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useContent } from "../../content/ContentContext";
import type { BodyZoneId, ZoneStatus } from "../../logic/bodyZones";
import type { EvalStatus } from "../../logic/evaluate";
import { StatusBadge } from "../StatusBadge";
import { StatusIcon } from "../StatusIcon";
import {
  DETAIL_CENTER,
  DETAIL_LEFT,
  JOINTS_CENTER,
  JOINTS_LEFT,
  KNEE,
  NAVEL,
  OUTLINE_PATH,
  PLATFORM,
  VIEW_H,
  VIEW_W,
  ZONE_ANCHORS,
} from "./bodyPaths";

export interface FigureZoneItem {
  id: string;
  name: string;
  unit: string;
  /** Ultima lectura formateada, o null si todavia no hay ninguna. */
  valueText: string | null;
  status: EvalStatus;
}

export interface FigureZone {
  zone: BodyZoneId;
  worst: ZoneStatus;
  items: FigureZoneItem[];
}

const MIRROR = `translate(${VIEW_W} 0) scale(-1 1)`;

/**
 * Figura humana frontal con zonas interactivas. El dibujo (SVG) es decorativo y aria-hidden; las zonas son
 * <button> HTML posicionados en % sobre el mismo viewBox, asi que tienen foco, Enter/Espacio y etiquetas nativas.
 * Cada zona abre un panel no modal con sus indicadores (Esc cierra y devuelve el foco al boton).
 */
export function BodyFigure({ zones }: { zones: FigureZone[] }) {
  const { t, content } = useContent();
  const statusIcons = content.app.theme.status_icons;
  const uid = useId().replace(/:/g, "");
  const [open, setOpen] = useState<BodyZoneId | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<BodyZoneId, HTMLButtonElement>());

  useEffect(() => {
    if (open) panelRef.current?.focus({ preventScroll: true });
  }, [open]);

  const openZone = zones.find((z) => z.zone === open);

  function close(returnFocus: boolean): void {
    const was = open;
    setOpen(null);
    if (returnFocus && was) buttons.current.get(was)?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>): void {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      close(true);
    }
  }

  const id = (name: string): string => `${uid}-${name}`;
  const url = (name: string): string => `url(#${id(name)})`;

  return (
    // El onKeyDown solo escucha Esc para cerrar el panel (los eventos de teclado burbujean desde botones y panel).
    <div className="relative" onKeyDown={onKeyDown}>
      <div role="group" aria-label={t("zone.figure_label")} className="body-stage">
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id={id("fill")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.2 }} />
              <stop offset="0.55" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.08 }} />
              <stop offset="1" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.03 }} />
            </linearGradient>
            <radialGradient id={id("aura")} cx="0.5" cy="0.45" r="0.5">
              <stop offset="0" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.12 }} />
              <stop offset="1" style={{ stopColor: "var(--color-accent)", stopOpacity: 0 }} />
            </radialGradient>
            <radialGradient id={id("halo")} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.35 }} />
              <stop offset="1" style={{ stopColor: "var(--color-accent)", stopOpacity: 0 }} />
            </radialGradient>
            <linearGradient id={id("scan")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--color-accent)", stopOpacity: 0 }} />
              <stop offset="0.8" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.28 }} />
              <stop offset="1" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.75 }} />
            </linearGradient>
            <filter id={id("glow")} x="-20%" y="-10%" width="140%" height="120%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id={id("clip")}>
              <path d={OUTLINE_PATH} />
            </clipPath>
          </defs>

          {/* Aura y plataforma/halo bajo los pies */}
          <ellipse cx="200" cy="400" rx="190" ry="420" fill={url("aura")} />
          <ellipse cx={PLATFORM.cx} cy={PLATFORM.cy} rx="190" ry="34" fill={url("halo")} />
          {PLATFORM.rings.map((r, i) => (
            <ellipse
              key={i}
              cx={PLATFORM.cx}
              cy={PLATFORM.cy}
              rx={r.rx}
              ry={r.ry}
              fill="none"
              stroke="var(--color-accent)"
              strokeOpacity={r.opacity}
              strokeWidth="1.2"
              strokeDasharray={r.dash}
            />
          ))}

          {/* Silueta: relleno sutil + contorno con brillo */}
          <path d={OUTLINE_PATH} fill={url("fill")} />
          <path
            d={OUTLINE_PATH}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.8"
            strokeLinejoin="round"
            filter={url("glow")}
          />

          {/* Lineas interiores tipo wireframe, a baja opacidad (izquierda + espejo) */}
          <g fill="none" stroke="var(--color-accent)" strokeOpacity="0.34" strokeWidth="1" strokeLinecap="round">
            {DETAIL_CENTER.map((d) => (
              <path key={d} d={d} strokeDasharray="3 5" />
            ))}
            {[undefined, MIRROR].map((transform, side) => (
              <g key={side} transform={transform}>
                {DETAIL_LEFT.map((d) => (
                  <path key={d} d={d} strokeDasharray={d.includes("L") ? "2 6" : undefined} />
                ))}
                <ellipse cx={KNEE[0]} cy={KNEE[1]} rx="11" ry="14" />
              </g>
            ))}
            <circle cx={NAVEL[0]} cy={NAVEL[1]} r="2.6" />
          </g>
          <g fill="var(--color-ink)" stroke="var(--color-accent)" strokeOpacity="0.6" strokeWidth="1">
            {[undefined, MIRROR].map((transform, side) => (
              <g key={side} transform={transform}>
                {JOINTS_LEFT.map(([x, y]) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r="2.8" />
                ))}
              </g>
            ))}
            {JOINTS_CENTER.map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="2.8" />
            ))}
          </g>

          {/* Barrido de escaneo: una sola pasada al cargar, recortado a la silueta (sin movimiento con reduced motion) */}
          <g clipPath={url("clip")}>
            <g className="scan-band">
              <rect x="0" y="0" width={VIEW_W} height="140" fill={url("scan")} />
              <rect x="0" y="138" width={VIEW_W} height="2" fill="var(--color-accent)" />
            </g>
          </g>
        </svg>

        {zones.map((z) => {
          const [x, y] = ZONE_ANCHORS[z.zone];
          const label = t(`zone.${z.zone}`);
          const items = z.items
            .map((i) => (i.valueText === null ? `${i.name} ${t("zone.no_reading")}` : t("zone.item", { name: i.name, status: t(`status.${i.status}`) })))
            .join(", ");
          const alert = z.worst === "attention" || z.worst === "critical";
          const nodata = z.worst === "nodata";
          const style = {
            left: `${(x / VIEW_W) * 100}%`,
            top: `${(y / VIEW_H) * 100}%`,
            "--zc": nodata ? "var(--color-muted)" : `var(--status-${z.worst})`,
          } as CSSProperties;
          return (
            <button
              key={z.zone}
              type="button"
              ref={(el) => {
                if (el) buttons.current.set(z.zone, el);
                else buttons.current.delete(z.zone);
              }}
              data-zone={z.zone}
              aria-label={t("zone.button", { zone: label, items })}
              aria-haspopup="dialog"
              aria-expanded={open === z.zone}
              onClick={() => setOpen(open === z.zone ? null : z.zone)}
              style={style}
              className="zone-btn"
            >
              <span data-anchor-zone={z.zone} className={`zone-dot ${nodata ? "opacity-60" : ""}`} style={nodata ? { borderStyle: "dashed" } : undefined}>
                {alert && (
                  <>
                    <span aria-hidden="true" className="zone-ring" />
                    <span aria-hidden="true" className="zone-ring zone-ring-2" />
                  </>
                )}
                {z.worst !== "nodata" && (
                  <StatusIcon name={z.worst === "unknown" ? "help-circle" : statusIcons[z.worst]} className="h-3.5 w-3.5" />
                )}
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-[calc(50%+16px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm bg-[color-mix(in_srgb,var(--color-ink)_80%,transparent)] px-1 font-mono text-[0.58rem] font-semibold uppercase tracking-wider text-[var(--color-text)] sm:text-[0.62rem]"
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {openZone && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={id("panel-title")}
          tabIndex={-1}
          className="glass absolute inset-x-1 bottom-1 z-30 rounded-sm p-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] lg:inset-x-auto lg:right-1 lg:top-6 lg:bottom-auto lg:w-60"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 id={id("panel-title")} className="eyebrow !text-[var(--color-text)]">
              {t(`zone.${openZone.zone}`)}
            </h3>
            <button
              type="button"
              onClick={() => close(true)}
              aria-label={t("zone.close")}
              className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-[var(--color-line)] text-[var(--color-text)] hover:border-[var(--color-accent)]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <ul className="mt-2 space-y-2">
            {openZone.items.map((i) => (
              <li key={i.id} className="rounded-sm border border-[var(--glass-border)] p-2">
                <p className="text-sm font-semibold">{i.name}</p>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  {i.valueText === null ? (
                    <span className="text-sm text-[var(--color-muted)]">{t("zone.no_reading")}</span>
                  ) : (
                    <span className="font-mono text-lg font-semibold">
                      {i.valueText} <span className="text-xs font-normal text-[var(--color-muted)]">{i.unit}</span>
                    </span>
                  )}
                  <StatusBadge status={i.status} live={false} size="sm" />
                </div>
                <a
                  href={`#/check/${encodeURIComponent(i.id)}`}
                  aria-label={t("board.open_in_check", { name: i.name })}
                  className="mt-2 inline-flex min-h-9 items-center text-sm font-semibold text-[var(--color-accent)] underline underline-offset-2"
                >
                  {t("board.open_short")}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[var(--color-muted)]">{t("zone.close_hint")}</p>
        </div>
      )}
    </div>
  );
}
