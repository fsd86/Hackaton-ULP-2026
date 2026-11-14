import { describe, expect, it } from "vitest";
import { buildCoverage, environmentCoverage, indicatorCoverage, protocolCoverage } from "../../src/logic/coverage";
import { validateContent } from "../../src/content/load";
import type { Protocol } from "../../src/content/schemas";
import { makeEnv, makeIndicator, realRaw } from "./helpers";

// Datos sintéticos (NO médicos): solo prueban la regla de cobertura por dato.

describe("indicatorCoverage", () => {
  it("text data are sourced only when the indicator cites sources and no text is a placeholder", () => {
    const ind = makeIndicator({
      source_ids: ["s1"],
      how_to_measure: ["step a", "PLACEHOLDER: step b"],
      why_it_matters: "why",
      frequency: { every_hours: null, label: "PLACEHOLDER: how often." },
      actions: {
        normal: { text: ["ok"], escalation: "self" },
        attention: { text: [], escalation: "crew" },
        critical: { text: ["PLACEHOLDER: what to do."], escalation: "ground" },
      },
    });
    const c = indicatorCoverage(ind);
    expect(c.how_to_measure).toBe("unsourced");
    expect(c.why_it_matters).toBe("sourced");
    expect(c.frequency).toBe("unsourced");
    expect(c.actions.items).toEqual([
      { status: "normal", state: "sourced" },
      { status: "attention", state: "unsourced" }, // sin texto: nada verificado que mostrar
      { status: "critical", state: "unsourced" },
    ]);
    expect(c.actions).toMatchObject({ sourced: 1, total: 3 });
  });

  it("without indicator-level sources no text datum counts as sourced", () => {
    const c = indicatorCoverage(makeIndicator({ source_ids: [] }));
    expect([c.how_to_measure, c.why_it_matters, c.frequency]).toEqual(["unsourced", "unsourced", "unsourced"]);
  });

  it("ranges (primary and secondary) need their own source_ids and at least one defined edge", () => {
    const c = indicatorCoverage(
      makeIndicator({
        ranges: [
          { status: "normal", min: 10, max: 20, source_ids: ["s1"] },
          { status: "attention", min: 20, max: 30, source_ids: [] },
          { status: "critical", min: null, max: null, source_ids: ["s1"] },
        ],
        ranges_secondary: [{ status: "normal", min: null, max: 5, source_ids: ["s2"] }],
      }),
    );
    expect(c.ranges.items.map((r) => [r.set, r.status, r.state])).toEqual([
      ["primary", "normal", "sourced"],
      ["primary", "attention", "unsourced"],
      ["primary", "critical", "unsourced"],
      ["secondary", "normal", "sourced"],
    ]);
    expect(c.ranges).toMatchObject({ sourced: 2, total: 4 });
    // 3 datos de texto + 4 rangos + 0 acciones
    expect(c.tally.total).toBe(7);
  });
});

describe("protocol and environment coverage", () => {
  it("a step is sourced with source_ids and no placeholder text/detail", () => {
    const p = {
      id: "p",
      title: "P",
      steps: [
        { text: "do a", check: true, source_ids: ["s"] },
        { text: "do b", detail: "PLACEHOLDER: detail", check: true, source_ids: ["s"] },
        { text: "PLACEHOLDER: c", check: true, source_ids: [] },
      ],
    } as unknown as Protocol;
    const c = protocolCoverage(p);
    expect(c.steps.items).toEqual(["sourced", "unsourced", "unsourced"]);
    expect(c.steps).toMatchObject({ sourced: 1, total: 3 });
  });

  it("environment delay needs sources and a value", () => {
    expect(environmentCoverage(makeEnv()).delay).toBe("unsourced");
    expect(environmentCoverage(makeEnv({ comm_delay_one_way_s: { min: 1, max: 2, source_ids: ["s"] } })).delay).toBe("sourced");
    expect(environmentCoverage(makeEnv({ comm_delay_one_way_s: { min: null, max: null, source_ids: ["s"] } })).delay).toBe("unsourced");
  });
});

describe("buildCoverage on the real data", () => {
  it("totals add up and show that PLACEHOLDER indicators still have sourced data points", () => {
    const res = validateContent(realRaw());
    if (!res.ok) throw new Error(JSON.stringify(res.errors));
    const content = res.content;
    const r = buildCoverage(content);
    const sum = r.indicators.reduce((a, i) => a + i.tally.total, 0);
    expect(r.totals.indicators.total).toBe(sum);
    expect(r.totals.all.total).toBe(r.totals.indicators.total + r.totals.protocols.total + r.totals.environments.total);
    // Todos los indicadores son PLACEHOLDER hoy, pero muchos de sus datos sí tienen fuente.
    expect(r.totals.indicators.sourced).toBeGreaterThan(0);
    expect(r.totals.indicators.sourced).toBeLessThan(r.totals.indicators.total);
  });
});
