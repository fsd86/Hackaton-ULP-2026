import type { Action, AppConfig, Environment, Escalation, HealthStatus } from "../content/schemas";
import type { EvalStatus } from "./evaluate";

/** Claves de strings.en.json que esta lógica puede devolver (load.ts verifica que existan). */
export const ESCALATION_MESSAGE_KEYS = [
  "escalation.self",
  "escalation.crew",
  "escalation.ground.contact",
  "escalation.ground.act_now",
  "escalation.ground.unknown_delay",
  "escalation.unknown",
] as const;
export type EscalationMessageKey = (typeof ESCALATION_MESSAGE_KEYS)[number];

export interface EscalationResult {
  level: Escalation;
  messageKey: EscalationMessageKey;
  protocolId?: string;
  /** Solo en "act now, then report": ventana estimada de la respuesta de tierra. */
  eta?: { earliest: Date; latest: Date };
}

/**
 * status + actions del indicador + entorno + config → nivel y mensaje de escalamiento.
 * Si el nivel es ground y la demora máxima supera config.realtime_threshold_s:
 * "act now, then report" con ETA = ahora + 2 × demora (min/max). Demora nula → mensaje conservador.
 */
export function escalate(
  status: EvalStatus,
  actions: Partial<Record<HealthStatus, Action>>,
  env: Pick<Environment, "comm_delay_one_way_s">,
  config: Pick<AppConfig, "realtime_threshold_s">,
  now: Date = new Date(),
): EscalationResult {
  if (status === "unknown") return { level: "self", messageKey: "escalation.unknown" };

  const action = actions[status];
  const level: Escalation = action?.escalation ?? (status === "normal" ? "self" : "ground");
  const protocolId = action?.protocol_id;
  const base = protocolId ? { protocolId } : {};

  if (level === "self") return { level, messageKey: "escalation.self", ...base };
  if (level === "crew") return { level, messageKey: "escalation.crew", ...base };

  const { min, max } = env.comm_delay_one_way_s;
  if (max === null && min === null) {
    return { level, messageKey: "escalation.ground.unknown_delay", ...base };
  }
  const maxS = max ?? (min as number);
  const minS = min ?? maxS;
  if (maxS > config.realtime_threshold_s) {
    return {
      level,
      messageKey: "escalation.ground.act_now",
      eta: {
        earliest: new Date(now.getTime() + 2 * minS * 1000),
        latest: new Date(now.getTime() + 2 * maxS * 1000),
      },
      ...base,
    };
  }
  return { level, messageKey: "escalation.ground.contact", ...base };
}
