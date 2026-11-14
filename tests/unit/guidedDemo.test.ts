import { beforeEach, describe, expect, it } from "vitest";
import guidedDemo from "../../data/guided-demo.json";
import demoReadings from "../../data/demo-readings.json";
import { validateContent, type ContentError } from "../../src/content/load";
import { AppConfig } from "../../src/content/schemas";
import { evaluate } from "../../src/logic/evaluate";
import { fillTokens, parseStepRoute, totalDuration } from "../../src/logic/guidedDemo";
import {
  addEmergencyLogEntry,
  addGuidedDemoReadings,
  beginGuidedDemoSandbox,
  clearAll,
  endGuidedDemoSandbox,
  getEmergencyLog,
  getEmergencySession,
  getEnvironmentId,
  getReadings,
  recoverGuidedDemoSandbox,
  setEnvironmentId,
  startEmergencySession,
} from "../../src/storage/local";
import { realRaw } from "./helpers";

type Loose = any; // eslint-disable-line @typescript-eslint/no-explicit-any

function raw() {
  return { ...realRaw(), demoReadings: structuredClone(demoReadings), guidedDemo: structuredClone(guidedDemo) as Loose };
}
function errorsOf(r: ReturnType<typeof raw>): ContentError[] {
  const res = validateContent(r);
  if (res.ok) throw new Error("expected validation to fail");
  return res.errors.filter((e) => e.file === "data/guided-demo.json");
}

describe("data/guided-demo.json", () => {
  it("validates against the real content", () => {
    const r = validateContent(raw());
    if (!r.ok) throw new Error(JSON.stringify(r.errors, null, 2));
    expect(r.content.guidedDemo?.steps.length).toBeGreaterThanOrEqual(5);
  });

  it("design total is about 90 s and equals the sum of the steps", () => {
    expect(totalDuration(guidedDemo as Loose)).toBe(guidedDemo.design_total_duration_ms);
    expect(guidedDemo.design_total_duration_ms).toBeGreaterThanOrEqual(80_000);
    expect(guidedDemo.design_total_duration_ms).toBeLessThanOrEqual(100_000);
  });

  it("walks board → emergency protocol → report, in that order", () => {
    const ids = guidedDemo.steps.map((s) => parseStepRoute(s.route)?.id);
    expect(ids[0]).toBe("home");
    expect(ids.indexOf("emergency")).toBeGreaterThan(0);
    expect(ids[ids.length - 1]).toBe("report");
  });

  it("the alert indicator's latest demo reading is attention or critical in the scenario environment", () => {
    const r = validateContent(raw());
    if (!r.ok) throw new Error("invalid");
    const { scenario } = guidedDemo;
    const ind = r.content.indicators.find((i) => i.id === scenario.alert_indicator_id)!;
    const env = r.content.environments.find((e) => e.id === scenario.environment_id)!;
    const latest = [...demoReadings.readings]
      .filter((x) => x.indicator_id === ind.id)
      .sort((a, b) => a.minutes_ago - b.minutes_ago)[0]!;
    expect(["attention", "critical"]).toContain(evaluate(ind, latest.value as number, env));
  });

  it("unknown scenario ids are reported", () => {
    const r = raw();
    r.guidedDemo.scenario = { environment_id: "nope_env", alert_indicator_id: "nope_ind", protocol_id: "nope_proto" };
    const paths = errorsOf(r).map((e) => e.path);
    expect(paths).toEqual(expect.arrayContaining(["scenario.environment_id", "scenario.alert_indicator_id", "scenario.protocol_id"]));
  });

  it("unknown route, unknown protocol in a route and missing caption key are reported", () => {
    const r = raw();
    r.guidedDemo.steps[0].route = "#/nowhere";
    r.guidedDemo.steps[1].route = "#/emergency/not_a_protocol";
    r.guidedDemo.steps[2].caption_key = "guided_demo.step.missing";
    const errs = errorsOf(r);
    expect(errs).toContainEqual(expect.objectContaining({ path: "steps[0].route" }));
    expect(errs).toContainEqual(expect.objectContaining({ path: "steps[1].route" }));
    expect(errs).toContainEqual(expect.objectContaining({ path: "steps[2].caption_key" }));
  });

  it("mark_step_done needs the protocol route and an earlier open_protocol", () => {
    const r = raw();
    r.guidedDemo.steps[1].action = { type: "mark_step_done" };
    const errs = errorsOf(r);
    expect(errs).toContainEqual(expect.objectContaining({ path: "steps[1].route" }));
    expect(errs).toContainEqual(expect.objectContaining({ path: "steps[1].action" }));
  });

  it("duration mismatch, duplicate step id, unknown action and unknown target token are reported", () => {
    const r = raw();
    r.guidedDemo.steps[0].duration_ms += 1000;
    r.guidedDemo.steps[1].id = r.guidedDemo.steps[0].id;
    r.guidedDemo.steps[2].target = "[data-x=\"{nope}\"]";
    expect(errorsOf(r).map((e) => e.path)).toEqual(expect.arrayContaining(["design_total_duration_ms", "steps[1].id", "steps[2].target"]));
    const bad = raw();
    bad.guidedDemo.steps[0].action = { type: "launch_rocket" };
    expect(errorsOf(bad)).toContainEqual(expect.objectContaining({ path: "steps[0].action.type" }));
  });

  it("the feature flag defaults to false when absent", () => {
    const app = structuredClone(realRaw().app) as Loose;
    delete app.features.guided_demo;
    expect(AppConfig.parse(app).features.guided_demo).toBe(false);
  });

  it("fillTokens leaves unknown tokens untouched", () => {
    expect(fillTokens('[data-zone="{zone}"] {other}', { zone: "chest" })).toBe('[data-zone="chest"] {other}');
  });
});

describe("guided demo sandbox (storage)", () => {
  beforeEach(() => {
    endGuidedDemoSandbox();
    clearAll();
  });

  it("restores emergency log, session and environment, and removes the demo readings it loaded", () => {
    setEnvironmentId("lunar_base");
    addEmergencyLogEntry({ protocolId: "p", stepIndex: 0, sessionId: "real" });
    const real = startEmergencySession("p");

    beginGuidedDemoSandbox();
    expect(getEmergencySession()).toBeNull(); // la demo abre su propia sesion
    addGuidedDemoReadings([{ indicatorId: "heart_rate", value: 104, environmentId: "spacecraft", timestamp: 1 }]);
    setEnvironmentId("spacecraft");
    startEmergencySession("crew_collapse_chest_pain");
    addEmergencyLogEntry({ protocolId: "crew_collapse_chest_pain", stepIndex: 0, sessionId: "demo" });
    expect(getReadings()).toHaveLength(1);

    endGuidedDemoSandbox();
    expect(getEnvironmentId()).toBe("lunar_base");
    expect(getEmergencySession()).toEqual(real);
    expect(getEmergencyLog().map((e) => e.sessionId)).toEqual(["real"]);
    expect(getReadings()).toEqual([]);
  });

  it("recovers an interrupted demo on startup", () => {
    beginGuidedDemoSandbox();
    addEmergencyLogEntry({ protocolId: "p", stepIndex: 0, sessionId: "demo" });
    expect(recoverGuidedDemoSandbox()).toBe(true);
    expect(getEmergencyLog()).toEqual([]);
    expect(recoverGuidedDemoSandbox()).toBe(false);
  });
});
