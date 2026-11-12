import { describe, expect, it } from "vitest";
import { isRouteEnabled, visibleNav, type Features } from "../../src/logic/features";
import { labelFor } from "../../src/logic/labels";

describe("labelFor", () => {
  it("uses the string when present and falls back to the id", () => {
    expect(labelFor({ "category.general": "General" }, "category", "general")).toBe("General");
    expect(labelFor({}, "category", "unknown_cat")).toBe("unknown_cat");
  });
});

const on: Features = { charts: true, reminders: true, emergency_guide: true, downlink_report: true };

describe("features", () => {
  it("shows every nav entry except Emergency (header) when all flags are on", () => {
    expect(visibleNav(on).map((r) => r.id)).toEqual(["home", "check", "report", "sources"]);
  });

  it("hides the report entry when downlink_report is off", () => {
    expect(visibleNav({ ...on, downlink_report: false }).map((r) => r.id)).toEqual(["home", "check", "sources"]);
  });

  it("emergency_guide off never adds Emergency to the nav and disables the route", () => {
    const off = { ...on, emergency_guide: false };
    expect(visibleNav(off).map((r) => r.id)).not.toContain("emergency");
    expect(isRouteEnabled("emergency", off)).toBe(false);
    expect(isRouteEnabled("emergency", on)).toBe(true);
  });

  it("other routes are always enabled", () => {
    const off = { ...on, emergency_guide: false, downlink_report: false };
    expect(isRouteEnabled("home", off)).toBe(true);
    expect(isRouteEnabled("check", off)).toBe(true);
    expect(isRouteEnabled("sources", off)).toBe(true);
    expect(isRouteEnabled("report", off)).toBe(false);
  });
});
