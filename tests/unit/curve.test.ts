import { describe, expect, it } from "vitest";
import { smoothPath } from "../../src/logic/curve";

describe("smoothPath", () => {
  it("handles empty, one and two points with straight segments", () => {
    expect(smoothPath([])).toBe("");
    expect(smoothPath([[1, 2]])).toBe("M1,2");
    expect(smoothPath([[0, 0], [10, 5]])).toBe("M0,0 L10,5");
  });

  it("passes through every point and never overshoots between monotone readings", () => {
    const pts = [[0, 10], [10, 8], [20, 2], [30, 1]] as const;
    const d = smoothPath(pts);
    for (const [x, y] of pts) expect(d).toContain(`${x},${y}`);
    // Puntos de control dentro del rango de y (sin picos inventados).
    const ys = [...d.matchAll(/,(-?[\d.]+)/g)].map((m) => Number(m[1]));
    expect(Math.max(...ys)).toBeLessThanOrEqual(10);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(1);
  });
});
