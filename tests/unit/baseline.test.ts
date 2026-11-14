import { describe, expect, it } from "vitest";
import {
  baselineWindowReadings,
  computeBaseline,
  computeIndicatorBaseline,
  deviationFromBaseline,
  formatDeviation,
  formatMean,
  isBaselineEligible,
  relativeDeviation,
  type BaselineReading,
} from "../../src/logic/baseline";
import { makeIndicator } from "./helpers";

// Datos sinteticos de prueba (NO medicos): solo se prueba la aritmetica y las reglas de ventana / minimo.
const DAY = 24 * 3_600_000;
const NOW = 100 * DAY;
const params = { windowDays: 7, minReadings: 3 };

const num = makeIndicator({ id: "n" });
const pair = makeIndicator({ id: "p", input: { kind: "pair", labels: ["A", "B"] } });
const scale = makeIndicator({ id: "s", input: { kind: "scale", min: 1, max: 5, labels: {} } });

const r = (indicatorId: string, value: BaselineReading["value"], daysAgo: number): BaselineReading => ({
  indicatorId,
  value,
  timestamp: NOW - daysAgo * DAY,
});

describe("baseline: eligibility", () => {
  it("only number and pair indicators are eligible (scale is ordinal)", () => {
    expect(isBaselineEligible(num)).toBe(true);
    expect(isBaselineEligible(pair)).toBe(true);
    expect(isBaselineEligible(scale)).toBe(false);
  });
});

describe("baseline: window and min_readings", () => {
  it("averages earlier readings in the window and leaves out the most recent one", () => {
    const readings = [r("n", 10, 6), r("n", 20, 4), r("n", 30, 2), r("n", 99, 0.1)];
    const e = computeIndicatorBaseline(num, readings, params, NOW);
    expect(e).toEqual({ indicatorId: "n", mean: 20, n: 3, from: NOW - 6 * DAY, to: NOW - 2 * DAY });
  });

  it("ignores readings older than window_days, from other indicators and in the future", () => {
    const readings = [r("n", 1000, 8), r("x", 5, 3), r("n", 10, 5), r("n", 20, 3), r("n", 30, 1), r("n", 40, 0.5), r("n", 7, -1)];
    const used = baselineWindowReadings(num, readings, params, NOW);
    expect(used.map((x) => x.value)).toEqual([10, 20, 30]);
  });

  it("returns null with fewer than min_readings earlier readings", () => {
    const readings = [r("n", 10, 3), r("n", 20, 2), r("n", 30, 1)]; // 2 previas + la ultima
    expect(computeIndicatorBaseline(num, readings, params, NOW)).toBeNull();
    expect(computeIndicatorBaseline(num, readings, { ...params, minReadings: 2 }, NOW)?.mean).toBe(15);
  });

  it("returns null with no readings at all", () => {
    expect(computeIndicatorBaseline(num, [], params, NOW)).toBeNull();
  });

  it("averages each pair component on its own and skips readings with the wrong shape", () => {
    const readings = [r("p", [100, 60], 5), r("p", [110, 70], 4), r("p", 5, 3.5), r("p", [120, 80], 3), r("p", [200, 100], 0.2)];
    const e = computeIndicatorBaseline(pair, readings, params, NOW);
    expect(e?.mean).toEqual([110, 70]);
    expect(e?.n).toBe(3);
  });

  it("computeBaseline reports excluded indicators and why", () => {
    const readings = [r("n", 10, 5), r("n", 20, 4), r("n", 30, 3), r("n", 40, 0)];
    const res = computeBaseline([num, pair, scale], readings, params, NOW);
    expect(res.entries.map((e) => e.indicatorId)).toEqual(["n"]);
    expect(res.skipped).toEqual([
      { indicatorId: "p", reason: "insufficient", n: 0 },
      { indicatorId: "s", reason: "scale", n: 0 },
    ]);
  });
});

describe("baseline: deviation", () => {
  it("relative deviation in % against the mean", () => {
    expect(relativeDeviation(112, 100)).toBeCloseTo(12);
    expect(relativeDeviation(90, 100)).toBeCloseTo(-10);
    expect(relativeDeviation(5, 0)).toBeNull();
    expect(relativeDeviation(-1, -2)).toBeCloseTo(50);
  });

  it("per component for pairs; null when the shape does not match", () => {
    expect(deviationFromBaseline({ mean: [100, 50] }, [110, 45])).toEqual([10, -10]);
    expect(deviationFromBaseline({ mean: 80 }, 100)).toEqual([25]);
    expect(deviationFromBaseline({ mean: 80 }, [1, 2])).toBeNull();
    expect(deviationFromBaseline({ mean: [1, 2] }, 3)).toBeNull();
  });

  it("formats with sign, rounded, never -0%", () => {
    expect(formatDeviation(12.4)).toBe("+12%");
    expect(formatDeviation(-5.6)).toBe("-6%");
    expect(formatDeviation(-0.2)).toBe("0%");
    expect(formatMean(75.86)).toBe("75.9");
    expect(formatMean([116, 74.25])).toBe("116 / 74.3");
  });
});
