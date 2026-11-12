import { z } from "zod";
import type { ReadingValue } from "../logic/evaluate";

// Wrapper de localStorage con try/catch y fallback en memoria (modo privado, storage bloqueado, tests).

export interface Reading {
  id: string;
  indicatorId: string;
  value: ReadingValue;
  environmentId: string;
  timestamp: number; // epoch ms
}

export interface EmergencyLogEntry {
  protocolId: string;
  stepIndex: number;
  timestamp: number; // epoch ms
  /** Sesión de emergencia a la que pertenece (ausente en entradas antiguas). */
  sessionId?: string;
}

/** Protocolo en curso: sobrevive a recargas. El log histórico no se borra al reiniciar. */
export interface EmergencySession {
  sessionId: string;
  protocolId: string;
  startedAt: number; // epoch ms
}

const KEYS = {
  readings: "eif.readings",
  emergencyLog: "eif.emergency_log",
  emergencySession: "eif.emergency_session",
  environment: "eif.environment",
} as const;

const memory = new Map<string, string>();
let persistent = true;

function backend(): Storage | null {
  try {
    const s = globalThis.localStorage;
    if (!s) return null;
    const probe = "eif.__probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

function readRaw(key: string): string | null {
  const s = backend();
  if (s) {
    try {
      return s.getItem(key);
    } catch {
      /* cae a memoria */
    }
  }
  return memory.get(key) ?? null;
}

function writeRaw(key: string, value: string): void {
  const s = backend();
  if (s) {
    try {
      s.setItem(key, value);
      persistent = true;
      return;
    } catch {
      /* cae a memoria */
    }
  }
  persistent = false;
  memory.set(key, value);
}

function removeRaw(key: string): void {
  memory.delete(key);
  try {
    backend()?.removeItem(key);
  } catch {
    /* ignorar */
  }
}

// ---- Esquemas de lo guardado (lo leído de localStorage no es de fiar) ----
const num = z.number().finite();
const ReadingSchema = z.object({
  id: z.string(),
  indicatorId: z.string(),
  value: z.union([num, z.tuple([num, num])]),
  environmentId: z.string(),
  timestamp: num,
});
const EmergencyLogEntrySchema = z.object({
  protocolId: z.string(),
  stepIndex: num.int().nonnegative(),
  timestamp: num,
  sessionId: z.string().optional(),
});
const EmergencySessionSchema = z.object({ sessionId: z.string(), protocolId: z.string(), startedAt: num });
const EnvironmentSchema = z.string();

// ---- Registro de descartes (store mínimo para useSyncExternalStore) ----
export interface StorageIssues {
  /** Total de ítems descartados desde el último cierre del aviso. */
  total: number;
  /** Descartes por clave lógica ("readings", "emergency_log", "emergency_session", "environment"). */
  byKey: Record<string, number>;
}

export interface StorageState {
  issues: StorageIssues;
  /** Se incrementa con clearAll(): las vistas con estado local se remontan con esta clave. */
  version: number;
}

let state: StorageState = { issues: { total: 0, byKey: {} }, version: 0 };
const listeners = new Set<() => void>();

function emit(next: StorageState): void {
  state = next;
  // Diferido: las lecturas ocurren durante el render de otras vistas.
  queueMicrotask(() => listeners.forEach((l) => l()));
}

function recordDiscard(name: string, count: number): void {
  if (count <= 0) return;
  emit({
    ...state,
    issues: { total: state.issues.total + count, byKey: { ...state.issues.byKey, [name]: (state.issues.byKey[name] ?? 0) + count } },
  });
}

export function getStorageIssues(): StorageIssues {
  return state.issues;
}
export function getStorageState(): StorageState {
  return state;
}
export function subscribeStorage(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
/** Cierra el aviso de descartes. */
export function dismissStorageIssues(): void {
  if (state.issues.total === 0) return;
  emit({ ...state, issues: { total: 0, byKey: {} } });
}

function parseRaw(raw: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false };
  }
}

/** Lista guardada: JSON roto o no-array → se descarta entera; ítems inválidos → solo esos (y se reescribe limpia). */
function readList<T>(key: string, name: string, schema: z.ZodType<T, z.ZodTypeDef, unknown>): T[] {
  const raw = readRaw(key);
  if (raw === null) return [];
  const parsed = parseRaw(raw);
  if (!parsed.ok || !Array.isArray(parsed.value)) {
    removeRaw(key);
    recordDiscard(name, 1);
    return [];
  }
  const valid: T[] = [];
  for (const item of parsed.value) {
    const r = schema.safeParse(item);
    if (r.success) valid.push(r.data);
  }
  const dropped = parsed.value.length - valid.length;
  if (dropped > 0) {
    writeRaw(key, JSON.stringify(valid));
    recordDiscard(name, dropped);
  }
  return valid;
}

function readOne<T>(key: string, name: string, schema: z.ZodType<T, z.ZodTypeDef, unknown>): T | null {
  const raw = readRaw(key);
  if (raw === null) return null;
  const parsed = parseRaw(raw);
  const r = parsed.ok ? schema.safeParse(parsed.value) : null;
  if (r?.success) return r.data;
  removeRaw(key);
  recordDiscard(name, 1);
  return null;
}

/** false si la última escritura no pudo persistir (la UI puede avisar "no se guarda"). */
export function isPersistent(): boolean {
  return persistent && backend() !== null;
}

function newId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getReadings(): Reading[] {
  return readList<Reading>(KEYS.readings, "readings", ReadingSchema);
}

export function addReading(input: Omit<Reading, "id" | "timestamp"> & { timestamp?: number }): Reading {
  const reading: Reading = { ...input, id: newId(), timestamp: input.timestamp ?? Date.now() };
  writeRaw(KEYS.readings, JSON.stringify([...getReadings(), reading]));
  return reading;
}

export function getEmergencyLog(): EmergencyLogEntry[] {
  return readList<EmergencyLogEntry>(KEYS.emergencyLog, "emergency_log", EmergencyLogEntrySchema);
}

export function addEmergencyLogEntry(
  input: Omit<EmergencyLogEntry, "timestamp"> & { timestamp?: number },
): EmergencyLogEntry {
  const entry: EmergencyLogEntry = { ...input, timestamp: input.timestamp ?? Date.now() };
  writeRaw(KEYS.emergencyLog, JSON.stringify([...getEmergencyLog(), entry]));
  return entry;
}

export function getEmergencySession(): EmergencySession | null {
  return readOne<EmergencySession>(KEYS.emergencySession, "emergency_session", EmergencySessionSchema);
}

export function startEmergencySession(protocolId: string, startedAt: number = Date.now()): EmergencySession {
  const session: EmergencySession = { sessionId: newId(), protocolId, startedAt };
  writeRaw(KEYS.emergencySession, JSON.stringify(session));
  return session;
}

/** Cierra la sesión en curso; el log de acciones (histórico) se conserva. */
export function clearEmergencySession(): void {
  removeRaw(KEYS.emergencySession);
}

export function getEnvironmentId(): string | null {
  return readOne<string>(KEYS.environment, "environment", EnvironmentSchema);
}

export function setEnvironmentId(id: string): void {
  writeRaw(KEYS.environment, JSON.stringify(id));
}

/** Borra todo lo guardado, cierra el aviso de descartes y avisa (version++) para remontar las vistas. */
export function clearAll(): void {
  for (const key of Object.values(KEYS)) removeRaw(key);
  emit({ issues: { total: 0, byKey: {} }, version: state.version + 1 });
}

/** Lee todas las claves una vez (al arrancar) para limpiar lo corrupto y registrar los descartes. */
export function scanStorage(): void {
  getReadings();
  getEmergencyLog();
  getEmergencySession();
  getEnvironmentId();
}
