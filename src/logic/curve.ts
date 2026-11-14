/**
 * Trazo suave para graficos de linea: cubica monotona (Fritsch-Carlson). A diferencia de Catmull-Rom no
 * "inventa" picos: la curva nunca pasa por encima ni por debajo de los puntos medidos entre dos lecturas.
 * Funcion pura; devuelve el atributo d de un <path> (vacio si no hay puntos).
 */
export function smoothPath(points: ReadonlyArray<readonly [number, number]>): string {
  const n = points.length;
  if (n === 0) return "";
  const f = (v: number) => Number(v.toFixed(2));
  if (n < 3) return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${f(x)},${f(y)}`).join(" ");

  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const h = points[i + 1]![0] - points[i]![0];
    dx.push(h);
    slope.push(h === 0 ? 0 : (points[i + 1]![1] - points[i]![1]) / h);
  }
  // Tangentes: 0 en extremos locales, media armonica ponderada en el resto (monotonia).
  const m: number[] = [slope[0]!];
  for (let i = 1; i < n - 1; i++) {
    const a = slope[i - 1]!;
    const b = slope[i]!;
    if (a * b <= 0) m.push(0);
    else {
      const w1 = 2 * dx[i]! + dx[i - 1]!;
      const w2 = dx[i]! + 2 * dx[i - 1]!;
      m.push((w1 + w2) / (w1 / a + w2 / b));
    }
  }
  m.push(slope[n - 2]!);

  let d = `M${f(points[0]![0])},${f(points[0]![1])}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i]!;
    const [x1, y1] = points[i + 1]!;
    const h = dx[i]! / 3;
    d += ` C${f(x0 + h)},${f(y0 + m[i]! * h)} ${f(x1 - h)},${f(y1 - m[i + 1]! * h)} ${f(x1)},${f(y1)}`;
  }
  return d;
}
