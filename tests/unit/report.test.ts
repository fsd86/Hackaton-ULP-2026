import { describe, expect, it } from "vitest";
import type { Content } from "../../src/content/load";
import { createT } from "../../src/content/t";
import { buildReport, type ReportInput } from "../../src/logic/report";

const strings: Record<string, string> = {
  "report.title": "Downlink report",
  "report.generated_at": "Generated at {time}",
  "report.environment": "Environment",
  "report.delay": "One-way delay",
  "report.eta": "Expected answer window",
  "report.readings": "Readings",
  "report.readings.empty": "No readings recorded",
  "report.emergency_log": "Emergency actions",
  "report.emergency_log.empty": "No emergency actions logged",
  "report.fields": "Information to include",
  "report.placeholder_warning": "Placeholder data included.",
  "report.eta_unknown": "Unknown",
  "report.eta_window": "{from} to {to}",
  "report.trend": "Trend: {from} → {to}",
  "report.step": "Step {n}: {text}",
  "report.warnings": "Warnings",
  "disclaimer.label": "Disclaimer",
  "status.normal": "Normal",
  "status.attention": "Attention",
  "status.critical": "Critical",
  "status.unknown": "Unknown",
  "environment.delay.unknown": "Delay unknown",
  "environment.delay.near_realtime": "Near real time",
  "environment.delay.single": "{min} min",
  "environment.delay.range": "{min} to {max} min",
};
const t = createT(strings, { strict: true });

const action = { text: [], escalation: "self" as const };
function makeContent(opts: { indStatus?: "VERIFIED" | "PLACEHOLDER"; delay?: { min: number | null; max: number | null } } = {}): Content {
  const status = opts.indStatus ?? "VERIFIED";
  return {
    sources: [],
    strings,
    app: { app_name: "TestApp", disclaimer: "Not medical advice." } as Content["app"],
    indicators: [
      {
        id: "hr",
        name: "Heart rate",
        unit: "bpm",
        category: "vitals",
        hazards: [],
        input: { kind: "number", step: 1 },
        how_to_measure: [],
        why_it_matters: "",
        frequency: { every_hours: 24, label: "daily" },
        ranges: [
          { status: "normal", min: 0, max: 100, source_ids: [] },
          { status: "attention", min: 100, max: 150, source_ids: [] },
          { status: "critical", min: 150, max: null, source_ids: [] },
        ],
        actions: { normal: action, attention: action, critical: action },
        source_ids: [],
        status,
      },
    ],
    environments: [
      {
        id: "env",
        name: "Test Env",
        description: "",
        comm_delay_one_way_s: { min: opts.delay ? opts.delay.min : 180, max: opts.delay ? opts.delay.max : 1320, source_ids: [] },
        available_equipment: [],
        indicator_overrides: {},
        status: "VERIFIED",
      },
    ],
    protocols: [
      {
        id: "p1",
        title: "Protocol One",
        trigger: [],
        escalation: "crew",
        steps: [
          { text: "First step", check: true, source_ids: [] },
          { text: "Second step", check: true, source_ids: [] },
        ],
        report_fields: ["Onset time", "Symptoms"],
        source_ids: [],
        status: "VERIFIED",
      },
    ],
  };
}

const NOW = new Date(Date.UTC(2026, 0, 10, 12, 0, 0));
const H = 3_600_000;

function run(over: Partial<ReportInput> = {}) {
  return buildReport({
    content: makeContent(),
    environmentId: "env",
    readings: [],
    emergencyLog: [],
    now: NOW,
    t,
    locale: "en",
    timeZone: "UTC",
    ...over,
  });
}

const reading = (id: string, hoursAgo: number, value: number) => ({
  id,
  indicatorId: "hr",
  value,
  environmentId: "env",
  timestamp: NOW.getTime() - hoursAgo * H,
});

describe("buildReport", () => {
  it("computes the expected answer window from a 180-1320 s delay", () => {
    const r = run();
    expect(r.json.expected_answer_window).toMatchObject({ from: "12:06", to: "12:44" });
    expect(r.text).toContain("Expected answer window: 12:06 to 12:44");
    expect(r.text).toContain("One-way delay: 3 to 22 min");
  });

  it("uses the unknown text when the delay is null", () => {
    const r = run({ content: makeContent({ delay: { min: null, max: null } }) });
    expect(r.json.expected_answer_window).toBeNull();
    expect(r.text).toContain("Expected answer window: Unknown");
    expect(r.text).toContain("Delay unknown");
  });

  it("excludes readings outside the period", () => {
    const r = run({ readings: [reading("a", 1, 70), reading("b", 30, 71)] });
    expect(r.json.readings).toHaveLength(1);
    expect(r.json.readings[0].readings).toHaveLength(1);
    expect(r.json.readings[0].readings[0].value).toBe(70);
    const custom = run({ readings: [reading("a", 1, 70), reading("b", 30, 71)], sinceMs: 48 * H });
    expect(custom.json.readings[0].readings).toHaveLength(2);
  });

  it("adds a trend line for attention/critical indicators with 2+ readings", () => {
    const r = run({ readings: [reading("a", 5, 110), reading("b", 1, 120)] });
    const g = r.json.readings[0];
    expect(g.readings[0].value).toBe(120); // más reciente primero
    expect(g.readings[0].status).toBe("attention");
    expect(g.trend).toMatchObject({ from: 110, to: 120 });
    expect(r.text).toContain("Trend: 110 → 120");
  });

  it("has no trend for normal readings or a single reading", () => {
    expect(run({ readings: [reading("a", 5, 60), reading("b", 1, 70)] }).json.readings[0].trend).toBeNull();
    expect(run({ readings: [reading("a", 1, 120)] }).json.readings[0].trend).toBeNull();
  });

  it("lists the emergency log chronologically with report_fields", () => {
    const r = run({
      emergencyLog: [
        { protocolId: "p1", stepIndex: 1, timestamp: NOW.getTime() - 10 * 60_000 },
        { protocolId: "p1", stepIndex: 0, timestamp: NOW.getTime() - 20 * 60_000 },
      ],
    });
    expect(r.json.emergency_actions.map((e) => e.step_index)).toEqual([0, 1]);
    expect(r.text.indexOf("Step 1: First step")).toBeLessThan(r.text.indexOf("Step 2: Second step"));
    expect(r.json.information_to_include[0].fields).toEqual(["Onset time", "Symptoms"]);
    expect(r.text).toContain("[ ] Onset time");
    expect(r.text).toContain("Protocol One");
  });

  it("flags placeholders only when a used item is PLACEHOLDER", () => {
    const ph = makeContent({ indStatus: "PLACEHOLDER" });
    expect(run({ content: ph }).hasPlaceholders).toBe(false); // sin lecturas no se usa
    const withReading = run({ content: ph, readings: [reading("a", 1, 70)] });
    expect(withReading.hasPlaceholders).toBe(true);
    expect(withReading.json.has_placeholders).toBe(true);
    expect(withReading.text).toContain("Placeholder data included.");
    const clean = run({ readings: [reading("a", 1, 70)] });
    expect(clean.hasPlaceholders).toBe(false);
    expect(clean.text).not.toContain("Placeholder data included.");
  });

  it("shows the empty-readings string and always ends with the disclaimer", () => {
    const r = run();
    expect(r.text).toContain("No readings recorded");
    expect(r.text).toContain("No emergency actions logged");
    expect(r.text.trimEnd().endsWith("Disclaimer: Not medical advice.")).toBe(true);
  });
});
