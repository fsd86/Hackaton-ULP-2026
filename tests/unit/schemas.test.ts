import { describe, expect, it } from "vitest";
import { formatPath, validateContent, type ContentError } from "../../src/content/load";
import { createT } from "../../src/content/t";
import { realRaw } from "./helpers";

function errorsOf(raw: ReturnType<typeof realRaw>): ContentError[] {
  const r = validateContent(raw);
  if (r.ok) throw new Error("expected validation to fail");
  return r.errors;
}

// Acceso laxo a los objetos crudos para romperlos.
type Loose = any; // eslint-disable-line @typescript-eslint/no-explicit-any

describe("real content files", () => {
  it("validate OK", () => {
    const r = validateContent(realRaw());
    if (!r.ok) throw new Error(JSON.stringify(r.errors, null, 2));
    expect(r.content.indicators).toHaveLength(6);
    expect(r.content.environments.map((e) => e.id)).toContain("remote_clinic_earth");
    expect(r.content.protocols[0].steps.length).toBeGreaterThanOrEqual(3);
  });
});

describe("broken content", () => {
  it("unknown source_id in an indicator range", () => {
    const raw = realRaw();
    (raw.indicators as Loose).indicators[2].ranges[0].source_ids = ["nope"];
    const errs = errorsOf(raw);
    expect(errs).toContainEqual(
      expect.objectContaining({ file: "data/indicators.json", path: "indicators[2].ranges[0].source_ids[0]" }),
    );
  });

  it("overlapping ranges", () => {
    const raw = realRaw();
    const ranges = (raw.indicators as Loose).indicators[0].ranges;
    ranges[0].min = 0;
    ranges[0].max = 50;
    ranges[1].min = 40;
    ranges[1].max = 60;
    const errs = errorsOf(raw);
    expect(errs).toContainEqual(
      expect.objectContaining({ file: "data/indicators.json", path: "indicators[0].ranges[1]" }),
    );
  });

  it("touching ranges are allowed", () => {
    const raw = realRaw();
    const ranges = (raw.indicators as Loose).indicators[0].ranges;
    ranges[0].min = 0;
    ranges[0].max = 50;
    ranges[1].min = 50;
    ranges[1].max = 60;
    expect(validateContent(raw).ok).toBe(true);
  });

  it("VERIFIED without sources", () => {
    const raw = realRaw();
    (raw.indicators as Loose).indicators[1].status = "VERIFIED";
    const errs = errorsOf(raw);
    expect(errs).toContainEqual(
      expect.objectContaining({ file: "data/indicators.json", path: "indicators[1].source_ids" }),
    );
  });

  it("VERIFIED source needs real url and date", () => {
    const raw = realRaw();
    (raw.sources as Loose).sources[0].status = "VERIFIED";
    const paths = errorsOf(raw).map((e) => `${e.file}:${e.path}`);
    expect(paths).toContain("data/sources.json:sources[0].url");
    expect(paths).toContain("data/sources.json:sources[0].accessed");
  });

  it("missing required field", () => {
    const raw = realRaw();
    delete (raw.environments as Loose).environments[1].name;
    const errs = errorsOf(raw);
    expect(errs).toContainEqual(
      expect.objectContaining({ file: "data/environments.json", path: "environments[1].name" }),
    );
  });

  it("unknown protocol_id, default_environment and override key", () => {
    const raw = realRaw();
    (raw.indicators as Loose).indicators[0].actions.critical.protocol_id = "ghost";
    (raw.app as Loose).default_environment = "mars_surface";
    (raw.environments as Loose).environments[0].indicator_overrides = { ghost_indicator: { note: "x" } };
    const paths = errorsOf(raw).map((e) => `${e.file}:${e.path}`);
    expect(paths).toContain("data/indicators.json:indicators[0].actions.critical.protocol_id");
    expect(paths).toContain("config/app.json:default_environment");
    expect(paths).toContain("data/environments.json:environments[0].indicator_overrides.ghost_indicator");
  });

  it("missing escalation string key", () => {
    const raw = realRaw();
    delete (raw.strings as Loose)["escalation.ground.act_now"];
    expect(errorsOf(raw)).toContainEqual(
      expect.objectContaining({ file: "config/strings.en.json", path: "escalation.ground.act_now" }),
    );
  });
});

describe("helpers", () => {
  it("formatPath", () => {
    expect(formatPath(["indicators", 2, "ranges", 0, "min"])).toBe("indicators[2].ranges[0].min");
    expect(formatPath([])).toBe("(root)");
  });

  it("t interpolates and fails on missing keys in strict mode", () => {
    const t = createT({ a: "Hello {name}!" }, { strict: true });
    expect(t("a", { name: "crew" })).toBe("Hello crew!");
    expect(() => t("missing")).toThrow(/missing/);
  });
});
