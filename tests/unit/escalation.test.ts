import { describe, expect, it } from "vitest";
import { ESCALATION_MESSAGE_KEYS, escalate } from "../../src/logic/escalation";
import strings from "../../config/strings.en.json";
import { makeEnv } from "./helpers";

// Demoras y umbral sintéticos, solo para probar la lógica.
const config = { realtime_threshold_s: 10 };
const now = new Date("2030-01-01T12:00:00Z");
const actions = {
  normal: { text: ["x"], escalation: "self" as const },
  attention: { text: ["x"], escalation: "crew" as const },
  critical: { text: ["x"], escalation: "ground" as const, protocol_id: "p1" },
};
const envWithDelay = (min: number | null, max: number | null) =>
  makeEnv({ comm_delay_one_way_s: { min, max, source_ids: [] } });

describe("escalate", () => {
  it("high delay + ground → act now with ETA = now + 2 × delay", () => {
    const r = escalate("critical", actions, envWithDelay(240, 1440), config, now);
    expect(r.level).toBe("ground");
    expect(r.messageKey).toBe("escalation.ground.act_now");
    expect(r.eta?.earliest.getTime()).toBe(now.getTime() + 2 * 240 * 1000);
    expect(r.eta?.latest.getTime()).toBe(now.getTime() + 2 * 1440 * 1000);
    expect(r.protocolId).toBe("p1");
  });

  it("null delay → conservative message, no ETA", () => {
    const r = escalate("critical", actions, envWithDelay(null, null), config, now);
    expect(r.messageKey).toBe("escalation.ground.unknown_delay");
    expect(r.eta).toBeUndefined();
  });

  it("low delay → contact ground, no ETA", () => {
    const r = escalate("critical", actions, envWithDelay(1, 3), config, now);
    expect(r.messageKey).toBe("escalation.ground.contact");
    expect(r.eta).toBeUndefined();
  });

  it("delay equal to threshold is not 'high'", () => {
    expect(escalate("critical", actions, envWithDelay(5, 10), config, now).messageKey).toBe(
      "escalation.ground.contact",
    );
  });

  it("self and crew levels ignore delay", () => {
    const env = envWithDelay(240, 1440);
    expect(escalate("normal", actions, env, config, now)).toMatchObject({ level: "self", messageKey: "escalation.self" });
    expect(escalate("attention", actions, env, config, now)).toMatchObject({ level: "crew", messageKey: "escalation.crew" });
  });

  it("unknown status → unknown message", () => {
    expect(escalate("unknown", actions, envWithDelay(1, 2), config, now).messageKey).toBe("escalation.unknown");
  });

  it("every message key exists in strings.en.json", () => {
    for (const key of ESCALATION_MESSAGE_KEYS) expect(strings).toHaveProperty([key]);
  });
});
