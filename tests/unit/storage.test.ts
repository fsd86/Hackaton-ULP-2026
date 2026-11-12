import { beforeEach, describe, expect, it } from "vitest";
import {
  addEmergencyLogEntry,
  addReading,
  clearAll,
  getEmergencyLog,
  getEnvironmentId,
  getReadings,
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
