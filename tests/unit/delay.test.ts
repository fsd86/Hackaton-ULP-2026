import { describe, expect, it } from "vitest";
import { classifyDelay, formatDelay, formatMinutes } from "../../src/logic/delay";
import { createT } from "../../src/content/t";
import strings from "../../config/strings.en.json";

const t = createT(strings as Record<string, string>, { strict: true });

// Demoras sintéticas, solo para probar el formato.
describe("formatDelay", () => {
  it("range: seconds → minutes", () => {
    expect(formatDelay({ min: 240, max: 1440 }, t)).toBe("Earth is 4–24 min away (one-way)");
  });

  it("single value when min equals max", () => {
    expect(formatDelay({ min: 600, max: 600 }, t)).toBe("Earth is about 10 min away (one-way)");
  });

  it("single value when only one bound is known", () => {
    expect(formatDelay({ min: null, max: 300 }, t)).toBe("Earth is about 5 min away (one-way)");
    expect(formatDelay({ min: 300, max: null }, t)).toBe("Earth is about 5 min away (one-way)");
  });

  it("less than a minute", () => {
    expect(formatDelay({ min: 1, max: 59 }, t)).toBe("Earth is less than a minute away (one-way)");
    expect(formatDelay({ min: 0, max: 0 }, t)).toBe("Earth is less than a minute away (one-way)");
  });

  it("unknown when both bounds are null", () => {
    expect(formatDelay({ min: null, max: null }, t)).toBe("Communication delay not verified yet");
    expect(classifyDelay({ min: null, max: null })).toBe("unknown");
  });

  it("formats minutes with one decimal under 10 min", () => {
    expect(formatMinutes(90)).toBe("1.5");
    expect(formatMinutes(120)).toBe("2");
    expect(formatMinutes(1440)).toBe("24");
  });
});
