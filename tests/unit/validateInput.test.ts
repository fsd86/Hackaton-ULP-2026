import { describe, expect, it } from "vitest";
import { validateReading } from "../../src/logic/validateInput";
import { makeIndicator } from "./helpers";

// Límites sintéticos, solo para probar la lógica (no son umbrales médicos).
const num = makeIndicator({ unit: "u", input: { kind: "number", min: 30, max: 45, step: 0.1 } });
const pair = makeIndicator({
  unit: "mmHg",
  input: { kind: "pair", labels: ["Top", "Bottom"], min: 40, max: 300, step: 1, second_lower_than_first: true },
});
const scale = makeIndicator({ input: { kind: "scale", min: 1, max: 5, labels: {} } });

function key(r: ReturnType<typeof validateReading>): string {
  return r.ok ? "ok" : r.errorKey;
}

describe("validateReading number", () => {
  it("accepts valid values, including float steps", () => {
    expect(validateReading(num, "36.6")).toEqual({ ok: true, value: 36.6 });
    expect(validateReading(num, " 37 ")).toEqual({ ok: true, value: 37 });
    expect(validateReading(num, 30)).toEqual({ ok: true, value: 30 });
    expect(validateReading(num, "45")).toEqual({ ok: true, value: 45 });
  });

  it("rejects empty, NaN, text and exponent notation", () => {
    for (const bad of ["", "   ", "abc", "NaN", "Infinity", "1e5", "1E1", "0x10", "--3", null, undefined, Number.NaN]) {
      expect(key(validateReading(num, bad as never)), String(bad)).toBe("daily.value_invalid");
    }
  });

  it("rejects out of range with min/max/unit vars", () => {
    expect(validateReading(num, "-1")).toEqual({
      ok: false,
      errorKey: "daily.value_out_of_range",
      vars: { min: "30", max: "45", unit: "u" },
    });
    expect(key(validateReading(num, "45.1"))).toBe("daily.value_out_of_range");
    expect(key(validateReading(num, "99999"))).toBe("daily.value_out_of_range");
  });

  it("rejects values that are not a multiple of step", () => {
    expect(validateReading(num, "36.65")).toEqual({ ok: false, errorKey: "daily.value_step", vars: { step: "0.1" } });
    const int = makeIndicator({ input: { kind: "number", min: 10, max: 1000, step: 1 } });
    expect(key(validateReading(int, "119.995"))).toBe("daily.value_step");
    expect(key(validateReading(int, "120"))).toBe("ok");
  });
});

describe("validateReading pair", () => {
  it("accepts valid pairs", () => {
    expect(validateReading(pair, ["120", "80"])).toEqual({ ok: true, value: [120, 80] });
  });

  it("rejects empty or non numeric components", () => {
    expect(key(validateReading(pair, ["120", ""]))).toBe("daily.pair_invalid");
    expect(key(validateReading(pair, ["1e2", "80"]))).toBe("daily.pair_invalid");
    expect(key(validateReading(pair, ["x", "80"]))).toBe("daily.pair_invalid");
  });

  it("rejects out of range, step and wrong order", () => {
    expect(key(validateReading(pair, ["-1", "-1"]))).toBe("daily.value_out_of_range");
    expect(key(validateReading(pair, ["999", "80"]))).toBe("daily.value_out_of_range");
    expect(key(validateReading(pair, ["119.995", "79"]))).toBe("daily.value_step");
    expect(validateReading(pair, ["80", "120"])).toEqual({
      ok: false,
      errorKey: "daily.pair_order",
      vars: { first: "Top", second: "Bottom" },
    });
    expect(key(validateReading(pair, ["80", "80"]))).toBe("daily.pair_order");
  });

  it("does not enforce order unless the JSON asks for it", () => {
    const free = makeIndicator({ input: { kind: "pair", labels: ["A", "B"], min: 0, max: 10 } });
    expect(key(validateReading(free, ["1", "2"]))).toBe("ok");
  });
});

describe("validateReading scale", () => {
  it("accepts integers inside the scale and rejects the rest", () => {
    expect(validateReading(scale, 3)).toEqual({ ok: true, value: 3 });
    expect(key(validateReading(scale, null))).toBe("daily.value_invalid");
    expect(key(validateReading(scale, 0))).toBe("daily.value_invalid");
    expect(key(validateReading(scale, 6))).toBe("daily.value_invalid");
    expect(key(validateReading(scale, 2.5))).toBe("daily.value_invalid");
  });
});
