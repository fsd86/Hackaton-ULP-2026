import { z } from "zod";

// Esquemas de contenido. Única definición de tipos: z.infer. Ver docs/04-arquitectura.md §3.

export const Status = z.enum(["VERIFIED", "PLACEHOLDER"]); // calidad del dato
export const HealthStatus = z.enum(["normal", "attention", "critical"]);
export const Escalation = z.enum(["self", "crew", "ground"]); // a quién escalar
const SourceIds = z.array(z.string()).default([]);
const Comment = z.string().optional(); // "_comment" aceptado en cualquier nivel documentado

const VERIFIED_NEEDS_SOURCES = 'status "VERIFIED" requires at least one entry in source_ids';

function requireSourcesIfVerified(
  value: { status: "VERIFIED" | "PLACEHOLDER"; source_ids: string[] },
  ctx: z.RefinementCtx,
): void {
  if (value.status === "VERIFIED" && value.source_ids.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["source_ids"], message: VERIFIED_NEEDS_SOURCES });
  }
}

// ---- sources.json
export const Source = z
  .object({
    id: z.string().regex(/^[a-z0-9_]+$/, "id must match /^[a-z0-9_]+$/"),
    title: z.string(),
    publisher: z.string(),
    url: z.string(), // url real si VERIFIED
    accessed: z.string(), // YYYY-MM-DD si VERIFIED
    license: z.string().optional(),
    notes: z.string().optional(),
    status: Status,
  })
  .superRefine((s, ctx) => {
    if (s.status !== "VERIFIED") return;
    // new URL() acepta "PLACEHOLDER: ..." como esquema válido; exigimos http(s) explícito.
    if (!/^https?:\/\/\S+$/.test(s.url) || !z.string().url().safeParse(s.url).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["url"], message: 'status "VERIFIED" requires a real URL' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.accessed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["accessed"],
        message: 'status "VERIFIED" requires an access date in YYYY-MM-DD format',
      });
    }
  });
export const SourcesFile = z.object({ _comment: Comment, sources: z.array(Source) });

// ---- indicators.json
export const Range = z.object({
  status: HealthStatus,
  min: z.number().nullable(), // null = sin límite (o pendiente si PLACEHOLDER)
  max: z.number().nullable(),
  // Cortes exclusivos (ej. "<70" = max 70 + max_exclusive). Ausente = inclusivo.
  min_exclusive: z.boolean().optional(),
  max_exclusive: z.boolean().optional(),
  source_ids: SourceIds,
});

// min/max/step de Input son límites de plausibilidad de ENTRADA (parámetro de diseño), no umbrales médicos.
export const Input = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("number"),
    step: z.number().positive().default(1),
    min: z.number().optional(),
    max: z.number().optional(),
  }),
  z.object({
    kind: z.literal("pair"),
    labels: z.tuple([z.string(), z.string()]),
    step: z.number().positive().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    // true: el segundo valor debe ser menor que el primero (ej. diastólica < sistólica).
    second_lower_than_first: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("scale"),
    min: z.number(),
    max: z.number(),
    labels: z.record(z.string(), z.string()),
  }),
]);

export const Frequency = z.object({ every_hours: z.number().nullable(), label: z.string() });

export const Action = z.object({
  text: z.array(z.string()),
  escalation: Escalation,
  protocol_id: z.string().optional(),
});

export const Hazard = z.enum(["radiation", "isolation", "distance", "gravity", "environment"]);

// Iconos propios disponibles para las tarjetas de indicador (src/components/IndicatorIcon.tsx).
export const IndicatorIconName = z.enum(["heart", "gauge", "drop", "thermometer", "moon", "smile", "pulse"]);

// Zonas de la figura del cuerpo del tablero (DISENO de UI, no medico).
export const BodyZone = z.enum(["head", "chest", "abdomen", "arm", "body"]);

export const Indicator = z
  .object({
    id: z.string(),
    name: z.string(),
    unit: z.string(),
    category: z.string(),
    hazards: z.array(Hazard).default([]),
    // Zona de la figura del cuerpo donde se muestra el indicador (ausente = no aparece en la figura).
    body_zone: BodyZone.optional(),
    // Icono de la tarjeta del tablero (ausente = icono generico).
    icon: IndicatorIconName.optional(),
    input: Input,
    how_to_measure: z.array(z.string()),
    why_it_matters: z.string(),
    frequency: Frequency,
    ranges: z.array(Range),
    ranges_secondary: z.array(Range).optional(),
    // true: el indicador declara a propósito huecos entre rangos (la fuente no define ese tramo → "unknown").
    allow_gaps: z.boolean().optional(),
    actions: z.record(HealthStatus, Action),
    source_ids: SourceIds,
    status: Status,
  })
  .superRefine(requireSourcesIfVerified);
export const IndicatorsFile = z.object({ _comment: Comment, indicators: z.array(Indicator) });

// ---- environments.json
export const Environment = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    comm_delay_one_way_s: z.object({
      min: z.number().nullable(),
      max: z.number().nullable(),
      source_ids: SourceIds,
    }),
    available_equipment: z.array(z.string()),
    indicator_overrides: z
      .record(
        z.string(),
        z.object({
          frequency: Frequency.optional(),
          ranges: z.array(Range).optional(),
          note: z.string().optional(),
        }),
      )
      .default({}),
    status: Status,
  })
  .superRefine((e, ctx) => {
    if (e.status === "VERIFIED" && e.comm_delay_one_way_s.source_ids.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["comm_delay_one_way_s", "source_ids"],
        message: VERIFIED_NEEDS_SOURCES,
      });
    }
  });
export const EnvironmentsFile = z.object({ _comment: Comment, environments: z.array(Environment) });

// ---- protocols.json
export const Step = z.object({
  text: z.string(),
  detail: z.string().optional(),
  timer_s: z.number().optional(),
  check: z.boolean().default(true),
  source_ids: SourceIds,
});

export const Protocol = z
  .object({
    id: z.string(),
    title: z.string(),
    trigger: z.array(z.string()),
    escalation: Escalation,
    steps: z.array(Step).min(1),
    report_fields: z.array(z.string()).default([]),
    source_ids: SourceIds,
    status: Status,
  })
  .superRefine(requireSourcesIfVerified);
export const ProtocolsFile = z.object({ _comment: Comment, protocols: z.array(Protocol) });

// ---- hazards.json (los 5 hazards de NASA HRP: resumen con fuente; los nombres cortos viven en strings "hazard.<id>")
export const HazardInfo = z
  .object({
    id: Hazard,
    summary: z.string(),
    source_ids: SourceIds,
    status: Status,
  })
  .superRefine(requireSourcesIfVerified);
export const HazardsFile = z.object({ _comment: Comment, hazards: z.array(HazardInfo) });

// ---- config/app.json → hero (DISENO de UI, no medico): imagen del cuerpo del tablero y donde se anclan
// los puntos de zona, el halo y la plataforma. Todo en % de la imagen (0-100).
const Pct = z.number().min(0).max(100);
export const HeroConfig = z.object({
  _comment: Comment,
  image: z.string(),
  width: z.number().positive(),
  height: z.number().positive(),
  zone_anchors: z.record(BodyZone, z.tuple([Pct, Pct])),
  halo: z.object({ x: Pct, y: Pct, w: Pct }),
  platform: z.object({ x: Pct, y: Pct, w: Pct }),
});

// ---- config/app.json
export const AppConfig = z.object({
  _comment: Comment,
  app_name: z.string(),
  tagline: z.string(),
  default_language: z.literal("en"),
  default_environment: z.string(),
  theme: z.object({
    mode: z.enum(["dark", "light"]),
    accent: z.string(),
    // Tokens de superficie (CSS variables en <html>); ver _comment de config/app.json.
    surfaces: z.object({
      background: z.string(),
      panel: z.string(),
      panel_raised: z.string(),
      glass: z.string(),
      glass_border: z.string(),
      line: z.string(),
      text: z.string(),
      muted: z.string(),
    }),
    // z.object (no z.record): exige las 3 claves y da tipos no opcionales.
    status_colors: z.object({ normal: z.string(), attention: z.string(), critical: z.string() }),
    status_icons: z.object({ normal: z.string(), attention: z.string(), critical: z.string() }),
    // Fondo/texto del botón Emergency (contraste AA); status_colors.critical queda para íconos y bordes.
    emergency_button: z.object({ background: z.string(), text: z.string() }),
  }),
  // Flags soportados (todos cableados): charts, reminders, emergency_guide, downlink_report.
  features: z.object({
    _comment: Comment,
    charts: z.boolean(),
    reminders: z.boolean(),
    emergency_guide: z.boolean(),
    downlink_report: z.boolean(),
    // Primera visita: siembra la demo una sola vez (opcional; ausente = false).
    demo_on_first_visit: z.boolean().default(false),
  }),
  // Parámetro de DISEÑO (no médico).
  realtime_threshold_s: z.number(),
  // Parámetro de DISEÑO (no médico): edad máxima para reanudar sola una sesión de emergencia guardada.
  emergency_session_max_age_hours: z.number().positive(),
  disclaimer: z.string(),
  // Opcional: sin hero, el tablero dibuja el cuerpo SVG.
  hero: HeroConfig.optional(),
});

// ---- demo-readings.json (datos sinteticos de demostracion, no mediciones reales)
const demoNum = z.number().finite();
export const DemoReading = z.object({
  indicator_id: z.string(),
  // Antiguedad de la lectura al cargar la demo (minutos): valores relativos, la demo nunca queda "vieja".
  minutes_ago: z.number().finite().nonnegative(),
  value: z.union([demoNum, z.tuple([demoNum, demoNum])]),
});
export const DemoReadingsFile = z.object({ _comment: Comment, readings: z.array(DemoReading) });

// ---- config/strings.en.json
export const Strings = z.record(z.string(), z.string());

// ---- tipos
export type Status = z.infer<typeof Status>;
export type HealthStatus = z.infer<typeof HealthStatus>;
export type Escalation = z.infer<typeof Escalation>;
export type Source = z.infer<typeof Source>;
export type Range = z.infer<typeof Range>;
export type Input = z.infer<typeof Input>;
export type Frequency = z.infer<typeof Frequency>;
export type Action = z.infer<typeof Action>;
export type Indicator = z.infer<typeof Indicator>;
export type BodyZone = z.infer<typeof BodyZone>;
export type IndicatorIconName = z.infer<typeof IndicatorIconName>;
export type DemoReading = z.infer<typeof DemoReading>;
export type Environment = z.infer<typeof Environment>;
export type Step = z.infer<typeof Step>;
export type Protocol = z.infer<typeof Protocol>;
export type AppConfig = z.infer<typeof AppConfig>;
export type HeroConfig = z.infer<typeof HeroConfig>;
export type HazardInfo = z.infer<typeof HazardInfo>;
export type HazardId = z.infer<typeof Hazard>;
export type Strings = z.infer<typeof Strings>;
