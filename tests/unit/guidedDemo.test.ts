import { beforeEach, describe, expect, it } from "vitest";
import guidedDemo from "../../data/guided-demo.json";
import demoReadings from "../../data/demo-readings.json";
import { validateContent, type ContentError } from "../../src/content/load";
import { AppConfig } from "../../src/content/schemas";
import { evaluate } from "../../src/logic/evaluate";
import { fillTokens, localDateTimeInputValue, parseStepRoute, totalDuration } from "../../src/logic/guidedDemo";
import {
  addEmergencyLogEntry,
  addGuidedDemoReadings,
  beginGuidedDemoSandbox,
  clearAll,
  clearConsultDraft,
  endGuidedDemoSandbox,
  getConsultDraft,
  getEmergencyLog,
  getEmergencySession,
  getEnvironmentId,
  getReadings,
  recoverGuidedDemoSandbox,
  setConsultDraft,
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

  it("clinical order: the conscious crewmate answers the consult BEFORE the collapse protocol, then the report", () => {
    const types = guidedDemo.steps.map((s) => (s as { action?: { type: string } }).action?.type);
    const open = types.indexOf("open_consult");
    const fill = types.indexOf("fill_consult_demo");
    const counter = guidedDemo.steps.findIndex((s) => s.target === "[data-testid=\"consult-counter\"]");
    const emergencyButton = guidedDemo.steps.findIndex((s) => s.id === "emergency_button");
    const protocol = types.indexOf("open_protocol");
    expect(open).toBeGreaterThan(0);
    expect(types.indexOf("select_consult_symptom")).toBeGreaterThan(open);
    expect(fill).toBeGreaterThan(types.indexOf("select_consult_symptom"));
    expect(counter).toBeGreaterThan(fill);
    // Nadie le pregunta a un tripulante inconsciente: todo el consult ocurre antes de Emergency y del protocolo.
    expect(emergencyButton).toBeGreaterThan(counter);
    expect(protocol).toBeGreaterThan(emergencyButton);
    expect(types.lastIndexOf("mark_step_done")).toBeGreaterThan(protocol);
    expect(guidedDemo.steps[guidedDemo.steps.length - 1]!.route).toBe("#/report");
  });

  it("the consult symptom links the CONSCIOUS chest-pain protocol and the demo answers fill complete sets", () => {
    const r = validateContent(raw());
    if (!r.ok) throw new Error("invalid");
    const consult = r.content.consult!;
    const symptom = consult.symptoms.find((s) => s.id === guidedDemo.scenario.consult.symptom_id)!;
    expect(symptom.open_protocol_id).toBe("crew_chest_pain_conscious");
    const answered = new Set(guidedDemo.scenario.consult.demo_answers.map((a) => a.question_id));
    for (const setId of ["opqrst", "pain_scale"]) {
      const set = consult.question_sets.find((s) => s.id === setId)!;
      for (const q of set.questions) expect(answered.has(q.id), `${setId}.${q.id}`).toBe(true);
    }
  });

  it("localDateTimeInputValue formats local time for a datetime-local input", () => {
    const ms = new Date(2026, 10, 14, 9, 5).getTime();
    expect(localDateTimeInputValue(ms)).toBe("2026-11-14T09:05");
  });

  it("consult scenario: unknown symptom, unknown question, invalid option and unsupported type are reported", () => {
    const r = raw();
    r.guidedDemo.scenario.consult.symptom_id = "nope";
    expect(errorsOf(r)).toContainEqual(expect.objectContaining({ path: "scenario.consult.symptom_id" }));
    const q = raw();
    q.guidedDemo.scenario.consult.demo_answers = [
      { question_id: "injury_loc", value: "No" }, // set "injury" no esta en chest_pain
      { question_id: "o_how", value: "Maybe" },
      { question_id: "pain_now", value: 11 },
      { question_id: "p", value: "x" }, // free_text: va en text
      { question_id: "o_when", text: "x" }, // time: necesita minutes_ago
      { question_id: "pain_now", value: 3, text: "x" }, // escala sin detalle de texto
      { question_id: "timestamp", text: "x" }, // auto: lo completa la app
    ];
    expect(errorsOf(q).map((e) => e.path)).toEqual(
      expect.arrayContaining([
        "scenario.consult.demo_answers[0].question_id",
        "scenario.consult.demo_answers[1].value",
        "scenario.consult.demo_answers[2].value",
        "scenario.consult.demo_answers[3].value",
        "scenario.consult.demo_answers[3].text",
        "scenario.consult.demo_answers[4].minutes_ago",
        "scenario.consult.demo_answers[5].text",
        "scenario.consult.demo_answers[6].question_id",
      ]),
    );
  });

  it("consult actions need the report route, scenario.consult and the right order", () => {
    const r = raw();
    const i = r.guidedDemo.steps.findIndex((s: Loose) => s.action?.type === "fill_consult_demo");
    r.guidedDemo.steps[0].action = { type: "fill_consult_demo" };
    r.guidedDemo.steps[i].route = "#/";
    const errs = errorsOf(r);
    expect(errs).toContainEqual(expect.objectContaining({ path: "steps[0].route" }));
    expect(errs).toContainEqual(expect.objectContaining({ path: "steps[0].action" }));
    expect(errs).toContainEqual(expect.objectContaining({ path: `steps[${i}].route` }));
    const n = raw();
    delete n.guidedDemo.scenario.consult;
    expect(errorsOf(n)).toContainEqual(expect.objectContaining({ message: expect.stringContaining("needs scenario.consult") }));
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

  it("restores the consult draft that existed before the demo (or none)", () => {
    setConsultDraft({ symptomId: "headache", answers: { p: { text: "real" } } });
    beginGuidedDemoSandbox();
    clearConsultDraft(); // open_consult
    setConsultDraft({ symptomId: "chest_pain", answers: { o_how: { value: "Suddenly" } } });
    endGuidedDemoSandbox();
    expect(getConsultDraft()?.symptomId).toBe("headache");

    clearConsultDraft();
    beginGuidedDemoSandbox();
    setConsultDraft({ symptomId: "chest_pain", answers: {} });
    endGuidedDemoSandbox();
    expect(getConsultDraft()).toBeNull();
  });

  it("recovers an interrupted demo on startup", () => {
    beginGuidedDemoSandbox();
    addEmergencyLogEntry({ protocolId: "p", stepIndex: 0, sessionId: "demo" });
    expect(recoverGuidedDemoSandbox()).toBe(true);
    expect(getEmergencyLog()).toEqual([]);
    expect(recoverGuidedDemoSandbox()).toBe(false);
  });
});
