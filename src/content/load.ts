import type { z } from "zod";
import sourcesRaw from "../../data/sources.json";
import indicatorsRaw from "../../data/indicators.json";
import environmentsRaw from "../../data/environments.json";
import protocolsRaw from "../../data/protocols.json";
import appRaw from "../../config/app.json";
import stringsRaw from "../../config/strings.en.json";
import { ESCALATION_MESSAGE_KEYS } from "../logic/escalation";
import {
  AppConfig,
  EnvironmentsFile,
  IndicatorsFile,
  ProtocolsFile,
  SourcesFile,
  Strings,
  type Environment,
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
}

export interface RawContent {
  sources: unknown;
  indicators: unknown;
  environments: unknown;
  protocols: unknown;
  app: unknown;
  strings: unknown;
}

export type LoadResult = { ok: true; content: Content } | { ok: false; errors: ContentError[] };

export const FILES = {
  sources: "data/sources.json",
  indicators: "data/indicators.json",
  environments: "data/environments.json",
  protocols: "data/protocols.json",
  app: "config/app.json",
  strings: "config/strings.en.json",
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

function checkOverlap(ranges: Range[], file: string, base: Array<string | number>, errors: ContentError[]): void {
  const numeric = ranges
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => r.min !== null || r.max !== null);
  for (const { r, i } of numeric) {
    if (r.min !== null && r.max !== null && r.min > r.max) {
      errors.push({ file, path: formatPath([...base, i, "min"]), message: `min (${r.min}) is greater than max (${r.max})` });
    }
  }
  for (let a = 0; a < numeric.length; a++) {
    for (let b = a + 1; b < numeric.length; b++) {
      const x = numeric[a];
      const y = numeric[b];
      const xLo = x.r.min ?? -Infinity;
      const xHi = x.r.max ?? Infinity;
      const yLo = y.r.min ?? -Infinity;
      const yHi = y.r.max ?? Infinity;
      // Se permite tocar en el borde (ej. normal hasta 100, attention desde 100); evaluate() toma el más severo.
      if (xLo < yHi && yLo < xHi) {
        errors.push({
          file,
          path: formatPath([...base, y.i]),
          message: `range overlaps with the range at index ${x.i} (status "${x.r.status}")`,
        });
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
    checkOverlap(ind.ranges, FILES.indicators, [...base, "ranges"], errors);
    checkOverlap(ind.ranges_secondary ?? [], FILES.indicators, [...base, "ranges_secondary"], errors);
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
        checkOverlap(override.ranges, FILES.environments, [...obase, "ranges"], errors);
      }
    }
  });

  protocols.forEach((p, i) => {
    const base: Array<string | number> = ["protocols", i];
    checkSources(p.source_ids, FILES.protocols, base);
    p.steps.forEach((s, k) => checkSources(s.source_ids, FILES.protocols, [...base, "steps", k]));
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
  return { ok: true, content: { sources, indicators, environments, protocols, app, strings } };
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
  });
  return cached;
}
