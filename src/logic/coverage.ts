import type { Environment, Indicator, Protocol, Range } from "../content/schemas";
import { isPlaceholderText } from "./placeholder";

// Cobertura de fuentes POR DATO (función pura). El status de un indicador es PLACEHOLDER si cualquier parte
// le falta fuente, lo que esconde cuánto SÍ está verificado; acá se mira cada dato por separado.
//
// Cómo se adjuntan las fuentes hoy en data/*.json (regla honesta, sin inventar):
// - how_to_measure, why_it_matters, frequency y actions NO tienen source_ids propios: los respalda la lista
//   source_ids del indicador. Un dato de texto cuenta como "sourced" si el indicador cita ≥1 fuente, el dato
//   tiene texto y NINGUNO de sus textos empieza con el marcador PLACEHOLDER. Un texto vacío (p. ej. actions
//   sin líneas) cuenta como "unsourced": no hay nada verificado que mostrar.
// - frequency: se mira frequency.label (lo que ve el usuario). every_hours puede ser null o una decisión de
//   diseño declarada en el propio texto/_comment; no se evalúa por separado.
// - Cada rango (ranges y ranges_secondary) tiene sus propios source_ids: "sourced" si cita ≥1 fuente y define
//   al menos un borde (min o max no null). Un rango vacío significa que las fuentes no lo definen.
// - Protocolos: cada paso tiene source_ids propios; "sourced" si cita ≥1 fuente y ni text ni detail son placeholder.
// - Entornos: la demora de comunicación es "sourced" si cita ≥1 fuente y define min o max.
// Límite conocido: que un texto tenga fuente a nivel indicador no prueba que CADA frase venga de esa fuente;
// eso lo audita docs/research. Esta función solo refleja lo que declaran los JSON.

export type DatumState = "sourced" | "unsourced";

export interface Tally {
  sourced: number;
  total: number;
}

export interface RangeDatum {
  set: "primary" | "secondary";
  status: Range["status"];
  state: DatumState;
}

export interface ActionDatum {
  status: string;
  state: DatumState;
}

export interface IndicatorCoverage {
  id: string;
  name: string;
  how_to_measure: DatumState;
  why_it_matters: DatumState;
  frequency: DatumState;
  ranges: Tally & { items: RangeDatum[] };
  actions: Tally & { items: ActionDatum[] };
  /** Suma de todos los datos del indicador. */
  tally: Tally;
}

export interface ProtocolCoverage {
  id: string;
  title: string;
  steps: Tally & { items: DatumState[] };
}

export interface EnvironmentCoverage {
  id: string;
  name: string;
  delay: DatumState;
}

export interface CoverageReport {
  indicators: IndicatorCoverage[];
  protocols: ProtocolCoverage[];
  environments: EnvironmentCoverage[];
  totals: { indicators: Tally; protocols: Tally; environments: Tally; all: Tally };
}

const state = (ok: boolean): DatumState => (ok ? "sourced" : "unsourced");

function tally(states: DatumState[]): Tally {
  return { sourced: states.filter((s) => s === "sourced").length, total: states.length };
}

function add(...ts: Tally[]): Tally {
  return ts.reduce((a, b) => ({ sourced: a.sourced + b.sourced, total: a.total + b.total }), { sourced: 0, total: 0 });
}

/** Texto(s) respaldado(s) por las fuentes del indicador: hay fuentes, hay texto y nada es placeholder. */
function textBacked(hasSources: boolean, texts: string[]): DatumState {
  return state(hasSources && texts.length > 0 && texts.every((t) => t.trim() !== "" && !isPlaceholderText(t)));
}

function rangeState(r: Range): DatumState {
  return state(r.source_ids.length > 0 && (r.min !== null || r.max !== null));
}

export function indicatorCoverage(ind: Indicator): IndicatorCoverage {
  const hasSources = ind.source_ids.length > 0;
  const how = textBacked(hasSources, ind.how_to_measure);
  const why = textBacked(hasSources, [ind.why_it_matters]);
  const freq = textBacked(hasSources, [ind.frequency.label]);
  const rangeItems: RangeDatum[] = [
    ...ind.ranges.map((r) => ({ set: "primary" as const, status: r.status, state: rangeState(r) })),
    ...(ind.ranges_secondary ?? []).map((r) => ({ set: "secondary" as const, status: r.status, state: rangeState(r) })),
  ];
  const actionItems: ActionDatum[] = Object.entries(ind.actions).map(([status, a]) => ({
    status,
    state: textBacked(hasSources, a?.text ?? []),
  }));
  const ranges = { ...tally(rangeItems.map((r) => r.state)), items: rangeItems };
  const actions = { ...tally(actionItems.map((a) => a.state)), items: actionItems };
  return {
    id: ind.id,
    name: ind.name,
    how_to_measure: how,
    why_it_matters: why,
    frequency: freq,
    ranges,
    actions,
    tally: add(tally([how, why, freq]), ranges, actions),
  };
}

export function protocolCoverage(p: Protocol): ProtocolCoverage {
  const items = p.steps.map((s) =>
    state(s.source_ids.length > 0 && !isPlaceholderText(s.text) && !isPlaceholderText(s.detail)),
  );
  return { id: p.id, title: p.title, steps: { ...tally(items), items } };
}

export function environmentCoverage(env: Environment): EnvironmentCoverage {
  const d = env.comm_delay_one_way_s;
  return { id: env.id, name: env.name, delay: state(d.source_ids.length > 0 && (d.min !== null || d.max !== null)) };
}

export function buildCoverage(input: {
  indicators: Indicator[];
  protocols: Protocol[];
  environments: Environment[];
}): CoverageReport {
  const indicators = input.indicators.map(indicatorCoverage);
  const protocols = input.protocols.map(protocolCoverage);
  const environments = input.environments.map(environmentCoverage);
  const ti = add(...indicators.map((i) => i.tally));
  const tp = add(...protocols.map((p) => p.steps));
  const te = tally(environments.map((e) => e.delay));
  return { indicators, protocols, environments, totals: { indicators: ti, protocols: tp, environments: te, all: add(ti, tp, te) } };
}
