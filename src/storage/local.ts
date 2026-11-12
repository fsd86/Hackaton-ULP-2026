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
}

const KEYS = {
  readings: "eif.readings",
  emergencyLog: "eif.emergency_log",
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

function readJson<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
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
  return readJson<Reading[]>(KEYS.readings, []);
}

export function addReading(input: Omit<Reading, "id" | "timestamp"> & { timestamp?: number }): Reading {
  const reading: Reading = { ...input, id: newId(), timestamp: input.timestamp ?? Date.now() };
  writeRaw(KEYS.readings, JSON.stringify([...getReadings(), reading]));
  return reading;
}

export function getEmergencyLog(): EmergencyLogEntry[] {
  return readJson<EmergencyLogEntry[]>(KEYS.emergencyLog, []);
}

export function addEmergencyLogEntry(
  input: Omit<EmergencyLogEntry, "timestamp"> & { timestamp?: number },
): EmergencyLogEntry {
  const entry: EmergencyLogEntry = { ...input, timestamp: input.timestamp ?? Date.now() };
  writeRaw(KEYS.emergencyLog, JSON.stringify([...getEmergencyLog(), entry]));
  return entry;
}

export function getEnvironmentId(): string | null {
  return readJson<string | null>(KEYS.environment, null);
}

export function setEnvironmentId(id: string): void {
  writeRaw(KEYS.environment, JSON.stringify(id));
}

export function clearAll(): void {
  const s = backend();
  for (const key of Object.values(KEYS)) {
    memory.delete(key);
    try {
      s?.removeItem(key);
    } catch {
      /* ignorar */
    }
  }
}
