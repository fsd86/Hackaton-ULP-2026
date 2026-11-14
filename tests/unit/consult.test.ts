import { beforeEach, describe, expect, it } from "vitest";
import environmentsJson from "../../data/environments.json";
import { validateContent, type Content } from "../../src/content/load";
import { createT } from "../../src/content/t";
import {
  activeSets,
  answeredSetIds,
  computeCounter,
  counterText,
  visibleQuestions,
} from "../../src/logic/consult";
import { buildReport } from "../../src/logic/report";
import {
  beginGuidedDemoSandbox,
  clearAll,
  endGuidedDemoSandbox,
  getConsultDraft,
  setConsultDraft,
  type ConsultDraft,
} from "../../src/storage/local";
import { realRaw } from "./helpers";

// Datos de prueba: se rompe una copia de data/consult.json real; los retardos salen de data/environments.json.

type Loose = Record<string, unknown> & { [k: string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

function loadReal(): Content {
  const r = validateContent(realRaw());
  if (!r.ok) throw new Error(JSON.stringify(r.errors, null, 2));
  return r.content;
}

function brokenConsult(mutate: (c: Loose) => void) {
  const raw = realRaw();
  mutate(raw.consult as Loose);
  return validateContent(raw);
}

function errorsOf(r: ReturnType<typeof validateContent>) {
  return r.ok ? [] : r.errors;
}

describe("data/consult.json: schema and cross-checks", () => {
  it("the real file validates; chest pain opens an existing protocol first", () => {
    const content = loadReal();
    const chest = content.consult?.symptoms.find((s) => s.id === "chest_pain");
    expect(chest?.open_protocol_id).toBe("crew_chest_pain_conscious");
    expect(content.protocols.some((p) => p.id === chest?.open_protocol_id)).toBe(true);
  });

  it("unknown source id", () => {
    const r = brokenConsult((c) => (c.question_sets[0].questions[0].source_ids = ["nope_source"]));
    expect(errorsOf(r)).toContainEqual(expect.objectContaining({ file: "data/consult.json", path: "question_sets[0].questions[0].source_ids[0]" }));
  });

  it("symptom module that is not a question set", () => {
    const r = brokenConsult((c) => c.symptoms[0].modules.push("ghost_set"));
    expect(errorsOf(r).some((e) => e.path.startsWith("symptoms[0].modules") && e.message.includes("ghost_set"))).toBe(true);
  });

  it("open_protocol_id that does not exist", () => {
    const r = brokenConsult((c) => (c.symptoms[0].open_protocol_id = "missing_protocol"));
    expect(errorsOf(r)).toContainEqual(expect.objectContaining({ path: "symptoms[0].open_protocol_id" }));
  });

  it("duplicate question id across sets", () => {
    const r = brokenConsult((c) => (c.question_sets[1].questions[0].id = c.question_sets[0].questions[0].id));
    expect(errorsOf(r).some((e) => e.message.includes("duplicate question id"))).toBe(true);
  });

  it("invalid answer type and a choice with one option", () => {
    expect(errorsOf(brokenConsult((c) => (c.question_sets[0].questions[0].answer = { type: "slider" }))).length).toBeGreaterThan(0);
    const r = brokenConsult((c) => (c.question_sets[0].questions[1].answer = { type: "choice", options: ["Only"] }));
    expect(errorsOf(r).some((e) => e.path.includes("answer.options"))).toBe(true);
  });

  it("design text (UX) must not cite a source; sourced text must cite one", () => {
    const r1 = brokenConsult((c) => (c.help.find((h: Loose) => h.id === "not_diagnosis").source_ids = ["cdc_fever"]));
    expect(errorsOf(r1).some((e) => e.message.includes("design text"))).toBe(true);
    const r2 = brokenConsult((c) => (c.symptoms[0].source_ids = []));
    expect(errorsOf(r2).some((e) => e.path === "symptoms[0].source_ids")).toBe(true);
  });

  it("skip_if pointing to an unknown question", () => {
    const r = brokenConsult((c) => (c.question_sets[0].questions[0].skip_if = { answered: "ghost_q" }));
    expect(errorsOf(r).some((e) => e.path.endsWith("skip_if.answered"))).toBe(true);
  });
});

describe("counter: N answered sets and X = N x round trip from environments.json only", () => {
  const mars = environmentsJson.environments.find((e) => e.id === "spacecraft")!.comm_delay_one_way_s;
  const strings = loadReal().strings;
  const t = createT(strings, { strict: true });

  it("Mars: min and max defined", () => {
    const c = computeCounter(3, 1, mars);
    expect(c.roundTrips).toBe(3);
    expect(c.roundTripS).toEqual({ min: 2 * mars.min!, max: 2 * mars.max! });
    expect(c.maxSavedS).toBe(3 * 2 * mars.max!);
    expect(c.minSavedS).toBe(3 * 2 * mars.min!);
    const text = counterText(c, t);
    expect(text.headline).toContain(`${(3 * 2 * mars.max!) / 60} min`);
    expect(text.detail).toContain(`${(3 * 2 * mars.min!) / 60} min`);
  });

  it("min equal to max: no separate minimum", () => {
    const c = computeCounter(2, 1, { min: 90, max: 90 });
    expect(c.maxSavedS).toBe(360);
    expect(c.minSavedS).toBeNull();
  });

  it("unknown delay (PLACEHOLDER): no time estimate", () => {
    const c = computeCounter(2, 1, { min: null, max: null });
    expect(c.delayKnown).toBe(false);
    expect(c.maxSavedS).toBeNull();
    const text = counterText(c, t);
    expect(text.detail).toBe(strings["consult.counter.unknown"]);
  });

  it("round trips per set comes from config (design parameter)", () => {
    expect(computeCounter(2, 2, mars).roundTrips).toBe(4);
    expect(counterText(computeCounter(0, 1, mars), t).headline).toBe(strings["consult.counter.none"]);
  });
});

describe("answered sets and skip rules", () => {
  const consult = loadReal().consult!;

  it("counts only sets with an answer from the person (auto fields do not count)", () => {
    const draft: ConsultDraft = { symptomId: "chest_pain", answers: { q: { text: "pressure" }, pain_now: { value: 6 } }, updatedAt: 0 };
    expect(answeredSetIds(consult, draft)).toEqual(["opqrst", "pain_scale"]);
  });

  it("e_events hides once o_when is answered; course hides when OPQRST is active", () => {
    const sets = activeSets(consult, "chest_pain");
    const ids = new Set(sets.map((s) => s.id));
    const sample = sets.find((s) => s.id === "sample")!;
    const remote = sets.find((s) => s.id === "remote_min")!;
    expect(visibleQuestions(sample, ids, {}).some((q) => q.id === "e_events")).toBe(true);
    expect(visibleQuestions(sample, ids, { o_when: { text: "working" } }).some((q) => q.id === "e_events")).toBe(false);
    expect(visibleQuestions(remote, ids, {}).some((q) => q.id === "course")).toBe(false);
    const other = activeSets(consult, "other");
    const remoteOther = other.find((s) => s.id === "remote_min")!;
    expect(visibleQuestions(remoteOther, new Set(other.map((s) => s.id)), {}).some((q) => q.id === "course")).toBe(true);
  });
});

describe("report: consult section", () => {
  const content = loadReal();
  const t = createT(content.strings, { strict: true });
  const now = new Date("2026-11-14T12:00:00Z");
  const base = {
    content,
    environmentId: "spacecraft",
    readings: [{ id: "r1", indicatorId: content.indicators[0].id, value: 70, environmentId: "spacecraft", timestamp: now.getTime() - 60_000 }],
    emergencyLog: [],
    now,
    t,
    timeZone: "UTC",
  };

  it("without a draft there is no consult section", () => {
    const r = buildReport(base);
    expect(r.json.consult).toBeNull();
    expect(r.text).not.toContain(content.strings["consult.report.title"].toUpperCase());
  });

  it("groups answers by module, lists unanswered questions and the counter", () => {
    const draft: ConsultDraft = {
      symptomId: "chest_pain",
      answers: { q: { text: "pressure" }, o_how: { value: "Suddenly" }, pain_now: { value: 7 } },
      updatedAt: 0,
    };
    const r = buildReport({ ...base, consultDraft: draft });
    const c = r.json.consult!;
    expect(c.symptom.label).toBe("Chest pain or pressure");
    expect(c.modules.map((m) => m.id)).toEqual(["opqrst", "sample", "pain_scale", "remote_min"]);
    expect(c.modules.find((m) => m.id === "opqrst")!.questions.find((q) => q.id === "q")!.answer).toBe("pressure");
    expect(c.not_answered.some((q) => q.id === "p")).toBe(true);
    expect(c.counter.round_trips).toBe(2);
    expect(c.counter.max_saved_s).toBe(2 * 2 * 1320);
    const vitals = c.modules.find((m) => m.id === "remote_min")!.questions.find((q) => q.id === "vitals")!;
    expect(vitals.status).toBe("auto");
    expect(vitals.auto?.[0]).toContain(content.indicators[0].name);
    expect(r.text).toContain(content.strings["consult.report.title"].toUpperCase());
    expect(r.text).toContain("A: pressure");
    expect(r.text).toContain(`A: ${content.strings["consult.not_answered"]}`);
    expect(r.text).toContain(c.counter.text);
    expect(r.text).toContain("2026-11-14 12:00 UTC");
  });
});

describe("storage: consult draft", () => {
  beforeEach(() => clearAll());

  it("is saved, cleared by Clear saved data, and the guided demo leaves none behind", () => {
    setConsultDraft({ symptomId: "other", answers: { s_symptoms: { text: "x" } } });
    expect(getConsultDraft()?.symptomId).toBe("other");
    clearAll();
    expect(getConsultDraft()).toBeNull();

    beginGuidedDemoSandbox();
    setConsultDraft({ symptomId: "injury", answers: {} });
    endGuidedDemoSandbox();
    expect(getConsultDraft()).toBeNull();
  });
});
