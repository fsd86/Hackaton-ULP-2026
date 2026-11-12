import type { Environment, Indicator } from "../content/schemas";
import type { Reading } from "../storage/local";
import { evaluate, type EvalStatus } from "./evaluate";
import { isDue, readingsFor } from "./daily";

export interface BoardContent {
  indicators: Indicator[];
  environments: Environment[];
}

export interface BoardEntry {
  indicatorId: string;
  /** Estado de la última lectura (evaluada con el entorno en que se tomó); "unknown" si no hay lectura. */
  status: EvalStatus;
  lastReading?: Reading;
  due: boolean;
  /** El indicador tiene datos sin verificar (status PLACEHOLDER). */
  placeholder: boolean;
}

export interface BoardCounts {
  normal: number;
  attention: number;
  critical: number;
  unknown: number;
  noData: number;
}

export type BoardOverall = "critical" | "attention" | "unknown" | "normal" | "noData";

export interface Board {
  /** Ordenado: critical, attention, unknown, normal, sin datos (estable por orden del JSON). */
  entries: BoardEntry[];
  counts: BoardCounts;
  /** attention + critical, critical primero. */
  needsAttention: string[];
  dueNow: string[];
  overall: BoardOverall;
}

export interface BuildBoardInput {
  content: BoardContent;
  environmentId: string;
  readings: Reading[];
  now: number;
}

// Menor = peor.
const RANK: Record<BoardOverall, number> = { critical: 0, attention: 1, unknown: 2, normal: 3, noData: 4 };

export function buildBoard({ content, environmentId, readings, now }: BuildBoardInput): Board {
  const currentEnv: Environment | undefined = content.environments.find((e) => e.id === environmentId);
  const dueEnv = currentEnv ?? { indicator_overrides: {} };

  const counts: BoardCounts = { normal: 0, attention: 0, critical: 0, unknown: 0, noData: 0 };
  const indexed = content.indicators.map((ind, index) => {
    const last = readingsFor(readings, ind.id)[0];
    let status: EvalStatus = "unknown";
    let rank: number = RANK.noData;
    if (last) {
      const env = content.environments.find((e) => e.id === last.environmentId) ?? dueEnv;
      status = evaluate(ind, last.value, env);
      rank = RANK[status];
      counts[status] += 1;
    } else {
      counts.noData += 1;
    }
    const entry: BoardEntry = {
      indicatorId: ind.id,
      status,
      due: isDue(ind, dueEnv, readings, now),
      placeholder: ind.status === "PLACEHOLDER",
    };
    if (last) entry.lastReading = last;
    return { entry, rank, index };
  });

  indexed.sort((a, b) => a.rank - b.rank || a.index - b.index);
  const entries = indexed.map((x) => x.entry);

  const needsAttention = entries
    .filter((e) => e.status === "critical" || e.status === "attention")
    .map((e) => e.indicatorId);
  const dueNow = content.indicators
    .map((i) => i.id)
    .filter((id) => entries.find((e) => e.indicatorId === id)?.due);

  let overall: BoardOverall = "noData";
  for (const x of indexed) {
    if (x.entry.lastReading && x.rank < RANK[overall]) overall = x.entry.status as BoardOverall;
  }

  return { entries, counts, needsAttention, dueNow, overall };
}
