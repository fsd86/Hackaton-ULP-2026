import type { z } from "zod";
import sourcesRaw from "../../data/sources.json";
import indicatorsRaw from "../../data/indicators.json";
import environmentsRaw from "../../data/environments.json";
import protocolsRaw from "../../data/protocols.json";
import demoRaw from "../../data/demo-readings.json";
import hazardsRaw from "../../data/hazards.json";
import appRaw from "../../config/app.json";
import stringsRaw from "../../config/strings.en.json";
import { ESCALATION_MESSAGE_KEYS } from "../logic/escalation";
import { resolveToken, templateTokens } from "../logic/indicatorText";
import {
  AppConfig,
  DemoReadingsFile,
  EnvironmentsFile,
  HazardsFile,
  IndicatorsFile,
  ProtocolsFile,
  SourcesFile,
  Strings,
  type DemoReading,
  type Environment,
  type HazardInfo,
  type Indicator,
  type Protocol,
  type Range,
  type Source,
} from "./schemas";

export interface ContentError {
  file: string;
  path: string;
  message: string;
}

export interface Content {
  sources: Source[];
  indicators: Indicator[];
  environments: Environment[];
  protocols: Protocol[];
  app: AppConfig;
  strings: Strings;
  /** Lecturas sinteticas de data/demo-readings.json ([] si el archivo no se entrega). */
  demoReadings: DemoReading[];
  /** Los 5 hazards de NASA HRP con resumen y fuente ([] si el archivo no se entrega). */
  hazards: HazardInfo[];
}

export interface RawContent {
  sources: unknown;
  indicators: unknown;
  environments: unknown;
  protocols: unknown;
  app: unknown;
  strings: unknown;
  /** Opcional: los tests antiguos no lo pasan. */
  demoReadings?: unknown;
  /** Opcional: los tests antiguos no lo pasan. */
  hazards?: unknown;
}

export type LoadResult = { ok: true; content: Content } | { ok: false; errors: ContentError[] };

export const FILES = {
  sources: "data/sources.json",
  indicators: "data/indicators.json",
  environments: "data/environments.json",
  protocols: "data/protocols.json",
  app: "config/app.json",
  strings: "config/strings.en.json",
  demoReadings: "data/demo-readings.json",
  hazards: "data/hazards.json",
} as const;

/** ["indicators", 2, "ranges", 0, "min"] → "indicators[2].ranges[0].min" */
export function formatPath(path: ReadonlyArray<string | number>): string {
  if (path.length === 0) return "(root)";
  return path.reduce<string>((acc, seg) => {
    if (typeof seg === "number") return `${acc}[${seg}]`;
    return acc ? `${acc}.${seg}` : seg;
  }, "");
}

function parseFile<S extends z.ZodTypeAny>(
  schema: S,
  raw: unknown,
  file: string,
  errors: ContentError[],
): z.infer<S> | undefined {
  const result = schema.safeParse(raw);
  if (result.success) return result.data as z.infer<S>;
  for (const issue of result.error.issues) {
    errors.push({ file, path: formatPath(issue.path), message: issue.message });
  }
  return undefined;
}

/**
 * Cobertura de rangos numéricos (los de min y max nulos se ignoran). Ordenados por min, dos consecutivos deben
 * tocarse exactamente (max == min siguiente) con exactamente un borde exclusivo. Solape → error.
 * Hueco → error salvo allowGaps (el hueco evalúa "unknown" a propósito).
 */
function checkRanges(
  ranges: Range[],
  file: string,
  base: Array<string | number>,
  errors: ContentError[],
  allowGaps: boolean,
): void {
  const numeric = ranges
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => r.min !== null || r.max !== null);
  for (const { r, i } of numeric) {
    if (r.min !== null && r.max !== null && r.min > r.max) {
      errors.push({ file, path: formatPath([...base, i, "min"]), message: `min (${r.min}) is greater than max (${r.max}); swap or fix the values` });
    }
  }
  const sorted = [...numeric].sort((p, q) => (p.r.min ?? -Infinity) - (q.r.min ?? -Infinity));
  for (let k = 0; k < sorted.length - 1; k++) {
    const x = sorted[k]!;
    const y = sorted[k + 1]!;
    const overlap = (): void => {
      errors.push({
        file,
        path: formatPath([...base, y.i]),
        message: `range overlaps with the range at index ${x.i} (status "${x.r.status}"); fix min/max so that they only touch`,
      });
    };
    if (x.r.max === null || y.r.min === null) {
      overlap();
      continue;
    }
    const where = formatPath([...base, y.i, "min"]);
    if (x.r.max > y.r.min) {
      overlap();
    } else if (x.r.max < y.r.min) {
      if (!allowGaps) {
        errors.push({
          file,
          path: where,
          message: `gap between ${x.r.max} (range ${x.i}) and ${y.r.min} (range ${y.i}); make them touch, or set "allow_gaps": true on the indicator if the source does not define that stretch`,
        });
      }
    } else if (Boolean(x.r.max_exclusive) === Boolean(y.r.min_exclusive)) {
      errors.push({
        file,
        path: where,
        message: `ranges ${x.i} and ${y.i} touch at ${y.r.min} and ${y.r.min_exclusive ? "both" : "neither"} edge is exclusive; exactly one of max_exclusive (range ${x.i}) and min_exclusive (range ${y.i}) must be true`,
      });
    }
  }
}

function collectTexts(ind: Indicator): Array<{ text: string; path: Array<string | number> }> {
  const out: Array<{ text: string; path: Array<string | number> }> = [];
  out.push({ text: ind.why_it_matters, path: ["why_it_matters"] });
  ind.how_to_measure.forEach((text, k) => out.push({ text, path: ["how_to_measure", k] }));
  for (const [status, action] of Object.entries(ind.actions)) {
    action.text.forEach((text, k) => out.push({ text, path: ["actions", status, "text", k] }));
  }
  return out;
}

/** Toda plantilla {…} debe resolver (base y cada override de entorno de este indicador). */
function checkTemplates(
  ind: Indicator,
  base: Array<string | number>,
  environments: Environment[],
  errors: ContentError[],
): void {
  const contexts: Array<{ env: Environment | undefined; label: string }> = [{ env: undefined, label: "" }];
  for (const env of environments) {
    if (env.indicator_overrides[ind.id]?.ranges) contexts.push({ env, label: ` (with ranges overridden by environment "${env.id}")` });
  }
  for (const { text, path } of collectTexts(ind)) {
    for (const token of templateTokens(text)) {
      for (const { env, label } of contexts) {
        if (resolveToken(token, ind, env) === undefined) {
          errors.push({
            file: FILES.indicators,
            path: formatPath([...base, ...path]),
            message: `template {${token}} cannot be resolved${label}; use {unit}, {range.<status>.min|max} or {range2.<status>.min|max}, and make sure exactly one range with that status has that edge`,
          });
          break;
        }
      }
    }
  }
}

/** Valida los objetos crudos: esquemas + referencias cruzadas. Función pura (testeable con datos rotos). */
export function validateContent(raw: RawContent): LoadResult {
  const errors: ContentError[] = [];

  const sourcesFile = parseFile(SourcesFile, raw.sources, FILES.sources, errors);
  const indicatorsFile = parseFile(IndicatorsFile, raw.indicators, FILES.indicators, errors);
  const environmentsFile = parseFile(EnvironmentsFile, raw.environments, FILES.environments, errors);
  const protocolsFile = parseFile(ProtocolsFile, raw.protocols, FILES.protocols, errors);
  const app = parseFile(AppConfig, raw.app, FILES.app, errors);
  const strings = parseFile(Strings, raw.strings, FILES.strings, errors);
  const demoFile =
    raw.demoReadings === undefined ? { readings: [] as DemoReading[] } : parseFile(DemoReadingsFile, raw.demoReadings, FILES.demoReadings, errors);

  const hazardsFile =
    raw.hazards === undefined ? { hazards: [] as HazardInfo[] } : parseFile(HazardsFile, raw.hazards, FILES.hazards, errors);

  if (!demoFile || !hazardsFile) return { ok: false, errors };
  if (!sourcesFile || !indicatorsFile || !environmentsFile || !protocolsFile || !app || !strings) {
    return { ok: false, errors };
  }

  const sources = sourcesFile.sources;
  const indicators = indicatorsFile.indicators;
  const environments = environmentsFile.environments;
  const protocols = protocolsFile.protocols;

  const uniqueIds = (items: Array<{ id: string }>, file: string, key: string) => {
    const seen = new Set<string>();
    items.forEach((item, i) => {
      if (seen.has(item.id)) {
        errors.push({ file, path: formatPath([key, i, "id"]), message: `duplicate id "${item.id}"` });
      }
      seen.add(item.id);
    });
  };
  uniqueIds(sources, FILES.sources, "sources");
  uniqueIds(indicators, FILES.indicators, "indicators");
  uniqueIds(environments, FILES.environments, "environments");
  uniqueIds(protocols, FILES.protocols, "protocols");
  uniqueIds(hazardsFile.hazards, FILES.hazards, "hazards");

  const sourceIds = new Set(sources.map((s) => s.id));
  const protocolIds = new Set(protocols.map((p) => p.id));
  const indicatorIds = new Set(indicators.map((i) => i.id));
  const environmentIds = new Set(environments.map((e) => e.id));

  const checkSources = (ids: string[], file: string, base: Array<string | number>) => {
    ids.forEach((id, k) => {
      if (!sourceIds.has(id)) {
        errors.push({
          file,
          path: formatPath([...base, "source_ids", k]),
          message: `source_id "${id}" does not exist in ${FILES.sources}`,
        });
      }
    });
  };
  const checkRangeSources = (ranges: Range[], file: string, base: Array<string | number>) => {
    ranges.forEach((r, j) => checkSources(r.source_ids, file, [...base, j]));
  };

  indicators.forEach((ind, i) => {
    const base: Array<string | number> = ["indicators", i];
    checkSources(ind.source_ids, FILES.indicators, base);
    checkRangeSources(ind.ranges, FILES.indicators, [...base, "ranges"]);
    checkRangeSources(ind.ranges_secondary ?? [], FILES.indicators, [...base, "ranges_secondary"]);
    checkRanges(ind.ranges, FILES.indicators, [...base, "ranges"], errors, ind.allow_gaps === true);
    checkRanges(ind.ranges_secondary ?? [], FILES.indicators, [...base, "ranges_secondary"], errors, ind.allow_gaps === true);
    checkTemplates(ind, base, environments, errors);
    for (const [status, action] of Object.entries(ind.actions)) {
      if (action.protocol_id !== undefined && !protocolIds.has(action.protocol_id)) {
        errors.push({
          file: FILES.indicators,
          path: formatPath([...base, "actions", status, "protocol_id"]),
          message: `protocol_id "${action.protocol_id}" does not exist in ${FILES.protocols}`,
        });
      }
    }
  });

  environments.forEach((env, i) => {
    const base: Array<string | number> = ["environments", i];
    checkSources(env.comm_delay_one_way_s.source_ids, FILES.environments, [...base, "comm_delay_one_way_s"]);
    const { min, max } = env.comm_delay_one_way_s;
    if (min !== null && max !== null && min > max) {
      errors.push({
        file: FILES.environments,
        path: formatPath([...base, "comm_delay_one_way_s", "min"]),
        message: `min (${min}) is greater than max (${max})`,
      });
    }
    for (const [indId, override] of Object.entries(env.indicator_overrides)) {
      const obase = [...base, "indicator_overrides", indId];
      if (!indicatorIds.has(indId)) {
        errors.push({
          file: FILES.environments,
          path: formatPath(obase),
          message: `indicator "${indId}" does not exist in ${FILES.indicators}`,
        });
      }
      if (override.ranges) {
        checkRangeSources(override.ranges, FILES.environments, [...obase, "ranges"]);
        const allowGaps = indicators.find((x) => x.id === indId)?.allow_gaps === true;
        checkRanges(override.ranges, FILES.environments, [...obase, "ranges"], errors, allowGaps);
      }
    }
  });

  protocols.forEach((p, i) => {
    const base: Array<string | number> = ["protocols", i];
    checkSources(p.source_ids, FILES.protocols, base);
    p.steps.forEach((s, k) => checkSources(s.source_ids, FILES.protocols, [...base, "steps", k]));
  });

  hazardsFile.hazards.forEach((h, i) => checkSources(h.source_ids, FILES.hazards, ["hazards", i]));

  demoFile.readings.forEach((r, i) => {
    const ind = indicators.find((x) => x.id === r.indicator_id);
    if (!ind) {
      errors.push({
        file: FILES.demoReadings,
        path: formatPath(["readings", i, "indicator_id"]),
        message: `indicator "${r.indicator_id}" does not exist in ${FILES.indicators}`,
      });
    } else if (Array.isArray(r.value) !== (ind.input.kind === "pair")) {
      errors.push({
        file: FILES.demoReadings,
        path: formatPath(["readings", i, "value"]),
        message: `value shape does not match the input kind "${ind.input.kind}" of indicator "${ind.id}"`,
      });
    }
  });

  if (!environmentIds.has(app.default_environment)) {
    errors.push({
      file: FILES.app,
      path: "default_environment",
      message: `default_environment "${app.default_environment}" does not exist in ${FILES.environments}`,
    });
  }

  for (const key of ESCALATION_MESSAGE_KEYS) {
    if (!(key in strings)) {
      errors.push({ file: FILES.strings, path: key, message: `missing string key required by the escalation logic` });
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, content: { sources, indicators, environments, protocols, app, strings, demoReadings: demoFile.readings, hazards: hazardsFile.hazards } };
}

let cached: LoadResult | undefined;

/** Carga el contenido empaquetado en build (imports JSON de Vite) y lo valida. */
export function loadContent(): LoadResult {
  cached ??= validateContent({
    sources: sourcesRaw,
    indicators: indicatorsRaw,
    environments: environmentsRaw,
    protocols: protocolsRaw,
    app: appRaw,
    strings: stringsRaw,
    demoReadings: demoRaw,
    hazards: hazardsRaw,
  });
  return cached;
}
