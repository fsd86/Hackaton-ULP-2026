import { useState, type CSSProperties } from "react";
import { useContent } from "../../content/ContentContext";
import type { HeroConfig } from "../../content/schemas";
import type { BodyZoneId } from "../../logic/bodyZones";
import { BodyFigure } from "./BodyFigure";
import { ZoneButton, type FigureZone } from "./ZoneButton";

/** Anillo elíptico (círculo inclinado en 3D) que gira despacio; decorativo. */
function Rings({ x, y, w, count, className }: { x: number; y: number; w: number; count: number; className: string }) {
  const style = { left: `${x}%`, top: `${y}%`, width: `${w}%` } as CSSProperties;
  return (
    <div aria-hidden="true" className={`hero-rings ${className}`} style={style}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`hero-ring hero-ring-${i + 1}`} />
      ))}
    </div>
  );
}

/**
 * Cuerpo del tablero: imagen translúcida (config/app.json → hero) mezclada con "screen" sobre el fondo oscuro,
 * halo sobre la cabeza y anillos de plataforma girando, barrido de escaneo al cargar (recortado a la silueta) y
 * puntos de zona accesibles. Sin hero, o si la imagen no carga, dibuja el cuerpo SVG (BodyFigure).
 * Todo el movimiento se apaga con prefers-reduced-motion (index.css).
 */
export function HeroBody({
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
  const { t, content } = useContent();
  const hero: HeroConfig | undefined = content.app.hero;
  const [failed, setFailed] = useState(false);

  if (!hero || failed) {
    return <BodyFigure zones={zones} selected={selected} onSelect={onSelect} controlsId={controlsId} />;
  }

  const src = `${import.meta.env.BASE_URL}${hero.image}`;
  const stageStyle = {
    aspectRatio: `${hero.width} / ${hero.height}`,
    "--hero-hw": hero.height / hero.width,
    "--hero-mask": `url("${src}")`,
  } as CSSProperties;

  return (
    <div role="group" aria-label={t("zone.figure_label")} className="hero-stage" style={stageStyle}>
      <div aria-hidden="true" className="hero-glow" />
      <Rings x={hero.platform.x} y={hero.platform.y} w={hero.platform.w} count={3} className="hero-platform" />
      <img
        src={src}
        alt=""
        width={hero.width}
        height={hero.height}
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
        className="hero-img"
      />
      {/* Mapa de calor: resplandor por zona segun su PEOR estado (groupByZone). Decorativo: el estado de cada zona
          ya esta en texto + icono en sus botones y en "Status by zone" (con leyenda). */}
      <div aria-hidden="true" className="hero-heat">
        {zones.map((z) => {
          const anchor = hero.zone_anchors[z.zone];
          if (!anchor || z.worst === "nodata") return null;
          const style = {
            left: `${anchor[0]}%`,
            top: `${anchor[1]}%`,
            width: `${hero.heat_radius * 2}%`,
            "--zc": `var(--status-${z.worst})`,
          } as CSSProperties;
          return <span key={z.zone} data-heat-zone={z.zone} className={`hero-heat-spot hero-heat-${z.worst}`} style={style} />;
        })}
      </div>
      <div aria-hidden="true" className="hero-scan">
        <span className="hero-scan-band" />
      </div>
      <Rings x={hero.halo.x} y={hero.halo.y} w={hero.halo.w} count={2} className="hero-halo" />
      {zones.map((z) => {
        const anchor = hero.zone_anchors[z.zone];
        if (!anchor) return null;
        return (
          <ZoneButton
            key={z.zone}
            zone={z}
            left={anchor[0]}
            top={anchor[1]}
            selected={selected === z.zone}
            onSelect={onSelect}
            controlsId={controlsId}
          />
        );
      })}
    </div>
  );
}
