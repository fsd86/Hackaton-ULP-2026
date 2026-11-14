import { useId } from "react";
import { useContent } from "../../content/ContentContext";
import type { BodyZoneId } from "../../logic/bodyZones";
import { ZoneButton, type FigureZone } from "./ZoneButton";
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

export type { FigureZone, FigureZoneItem } from "./ZoneButton";

const MIRROR = `translate(${VIEW_W} 0) scale(-1 1)`;

/**
 * Figura humana frontal dibujada en SVG (respaldo cuando no hay imagen del cuerpo). El dibujo es decorativo y
 * aria-hidden; las zonas son <button> (ZoneButton) posicionados en % sobre el mismo viewBox.
 * La zona elegida se muestra en el panel de detalle del tablero (controlsId).
 */
export function BodyFigure({
  zones,
  selected,
  onSelect,
  controlsId,
}: {
  zones: FigureZone[];
  selected: BodyZoneId | null;
  onSelect: (zone: BodyZoneId) => void;
  controlsId?: string;
}) {
  const { t } = useContent();
  const uid = useId().replace(/:/g, "");
  const id = (name: string): string => `${uid}-${name}`;
  const url = (name: string): string => `url(#${id(name)})`;

  return (
    <div className="relative">
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
          return (
            <ZoneButton
              key={z.zone}
              zone={z}
              left={(x / VIEW_W) * 100}
              top={(y / VIEW_H) * 100}
              selected={selected === z.zone}
              onSelect={onSelect}
              controlsId={controlsId}
            />
          );
        })}
      </div>

    </div>
  );
}
