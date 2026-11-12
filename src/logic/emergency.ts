import type { Protocol } from "../content/schemas";

/** Segundos → "mm:ss" (los minutos pueden pasar de 59: en una emergencia larga no se pasa a horas). */
export function formatElapsed(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/** Primer paso sin hacer (o el último si ya están todos hechos). */
export function firstUndoneIndex(stepCount: number, doneIndexes: Iterable<number>): number {
  const done = new Set(doneIndexes);
  for (let i = 0; i < stepCount; i++) if (!done.has(i)) return i;
  return Math.max(0, stepCount - 1);
}

/** Filtro por texto en título y disparadores (sin distinguir mayúsculas). Consulta vacía → todos. */
export function filterProtocols(protocols: Protocol[], query: string): Protocol[] {
  const q = query.trim().toLowerCase();
  if (!q) return protocols;
  return protocols.filter((p) => [p.title, ...p.trigger].some((s) => s.toLowerCase().includes(q)));
}
