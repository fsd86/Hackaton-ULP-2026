import { beforeEach, describe, expect, it } from "vitest";
import environmentsJson from "../../data/environments.json";
import { validateContent, type Content } from "../../src/content/load";
import { createT } from "../../src/content/t";
import {
  activeSets,
  completeSetIds,
  computeCounter,
  counterAssumption,
  counterParams,
  counterText,
  isSetComplete,
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

// Respuestas que completan OPQRST (6 preguntas) y la escala de dolor (2).
const FULL_OPQRST: ConsultDraft["answers"] = {
  o_when: { value: "2026-11-14T11:50" },
  o_how: { value: "Suddenly" },
  p: { text: "nothing changes it" },
  q: { text: "pressure" },
  r: { text: "centre of the chest" },
  t: { value: "Constant" },
};
const FULL_PAIN: ConsultDraft["answers"] = { pain_now: { value: 6 }, pain_words: { value: "Moderate" } };
const ONE_ONE = { upperPerCompleteSet: 1, lower: 1 };

describe("counter: range of round trips from complete sets, minutes from environments.json only", () => {
  const mars = environmentsJson.environments.find((e) => e.id === "spacecraft")!.comm_delay_one_way_s;
  const strings = loadReal().strings;
  const t = createT(strings, { strict: true });

  it("Mars, 2 complete sets: between 1 and 2 round trips; 1 × 2 × min one-way to 2 × 2 × max one-way", () => {
    const c = computeCounter(2, ONE_ONE, mars);
    expect(c.roundTrips).toEqual({ min: 1, max: 2 });
    expect(c.roundTripS).toEqual({ min: 2 * mars.min!, max: 2 * mars.max! });
    expect(c.savedS).toEqual({ min: 1 * 2 * mars.min!, max: 2 * 2 * mars.max! });
    const text = counterText(c, t);
    // 3–22 min de ida → de 6 a 88 min.
    expect(text.headline).toBe("Avoids between 1 and 2 round trips — about 6 min to 88 min");
    expect(text.detail).toContain("Lower bound: 1 round trip at the shortest delay (6 min)");
    expect(text.detail).toContain("Upper bound: 2 round trips at the longest delay (88 min)");
  });

  it("one complete set: exactly 1 round trip, minutes still a range over the delay", () => {
    const c = computeCounter(1, ONE_ONE, mars);
    expect(c.roundTrips).toEqual({ min: 1, max: 1 });
    expect(counterText(c, t).headline).toBe("Avoids about 1 round trip — about 6 min to 44 min");
  });

  it("fixed delay (min = max) and one set: a single value", () => {
    const c = computeCounter(1, ONE_ONE, { min: 90, max: 90 });
    expect(c.savedS).toEqual({ min: 180, max: 180 });
    expect(counterText(c, t).headline).toBe("Avoids about 1 round trip — about 3 min");
  });

  it("N = 0: no saving is claimed", () => {
    const c = computeCounter(0, ONE_ONE, mars);
    expect(c.roundTrips).toEqual({ min: 0, max: 0 });
    expect(counterText(c, t)).toEqual({ headline: strings["consult.counter.none"], detail: null });
  });

  it("unknown delay (PLACEHOLDER): round trips but no minutes", () => {
    const c = computeCounter(2, ONE_ONE, { min: null, max: null });
    expect(c.delayKnown).toBe(false);
    expect(c.savedS).toEqual({ min: null, max: null });
    const text = counterText(c, t);
    expect(text.headline).toBe("Avoids between 1 and 2 round trips");
    expect(text.detail).toBe(strings["consult.counter.unknown"]);
  });

  it("design parameters come from config; the lower bound never exceeds the upper bound", () => {
    expect(computeCounter(2, { upperPerCompleteSet: 2, lower: 1 }, mars).roundTrips).toEqual({ min: 1, max: 4 });
    expect(computeCounter(1, { upperPerCompleteSet: 1, lower: 3 }, mars).roundTrips).toEqual({ min: 1, max: 1 });
    expect(counterParams(loadReal().app.consult)).toEqual(ONE_ONE);
    const assumption = counterAssumption(ONE_ONE, t);
    expect(assumption).toContain("one set per message");
    expect(assumption).toContain("batch all its follow-up questions in one message");
  });
});

describe("complete sets and skip rules", () => {
  const consult = loadReal().consult!;
  const draft = (answers: ConsultDraft["answers"]): ConsultDraft => ({ symptomId: "chest_pain", answers, updatedAt: 0 });

  it("a set with only some answers does NOT count (one answer is not a whole set)", () => {
    expect(completeSetIds(consult, draft({ q: { text: "pressure" }, pain_now: { value: 6 } }))).toEqual([]);
    const fiveOfSix = { ...FULL_OPQRST };
    delete fiveOfSix.t;
    expect(completeSetIds(consult, draft(fiveOfSix))).toEqual([]);
  });

  it("a set counts only when every visible, non-auto question has an answer", () => {
    expect(completeSetIds(consult, draft({ ...FULL_OPQRST, ...FULL_PAIN, a_allergies: { value: "No" } }))).toEqual(["opqrst", "pain_scale"]);
  });

  it("questions hidden by skip_if do not block a set; auto fields never count as answers", () => {
    const sets = activeSets(consult, "chest_pain");
    const ids = new Set(sets.map((s) => s.id));
    const sample = sets.find((s) => s.id === "sample")!;
    const remote = sets.find((s) => s.id === "remote_min")!;
    // e_events se oculta cuando o_when esta respondida: SAMPLE se completa sin ella.
    const sampleAnswers: ConsultDraft["answers"] = {
      o_when: { value: "2026-11-14T11:50" },
      s_symptoms: { text: "x" },
      a_allergies: { value: "No" },
      m_before: { text: "x" },
      m_since: { text: "x" },
      p_past: { text: "x" },
      l_last_intake: { value: "2026-11-14T08:00" },
    };
    expect(isSetComplete(sample, ids, sampleAnswers)).toBe(true);
    const withoutWhen = { ...sampleAnswers };
    delete withoutWhen.o_when;
    expect(isSetComplete(sample, ids, withoutWhen)).toBe(false); // e_events visible y sin respuesta
    // remote_min: las auto (hora, lecturas, contexto) no cuentan; con solo ellas el set no esta completo.
    expect(isSetComplete(remote, ids, {})).toBe(false);
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
      answers: { ...FULL_OPQRST, pain_now: { value: 7 } }, // OPQRST completo; escala a medias (no cuenta)
      updatedAt: 0,
    };
    const r = buildReport({ ...base, consultDraft: draft });
    const c = r.json.consult!;
    expect(c.symptom.label).toBe("Chest pain or pressure");
    expect(c.modules.map((m) => m.id)).toEqual(["opqrst", "sample", "pain_scale", "remote_min"]);
    expect(c.modules.find((m) => m.id === "opqrst")!.questions.find((q) => q.id === "q")!.answer).toBe("pressure");
    expect(c.not_answered.some((q) => q.id === "pain_words")).toBe(true);
    expect(c.modules.map((m) => [m.id, m.complete])).toEqual([["opqrst", true], ["sample", false], ["pain_scale", false], ["remote_min", false]]);
    expect(c.counter.complete_sets).toBe(1);
    expect(c.counter.round_trips).toEqual({ min: 1, max: 1 });
    expect(c.counter.saved_s).toEqual({ min: 1 * 2 * 180, max: 1 * 2 * 1320 });
    expect(r.text).toContain(c.counter.assumption);
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
