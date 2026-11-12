import { describe, expect, it } from "vitest";
import type { Protocol } from "../../src/content/schemas";
import { buildCitations, summarizeVerification } from "../../src/logic/citations";
import { makeEnv, makeIndicator } from "./helpers";

const protocol: Protocol = {
  id: "p1",
  title: "Protocol one",
  trigger: [],
  escalation: "ground",
  steps: [
    { text: "a", check: true, source_ids: [] },
    { text: "b", check: true, source_ids: ["s_step"] },
  ],
  report_fields: [],
  source_ids: ["s_proto"],
  status: "PLACEHOLDER",
};

describe("buildCitations", () => {
  const indicator = makeIndicator({
    id: "i1",
    name: "Ind one",
    source_ids: ["s_ind"],
    ranges: [
      { status: "normal", min: 1, max: 2, source_ids: ["s_range"] },
      { status: "critical", min: 2, max: null, source_ids: ["s_range", "s_ind"] },
    ],
    ranges_secondary: [{ status: "attention", min: 0, max: 1, source_ids: ["s_sec"] }],
  });
  const env = makeEnv({
    id: "e1",
    name: "Env one",
    comm_delay_one_way_s: { min: 1, max: 2, source_ids: ["s_delay"] },
    indicator_overrides: { i1: { ranges: [{ status: "normal", min: 5, max: 6, source_ids: ["s_over"] }] } },
  });
  const sources = ["s_ind", "s_range", "s_sec", "s_delay", "s_over", "s_proto", "s_step", "s_unused"].map((id) => ({ id }));

  const result = buildCitations({ sources, indicators: [indicator], environments: [env], protocols: [protocol] });

  it("lists every source, with an empty array when nobody cites it", () => {
    expect(Object.keys(result).sort()).toEqual(sources.map((s) => s.id).sort());
    expect(result.s_unused).toEqual([]);
  });

  it("collects indicator, range and secondary range citations", () => {
    expect(result.s_ind.map((c) => c.kind)).toEqual(["indicator", "range"]);
    expect(result.s_range).toHaveLength(2);
    expect(result.s_range[1]).toMatchObject({ kind: "range", ownerId: "i1", rangeStatus: "critical" });
    expect(result.s_sec[0]).toMatchObject({ kind: "range_secondary", rangeStatus: "attention" });
  });

  it("collects environment delay and override range citations", () => {
    expect(result.s_delay[0]).toMatchObject({ kind: "environment_delay", ownerId: "e1", ownerName: "Env one" });
    expect(result.s_over[0]).toMatchObject({ kind: "override_range", ownerName: "Ind one", environmentName: "Env one" });
  });

  it("collects protocol and step citations with the step index", () => {
    expect(result.s_proto[0]).toMatchObject({ kind: "protocol", ownerId: "p1" });
    expect(result.s_step[0]).toMatchObject({ kind: "step", ownerId: "p1", stepIndex: 1 });
  });

  it("does not crash on a cited id missing from sources", () => {
    const r = buildCitations({
      sources: [],
      indicators: [makeIndicator({ source_ids: ["ghost"] })],
      environments: [],
      protocols: [],
    });
    expect(r.ghost).toHaveLength(1);
  });
});

describe("summarizeVerification", () => {
  it("counts VERIFIED vs PLACEHOLDER per entity type", () => {
    const s = summarizeVerification({
      sources: [{ status: "VERIFIED" }, { status: "PLACEHOLDER" }],
      indicators: [{ status: "PLACEHOLDER" }, { status: "PLACEHOLDER" }],
      protocols: [],
      environments: [{ status: "VERIFIED" }],
    });
    expect(s.sources).toEqual({ verified: 1, placeholder: 1 });
    expect(s.indicators).toEqual({ verified: 0, placeholder: 2 });
    expect(s.protocols).toEqual({ verified: 0, placeholder: 0 });
    expect(s.environments).toEqual({ verified: 1, placeholder: 0 });
  });
});
