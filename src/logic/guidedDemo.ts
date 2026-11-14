import type { Consult, GuidedDemo, GuidedDemoStep, Indicator, Strings } from "../content/schemas";
import { activeSets } from "./consult";
import { ROUTES, type RouteId } from "../hooks/useHashRoute";

// Logica pura del modo Guided demo: validacion cruzada del guion y resolucion de plantillas.

export interface GuidedDemoIssue {
  path: string;
  message: string;
}

/** Variables permitidas en target (selector) y en caption (texto). */
export const TARGET_TOKENS = ["zone", "indicator"] as const;
export const CAPTION_TOKENS = ["environment", "indicator", "status", "zone", "protocol", "symptom"] as const;

/** Vista donde vive el One-shot consult. */
export const CONSULT_ROUTE = "#/report";

function tokens(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!);
}

/** "#/emergency/x" → { id: "emergency", param: "x" }; null si la primera parte no es una ruta conocida. */
export function parseStepRoute(route: string): { id: RouteId; param: string | undefined } | null {
  const [first, second, ...rest] = route.replace(/^#/, "").split("/").filter((s) => s.length > 0);
  if (rest.length > 0) return null;
  const path = first ? `#/${first}` : "#/";
  const def = ROUTES.find((r) => r.path === path);
  return def ? { id: def.id, param: second } : null;
}

/** Validacion cruzada del guion contra el resto del contenido (ids, rutas, claves de texto, duracion). */
export function checkGuidedDemo(
  demo: GuidedDemo,
  ctx: {
    environmentIds: Set<string>;
    indicators: Indicator[];
    protocolIds: Set<string>;
    strings: Strings;
    /** Indicadores con lecturas en data/demo-readings.json; null = no se verifica. */
    demoIndicatorIds: Set<string> | null;
    /** data/consult.json; null = no se entrega (las acciones del consult quedan invalidas). Ausente = no se verifica. */
    consult?: Consult | null;
  },
): GuidedDemoIssue[] {
  const issues: GuidedDemoIssue[] = [];
  const { scenario } = demo;
  if (!ctx.environmentIds.has(scenario.environment_id)) {
    issues.push({ path: "scenario.environment_id", message: `environment "${scenario.environment_id}" does not exist in data/environments.json` });
  }
  const alert = ctx.indicators.find((i) => i.id === scenario.alert_indicator_id);
  if (!alert) {
    issues.push({ path: "scenario.alert_indicator_id", message: `indicator "${scenario.alert_indicator_id}" does not exist in data/indicators.json` });
  } else {
    if (alert.body_zone === undefined) {
      issues.push({ path: "scenario.alert_indicator_id", message: `indicator "${alert.id}" has no body_zone, so the alert cannot be shown on the body map` });
    }
    if (ctx.demoIndicatorIds && !ctx.demoIndicatorIds.has(alert.id)) {
      issues.push({ path: "scenario.alert_indicator_id", message: `indicator "${alert.id}" has no readings in data/demo-readings.json` });
    }
  }
  if (!ctx.protocolIds.has(scenario.protocol_id)) {
    issues.push({ path: "scenario.protocol_id", message: `protocol "${scenario.protocol_id}" does not exist in data/protocols.json` });
  }

  // One-shot consult de la demo: sintoma y respuestas DEMO deben existir y ser validos en data/consult.json.
  const consultScenario = scenario.consult;
  if (consultScenario && ctx.consult !== undefined) {
    const symptom = ctx.consult?.symptoms.find((s) => s.id === consultScenario.symptom_id);
    if (!ctx.consult) {
      issues.push({ path: "scenario.consult", message: "data/consult.json is not available, so the demo cannot open the One-shot consult" });
    } else if (!symptom) {
      issues.push({ path: "scenario.consult.symptom_id", message: `symptom "${consultScenario.symptom_id}" does not exist in data/consult.json` });
    } else {
      const questions = activeSets(ctx.consult, symptom.id).flatMap((s) => s.questions);
      consultScenario.demo_answers.forEach((a, i) => {
        const at = `scenario.consult.demo_answers[${i}]`;
        const q = questions.find((x) => x.id === a.question_id);
        if (!q) {
          issues.push({ path: `${at}.question_id`, message: `question "${a.question_id}" is not in a question set of symptom "${symptom.id}"` });
        } else if (q.answer.type === "choice") {
          if (!q.answer.options.includes(String(a.value))) {
            issues.push({ path: `${at}.value`, message: `"${a.value}" is not an option of question "${q.id}" (${q.answer.options.join(", ")})` });
          }
        } else if (q.answer.type === "scale_0_10") {
          if (typeof a.value !== "number" || a.value < 0 || a.value > 10) {
            issues.push({ path: `${at}.value`, message: `question "${q.id}" takes an integer from 0 to 10` });
          }
        } else {
          issues.push({ path: `${at}.question_id`, message: `question "${q.id}" is "${q.answer.type}"; demo answers only support "choice" and "scale_0_10"` });
        }
      });
    }
  }

  const protocolRoute = `#/emergency/${scenario.protocol_id}`;
  const seen = new Set<string>();
  let total = 0;
  let protocolOpened = false;
  let consultOpened = false;
  let symptomSelected = false;
  demo.steps.forEach((step, i) => {
    const at = (field: string) => `steps[${i}].${field}`;
    total += step.duration_ms;
    if (seen.has(step.id)) issues.push({ path: at("id"), message: `duplicate step id "${step.id}"` });
    seen.add(step.id);

    const route = parseStepRoute(step.route);
    if (!route) {
      issues.push({ path: at("route"), message: `route "${step.route}" is not a known view (${ROUTES.map((r) => r.path).join(", ")})` });
    } else if (route.id === "emergency" && route.param !== undefined && !ctx.protocolIds.has(route.param)) {
      issues.push({ path: at("route"), message: `protocol "${route.param}" in the route does not exist in data/protocols.json` });
    } else if (route.param !== undefined && route.id !== "emergency") {
      issues.push({ path: at("route"), message: `route "${step.route}" does not take a parameter` });
    }

    if (!(step.caption_key in ctx.strings)) {
      issues.push({ path: at("caption_key"), message: `string key "${step.caption_key}" does not exist in config/strings.en.json` });
    } else {
      for (const tk of tokens(ctx.strings[step.caption_key]!)) {
        if (!(CAPTION_TOKENS as readonly string[]).includes(tk)) {
          issues.push({ path: at("caption_key"), message: `caption uses {${tk}}; allowed: ${CAPTION_TOKENS.map((x) => `{${x}}`).join(", ")}` });
        }
      }
    }
    for (const tk of step.target === null ? [] : tokens(step.target)) {
      if (!(TARGET_TOKENS as readonly string[]).includes(tk)) {
        issues.push({ path: at("target"), message: `target uses {${tk}}; allowed: ${TARGET_TOKENS.map((x) => `{${x}}`).join(", ")}` });
      }
    }

    const type = step.action?.type;
    if (type === "open_protocol") protocolOpened = true;
    if ((type === "open_protocol" || type === "mark_step_done") && step.route !== protocolRoute) {
      issues.push({ path: at("route"), message: `action "${type}" needs route "${protocolRoute}" (scenario.protocol_id)` });
    }
    if (type === "open_consult" || type === "select_consult_symptom" || type === "fill_consult_demo") {
      if (step.route !== CONSULT_ROUTE) issues.push({ path: at("route"), message: `action "${type}" needs route "${CONSULT_ROUTE}"` });
      if (!scenario.consult) issues.push({ path: at("action"), message: `action "${type}" needs scenario.consult` });
      if (type === "open_consult") consultOpened = true;
      if (type === "select_consult_symptom") {
        if (!consultOpened) issues.push({ path: at("action"), message: `action "${type}" needs an earlier step with action "open_consult"` });
        symptomSelected = true;
      }
      if (type === "fill_consult_demo" && !symptomSelected) {
        issues.push({ path: at("action"), message: `action "${type}" needs an earlier step with action "select_consult_symptom"` });
      }
    }
    if (type === "mark_step_done" && !protocolOpened) {
      issues.push({ path: at("action"), message: `action "mark_step_done" needs an earlier step with action "open_protocol"` });
    }
  });

  if (total !== demo.design_total_duration_ms) {
    issues.push({
      path: "design_total_duration_ms",
      message: `the steps add up to ${total} ms but design_total_duration_ms is ${demo.design_total_duration_ms}; make them match`,
    });
  }
  return issues;
}

/** Reemplaza {nombre} por vars[nombre] (los desconocidos quedan igual). */
export function fillTokens(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (m, name: string) => (Object.prototype.hasOwnProperty.call(vars, name) ? vars[name]! : m));
}

/** Selector del paso con {zone}/{indicator} resueltos; null si el paso no destaca nada. */
export function stepTarget(step: GuidedDemoStep, vars: { zone: string; indicator: string }): string | null {
  return step.target === null ? null : fillTokens(step.target, vars);
}

/** Suma de las duraciones (la validacion exige que coincida con design_total_duration_ms). */
export function totalDuration(demo: GuidedDemo): number {
  return demo.steps.reduce((acc, s) => acc + s.duration_ms, 0);
}
