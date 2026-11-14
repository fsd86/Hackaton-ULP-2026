import { describe, expect, it } from "vitest";
import { isPlaceholderText, placeholderTopic, plainDataText } from "../../src/logic/placeholder";

const t = (key: string, vars?: Record<string, string | number>) => (vars ? `${key}:${JSON.stringify(vars)}` : key);

describe("placeholder text helper", () => {
  it("detects texts that start with the PLACEHOLDER marker", () => {
    expect(isPlaceholderText("PLACEHOLDER: how often to measure.")).toBe(true);
    expect(isPlaceholderText("  PLACEHOLDER")).toBe(true);
    expect(isPlaceholderText("Measure twice a day.")).toBe(false);
    expect(isPlaceholderText("PLACEHOLDERS are not a word here")).toBe(false);
    expect(isPlaceholderText(undefined)).toBe(false);
  });

  it("extracts the topic without the marker or trailing period", () => {
    expect(placeholderTopic("PLACEHOLDER: medication step.")).toBe("medication step");
    expect(placeholderTopic("PLACEHOLDER")).toBe("");
  });

  it("plain text never contains the raw marker", () => {
    expect(plainDataText("Real text.", t)).toBe("Real text.");
    expect(plainDataText("PLACEHOLDER: medication step.", t)).toBe('unverified.inline:{"topic":"medication step"}');
    expect(plainDataText("PLACEHOLDER", t)).toBe("unverified.note");
  });
});
