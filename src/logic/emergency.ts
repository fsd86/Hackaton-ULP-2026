import type { Protocol } from "../content/schemas";

/**
 * Segundos → "mm:ss" (< 1 h), "h:mm:ss" (< 24 h) o "Xd hh:mm" (≥ 24 h).
 * daySuffix viene de strings ("time.day_abbr"); el valor por defecto es solo para tests/uso suelto.
 */
export function formatElapsed(totalSeconds: number, daySuffix = "d"): string {
  const s = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const two = (n: number) => String(n).padStart(2, "0");
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  if (days >= 1) return `${days}${daySuffix} ${two(hours)}:${two(minutes)}`;
  if (hours >= 1) return `${hours}:${two(minutes)}:${two(seconds)}`;
  return `${two(minutes)}:${two(seconds)}`;
}

/** Sesión no reanudable sola: startedAt inválido, en el futuro o más vieja que el máximo (parámetro de diseño). */
export function isSessionStale(startedAt: number, nowMs: number, maxAgeHours: number): boolean {
  if (!Number.isFinite(startedAt) || startedAt > nowMs) return true;
  return nowMs - startedAt > maxAgeHours * 3_600_000;
}

/** Antigüedad legible ("3d 02h", "5h 10min", "12min"). Los sufijos vienen de strings. */
export function formatAgo(
  ms: number,
  units: { day: string; hour: string; minute: string },
): string {
  const totalMin = Math.max(0, Math.floor(ms / 60_000));
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const minutes = totalMin % 60;
  if (days >= 1) return `${days}${units.day} ${hours}${units.hour}`;
  if (hours >= 1) return `${hours}${units.hour} ${minutes}${units.minute}`;
  return `${minutes}${units.minute}`;
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
