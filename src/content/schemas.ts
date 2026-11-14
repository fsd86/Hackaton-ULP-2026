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
  // Notas (texto de UI, con fuente en source_ids) que se muestran solo cuando la lectura cae en ESTE rango
  // (p. ej. "bajo" vs "alto" dentro del mismo estado attention).
  notes: z.array(z.string()).optional(),
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

// design_choice: la frecuencia es una decisión de DISEÑO de la app, no de una fuente (no cuenta como dato con fuente).
export const Frequency = z.object({ every_hours: z.number().nullable(), label: z.string(), design_choice: z.boolean().optional() });

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
    // true: los rangos/acciones son una referencia de la Tierra sin valor especifico de vuelo; la UI muestra
    // el aviso "reference.earth" junto a rangos y acciones.
    earth_reference: z.boolean().optional(),
    // Aclaracion propia del indicador que acompana al aviso (p. ej. "solo en ayunas"); texto con fuente.
    reference_note: z.string().optional(),
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
  // true: el paso sigue una guia de la Tierra (sin valor especifico de vuelo); la UI muestra el aviso.
  earth_reference: z.boolean().optional(),
  // Paso que deriva a otro protocolo (p. ej. "pasar a Crewmate collapsed"); el loader valida que exista.
  link_protocol_id: z.string().optional(),
  source_ids: SourceIds,
});

// Nota informativa del protocolo (contexto, sin temporizador ni paso que marcar), con su fuente.
export const ProtocolNote = z
  .object({
    text: z.string(),
    earth_reference: z.boolean().optional(),
    source_ids: SourceIds,
    status: Status.default("VERIFIED"),
  })
  .superRefine(requireSourcesIfVerified);

export const Protocol = z
  .object({
    id: z.string(),
    title: z.string(),
    trigger: z.array(z.string()),
    // true: los disparadores son señales descritas por guias de la Tierra; la UI muestra el aviso.
    trigger_earth_reference: z.boolean().optional(),
    escalation: Escalation,
    steps: z.array(Step).min(1),
    report_fields: z.array(z.string()).default([]),
    notes: z.array(ProtocolNote).optional(),
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
  // Mapa de calor: radio (en % del ancho de la imagen) del resplandor de cada zona segun su peor estado.
  heat_radius: Pct.default(16),
  // Zoom del panel "Zone details": recorte ampliado de la MISMA imagen centrado en el ancla de la zona.
  // scale = aumento (<= 1: imagen entera); aspect = ancho/alto del recuadro; zone_scale pisa scale por zona.
  zoom: z
    .object({
      scale: z.number().positive().max(8),
      aspect: z.number().positive().max(4),
      zone_scale: z.record(BodyZone, z.number().positive().max(8)).default({}),
    })
    .optional(),
});

// ---- config/app.json → hud (DISENO de UI, no medico): graficos decorativos del tablero.
const Bpm = z.number().positive().max(400);
export const HudConfig = z
  .object({
    _comment: Comment,
    pulse_trace: z
      .object({
        // Indicador cuya ultima lectura marca el ritmo del dibujo (null = sin traza).
        indicator_id: z.string().nullable(),
        // Ritmo del dibujo sin lectura y limites de velocidad de la animacion (no son umbrales medicos).
        idle_bpm: Bpm,
        min_bpm: Bpm,
        max_bpm: Bpm,
      })
      .refine((p) => p.min_bpm <= p.max_bpm, { message: "min_bpm must be <= max_bpm", path: ["min_bpm"] }),
    // Extrapolacion lineal punteada en los graficos de tendencia (DISENO, no medico; sin umbrales ni cruces).
    projection: z
      .object({
        _comment: Comment,
        enabled: z.boolean(),
        horizon_hours: z.number().positive().max(24 * 30),
        min_points: z.number().int().min(2),
      })
      .default({ enabled: false, horizon_hours: 24, min_points: 4 }),
  })
  .default({
    pulse_trace: { indicator_id: null, idle_bpm: 60, min_bpm: 40, max_bpm: 160 },
    projection: { enabled: false, horizon_hours: 24, min_points: 4 },
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
    // Acentos calidos junto al cian (marcos, detalles); como texto solo sobre superficies oscuras (AA).
    warm: z
      .object({ accent: z.string(), hot: z.string(), glow: z.string() })
      .default({ accent: "#FF9447", hot: "#FF5A5F", glow: "rgba(255, 148, 71, 0.35)" }),
    // Fondo espacial generado por codigo (sin imagenes): estrellas y arco del horizonte terrestre.
    space: z
      .object({
        stars: z.string(),
        star_count: z.number().int().min(0).max(600),
        horizon: z.string(),
        horizon_rim: z.string(),
      })
      .default({ stars: "#DCEBFF", star_count: 160, horizon: "#0A2A5C", horizon_rim: "#6FD3FF" }),
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
    // Boton "Guided demo" del tablero (data/guided-demo.json). Opcional; ausente = false.
    guided_demo: z.boolean().default(false),
  }),
  // Parámetro de DISEÑO (no médico).
  realtime_threshold_s: z.number(),
  // Parámetro de DISEÑO (no médico): edad máxima para reanudar sola una sesión de emergencia guardada.
  emergency_session_max_age_hours: z.number().positive(),
  disclaimer: z.string(),
  // Opcional: sin hero, el tablero dibuja el cuerpo SVG.
  hero: HeroConfig.optional(),
  hud: HudConfig,
  // One-shot consult: parametro de DISENO (no medico) del contador "Avoids up to N round trips"; ver _comment.
  consult: z
    .object({
      _comment: Comment,
      round_trips_per_answered_set: z.number().int().positive(),
    })
    .default({ round_trips_per_answered_set: 1 }),
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

// ---- guided-demo.json (guion del modo "Guided demo" para grabar el video; no es contenido medico)
// Las acciones usan los ids de "scenario" (una sola fuente); el loader verifica que existan.
export const GuidedDemoAction = z.discriminatedUnion("type", [
  z.object({ type: z.literal("set_environment") }),
  z.object({ type: z.literal("select_alert_zone") }),
  z.object({ type: z.literal("open_protocol") }),
  z.object({ type: z.literal("mark_step_done") }),
]);
export const GuidedDemoStep = z.object({
  _comment: Comment,
  id: z.string().min(1),
  // Hash de la vista ("#/", "#/emergency/<protocol_id>", "#/report"...).
  route: z.string().regex(/^#\/[A-Za-z0-9_\-/]*$/, 'route must be a hash like "#/" or "#/report"'),
  // Selector CSS del elemento a destacar (null = sin destacado). Admite {zone} y {indicator} del escenario.
  target: z.string().min(1).nullable(),
  // Clave de config/strings.en.json; admite {environment}, {indicator}, {status}, {zone} y {protocol}.
  caption_key: z.string().min(1),
  duration_ms: z.number().int().min(1000).max(60_000),
  action: GuidedDemoAction.optional(),
});
export const GuidedDemoFile = z.object({
  _comment: Comment,
  // Parametro de DISENO (no medico): duracion total pensada para el video; debe ser la suma de los pasos.
  design_total_duration_ms: z.number().int().positive(),
  scenario: z.object({
    environment_id: z.string().min(1),
    alert_indicator_id: z.string().min(1),
    protocol_id: z.string().min(1),
  }),
  steps: z.array(GuidedDemoStep).min(1),
});

// ---- consult.json (One-shot consult del Downlink report; ver docs/research/5-verificacion.md "Listo para cargar")
// design_text: texto de DISENO (UX) sin fuente; si no es design_text, exige al menos una fuente.
function sourcedOrDesign(value: { design_text?: boolean; source_ids: string[] }, ctx: z.RefinementCtx): void {
  if (value.design_text === true && value.source_ids.length > 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["source_ids"], message: "design_text items are design text (UX) and must not cite sources" });
  }
  if (value.design_text !== true && value.source_ids.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["source_ids"],
      message: 'needs at least one source in source_ids, or "design_text": true if it is design text (UX)',
    });
  }
}

const ConsultId = z.string().regex(/^[a-z0-9_]+$/, "id must match /^[a-z0-9_]+$/");

export const ConsultHelp = z
  .object({
    _comment: Comment,
    id: ConsultId,
    // notice: aviso fijo; top: arriba del formulario; why: desplegable; module: ayuda de un set (help_id); after: tras enviar.
    placement: z.enum(["notice", "top", "why", "module", "after"]),
    text: z.string().min(1),
    earth_reference: z.boolean().optional(),
    design_text: z.boolean().optional(),
    source_ids: SourceIds,
  })
  .superRefine(sourcedOrDesign);

export const ConsultAnswer = z.discriminatedUnion("type", [
  z.object({ type: z.literal("free_text") }),
  z.object({ type: z.literal("choice"), options: z.array(z.string().min(1)).min(2), with_text: z.boolean().optional() }),
  z.object({ type: z.literal("time"), with_text: z.boolean().optional() }),
  z.object({ type: z.literal("scale_0_10"), anchors: z.object({ min_label: z.string().min(1), max_label: z.string().min(1) }) }),
  z.object({
    type: z.literal("auto"),
    // Lo completa la app desde sus datos: hora actual, ultimas lecturas, entorno + retardo.
    fill: z.enum(["timestamp", "latest_readings", "mission_context"]),
    with_text: z.boolean().optional(),
  }),
]);

export const ConsultSkipIf = z.union([
  z.object({ answered: z.string().min(1) }).strict(),
  z.object({ set_active: z.string().min(1) }).strict(),
]);

export const ConsultQuestion = z
  .object({
    _comment: Comment,
    id: ConsultId,
    text: z.string().min(1),
    answer: ConsultAnswer,
    skip_if: ConsultSkipIf.optional(),
    earth_reference: z.boolean().optional(),
    design_text: z.boolean().optional(),
    source_ids: SourceIds,
  })
  .superRefine(sourcedOrDesign);

export const ConsultQuestionSet = z.object({
  _comment: Comment,
  id: ConsultId,
  // Titulo del modulo: etiqueta de UI (diseno), no afirmacion.
  title: z.string().min(1),
  help_id: z.string().optional(),
  questions: z.array(ConsultQuestion).min(1),
});

export const ConsultSymptom = z
  .object({
    _comment: Comment,
    id: ConsultId,
    label: z.string().min(1),
    // Ids de question_sets, en el orden en que se preguntan.
    modules: z.array(z.string()).min(1),
    // Protocolo a abrir ANTES del formulario (p. ej. dolor de pecho); el loader valida que exista.
    open_protocol_id: z.string().optional(),
    earth_reference: z.boolean().optional(),
    design_text: z.boolean().optional(),
    source_ids: SourceIds,
  })
  .superRefine(sourcedOrDesign);

export const ConsultFile = z.object({
  _comment: Comment,
  help: z.array(ConsultHelp),
  symptoms: z.array(ConsultSymptom).min(1),
  question_sets: z.array(ConsultQuestionSet).min(1),
});

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
export type ProtocolNote = z.infer<typeof ProtocolNote>;
export type AppConfig = z.infer<typeof AppConfig>;
export type HeroConfig = z.infer<typeof HeroConfig>;
export type HudConfig = z.infer<typeof HudConfig>;
export type HazardInfo = z.infer<typeof HazardInfo>;
export type HazardId = z.infer<typeof Hazard>;
export type Strings = z.infer<typeof Strings>;
export type GuidedDemo = z.infer<typeof GuidedDemoFile>;
export type GuidedDemoStep = z.infer<typeof GuidedDemoStep>;
export type GuidedDemoAction = z.infer<typeof GuidedDemoAction>;
export type Consult = z.infer<typeof ConsultFile>;
export type ConsultHelp = z.infer<typeof ConsultHelp>;
export type ConsultSymptom = z.infer<typeof ConsultSymptom>;
export type ConsultQuestionSet = z.infer<typeof ConsultQuestionSet>;
export type ConsultQuestion = z.infer<typeof ConsultQuestion>;
export type ConsultAnswer = z.infer<typeof ConsultAnswer>;
