import { useMemo } from "react";
import { useContent } from "../content/ContentContext";

/** PRNG determinista (mulberry32): el campo de estrellas es igual en cada carga. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fondo espacial generado por codigo (sin imagenes externas): campo de estrellas SVG y arco luminoso del horizonte
 * terrestre abajo. Capa fija con z-index negativo, HERMANA del contenido: no es ancestro de la imagen del cuerpo,
 * asi el "screen" de .hero-img sigue mezclandose con el fondo. Decorativo (aria-hidden); el parpadeo se apaga con
 * prefers-reduced-motion. Colores y cantidad de estrellas: config theme.space.
 */
export function SpaceBackdrop() {
  const { content } = useContent();
  const count = content.app.theme.space.star_count;
  const stars = useMemo(() => {
    const r = rng(7919);
    return Array.from({ length: count }, (_, i) => {
      const x = r() * 1000;
      // Mas densas arriba: el horizonte ocupa la parte baja.
      const y = Math.pow(r(), 1.35) * 1000;
      const size = r();
      return { i, x, y, rad: size > 0.94 ? 1.6 : size > 0.75 ? 1.1 : 0.7, op: 0.35 + r() * 0.6, tw: r() > 0.85 };
    });
  }, [count]);

  return (
    <div aria-hidden="true" className="space-bg">
      <svg className="space-stars" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        {stars.map((s) => (
          <circle
            key={s.i}
            cx={s.x.toFixed(1)}
            cy={s.y.toFixed(1)}
            r={s.rad}
            opacity={s.op.toFixed(2)}
            className={s.tw ? "space-star space-star-tw" : "space-star"}
            style={s.tw ? { animationDelay: `${((s.i * 0.37) % 4).toFixed(2)}s` } : undefined}
          />
        ))}
      </svg>
      <div className="space-nebula" />
      <div className="space-horizon" />
    </div>
  );
}
