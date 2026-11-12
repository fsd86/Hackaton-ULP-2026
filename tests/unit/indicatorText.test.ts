import { describe, expect, it } from "vitest";
import { formatNumber, renderIndicatorText } from "../../src/logic/indicatorText";
import { makeEnv, makeIndicator } from "./helpers";

// Datos sintéticos, solo para probar la lógica.
const ind = makeIndicator({
  unit: "u",
  ranges: [
    { status: "attention", min: null, max: 10, max_exclusive: true, source_ids: [] },
    { status: "normal", min: 10, max: 20.5, source_ids: [] },
    { status: "attention", min: 20.5, min_exclusive: true, max: null, source_ids: [] },
  ],
  ranges_secondary: [{ status: "normal", min: null, max: 80, max_exclusive: true, source_ids: [] }],
});

describe("renderIndicatorText", () => {
  it("resolves range, range2 and unit", () => {
    expect(renderIndicatorText("Within {range.normal.min} to {range.normal.max} {unit}; diastolic below {range2.normal.max}.", ind)).toBe(
      "Within 10 to 20.5 u; diastolic below 80.",
    );
  });

  it("uses the unique range of a status that has that edge (two attention ranges)", () => {
    expect(renderIndicatorText("{range.attention.max} / {range.attention.min}", ind)).toBe("10 / 20.5");
  });

  it("uses the effective ranges of the environment override", () => {
    const env = makeEnv({
      indicator_overrides: {
        test_ind: { ranges: [{ status: "normal", min: 12, max: 18.25, source_ids: [] }] },
      },
    });
    expect(renderIndicatorText("{range.normal.min}-{range.normal.max}", ind, env)).toBe("12-18.25");
    expect(renderIndicatorText("{range.normal.min}-{range.normal.max}", ind, makeEnv())).toBe("10-20.5");
  });

  it("leaves unresolvable tokens untouched and plain text alone", () => {
    expect(renderIndicatorText("{range.critical.min} and no tokens", ind)).toBe("{range.critical.min} and no tokens");
    expect(renderIndicatorText("15 g every 15 minutes", ind)).toBe("15 g every 15 minutes");
  });

  it("formats numbers without extra zeros", () => {
    expect(formatNumber(70)).toBe("70");
    expect(formatNumber(0.1 + 0.2)).toBe("0.3");
    expect(formatNumber(36.6)).toBe("36.6");
  });
});
