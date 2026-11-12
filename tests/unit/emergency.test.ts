import { describe, expect, it } from "vitest";
import { formatAgo, formatElapsed, isSessionStale } from "../../src/logic/emergency";

describe("formatElapsed", () => {
  it("uses mm:ss under one hour", () => {
    expect(formatElapsed(0)).toBe("00:00");
    expect(formatElapsed(59.9)).toBe("00:59");
    expect(formatElapsed(3599)).toBe("59:59");
  });
  it("uses h:mm:ss from one hour", () => {
    expect(formatElapsed(3600)).toBe("1:00:00");
    expect(formatElapsed(3 * 3600 + 5 * 60 + 7)).toBe("3:05:07");
    expect(formatElapsed(86399)).toBe("23:59:59");
  });
  it("uses Xd hh:mm from 24 h", () => {
    expect(formatElapsed(86400)).toBe("1d 00:00");
    expect(formatElapsed(3 * 86400 + 3)).toBe("3d 00:00");
    expect(formatElapsed(2 * 86400 + 7 * 3600 + 9 * 60, "j")).toBe("2j 07:09");
  });
  it("clamps negative and non-finite input", () => {
    expect(formatElapsed(-5)).toBe("00:00");
    expect(formatElapsed(Number.NaN)).toBe("00:00");
  });
});

describe("isSessionStale", () => {
  const now = 1_000_000_000_000;
  it("is fresh within the max age", () => {
    expect(isSessionStale(now - 3_600_000, now, 12)).toBe(false);
    expect(isSessionStale(now - 12 * 3_600_000, now, 12)).toBe(false);
  });
  it("is stale beyond the max age, in the future or invalid", () => {
    expect(isSessionStale(now - 12 * 3_600_000 - 1, now, 12)).toBe(true);
    expect(isSessionStale(now + 1000, now, 12)).toBe(true);
    expect(isSessionStale(Number.NaN, now, 12)).toBe(true);
  });
});

describe("formatAgo", () => {
  const u = { day: "d", hour: "h", minute: "min" };
  it("formats minutes, hours and days", () => {
    expect(formatAgo(12 * 60_000, u)).toBe("12min");
    expect(formatAgo((5 * 60 + 10) * 60_000, u)).toBe("5h 10min");
    expect(formatAgo((3 * 24 + 2) * 3_600_000, u)).toBe("3d 2h");
  });
});
