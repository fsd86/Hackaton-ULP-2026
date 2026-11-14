import type { CSSProperties } from "react";
import { useContent } from "../../content/ContentContext";
import type { BodyZoneId } from "../../logic/bodyZones";

/**
 * Posicion de fondo (0-1) que centra el ancla `a` (fraccion de la imagen) en el recuadro, sin mostrar mas alla
 * del borde de la imagen. `ratio` = tamano de la imagen ampliada / tamano del recuadro en ese eje.
 */
function centerOn(a: number, ratio: number): number {
  if (ratio <= 1) return 0.5;
  return Math.min(1, Math.max(0, (0.5 - a * ratio) / (1 - ratio)));
}

/**
 * Zoom de la zona elegida en "Zone details": recorte ampliado de la MISMA imagen del cuerpo (config hero.image),
 * centrado en el ancla de la zona (hero.zone_anchors). Decorativo (aria-hidden): el nombre de la zona ya esta como
 * texto en el encabezado del panel. Sin hero o sin zoom en config, no se dibuja.
 */
export function ZoneZoom({ zone }: { zone: BodyZoneId }) {
  const { content } = useContent();
  const hero = content.app.hero;
  const zoom = hero?.zoom;
  const anchor = hero?.zone_anchors[zone];
  if (!hero || !zoom || !anchor) return null;

  const scale = zoom.zone_scale[zone] ?? zoom.scale;
  const hw = hero.height / hero.width;
  // Recuadro de ancho 1 y alto 1/aspect; la imagen ampliada mide scale de ancho y scale*hw de alto.
  const whole = scale <= 1;
  const rx = scale;
  const ry = scale * hw * zoom.aspect;
  const ax = anchor[0] / 100;
  const ay = anchor[1] / 100;
  const px = centerOn(ax, rx);
  const py = centerOn(ay, ry);
  // Donde cae el ancla dentro del recuadro (la reticula la marca aunque el recorte este pegado a un borde).
  const wFrac = 1 / (zoom.aspect * hw); // ancho de la imagen entera (contain) / ancho del recuadro
  const markX = whole ? 0.5 - wFrac / 2 + ax * wFrac : ax * rx - px * (rx - 1);
  const markY = whole ? ay : ay * ry - py * (ry - 1);
  const frame = {
    "--mark-x": `${(markX * 100).toFixed(2)}%`,
    "--mark-y": `${(markY * 100).toFixed(2)}%`,
    aspectRatio: String(zoom.aspect),
  } as CSSProperties;
  const style = {
    backgroundImage: `url("${import.meta.env.BASE_URL}${hero.image}")`,
    backgroundSize: whole ? "contain" : `${scale * 100}% auto`,
    backgroundPosition: whole ? "50% 50%" : `${(px * 100).toFixed(2)}% ${(py * 100).toFixed(2)}%`,
  } as CSSProperties;

  return (
    // La imagen va en su propia capa con "screen"; la reticula y el barrido van encima sin mezclarse.
    <div aria-hidden="true" data-zoom-zone={zone} className="zone-zoom" style={frame}>
      <span className="zone-zoom-img" style={style} />
      <span className="zone-zoom-reticle" />
      <span className="zone-zoom-scan" />
    </div>
  );
}
