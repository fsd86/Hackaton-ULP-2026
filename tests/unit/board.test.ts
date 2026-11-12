import { describe, expect, it } from "vitest";
import { buildBoard } from "../../src/logic/board";
import type { Reading } from "../../src/storage/local";
import { makeEnv, makeIndicator } from "./helpers";

// Datos sintéticos, solo para probar la lógica.
const H = 3_600_000;
const NOW = 1_000 * H;

const a = makeIndicator({ id: "a", frequency: { every_hours: 24, label: "daily" } });
const b = makeIndicator({ id: "b", frequency: { every_hours: null, label: "none" }, status: "VERIFIED", source_ids: ["x"] });
const c = makeIndicator({ id: "c", frequency: { every_hours: 24, label: "daily" } });
const d = makeIndicator({ id: "d", frequency: { every_hours: 24, label: "daily" } });
const env = makeEnv();

function rd(indicatorId: string, value: number, ageH = 1, environmentId = env.id): Reading {
  return { id: `${indicatorId}-${ageH}`, indicatorId, value, environmentId, timestamp: NOW - ageH * H };
}

describe("buildBoard", () => {
  const content = { indicators: [a, b, c, d], environments: [env] };

  it("orders critical, attention, unknown, normal, no data; counts and overall", () => {
    const board = buildBoard({
      content,
      environmentId: env.id,
      readings: [rd("a", 15), rd("b", 99), rd("c", 5)], // normal, critical, unknown (fuera de rangos)
      now: NOW,
    });
    expect(board.entries.map((e) => e.indicatorId)).toEqual(["b", "c", "a", "d"]);
    expect(board.entries.map((e) => e.status)).toEqual(["critical", "unknown", "normal", "unknown"]);
    expect(board.counts).toEqual({ normal: 1, attention: 0, critical: 1, unknown: 1, noData: 1 });
    expect(board.overall).toBe("critical");
    expect(board.needsAttention).toEqual(["b"]);
    expect(board.entries[0]!.placeholder).toBe(false);
    expect(board.entries[2]!.placeholder).toBe(true);
  });

  it("puts critical before attention in needsAttention", () => {
    const board = buildBoard({
      content,
      environmentId: env.id,
      readings: [rd("a", 25), rd("c", 99)],
      now: NOW,
    });
    expect(board.needsAttention).toEqual(["c", "a"]);
    expect(board.overall).toBe("critical");
  });

  it("is noData with no readings; everything with a frequency is due, the rest has no frequency", () => {
    const board = buildBoard({ content, environmentId: env.id, readings: [], now: NOW });
    expect(board.overall).toBe("noData");
    expect(board.counts.noData).toBe(4);
    expect(board.dueNow).toEqual(["a", "c", "d"]);
    expect(board.noFrequency).toEqual(["b"]);
    expect(board.entries.map((e) => e.indicatorId)).toEqual(["a", "b", "c", "d"]);
  });

  it("due: frequency null is no_frequency (never due, never ok); others expire after every_hours", () => {
    const board = buildBoard({
      content,
      environmentId: env.id,
      readings: [rd("a", 15, 25), rd("b", 15, 500), rd("c", 15, 2)],
      now: NOW,
    });
    expect(board.dueNow).toEqual(["a", "d"]);
    expect(board.noFrequency).toEqual(["b"]);
    expect(board.entries.find((e) => e.indicatorId === "c")!.due).toBe("ok");
    expect(board.entries.find((e) => e.indicatorId === "b")!.due).toBe("no_frequency");
  });

  it("uses the environment override of the reading for status and the current one for frequency", () => {
    const strict = makeEnv({
      id: "strict",
      indicator_overrides: {
        a: {
          ranges: [{ status: "critical", min: 0, max: 100, source_ids: [] }],
          frequency: { every_hours: 1, label: "hourly" },
        },
      },
    });
    const cont = { indicators: [a], environments: [env, strict] };
    const board = buildBoard({
      content: cont,
      environmentId: "strict",
      readings: [rd("a", 15, 2, env.id)],
      now: NOW,
    });
    expect(board.entries[0]!.status).toBe("normal"); // evaluada con el entorno de la lectura
    expect(board.entries[0]!.due).toBe("due"); // frecuencia del entorno actual (1 h)
    const board2 = buildBoard({
      content: cont,
      environmentId: "strict",
      readings: [rd("a", 15, 2, "strict")],
      now: NOW,
    });
    expect(board2.entries[0]!.status).toBe("critical");
  });
});
