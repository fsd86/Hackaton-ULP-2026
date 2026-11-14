import type { TFunction } from "../content/t";
import type { Consult, ConsultQuestion, ConsultQuestionSet, Environment, Indicator } from "../content/schemas";
import type { ConsultAnswerValue, ConsultDraft, Reading } from "../storage/local";
import { formatMinutes } from "./delay";
import { formatValue, readingsFor } from "./daily";
import { plainDataText } from "./placeholder";

// One-shot consult (Downlink report). Funciones puras: reciben datos, no leen storage ni reloj.
// La app NO diagnostica ni sugiere tratamiento: solo ordena preguntas habituales y las respuestas de la persona.

export interface ConsultIssue {
  path: string;
  message: string;
}

/** Referencias cruzadas de data/consult.json (el esquema zod ya validó la forma). */
export function checkConsult(consult: Consult, ctx: { sourceIds: Set<string>; protocolIds: Set<string> }): ConsultIssue[] {
  const issues: ConsultIssue[] = [];
  const dup = (ids: string[], base: string, key: string): void => {
    const seen = new Set<string>();
    ids.forEach((id, i) => {
      if (seen.has(id)) issues.push({ path: `${base}[${i}].${key}`, message: `duplicate id "${id}"` });
      seen.add(id);
    });
  };
  const srcs = (ids: string[], base: string): void => {
    ids.forEach((id, k) => {
      if (!ctx.sourceIds.has(id)) issues.push({ path: `${base}.source_ids[${k}]`, message: `source_id "${id}" does not exist in data/sources.json` });
    });
  };

  dup(consult.help.map((h) => h.id), "help", "id");
  dup(consult.symptoms.map((s) => s.id), "symptoms", "id");
  dup(consult.question_sets.map((s) => s.id), "question_sets", "id");

  const helpIds = new Set(consult.help.map((h) => h.id));
  const setIds = new Set(consult.question_sets.map((s) => s.id));
  if (!consult.help.some((h) => h.placement === "notice")) {
    issues.push({ path: "help", message: 'at least one help item with placement "notice" (the not-a-diagnosis notice) is required' });
  }
  consult.help.forEach((h, i) => srcs(h.source_ids, `help[${i}]`));

  consult.symptoms.forEach((s, i) => {
    const base = `symptoms[${i}]`;
    srcs(s.source_ids, base);
    const seen = new Set<string>();
    s.modules.forEach((m, k) => {
      if (!setIds.has(m)) issues.push({ path: `${base}.modules[${k}]`, message: `question set "${m}" does not exist in question_sets` });
      if (seen.has(m)) issues.push({ path: `${base}.modules[${k}]`, message: `question set "${m}" is listed twice` });
      seen.add(m);
    });
    if (s.open_protocol_id !== undefined && !ctx.protocolIds.has(s.open_protocol_id)) {
      issues.push({ path: `${base}.open_protocol_id`, message: `protocol "${s.open_protocol_id}" does not exist in data/protocols.json` });
    }
  });

  // Ids de pregunta únicos en TODO el archivo (las respuestas guardadas se indexan por id).
  const allQuestions: Array<{ q: ConsultQuestion; path: string }> = [];
  consult.question_sets.forEach((set, i) => {
    if (set.help_id !== undefined && !helpIds.has(set.help_id)) {
      issues.push({ path: `question_sets[${i}].help_id`, message: `help "${set.help_id}" does not exist in help` });
    }
    set.questions.forEach((q, k) => allQuestions.push({ q, path: `question_sets[${i}].questions[${k}]` }));
  });
  const qIds = new Set<string>();
  for (const { q, path } of allQuestions) {
    if (qIds.has(q.id)) issues.push({ path: `${path}.id`, message: `duplicate question id "${q.id}" (question ids must be unique across all sets)` });
    qIds.add(q.id);
    srcs(q.source_ids, path);
    if (q.answer.type === "choice" && new Set(q.answer.options).size !== q.answer.options.length) {
      issues.push({ path: `${path}.answer.options`, message: "choice options must be unique" });
    }
  }
  for (const { q, path } of allQuestions) {
    const skip = q.skip_if;
    if (!skip) continue;
    if ("answered" in skip) {
      if (!qIds.has(skip.answered)) issues.push({ path: `${path}.skip_if.answered`, message: `question "${skip.answered}" does not exist` });
      if (skip.answered === q.id) issues.push({ path: `${path}.skip_if.answered`, message: "a question cannot skip itself" });
    } else if (!setIds.has(skip.set_active)) {
      issues.push({ path: `${path}.skip_if.set_active`, message: `question set "${skip.set_active}" does not exist` });
    }
  }
  return issues;
}

// ---------- estado del formulario ----------

export function findSymptom(consult: Consult, symptomId: string | null) {
  return symptomId === null ? undefined : consult.symptoms.find((s) => s.id === symptomId);
}

/** Sets del síntoma, en su orden. */
export function activeSets(consult: Consult, symptomId: string | null): ConsultQuestionSet[] {
  const symptom = findSymptom(consult, symptomId);
  if (!symptom) return [];
  return symptom.modules.map((m) => consult.question_sets.find((s) => s.id === m)).filter((s): s is ConsultQuestionSet => s !== undefined);
}

/** Respondida = la persona escribió o eligió algo (lo que completa la app sola no cuenta). */
export function isAnswered(answer: ConsultAnswerValue | undefined): boolean {
  if (!answer) return false;
  const hasValue = answer.value !== undefined && String(answer.value).trim() !== "";
  const hasText = answer.text !== undefined && answer.text.trim() !== "";
  return hasValue || hasText;
}

export function isSkipped(q: ConsultQuestion, activeSetIds: ReadonlySet<string>, answers: ConsultDraft["answers"]): boolean {
  const skip = q.skip_if;
  if (!skip) return false;
  if ("answered" in skip) return isAnswered(answers[skip.answered]);
  return activeSetIds.has(skip.set_active);
}

export function visibleQuestions(set: ConsultQuestionSet, activeSetIds: ReadonlySet<string>, answers: ConsultDraft["answers"]): ConsultQuestion[] {
  return set.questions.filter((q) => !isSkipped(q, activeSetIds, answers));
}

/**
 * Set COMPLETO: tiene al menos una pregunta para la persona y TODAS las preguntas visibles que no son automáticas
 * (las que no saltó una regla skip_if) tienen respuesta propia. Un set a medias no cuenta para el contador.
 */
export function isSetComplete(set: ConsultQuestionSet, activeSetIds: ReadonlySet<string>, answers: ConsultDraft["answers"]): boolean {
  const own = visibleQuestions(set, activeSetIds, answers).filter((q) => q.answer.type !== "auto");
  return own.length > 0 && own.every((q) => isAnswered(answers[q.id]));
}

/** Sets completos del síntoma elegido, en su orden. */
export function completeSetIds(consult: Consult, draft: ConsultDraft): string[] {
  const sets = activeSets(consult, draft.symptomId);
  const ids = new Set(sets.map((s) => s.id));
  return sets.filter((s) => isSetComplete(s, ids, draft.answers)).map((s) => s.id);
}

// ---------- contador "Avoids between 1 and N round trips" ----------

/** Parámetros de DISEÑO del contador (config/app.json → consult). */
export interface CounterParams {
  /** Cota superior: round trips evitados por cada set completo (supuesto: tierra pregunta un set por mensaje). */
  upperPerCompleteSet: number;
  /** Cota inferior: round trips evitados si hay al menos un set completo (supuesto: tierra agrupa todo en un mensaje). */
  lower: number;
}

/** config/app.json → consult (validado por zod) → parámetros del contador. */
export function counterParams(cfg: { upper_round_trips_per_complete_set: number; lower_round_trips: number }): CounterParams {
  return { upperPerCompleteSet: cfg.upper_round_trips_per_complete_set, lower: cfg.lower_round_trips };
}

export interface ConsultCounter {
  completeSets: number;
  /** Rango de round trips evitados: min = lower (si hay sets completos), max = N × upperPerCompleteSet. 0/0 sin sets. */
  roundTrips: { min: number; max: number };
  /** Ida y vuelta (s) = 2 × comm_delay_one_way_s del entorno (min y max); null si no hay dato. */
  roundTripS: { min: number | null; max: number | null };
  /** Minutos ahorrados (s): min = roundTrips.min × ida y vuelta mínima; max = roundTrips.max × ida y vuelta máxima. */
  savedS: { min: number | null; max: number | null };
  delayKnown: boolean;
}

export function computeCounter(completeSets: number, params: CounterParams, delay: { min: number | null; max: number | null }): ConsultCounter {
  const max = completeSets * params.upperPerCompleteSet;
  const min = completeSets > 0 ? Math.min(params.lower, max) : 0;
  const lo = delay.min ?? delay.max;
  const hi = delay.max ?? delay.min;
  const rtMin = lo === null ? null : 2 * lo;
  const rtMax = hi === null ? null : 2 * hi;
  return {
    completeSets,
    roundTrips: { min, max },
    roundTripS: { min: rtMin, max: rtMax },
    savedS: { min: rtMin === null ? null : min * rtMin, max: rtMax === null ? null : max * rtMax },
    delayKnown: rtMin !== null && rtMax !== null,
  };
}

/** Duración legible: segundos bajo 1 min, minutos desde ahí (mismo formato que la demora). */
export function formatDuration(seconds: number, t: TFunction): string {
  if (seconds < 60) return t("consult.duration.seconds", { s: String(Number(seconds.toFixed(1))) });
  return t("consult.duration.minutes", { m: formatMinutes(seconds) });
}

function tripsWord(n: number, t: TFunction): string {
  return t(n === 1 ? "consult.counter.trips_one" : "consult.counter.trips_other", { n });
}

/** Texto de los supuestos (parámetros de diseño de config/app.json → consult). */
export function counterAssumption(params: CounterParams, t: TFunction): string {
  return t("consult.counter.assumption", { per_set: tripsWord(params.upperPerCompleteSet, t), lower: tripsWord(params.lower, t) });
}

export function counterText(c: ConsultCounter, t: TFunction): { headline: string; detail: string | null } {
  if (c.roundTrips.max === 0) return { headline: t("consult.counter.none"), detail: null };
  const trips =
    c.roundTrips.min === c.roundTrips.max
      ? t("consult.counter.trips_exact", { trips: tripsWord(c.roundTrips.max, t) })
      : t("consult.counter.trips_range", { min: c.roundTrips.min, max: c.roundTrips.max });
  const { min, max } = c.savedS;
  if (!c.delayKnown || min === null || max === null) {
    return { headline: t("consult.counter.headline_unknown", { trips }), detail: t("consult.counter.unknown") };
  }
  const lo = formatDuration(min, t);
  const hi = formatDuration(max, t);
  const time = lo === hi ? t("consult.counter.time_single", { value: hi }) : t("consult.counter.time_range", { min: lo, max: hi });
  const detail = t("consult.counter.bounds", {
    min_trips: tripsWord(c.roundTrips.min, t),
    min: lo,
    max_trips: tripsWord(c.roundTrips.max, t),
    max: hi,
  });
  return { headline: t("consult.counter.headline", { trips, time }), detail };
}

// ---------- campos automáticos ----------

export interface AutoContext {
  now: Date;
  env: Environment;
  indicators: Indicator[];
  readings: Reading[];
  t: TFunction;
  dateTime: (ts: number) => string;
  delayText: string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function utcStamp(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

export function roundTripText(delay: { min: number | null; max: number | null }, t: TFunction): string {
  const lo = delay.min ?? delay.max;
  const hi = delay.max ?? delay.min;
  if (lo === null || hi === null) return t("consult.round_trip.unknown");
  const a = formatDuration(2 * lo, t);
  const b = formatDuration(2 * hi, t);
  return a === b ? t("consult.round_trip.single", { value: a }) : t("consult.round_trip.range", { min: a, max: b });
}

/** Líneas que la app completa sola (hora, últimas lecturas con hora, entorno + retardo + equipo). */
export function autoLines(fill: "timestamp" | "latest_readings" | "mission_context", ctx: AutoContext): string[] {
  const { t } = ctx;
  if (fill === "timestamp") return [utcStamp(ctx.now)];
  if (fill === "latest_readings") {
    const nowMs = ctx.now.getTime();
    const upTo = ctx.readings.filter((r) => r.timestamp <= nowMs);
    const lines: string[] = [];
    for (const ind of ctx.indicators) {
      const latest = readingsFor(upTo, ind.id)[0];
      if (!latest) continue;
      const demo = latest.demo === true ? ` ${t("consult.auto.demo_suffix")}` : "";
      lines.push(t("consult.auto.reading", { name: ind.name, value: formatValue(latest.value), unit: ind.unit, time: ctx.dateTime(latest.timestamp) }) + demo);
    }
    return lines.length > 0 ? lines : [t("consult.auto.no_readings")];
  }
  const { env } = ctx;
  const lines = [`${t("report.environment")}: ${env.name}`];
  const desc = plainDataText(env.description, t);
  if (desc.trim() !== "") lines.push(desc);
  lines.push(`${t("report.delay")}: ${ctx.delayText}`);
  lines.push(roundTripText(env.comm_delay_one_way_s, t));
  lines.push(
    env.available_equipment.length > 0
      ? t("consult.auto.equipment", { list: env.available_equipment.join(", ") })
      : t("consult.auto.no_equipment"),
  );
  return lines;
}

// ---------- sección del informe ----------

export interface ConsultQuestionJson {
  id: string;
  text: string;
  status: "answered" | "not_answered" | "auto";
  /** Respuesta de la persona como texto (null = sin respuesta). */
  answer: string | null;
  /** Solo campos automáticos: lo que completó la app. */
  auto?: string[];
}

export interface ConsultModuleJson {
  id: string;
  title: string;
  /** Set completo: todas sus preguntas visibles para la persona tienen respuesta (solo estos cuentan). */
  complete: boolean;
  questions: ConsultQuestionJson[];
}

export interface ConsultJson {
  symptom: { id: string; label: string };
  notice: string;
  modules: ConsultModuleJson[];
  not_answered: Array<{ id: string; text: string; module_id: string }>;
  counter: {
    complete_sets: number;
    round_trips: { min: number; max: number };
    round_trip_s: { min: number | null; max: number | null };
    saved_s: { min: number | null; max: number | null };
    text: string;
    assumption: string;
  };
  after: string[];
}

export function answerText(q: ConsultQuestion, a: ConsultAnswerValue | undefined, t: TFunction): string | null {
  if (!isAnswered(a) || !a) return null;
  const text = a.text?.trim() ?? "";
  let value = a.value !== undefined && String(a.value).trim() !== "" ? String(a.value) : "";
  if (value !== "" && q.answer.type === "time") value = value.replace("T", " ");
  if (value !== "" && q.answer.type === "scale_0_10") {
    value = t("consult.answer.scale", { n: value, min_label: q.answer.anchors.min_label, max_label: q.answer.anchors.max_label });
  }
  if (value !== "" && text !== "") return `${value} — ${text}`;
  return value !== "" ? value : text;
}

export function buildConsultSection(
  consult: Consult,
  draft: ConsultDraft,
  params: CounterParams,
  ctx: AutoContext,
): ConsultJson | null {
  const symptom = findSymptom(consult, draft.symptomId);
  if (!symptom) return null;
  const { t } = ctx;
  const sets = activeSets(consult, draft.symptomId);
  const setIds = new Set(sets.map((s) => s.id));
  const complete = new Set(completeSetIds(consult, draft));
  const notAnswered: ConsultJson["not_answered"] = [];
  const modules: ConsultModuleJson[] = sets.map((set) => ({
    id: set.id,
    title: set.title,
    complete: complete.has(set.id),
    questions: visibleQuestions(set, setIds, draft.answers).map((q) => {
      const a = draft.answers[q.id];
      const answer = answerText(q, a, t);
      if (q.answer.type === "auto") {
        return { id: q.id, text: q.text, status: "auto" as const, answer, auto: autoLines(q.answer.fill, ctx) };
      }
      if (answer === null) notAnswered.push({ id: q.id, text: q.text, module_id: set.id });
      return { id: q.id, text: q.text, status: answer === null ? ("not_answered" as const) : ("answered" as const), answer };
    }),
  }));
  const c = computeCounter(complete.size, params, ctx.env.comm_delay_one_way_s);
  const ct = counterText(c, t);
  return {
    symptom: { id: symptom.id, label: symptom.label },
    notice: consult.help.filter((h) => h.placement === "notice").map((h) => h.text).join(" "),
    modules,
    not_answered: notAnswered,
    counter: {
      complete_sets: c.completeSets,
      round_trips: c.roundTrips,
      round_trip_s: c.roundTripS,
      saved_s: c.savedS,
      text: ct.detail ? `${ct.headline} ${ct.detail}` : ct.headline,
      assumption: counterAssumption(params, t),
    },
    after: consult.help.filter((h) => h.placement === "after").map((h) => h.text),
  };
}

export function renderConsultText(c: ConsultJson, t: TFunction): string[] {
  const lines: string[] = ["", t("consult.report.title").toUpperCase()];
  lines.push(`${t("consult.report.symptom")}: ${c.symptom.label}`);
  lines.push(c.notice);
  lines.push(c.counter.text);
  lines.push(c.counter.assumption);
  for (const m of c.modules) {
    lines.push("", m.title);
    for (const q of m.questions) {
      lines.push(`  ${t("consult.report.q")}: ${q.text}`);
      if (q.auto) for (const l of q.auto) lines.push(`    ${l}`);
      if (q.status === "auto") {
        if (q.answer !== null) lines.push(`  ${t("consult.report.a")}: ${q.answer}`);
      } else {
        lines.push(`  ${t("consult.report.a")}: ${q.answer ?? t("consult.not_answered")}`);
      }
    }
  }
  lines.push("", t("consult.report.not_answered_count", { n: c.not_answered.length }));
  for (const a of c.after) lines.push(a);
  return lines;
}
