import { BodyZone } from "../content/schemas";
import type { EvalStatus } from "./evaluate";

/** Zonas de la figura, en el orden en que se recorren (las define el esquema de data/indicators.json). */
export const BODY_ZONE_IDS = BodyZone.options;
export type BodyZoneId = (typeof BODY_ZONE_IDS)[number];

/** "nodata" = el indicador no tiene ninguna lectura. */
export type ZoneStatus = EvalStatus | "nodata";

export interface ZoneSummary {
  zone: BodyZoneId;
  indicatorIds: string[];
  /** Peor estado entre los indicadores con lectura; "nodata" solo si ninguno tiene lectura. */
  worst: ZoneStatus;
}

// Mayor = peor. "unknown" (sin umbral verificado) pesa mas que normal: no se puede afirmar que esta bien.
const RANK: Record<ZoneStatus, number> = { nodata: 0, normal: 1, unknown: 2, attention: 3, critical: 4 };

export function worstZoneStatus(statuses: ZoneStatus[]): ZoneStatus {
  return statuses.reduce<ZoneStatus>((a, b) => (RANK[b] > RANK[a] ? b : a), "nodata");
}

/**
 * Agrupa indicadores por body_zone y calcula el peor estado de cada zona. Funcion pura.
 * Solo devuelve zonas con al menos un indicador, en el orden de BODY_ZONE_IDS.
 */
export function groupByZone(
  indicators: ReadonlyArray<{ id: string; body_zone?: BodyZoneId | undefined }>,
  statusOf: (indicatorId: string) => ZoneStatus,
): ZoneSummary[] {
  const out: ZoneSummary[] = [];
  for (const zone of BODY_ZONE_IDS) {
    const ids = indicators.filter((i) => i.body_zone === zone).map((i) => i.id);
    if (ids.length === 0) continue;
    out.push({ zone, indicatorIds: ids, worst: worstZoneStatus(ids.map(statusOf)) });
  }
  return out;
}
