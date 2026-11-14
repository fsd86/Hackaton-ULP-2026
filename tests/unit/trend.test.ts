import { describe, expect, it } from "vitest";
import { buildTrend } from "../../src/logic/trend";
import type { Reading } from "../../src/storage/local";
import type { Indicator } from "../../src/content/schemas";
import { makeEnv, makeIndicator } from "./helpers";

// Datos sintéticos, solo para probar la lógica.
const DAY = 24 * 3_600_000;
const NOW = 100 * DAY;

function rd(value: Reading["value"], ageMs: number, indicatorId = "test_ind"): Reading {
  return { id: `${indicatorId}-${ageMs}`, indicatorId, value, environmentId: "e", timestamp: NOW - ageMs };
}

describe("buildTrend", () => {
  const ind = makeIndicator();

  it("filters by period (default 7 days) and orders chronologically", () => {
    const t = buildTrend({
      indicator: ind,
      readings: [rd(15, 1 * DAY), rd(25, 8 * DAY), rd(35, 3 * DAY), rd(12, 0.5 * DAY, "other")],
      now: NOW,
    });
    expect(t.series).toHaveLength(1);
    expect(t.series[0]!.points.map((p) => p.v)).toEqual([35, 15]);
    expect(t.series[0]!.points.map((p) => p.status)).toEqual(["critical", "normal"]);
    const t2 = buildTrend({ indicator: ind, readings: [rd(25, 8 * DAY)], sinceMs: 10 * DAY, now: NOW });
    expect(t2.series[0]!.points).toHaveLength(1);
  });

  it("keeps the most recent maxPoints", () => {
    const readings = [1, 2, 3, 4, 5].map((v) => rd(10 + v, (6 - v) * 1000));
    const t = buildTrend({ indicator: ind, readings, now: NOW, maxPoints: 2 });
    expect(t.series[0]!.points.map((p) => p.v)).toEqual([14, 15]);
  });

  it("pair yields two series using primary and secondary ranges", () => {
    const pair: Indicator = makeIndicator({
      input: { kind: "pair", labels: ["hi", "lo"] },
      ranges: [{ status: "normal", min: 0, max: 100, source_ids: ["s1"] }],
      ranges_secondary: [{ status: "critical", min: 0, max: 50, source_ids: ["s1"] }],
    });
    const t = buildTrend({ indicator: pair, readings: [rd([90, 40], 1000)], now: NOW });
    expect(t.series.map((s) => s.labelIndex)).toEqual([0, 1]);
    expect(t.series[0]!.points[0]).toMatchObject({ v: 90, status: "normal" });
    expect(t.series[1]!.points[0]).toMatchObject({ v: 40, status: "critical" });
    expect(t.bands[0]![0]!.status).toBe("normal");
    expect(t.bands[1]![0]!.status).toBe("critical");
  });

  it("uses the real cut-offs as band edges and replaces null with domain edges", () => {
    const x = makeIndicator({
      ranges: [
        { status: "critical", min: null, max: 60, max_exclusive: true, source_ids: ["s1"] },
        { status: "attention", min: 60, max: 70, max_exclusive: true, source_ids: ["s1"] },
        { status: "normal", min: 70, max: 120, max_exclusive: true, source_ids: ["s1"] },
        { status: "critical", min: 120, max: null, source_ids: ["s1"] },
        { status: "normal", min: null, max: null, source_ids: ["s1"] }, // ignorado
      ],
    });
    const t = buildTrend({ indicator: x, readings: [rd(80, 1000)], now: NOW });
    const { vMin, vMax } = t.domain;
    expect(t.bands[0]).toEqual([
      { status: "critical", from: vMin, to: 60 },
      { status: "attention", from: 60, to: 70 },
      { status: "normal", from: 70, to: 120 },
      { status: "critical", from: 120, to: vMax },
    ]);
    // 10% de padding sobre [60, 120]
    expect(vMin).toBeLessThan(60);
    expect(vMax).toBeGreaterThan(120);
  });

  it("does not close real gaps and applies the environment override", () => {
    const env = makeEnv({
      indicator_overrides: { test_ind: { ranges: [{ status: "normal", min: 0, max: 5, source_ids: ["s1"] }, { status: "attention", min: 6, max: 9, source_ids: ["s1"] }] } },
    });
    const t = buildTrend({ indicator: ind, readings: [rd(3, 1000)], environment: env, now: NOW });
    expect(t.bands[0]!.map((b) => [b.from, b.to])).toEqual([[0, 5], [6, 9]]);
    expect(t.series[0]!.points[0]!.status).toBe("normal");
  });

  it("is empty without points", () => {
    const t = buildTrend({ indicator: ind, readings: [], now: NOW });
    expect(t.empty).toBe(true);
    expect(t.series[0]!.points).toEqual([]);
  });

  it("gives a reasonable window for a single point", () => {
    // Rangos con fuente: solo esos suman bordes al dominio vertical (los no citados no se sombrean).
    const sourced = makeIndicator({ ranges: ind.ranges.map((r) => ({ ...r, source_ids: ["s1"] })) });
    const t = buildTrend({ indicator: sourced, readings: [rd(15, 1000)], now: NOW });
    expect(t.empty).toBe(false);
    expect(t.domain.tMin).toBeLessThan(NOW - 1000);
    expect(t.domain.tMax).toBeGreaterThan(NOW - 1000);
    expect(t.domain.vMin).toBeLessThan(10);
    expect(t.domain.vMax).toBeGreaterThan(30);
  });
});

describe("buildTrend: bandas con fuente y ventana fija", () => {
  it("never shades ranges without source_ids (gaps and unsourced stay unshaded)", () => {
    const x = makeIndicator({
      ranges: [
        { status: "attention", min: null, max: 60, source_ids: [] },
        { status: "normal", min: 60, max: 100, source_ids: ["s1"] },
        { status: "attention", min: 100, max: null, source_ids: [] },
      ],
    });
    const t = buildTrend({ indicator: x, readings: [rd(80, 1000)], now: NOW });
    expect(t.bands[0]!.map((b) => [b.status, b.from, b.to])).toEqual([["normal", 60, 100]]);
    // la evaluacion sigue usando todos los rangos (no cambia el estado)
    expect(t.series[0]!.points[0]!.status).toBe("normal");
  });

  it("fixedWindow spans exactly [now - sinceMs, now]", () => {
    const ind = makeIndicator();
    const t = buildTrend({ indicator: ind, readings: [rd(15, 2 * DAY), rd(16, 1000)], now: NOW, fixedWindow: true });
    expect(t.domain.tMin).toBe(NOW - 7 * DAY);
    expect(t.domain.tMax).toBe(NOW);
    const free = buildTrend({ indicator: ind, readings: [rd(15, 2 * DAY), rd(16, 1000)], now: NOW });
    expect(free.domain.tMin).toBe(NOW - 2 * DAY);
  });
});
