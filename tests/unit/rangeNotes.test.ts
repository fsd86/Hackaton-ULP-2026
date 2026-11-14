import { describe, expect, it } from "vitest";
import { evaluate, rangeNotes } from "../../src/logic/evaluate";
import { loadContent } from "../../src/content/load";
import { makeIndicator } from "./helpers";

describe("rangeNotes (umbrales sinteticos)", () => {
  const ind = makeIndicator({
    ranges: [
      { status: "attention", min: null, max: 10, max_exclusive: true, notes: ["low"], source_ids: [] },
      { status: "normal", min: 10, max: 20, source_ids: [] },
      { status: "attention", min: 20, min_exclusive: true, max: null, notes: ["high"], source_ids: [] },
    ],
  });

  it("devuelve solo las notas del rango donde cae la lectura", () => {
    expect(rangeNotes(ind, 5, evaluate(ind, 5))).toEqual(["low"]);
    expect(rangeNotes(ind, 25, evaluate(ind, 25))).toEqual(["high"]);
    expect(rangeNotes(ind, 15, evaluate(ind, 15))).toEqual([]);
  });

  it("sin estado conocido no hay notas", () => {
    expect(rangeNotes(ind, 5, "unknown")).toEqual([]);
  });
});

// Etapa 3A: con los rangos con fuente cargados, estos valores dejan de ser "unknown" (datos reales de data/).
describe("datos reales (etapa 3A)", () => {
  const r = loadContent();
  if (!r.ok) throw new Error("content must load");
  const byId = (id: string) => r.content.indicators.find((i) => i.id === id)!;

  it("glucosa 76 mg/dL es normal (referencia en ayunas 70-99)", () => {
    expect(evaluate(byId("blood_glucose"), 76)).toBe("normal");
  });

  it("temperatura 36.7 °C es normal (36.1-37.2); 37.5 queda unknown (hueco sin fuente)", () => {
    expect(evaluate(byId("body_temperature"), 36.7)).toBe("normal");
    expect(evaluate(byId("body_temperature"), 37.5)).toBe("unknown");
  });
});
