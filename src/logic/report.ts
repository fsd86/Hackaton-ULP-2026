import type { Content } from "../content/load";
import type { TFunction } from "../content/t";
import type { EmergencyLogEntry, Reading } from "../storage/local";
import type { Indicator, Protocol } from "../content/schemas";
import { formatDelay } from "./delay";
import { formatValue, readingsFor, statusOfReading } from "./daily";
import type { EvalStatus } from "./evaluate";
import { plainDataText } from "./placeholder";

// Informe de bajada (downlink). Función pura: recibe los datos, no lee storage ni reloj.

export const DEFAULT_REPORT_WINDOW_MS = 24 * 3_600_000;

export interface ReportInput {
  content: Content;
  environmentId: string;
  readings: Reading[];
  emergencyLog: EmergencyLogEntry[];
  now: Date;
  t: TFunction;
  locale?: string;
  sinceMs?: number; // ventana hacia atrás desde now (default 24 h)
  timeZone?: string; // IANA; undefined = zona local (tests pasan "UTC")
}

export interface ReportReadingJson {
  timestamp: number;
  time: string;
  value: ReadingValueJson;
  value_text: string;
  unit: string;
  status: EvalStatus;
  environment_id: string;
}
export type ReadingValueJson = number | [number, number];

export interface ReportTrendJson {
  from: ReadingValueJson;
  to: ReadingValueJson;
  text: string;
}

export interface ReportIndicatorJson {
  indicator_id: string;
  name: string;
  readings: ReportReadingJson[]; // más reciente primero
  trend: ReportTrendJson | null;
}

export interface ReportEmergencyJson {
  protocol_id: string;
  protocol_title: string;
  step_index: number;
  step_text: string;
  timestamp: number;
  time: string;
}

export interface ReportJson {
  app_name: string;
  generated_at: { timestamp: number; iso: string; text: string };
  environment: { id: string; name: string };
  delay: { one_way_s: { min: number | null; max: number | null }; text: string };
  expected_answer_window: { from: string; to: string; text: string } | null;
  period: { since: number; until: number };
  readings: ReportIndicatorJson[];
  emergency_actions: ReportEmergencyJson[];
  information_to_include: Array<{ protocol_id: string; protocol_title: string; fields: string[] }>;
  has_placeholders: boolean;
  /** El informe incluye lecturas sinteticas de demostracion (no mediciones reales). */
  has_demo: boolean;
  disclaimer: string;
}

export interface Report {
  text: string;
  json: ReportJson;
  hasPlaceholders: boolean;
  hasDemo: boolean;
}

export function buildReport(input: ReportInput): Report {
  const { content, environmentId, now, t } = input;
  const locale = input.locale ?? "en";
  const nowMs = now.getTime();
  const since = nowMs - (input.sinceMs ?? DEFAULT_REPORT_WINDOW_MS);

  const hm = (ts: number): string =>
    // 24 h: formato operativo, sin ambigüedad AM/PM para los flight surgeons.
    new Date(ts).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: input.timeZone });
  const dateTime = (ts: number): string =>
    new Date(ts).toLocaleString(locale, { dateStyle: "short", timeStyle: "short", hourCycle: "h23", timeZone: input.timeZone });

  const env = content.environments.find((e) => e.id === environmentId);
  if (!env) throw new Error(`buildReport: environment "${environmentId}" does not exist`);

  // ---- demora y ventana de respuesta
  const { min, max } = env.comm_delay_one_way_s;
  const delayText = formatDelay({ min, max }, t);
  const lo = min ?? max;
  const hi = max ?? min;
  let window: ReportJson["expected_answer_window"] = null;
  if (lo !== null && hi !== null) {
    const from = hm(nowMs + 2 * lo * 1000);
    const to = hm(nowMs + 2 * hi * 1000);
    window = { from, to, text: t("report.eta_window", { from, to }) };
  }
  const etaText = window ? window.text : t("report.eta_unknown");

  // ---- lecturas del período, por indicador
  const inPeriod = input.readings.filter((r) => r.timestamp >= since && r.timestamp <= nowMs);
  const indicatorById = new Map<string, Indicator>(content.indicators.map((i) => [i.id, i]));
  const usedIndicators = new Set<string>();
  const readingGroups: ReportIndicatorJson[] = [];

  for (const ind of content.indicators) {
    const list = readingsFor(inPeriod, ind.id);
    if (list.length === 0) continue;
    usedIndicators.add(ind.id);
    const items: ReportReadingJson[] = list.map((r) => ({
      timestamp: r.timestamp,
      time: hm(r.timestamp),
      value: r.value,
      value_text: formatValue(r.value),
      unit: ind.unit,
      status: statusOfReading(ind, r, content.environments, env),
      environment_id: r.environmentId,
    }));
    let trend: ReportTrendJson | null = null;
    const latest = items[0];
    if (items.length >= 2 && (latest.status === "attention" || latest.status === "critical")) {
      const prev = items[1];
      trend = {
        from: prev.value,
        to: latest.value,
        text: t("report.trend", { from: prev.value_text, to: latest.value_text }),
      };
    }
    readingGroups.push({ indicator_id: ind.id, name: ind.name, readings: items, trend });
  }

  // ---- log de emergencia (cronológico)
  const protocolById = new Map<string, Protocol>(content.protocols.map((p) => [p.id, p]));
  const usedProtocols: Protocol[] = [];
  const log = [...input.emergencyLog]
    .filter((e) => e.timestamp <= nowMs)
    .sort((a, b) => a.timestamp - b.timestamp);
  const emergency: ReportEmergencyJson[] = [];
  for (const entry of log) {
    const p = protocolById.get(entry.protocolId);
    if (!p) continue;
    if (!usedProtocols.includes(p)) usedProtocols.push(p);
    emergency.push({
      protocol_id: p.id,
      protocol_title: p.title,
      step_index: entry.stepIndex,
      step_text: plainDataText(p.steps[entry.stepIndex]?.text ?? "", t),
      timestamp: entry.timestamp,
      time: hm(entry.timestamp),
    });
  }
  const info = usedProtocols
    .filter((p) => p.report_fields.length > 0)
    .map((p) => ({ protocol_id: p.id, protocol_title: p.title, fields: p.report_fields }));

  // ---- advertencias
  const hasPlaceholders =
    env.status === "PLACEHOLDER" ||
    [...usedIndicators].some((id) => indicatorById.get(id)?.status === "PLACEHOLDER") ||
    usedProtocols.some((p) => p.status === "PLACEHOLDER");

  const hasDemo = inPeriod.some((r) => r.demo === true);

  const generatedText = t("report.generated_at", { time: dateTime(nowMs) });
  const json: ReportJson = {
    app_name: content.app.app_name,
    generated_at: { timestamp: nowMs, iso: now.toISOString(), text: generatedText },
    environment: { id: env.id, name: env.name },
    delay: { one_way_s: { min, max }, text: delayText },
    expected_answer_window: window,
    period: { since, until: nowMs },
    readings: readingGroups,
    emergency_actions: emergency,
    information_to_include: info,
    has_placeholders: hasPlaceholders,
    has_demo: hasDemo,
    disclaimer: content.app.disclaimer,
  };

  return { text: renderText(json, t, hasPlaceholders, etaText), json, hasPlaceholders, hasDemo };
}

function renderText(json: ReportJson, t: TFunction, hasPlaceholders: boolean, etaText: string): string {
  const lines: string[] = [];
  lines.push(`${json.app_name} — ${t("report.title")}`);
  lines.push(json.generated_at.text);
  lines.push(`${t("report.environment")}: ${json.environment.name}`);
  lines.push(`${t("report.delay")}: ${json.delay.text}`);
  lines.push(`${t("report.eta")}: ${etaText}`);

  lines.push("", t("report.readings").toUpperCase());
  if (json.readings.length === 0) {
    lines.push(t("report.readings.empty"));
  } else {
    for (const g of json.readings) {
      lines.push(g.name);
      for (const r of g.readings) {
        lines.push(`  ${r.value_text} ${r.unit} — ${t(`status.${r.status}`)} — ${r.time}`);
      }
      if (g.trend) lines.push(`  ${g.trend.text}`);
    }
  }

  lines.push("", t("report.emergency_log").toUpperCase());
  if (json.emergency_actions.length === 0) {
    lines.push(t("report.emergency_log.empty"));
  } else {
    for (const e of json.emergency_actions) {
      lines.push(`${e.protocol_title} — ${t("report.step", { n: e.step_index + 1, text: e.step_text })} — ${e.time}`);
    }
  }

  if (json.information_to_include.length > 0) {
    lines.push("", t("report.fields").toUpperCase());
    for (const p of json.information_to_include) {
      lines.push(p.protocol_title);
      for (const f of p.fields) lines.push(`  [ ] ${f}`);
    }
  }

  if (hasPlaceholders || json.has_demo) {
    lines.push("", t("report.warnings").toUpperCase());
    if (hasPlaceholders) lines.push(t("report.placeholder_warning"));
    if (json.has_demo) lines.push(t("report.demo_warning"));
  }
  lines.push("", `${t("disclaimer.label")}: ${json.disclaimer}`);
  return lines.join("\n");
}
