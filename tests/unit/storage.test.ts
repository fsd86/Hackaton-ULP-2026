import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addEmergencyLogEntry,
  addReading,
  clearAll,
  dismissStorageIssues,
  getEmergencyLog,
  getEmergencySession,
  getEnvironmentId,
  getReadings,
  getStorageIssues,
  getStorageState,
  seedDemoOnFirstVisit,
  setEnvironmentId,
} from "../../src/storage/local";

// En Node no hay localStorage: se ejercita el fallback en memoria.
describe("storage (memory fallback)", () => {
  beforeEach(() => clearAll());

  it("stores readings, emergency log and environment", () => {
    expect(getReadings()).toEqual([]);
    const r = addReading({ indicatorId: "x", value: [1, 2], environmentId: "e" });
    expect(getReadings()).toEqual([r]);
    addEmergencyLogEntry({ protocolId: "p", stepIndex: 0 });
    expect(getEmergencyLog()).toHaveLength(1);
    expect(getEnvironmentId()).toBeNull();
    setEnvironmentId("e");
    expect(getEnvironmentId()).toBe("e");
  });
});

describe("storage (corrupted data)", () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = new Map();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    });
    clearAll();
  });
  afterEach(() => vi.unstubAllGlobals());

  const good = { id: "a", indicatorId: "i", value: 5, environmentId: "e", timestamp: 1000 };

  it("keeps valid items, drops invalid ones, counts them and rewrites a clean key", () => {
    store.set(
      "eif.readings",
      JSON.stringify([
        null,
        good,
        { ...good, id: "b", value: "abc" },
        { ...good, id: "c", value: [1] },
        { ...good, id: "d", timestamp: "yesterday" },
        { ...good, id: "p", value: [120, 80] },
      ]),
    );
    expect(getReadings().map((r) => r.id)).toEqual(["a", "p"]);
    expect(getStorageIssues()).toEqual({ total: 4, byKey: { readings: 4 } });
    expect(JSON.parse(store.get("eif.readings") ?? "null")).toHaveLength(2);
    // segunda lectura: ya limpio, no vuelve a contar
    expect(getReadings()).toHaveLength(2);
    expect(getStorageIssues().total).toBe(4);
  });

  it("discards the whole value when JSON is broken or the type is wrong", () => {
    store.set("eif.readings", "{not json");
    expect(getReadings()).toEqual([]);
    store.set("eif.readings", '"abc"');
    expect(getReadings()).toEqual([]);
    store.set("eif.emergency_log", '{"a":1}');
    expect(getEmergencyLog()).toEqual([]);
    expect(getStorageIssues()).toEqual({ total: 3, byKey: { readings: 2, emergency_log: 1 } });
    expect(store.has("eif.readings")).toBe(false);
    expect(store.has("eif.emergency_log")).toBe(false);
  });

  it("validates session and environment", () => {
    store.set("eif.emergency_session", JSON.stringify({ sessionId: "s", protocolId: "p", startedAt: "x" }));
    expect(getEmergencySession()).toBeNull();
    store.set("eif.environment", "{}");
    expect(getEnvironmentId()).toBeNull();
    expect(getStorageIssues().byKey).toEqual({ emergency_session: 1, environment: 1 });
    store.set("eif.emergency_session", JSON.stringify({ sessionId: "s", protocolId: "p", startedAt: 5 }));
    expect(getEmergencySession()).toEqual({ sessionId: "s", protocolId: "p", startedAt: 5 });
  });

  it("dismissStorageIssues resets the counter; clearAll bumps the version", () => {
    store.set("eif.readings", "[1]");
    getReadings();
    expect(getStorageIssues().total).toBe(1);
    dismissStorageIssues();
    expect(getStorageIssues().total).toBe(0);
    const v = getStorageState().version;
    clearAll();
    expect(getStorageState().version).toBe(v + 1);
  });
});

describe("storage (first-visit demo seed)", () => {
  let store: Map<string, string>;
  beforeEach(() => {
    store = new Map();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    });
    clearAll();
  });
  afterEach(() => vi.unstubAllGlobals());
  const item = { indicatorId: "x", value: 1, environmentId: "e", timestamp: 1 };

  it("seeds once, marks readings as demo and never reseeds (not even after clearAll)", () => {
    expect(seedDemoOnFirstVisit([item])).toBe(true);
    expect(getReadings()).toHaveLength(1);
    expect(getReadings()[0]?.demo).toBe(true);
    expect(seedDemoOnFirstVisit([item])).toBe(false);
    clearAll();
    expect(seedDemoOnFirstVisit([item])).toBe(false);
    expect(getReadings()).toEqual([]);
    expect(store.get("eif.demo_seeded")).toBe("1");
  });

  it("does not seed over existing readings", () => {
    addReading({ indicatorId: "x", value: 2, environmentId: "e" });
    expect(seedDemoOnFirstVisit([item])).toBe(false);
    expect(getReadings()).toHaveLength(1);
  });
});

describe("storage (personal baseline)", () => {
  beforeEach(() => clearAll());

  it("stores a valid baseline, drops a corrupted one and clearAll removes it", async () => {
    const { getBaseline, setBaseline, clearBaseline } = await import("../../src/storage/local");
    expect(getBaseline()).toBeNull();
    const b = {
      source: "demo" as const,
      createdAt: 1,
      windowDays: 7,
      minReadings: 3,
      entries: [{ indicatorId: "x", mean: [1, 2] as [number, number], n: 3, from: 1, to: 2 }],
    };
    setBaseline(b);
    expect(getBaseline()).toEqual(b);
    clearBaseline();
    expect(getBaseline()).toBeNull();
    setBaseline(b);
    clearAll();
    expect(getBaseline()).toBeNull();
    // Forma invalida (n = 0): se descarta.
    setBaseline({ ...b, entries: [{ ...b.entries[0]!, n: 0 }] });
    expect(getBaseline()).toBeNull();
  });
});
