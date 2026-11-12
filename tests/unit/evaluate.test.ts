import { describe, expect, it } from "vitest";
import { evaluate } from "../../src/logic/evaluate";
import { makeEnv, makeIndicator } from "./helpers";

// Todos los umbrales de este archivo son sintéticos, solo para probar la lógica.

describe("evaluate", () => {
  const ind = makeIndicator();

  it("classifies by range", () => {
    expect(evaluate(ind, 15)).toBe("normal");
    expect(evaluate(ind, 25)).toBe("attention");
    expect(evaluate(ind, 99)).toBe("critical");
  });

  it("returns unknown when value is outside every range", () => {
    expect(evaluate(ind, 5)).toBe("unknown");
  });

  it("boundary shared by two ranges takes the most severe", () => {
    expect(evaluate(ind, 20)).toBe("attention");
    expect(evaluate(ind, 30)).toBe("critical");
  });

  it("returns unknown when all ranges are null", () => {
    const nulls = makeIndicator({
      ranges: [
        { status: "normal", min: null, max: null, source_ids: [] },
        { status: "critical", min: null, max: null, source_ids: [] },
      ],
    });
    expect(evaluate(nulls, 42)).toBe("unknown");
    expect(evaluate(makeIndicator({ ranges: [] }), 42)).toBe("unknown");
  });

  it("returns unknown for NaN", () => {
    expect(evaluate(ind, Number.NaN)).toBe("unknown");
  });

  it("applies the environment override instead of base ranges", () => {
    const env = makeEnv({
      indicator_overrides: {
        test_ind: { ranges: [{ status: "critical", min: 10, max: 20, source_ids: [] }] },
      },
    });
    expect(evaluate(ind, 15, env)).toBe("critical");
    expect(evaluate(ind, 15, makeEnv())).toBe("normal");
  });

  describe("exclusive edges", () => {
    const glucose = makeIndicator({
      ranges: [
        { status: "critical", min: null, max: 54, max_exclusive: true, source_ids: [] },
        { status: "attention", min: 54, max: 70, max_exclusive: true, source_ids: [] },
      ],
    });
    it("respects max_exclusive and has no reachable gap", () => {
      expect(evaluate(glucose, 53.999)).toBe("critical");
      expect(evaluate(glucose, 54)).toBe("attention");
      expect(evaluate(glucose, 69.999)).toBe("attention");
      expect(evaluate(glucose, 70)).toBe("unknown");
    });

    it("respects min_exclusive", () => {
      const hr = makeIndicator({
        ranges: [
          { status: "normal", min: 60, max: 100, source_ids: [] },
          { status: "attention", min: 100, min_exclusive: true, max: null, source_ids: [] },
        ],
      });
      expect(evaluate(hr, 100)).toBe("normal");
      expect(evaluate(hr, 100.001)).toBe("attention");
    });

    it("systolic 120 is elevated, not normal", () => {
      const bp = makeIndicator({
        input: { kind: "pair", labels: ["S", "D"] },
        ranges: [
          { status: "normal", min: null, max: 120, max_exclusive: true, source_ids: [] },
          { status: "attention", min: 120, max: 180, source_ids: [] },
          { status: "critical", min: 180, min_exclusive: true, max: null, source_ids: [] },
        ],
        ranges_secondary: [
          { status: "normal", min: null, max: 80, max_exclusive: true, source_ids: [] },
          { status: "attention", min: 80, max: 120, source_ids: [] },
        ],
      });
      expect(evaluate(bp, [119.995, 79])).toBe("normal");
      expect(evaluate(bp, [120, 79])).toBe("attention");
      expect(evaluate(bp, [180, 79])).toBe("attention");
      expect(evaluate(bp, [180.5, 79])).toBe("critical");
    });
  });

  describe("pair", () => {
    const pair = makeIndicator({
      id: "pair_ind",
      input: { kind: "pair", labels: ["A", "B"] },
      ranges: [
        { status: "normal", min: 0, max: 10, source_ids: [] },
        { status: "critical", min: 11, max: null, source_ids: [] },
      ],
      ranges_secondary: [
        { status: "normal", min: 0, max: 5, source_ids: [] },
        { status: "attention", min: 6, max: null, source_ids: [] },
      ],
    });

    it("returns the worst of both components", () => {
      expect(evaluate(pair, [5, 3])).toBe("normal");
      expect(evaluate(pair, [5, 8])).toBe("attention");
      expect(evaluate(pair, [20, 8])).toBe("critical");
    });

    it("a component without threshold does not hide the other as normal", () => {
      const noSecondary = makeIndicator({ ...pair, ranges_secondary: undefined });
      expect(evaluate(noSecondary, [5, 3])).toBe("unknown");
      expect(evaluate(noSecondary, [20, 3])).toBe("critical");
    });

    it("wrong value shape is unknown", () => {
      expect(evaluate(pair, 5)).toBe("unknown");
      expect(evaluate(ind, [1, 2])).toBe("unknown");
    });
  });
});
