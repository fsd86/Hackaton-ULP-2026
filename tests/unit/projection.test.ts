import { describe, expect, it } from "vitest";
import { linearFit, projectSeries, type ProjectionParams } from "../../src/logic/projection";
import type { TrendSeries } from "../../src/logic/trend";
import { AppConfig } from "../../src/content/schemas";
import appJson from "../../config/app.json";

// Datos sinteticos, solo para probar la matematica de la extrapolacion (no son valores medicos).
const H = 3_600_000;
const P: ProjectionParams = { enabled: true, horizon_hours: 24, min_points: 4 };

function ser(index: 0 | 1, vals: [number, number][]): TrendSeries {
  return { index, labelIndex: index, points: vals.map(([h, v]) => ({ t: h * H, v, status: "normal" })) };
}

describe("linearFit", () => {
  it("recovers an exact line", () => {
    const fit = linearFit([0, 1, 2, 3].map((h) => ({ t: h * H, v: 10 + 2 * h })))!;
    expect(fit.slope * H).toBeCloseTo(2);
    expect(fit.at(5 * H)).toBeCloseTo(20);
  });

  it("is the least-squares fit for noisy points", () => {
    // v = 1, 3, 2, 4 en h = 0..3 → pendiente 0.8, ordenada 1.3
    const fit = linearFit([1, 3, 2, 4].map((v, h) => ({ t: h * H, v })))!;
    expect(fit.slope * H).toBeCloseTo(0.8);
    expect(fit.at(0)).toBeCloseTo(1.3);
  });

  it("returns null with fewer than 2 points or a single instant", () => {
    expect(linearFit([{ t: 0, v: 1 }])).toBeNull();
    expect(linearFit([{ t: H, v: 1 }, { t: H, v: 3 }])).toBeNull();
  });
});

describe("projectSeries", () => {
  it("extends horizon_hours past the last reading from the fitted value", () => {
    const [seg] = projectSeries([ser(0, [[0, 10], [1, 12], [2, 14], [3, 16]])], P);
    expect(seg!.from.t).toBe(3 * H);
    expect(seg!.from.v).toBeCloseTo(16);
    expect(seg!.to.t).toBe(27 * H);
    expect(seg!.to.v).toBeCloseTo(64);
  });

  it("respects horizon_hours", () => {
    const [seg] = projectSeries([ser(0, [[0, 0], [1, 1], [2, 2], [3, 3]])], { ...P, horizon_hours: 6 });
    expect(seg!.to.t - seg!.from.t).toBe(6 * H);
    expect(seg!.to.v).toBeCloseTo(9);
  });

  it("draws nothing below min_points or when disabled", () => {
    const s = ser(0, [[0, 1], [1, 2], [2, 3]]);
    expect(projectSeries([s], P)).toEqual([]);
    expect(projectSeries([s], { ...P, min_points: 3 })).toHaveLength(1);
    expect(projectSeries([ser(0, [[0, 1], [1, 2], [2, 3], [3, 4]])], { ...P, enabled: false })).toEqual([]);
  });

  it("projects both series of a pair indicator independently", () => {
    const segs = projectSeries(
      [ser(0, [[0, 120], [1, 122], [2, 124], [3, 126]]), ser(1, [[0, 80], [1, 79], [2, 78], [3, 77]])],
      P,
    );
    expect(segs.map((s) => s.index)).toEqual([0, 1]);
    expect(segs[0]!.to.v).toBeCloseTo(126 + 48);
    expect(segs[1]!.to.v).toBeCloseTo(77 - 24);
  });

  it("returns only geometry (no status, no threshold crossing)", () => {
    const [seg] = projectSeries([ser(0, [[0, 1], [1, 2], [2, 3], [3, 4]])], P);
    expect(Object.keys(seg!).sort()).toEqual(["from", "index", "to"]);
  });
});

describe("hud.projection config", () => {
  it("is valid in config/app.json and rejects min_points < 2", () => {
    const cfg = AppConfig.parse(appJson);
    expect(cfg.hud.projection.min_points).toBeGreaterThanOrEqual(2);
    const bad = structuredClone(appJson) as { hud: { projection: { min_points: number } } };
    bad.hud.projection.min_points = 1;
    expect(AppConfig.safeParse(bad).success).toBe(false);
  });
});
