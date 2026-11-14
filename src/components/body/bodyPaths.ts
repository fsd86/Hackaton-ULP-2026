import type { BodyZoneId } from "../../logic/bodyZones";

// Geometria de la figura (viewBox 0 0 400 900). Canon de ~8 cabezas: cabeza = 102 u, cima y=30, suelo y≈853.
// Referencias verticales: menton ~132 · hombros 172-204 · axilas 214 · cintura/ombligo ~337 · entrepierna 440 ·
// rodilla ~602 · tobillo ~810. Hombros (deltoides) ≈ 2 cabezas de ancho (208 u); pecho 128 u; cintura 96 u; cadera 120 u.

export const VIEW_W = 400;
export const VIEW_H = 900;
export const CENTER_X = 200;

type Pt = readonly [number, number];
/** Curva cubica: [c1x, c1y, c2x, c2y, x, y]. */
type Seg = readonly [number, number, number, number, number, number];

/** Punto de arranque: coronilla, sobre el eje central. */
const START: Pt = [200, 30];

/**
 * Mitad IZQUIERDA del contorno, de la coronilla a la entrepierna, una sola curva continua:
 * craneo → mandibula → cuello → trapecio → hombro → brazo (lado externo) → mano → brazo (lado interno) → axila →
 * costado del torso → cintura → cadera → muslo → rodilla → pantorrilla → tobillo → pie → pierna (lado interno) → entrepierna.
 * Los brazos quedan separados del torso a partir de la axila. La mitad derecha NO se escribe: se genera espejando.
 */
const LEFT: readonly Seg[] = [
  // Craneo y mandibula
  [178, 30, 167, 52, 167, 80],
  [167, 96, 169, 108, 176, 117],
  [179, 121, 182, 124, 183, 128],
  // Cuello y trapecio
  [183, 138, 180, 145, 179, 150],
  [168, 155, 138, 162, 116, 172],
  // Hombro (deltoides) y brazo, lado externo
  [104, 176, 97, 188, 96, 204],
  [92, 226, 84, 300, 78, 342],
  [76, 352, 74, 362, 73, 376],
  [71, 400, 70, 430, 71, 458],
  // Muneca y mano (nudillos, dedos juntos, punta redondeada)
  [70, 470, 66, 480, 66, 496],
  [65, 516, 67, 534, 72, 546],
  [73, 553, 84, 553, 85, 546],
  [88, 534, 91, 516, 91, 498],
  [91, 484, 89, 472, 89, 460],
  // Antebrazo y brazo, lado interno, hasta la axila
  [89, 430, 101, 404, 103, 376],
  [104, 364, 106, 354, 107, 345],
  [111, 305, 125, 255, 136, 214],
  // Torso: costado, cintura, cadera
  [137, 240, 150, 300, 152, 335],
  [152, 365, 140, 395, 140, 425],
  // Pierna, lado externo: muslo, rodilla, pantorrilla, tobillo
  [138, 450, 136, 490, 137, 520],
  [139, 550, 148, 578, 150, 602],
  [151, 622, 146, 650, 145, 684],
  [145, 720, 152, 770, 155, 806],
  // Pie
  [155, 826, 148, 832, 146, 844],
  [146, 851, 151, 853, 160, 853],
  [172, 853, 184, 852, 187, 846],
  // Pierna, lado interno, hasta la entrepierna
  [187, 834, 178, 828, 177, 810],
  [179, 780, 189, 740, 189, 700],
  [190, 660, 192, 630, 190, 604],
  [189, 570, 195, 500, 197, 458],
  [198, 450, 199, 444, 200, 440],
];

const mirrorPt = ([x, y]: Pt): Pt => [2 * CENTER_X - x, y];

/**
 * Espeja una cadena de curvas respecto del eje central y la recorre al reves, de modo que empalme
 * exactamente con el final de la cadena original (garantiza simetria perfecta).
 */
function mirrorReverse(start: Pt, segs: readonly Seg[]): Seg[] {
  const points: Pt[] = [start, ...segs.map((s): Pt => [s[4], s[5]])];
  const out: Seg[] = [];
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i]!;
    const c1 = mirrorPt([s[2], s[3]]); // el control final pasa a ser el inicial al invertir
    const c2 = mirrorPt([s[0], s[1]]);
    const to = mirrorPt(points[i]!);
    out.push([c1[0], c1[1], c2[0], c2[1], to[0], to[1]]);
  }
  return out;
}

const num = (n: number): string => String(Math.round(n * 100) / 100);
const seg = (s: Seg): string => `C${s.map(num).join(" ")}`;

/** Contorno cerrado de la silueta completa (izquierda original + derecha espejada). */
export const OUTLINE_PATH: string = [
  `M${START[0]} ${START[1]}`,
  ...LEFT.map(seg),
  ...mirrorReverse(START, LEFT).map(seg),
  "Z",
].join(" ");

/** Punto de anclaje de cada zona (lado izquierdo del espectador, para que las lineas lleguen sin cruzar la figura). */
export const ZONE_ANCHORS: Record<BodyZoneId, Pt> = {
  head: [184, 76],
  chest: [170, 262],
  abdomen: [172, 372],
  arm: [99, 290],
  body: [150, 480],
};

/** Trazos interiores tenues (solo mitad izquierda; se dibujan tambien espejados con transform). */
export const DETAIL_LEFT: readonly string[] = [
  // Cabeza: linea de ojos y menton
  "M168 78 H200",
  "M176 117 Q188 136 200 138",
  // Clavicula
  "M187 157 C170 152 146 158 124 172",
  // Pectoral inferior
  "M197 246 C182 260 156 258 142 240",
  // Costillas (insinuacion)
  ...[0, 1, 2].map((k) => `M197 ${270 + k * 17} C176 ${268 + k * 17} 160 ${274 + k * 17} ${150 + k * 2} ${290 + k * 17}`),
  // Abdomen: lineas del recto abdominal
  "M187 356 H200",
  "M187 374 H200",
  "M187 392 H200",
  "M188 300 C186 320 186 340 188 356",
  // Cresta iliaca hacia la entrepierna
  "M146 398 C164 408 184 420 200 436",
  // Esqueleto de brazo y pierna (lineas entre articulaciones)
  "M116 190 L92 345 L80 462",
  "M158 428 L170 602 L166 812",
];

/** Trazos interiores centrales (no se espejan). */
export const DETAIL_CENTER: readonly string[] = ["M200 140 V436", "M183 128 H217"];

/** Articulaciones (mitad izquierda; el eje central lleva las suyas aparte). */
export const JOINTS_LEFT: readonly Pt[] = [
  [116, 184], // hombro
  [92, 345], // codo
  [80, 462], // muneca
  [158, 428], // cadera
  [170, 602], // rodilla
  [166, 812], // tobillo
];
export const JOINTS_CENTER: readonly Pt[] = [
  [200, 150], // base del cuello
  [200, 337], // ombligo
  [200, 436], // pelvis
];

export const NAVEL: Pt = [200, 337];
export const KNEE: Pt = [170, 602];

/** Plataforma/halo bajo los pies (elipses concentricas). cy en unidades del viewBox. */
export const PLATFORM = {
  cx: 200,
  cy: 856,
  rings: [
    { rx: 172, ry: 26, opacity: 0.35, dash: "2 7" },
    { rx: 140, ry: 21, opacity: 0.5, dash: undefined },
    { rx: 104, ry: 15, opacity: 0.45, dash: undefined },
    { rx: 66, ry: 9, opacity: 0.8, dash: undefined },
  ],
} as const;
