import type { Consult, Environment, HazardInfo, Indicator, Protocol, Range, Source } from "../content/schemas";

// "Cited by": qué entidades de data/ citan cada fuente. Función pura.

export type CitationKind =
  | "indicator"
  | "range"
  | "range_secondary"
  | "override_range"
  | "protocol"
  | "step"
  | "environment_delay"
  | "hazard"
  | "consult_help"
  | "consult_symptom"
  | "consult_question"
  | "baseline";

export interface Citation {
  kind: CitationKind;
  /** id del indicador / protocolo / entorno dueño de la cita. */
  ownerId: string;
  ownerName: string;
  /** Solo rangos: estado del rango citado. */
  rangeStatus?: string;
  /** Solo pasos: índice 0-based. */
  stepIndex?: number;
  /** Solo override_range: entorno que define el override. */
  environmentName?: string;
}

export interface CitationInput {
  sources: Pick<Source, "id">[];
  indicators: Indicator[];
  environments: Environment[];
  protocols: Protocol[];
  /** Opcional: los 5 hazards de data/hazards.json. ownerName es el id; la vista lo traduce con hazard.<id>. */
  hazards?: HazardInfo[];
  /** Opcional: data/consult.json (ayudas, síntomas y preguntas del One-shot consult). */
  consult?: Consult | null;
  /** Opcional: fuentes del texto "why a personal baseline" (config/app.json baseline.source_ids). */
  baselineSourceIds?: string[];
}

/** Devuelve un mapa sourceId → citas (todas las fuentes aparecen, con [] si nadie las cita). */
export function buildCitations(input: CitationInput): Record<string, Citation[]> {
  const out: Record<string, Citation[]> = {};
  for (const s of input.sources) out[s.id] = [];
  const add = (sourceId: string, c: Citation): void => {
    (out[sourceId] ??= []).push(c);
  };

  for (const ind of input.indicators) {
    for (const id of ind.source_ids) add(id, { kind: "indicator", ownerId: ind.id, ownerName: ind.name });
    const ranges = (list: Range[] | undefined, kind: "range" | "range_secondary") => {
      for (const r of list ?? []) {
        for (const id of r.source_ids) {
          add(id, { kind, ownerId: ind.id, ownerName: ind.name, rangeStatus: r.status });
        }
      }
    };
    ranges(ind.ranges, "range");
    ranges(ind.ranges_secondary, "range_secondary");
  }

  for (const env of input.environments) {
    for (const id of env.comm_delay_one_way_s.source_ids) {
      add(id, { kind: "environment_delay", ownerId: env.id, ownerName: env.name });
    }
    for (const [indId, override] of Object.entries(env.indicator_overrides)) {
      const ind = input.indicators.find((i) => i.id === indId);
      for (const r of override.ranges ?? []) {
        for (const id of r.source_ids) {
          add(id, {
            kind: "override_range",
            ownerId: indId,
            ownerName: ind?.name ?? indId,
            rangeStatus: r.status,
            environmentName: env.name,
          });
        }
      }
    }
  }

  for (const p of input.protocols) {
    for (const id of p.source_ids) add(id, { kind: "protocol", ownerId: p.id, ownerName: p.title });
    p.steps.forEach((step, i) => {
      for (const id of step.source_ids) add(id, { kind: "step", ownerId: p.id, ownerName: p.title, stepIndex: i });
    });
  }

  for (const h of input.hazards ?? []) {
    for (const id of h.source_ids) add(id, { kind: "hazard", ownerId: h.id, ownerName: h.id });
  }

  const consult = input.consult;
  if (consult) {
    for (const h of consult.help) for (const id of h.source_ids) add(id, { kind: "consult_help", ownerId: h.id, ownerName: h.id });
    for (const sy of consult.symptoms) for (const id of sy.source_ids) add(id, { kind: "consult_symptom", ownerId: sy.id, ownerName: sy.label });
    for (const set of consult.question_sets) {
      set.questions.forEach((q, i) => {
        for (const id of q.source_ids) add(id, { kind: "consult_question", ownerId: set.id, ownerName: set.title, stepIndex: i });
      });
    }
  }

  for (const id of input.baselineSourceIds ?? []) add(id, { kind: "baseline", ownerId: "baseline", ownerName: "" });

  return out;
}

export interface VerificationSummary {
  sources: { verified: number; placeholder: number };
  indicators: { verified: number; placeholder: number };
  protocols: { verified: number; placeholder: number };
  environments: { verified: number; placeholder: number };
}

function count(items: Array<{ status: "VERIFIED" | "PLACEHOLDER" }>): { verified: number; placeholder: number } {
  const verified = items.filter((i) => i.status === "VERIFIED").length;
  return { verified, placeholder: items.length - verified };
}

export function summarizeVerification(input: {
  sources: Pick<Source, "status">[];
  indicators: Pick<Indicator, "status">[];
  protocols: Pick<Protocol, "status">[];
  environments: Pick<Environment, "status">[];
}): VerificationSummary {
  return {
    sources: count(input.sources),
    indicators: count(input.indicators),
    protocols: count(input.protocols),
    environments: count(input.environments),
  };
}
