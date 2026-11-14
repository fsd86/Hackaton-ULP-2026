import sources from "../../data/sources.json";
import indicators from "../../data/indicators.json";
import environments from "../../data/environments.json";
import protocols from "../../data/protocols.json";
import hazards from "../../data/hazards.json";
import app from "../../config/app.json";
import strings from "../../config/strings.en.json";
import type { RawContent } from "../../src/content/load";
import type { Environment, Indicator } from "../../src/content/schemas";

/** Copia profunda de los JSON reales para romperlos en tests sin tocar los originales. */
export function realRaw(): RawContent {
  return structuredClone({ sources, indicators, environments, protocols, app, strings, hazards }) as RawContent;
}

/** Indicador sintético (datos de prueba, NO médicos). */
export function makeIndicator(partial: Partial<Indicator> = {}): Indicator {
  return {
    id: "test_ind",
    name: "Test indicator",
    unit: "u",
    category: "test",
    hazards: [],
    input: { kind: "number", step: 1 },
    how_to_measure: ["step"],
    why_it_matters: "why",
    frequency: { every_hours: null, label: "label" },
    ranges: [
      { status: "normal", min: 10, max: 20, source_ids: [] },
      { status: "attention", min: 20, max: 30, source_ids: [] },
      { status: "critical", min: 30, max: null, source_ids: [] },
    ],
    actions: {},
    source_ids: [],
    status: "PLACEHOLDER",
    ...partial,
  };
}

export function makeEnv(partial: Partial<Environment> = {}): Environment {
  return {
    id: "test_env",
    name: "Test env",
    description: "desc",
    comm_delay_one_way_s: { min: null, max: null, source_ids: [] },
    available_equipment: [],
    indicator_overrides: {},
    status: "PLACEHOLDER",
    ...partial,
  };
}
