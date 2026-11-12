# 04 — Arquitectura

Concepto: **B — "Earth Is Far"** (`03-concepto.md`). Principio: menos piezas móviles, menos fallos. Cada dependencia tiene que pagar su costo.

## 1. Stack mínimo

| Pieza | Elección | Por qué paga su costo |
|---|---|---|
| Build / dev | **Vite + React 18 + TypeScript** | Arranque instantáneo, importa JSON nativamente, build estático → Vercel sin config. Next.js no aporta nada sin servidor. |
| Estilos | **Tailwind CSS** | Rápido, consistente; los colores de estado salen de `config/app.json` vía CSS variables. |
| Validación | **zod** | Exigido por CLAUDE.md; mensajes de error claros con la ruta del campo roto. |
| Persistencia | **localStorage** (wrapper propio de ~40 líneas) | Lecturas y log de emergencia del usuario; funciona offline; sin backend. |
| Gráficos | **SVG propio** (línea + bandas de rango) | Un sparkline/line chart simple son ~80 líneas; evita 100 KB de librería. Plan B: Recharts si se complica. |
| Ruteo | **hash routing propio** (`#/check`, `#/emergency`…) | 4–5 vistas; un hook de 20 líneas alcanza. Deep links para la demo. |
| Offline | **vite-plugin-pwa** (slice tardío) | Demostrar "funciona sin red" es argumento de Impact. |
| Tests | **Vitest** (lógica + esquemas) y **Playwright** (e2e) | Vitest viene casi gratis con Vite; Playwright lo pide el flujo de QA. |
| Lint | ESLint (config de Vite) + Prettier | Estándar. |
| Deploy | **Vercel** (estático) | Pedido en CLAUDE.md. Requiere login del usuario en Vercel. |

Sin backend, sin base de datos, sin cuentas, sin IA en runtime.

## 2. Estructura del repo

```
/
├─ config/
│  ├─ app.json            # nombre, tema, features, disclaimer, umbral de demora
│  └─ strings.en.json     # TODOS los textos de interfaz (labels, botones, títulos)
├─ data/
│  ├─ indicators.json     # indicadores, cómo medir, por qué, rangos, acciones, escalamiento
│  ├─ environments.json   # entornos: demora de comms, equipo, overrides por indicador
│  ├─ protocols.json      # protocolos de emergencia paso a paso
│  └─ sources.json        # fuentes citables
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx             # layout + router + barra de entorno + botón Emergency
│  ├─ content/
│  │  ├─ schemas.ts       # esquemas zod (única definición de tipos: z.infer)
│  │  ├─ load.ts          # importa JSON, valida, cruza referencias (source_ids, ids)
│  │  └─ ContentContext.tsx
│  ├─ logic/
│  │  ├─ evaluate.ts      # valor + rangos (+ override de entorno) → status
│  │  ├─ escalation.ts    # status + demora del entorno → mensaje de escalamiento
│  │  ├─ reminders.ts     # frecuencia + última lectura → pendientes
│  │  └─ report.ts        # lecturas + log de emergencia → texto de downlink
│  ├─ storage/local.ts    # lecturas, log de emergencia, entorno elegido
│  ├─ views/              # Home, DailyCheck, IndicatorDetail, Emergency, Report, Sources
│  ├─ components/         # StatusBadge, DelayBanner, StepCard, TrendChart, SourceLink, PlaceholderBadge
│  └─ hooks/useHashRoute.ts
├─ tests/
│  ├─ unit/               # evaluate, escalation, report, schemas (data real + casos rotos)
│  └─ e2e/                # Playwright: daily check, emergencia, reporte, a11y
├─ docs/
└─ .env.example           # vacío por ahora (no hay secretos)
```

Regla: **ningún componente contiene texto visible literal**. Todo sale de `strings.en.json` o de `data/`.

## 3. Esquemas de datos (zod)

Tipos compartidos:

```ts
const Status = z.enum(["VERIFIED", "PLACEHOLDER"]);           // calidad del dato
const HealthStatus = z.enum(["normal", "attention", "critical"]);
const Escalation = z.enum(["self", "crew", "ground"]);         // a quién escalar
const SourceIds = z.array(z.string()).default([]);
// Regla transversal (refine): si status === "VERIFIED" ⇒ source_ids.length > 0.
```

### 3.1 `data/sources.json`
```ts
const Source = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  title: z.string(),
  publisher: z.string(),
  url: z.string(),            // url() si status VERIFIED
  accessed: z.string(),       // YYYY-MM-DD si VERIFIED
  license: z.string().optional(),
  notes: z.string().optional(),
  status: Status,
});
const SourcesFile = z.object({ sources: z.array(Source) });
```

### 3.2 `data/indicators.json` (extiende el existente)
```ts
const Range = z.object({
  status: HealthStatus,
  min: z.number().nullable(),   // null = sin límite (o pendiente si PLACEHOLDER)
  max: z.number().nullable(),
  source_ids: SourceIds,
});

const Input = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("number"), step: z.number().default(1), min: z.number().optional(), max: z.number().optional() }),
  z.object({ kind: z.literal("pair"), labels: z.tuple([z.string(), z.string()]) }),        // presión: sistólica/diastólica
  z.object({ kind: z.literal("scale"), min: z.number(), max: z.number(), labels: z.record(z.string()) }), // ánimo 1–5
]);

const Indicator = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string(),
  category: z.string(),                 // agrupa en la UI (cardiovascular, behavioral…)
  hazards: z.array(z.enum(["radiation","isolation","distance","gravity","environment"])).default([]),
  input: Input,
  how_to_measure: z.array(z.string()),  // pasos numerados
  why_it_matters: z.string(),
  frequency: z.object({ every_hours: z.number().nullable(), label: z.string() }),
  ranges: z.array(Range),               // para "pair" se evalúa cada componente: ranges_secondary opcional
  ranges_secondary: z.array(Range).optional(),
  actions: z.record(HealthStatus, z.object({
    text: z.array(z.string()),
    escalation: Escalation,
    protocol_id: z.string().optional(),  // link a un protocolo de emergencia
  })),
  source_ids: SourceIds,
  status: Status,
});
```
Validaciones cruzadas en `load.ts`: rangos no solapados; `protocol_id` existe en `protocols.json`; todo `source_id` existe en `sources.json`.

### 3.3 `data/environments.json` (extiende el existente)
```ts
const Environment = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  comm_delay_one_way_s: z.object({   // demora de comunicación solo ida, en segundos
    min: z.number().nullable(),
    max: z.number().nullable(),
    source_ids: SourceIds,
  }),
  available_equipment: z.array(z.string()),
  indicator_overrides: z.record(z.string(), z.object({   // por id de indicador
    frequency: z.object({ every_hours: z.number().nullable(), label: z.string() }).optional(),
    ranges: z.array(Range).optional(),
    note: z.string().optional(),
  })).default({}),
  status: Status,
});
```
Incluye un entorno terrestre ("Remote clinic") para la historia de transferencia a la Tierra — `PLACEHOLDER` hasta tener fuente.

### 3.4 `data/protocols.json` (nuevo)
```ts
const Step = z.object({
  text: z.string(),
  detail: z.string().optional(),
  timer_s: z.number().optional(),      // muestra temporizador
  check: z.boolean().default(true),    // el usuario confirma "hecho" → se loguea con hora
  source_ids: SourceIds,
});
const Protocol = z.object({
  id: z.string(),
  title: z.string(),                   // "Crewmate collapsed / chest pain"
  trigger: z.array(z.string()),        // síntomas que lo disparan, para buscar
  escalation: Escalation,
  steps: z.array(Step).min(1),
  report_fields: z.array(z.string()).default([]), // qué incluir en el downlink
  source_ids: SourceIds,
  status: Status,
});
```

### 3.5 `config/app.json` (extiende el existente)
```ts
const AppConfig = z.object({
  app_name: z.string(),
  tagline: z.string(),
  default_language: z.literal("en"),
  default_environment: z.string(),     // debe existir en environments.json
  theme: z.object({
    mode: z.enum(["dark","light"]),
    accent: z.string(),
    status_colors: z.object({ normal, attention, critical }),   // z.object: exige las 3 claves
    status_icons: z.object({ normal, attention, critical }),    // el color nunca es la única señal
    emergency_button: z.object({ background, text }),           // ≥ 4.5:1 (AA)
  }),
  // Solo flags cableados (QA M8): offline, body_map, reaction_test y gamification se eliminaron.
  features: z.object({
    charts: z.boolean(), reminders: z.boolean(), emergency_guide: z.boolean(), downlink_report: z.boolean(),
  }),
  // Parámetros de DISEÑO (no médicos): a partir de qué demora la app prioriza actuar a bordo,
  // y cuántas horas puede tener una sesión de emergencia antes de preguntar si continuar.
  realtime_threshold_s: z.number(),
  emergency_session_max_age_hours: z.number().positive(),
  disclaimer: z.string(),
});
```

### 3.6 `config/strings.en.json` (nuevo)
`z.record(z.string(), z.string())` plano con claves tipo `"nav.daily_check"`, `"escalation.ground.delayed"` (con interpolación `{eta}`). Un helper `t(key, vars)` falla en dev si falta una clave.

## 4. Carga de datos y manejo de faltantes
- **En build:** los JSON se importan con `import x from "../../data/x.json"` → quedan en el bundle, disponibles offline. Cambiar datos = editar JSON + redeploy (Vercel lo hace solo con cada push).
- **Al iniciar:** `load.ts` corre `safeParse` en cada archivo y las validaciones cruzadas. Si algo falla, la app muestra una **pantalla de error de contenido** con archivo, ruta (`indicators[2].ranges[0].min`) y mensaje — nada de pantallas en blanco.
- **También en CI/tests:** un test de Vitest valida los JSON reales, así un dato roto falla antes de desplegar.
- **PLACEHOLDER en la UI:** cualquier entidad con `status: "PLACEHOLDER"` lleva un badge visible "Unverified data — placeholder". Si un rango tiene `min` y `max` nulos, la evaluación devuelve `"unknown"` y la UI dice "No verified threshold yet" en lugar de inventar un color.
- **Demora desconocida:** si `comm_delay_one_way_s` es nulo, el escalamiento cae en el mensaje conservador ("contact ground; if no answer, follow crew protocol").

## 5. Lógica clave (pura y testeada)
- `evaluate(indicator, value, env)` → `HealthStatus | "unknown"`. Aplica override de entorno si existe.
- `escalate(status, actions, env, config)` → `{ level, message_key, eta? }`. Si `level === "ground"` y `env.delay.max > config.realtime_threshold_s` → mensaje "act now, then report" + ETA de respuesta = ahora + 2 × demora (min/max).
- `remindersDue(indicators, readings, env, now)` → lista de pendientes.
- `buildReport(readings, emergencyLog, env, now)` → texto plano + JSON descargable.

## 6. Plan de slices (cada uno ≤ 90 min, desplegable, con commit)

Ordenados por valor para la demo. La línea punteada es el corte si falta tiempo.

| # | Slice | Entregable visible | Agente |
|---|---|---|---|
| S0 | Scaffold + esquemas + carga + pantalla de error + deploy | App vacía en Vercel que valida los JSON | frontend + backend-data |
| S1 | Barra de entorno + **DelayBanner** | Elegir entorno; ver "Earth is 4–24 min away (one-way)" | frontend |
| S2 | **Daily check** (asistente por indicador) | Cómo medir → por qué → cargar valor → estado (color+ícono+texto) → acción + escalamiento | frontend + backend-data |
| S3 | **Emergency mode** | Botón rojo global → protocolo paso a paso, temporizadores, log con hora | frontend |
| S4 | **Downlink report** | Reporte armado con lecturas + log; ETA de respuesta; copiar/descargar | backend-data + frontend |
| S5 | Fuentes + badges PLACEHOLDER + disclaimer + **poblar 3–4 indicadores y 1 protocolo con fuentes reales** | Panel Sources; cada afirmación linkeable | backend-data (+ revisión humana) |
| S6 | Home / status board + gráficos de tendencia (SVG) | Resumen de un vistazo + evolución | frontend |
| ┄┄ | *corte mínimo para demo* | | |
| S7 | Recordatorios | Lista "due now" según frecuencia; Notification API opcional | backend-data + frontend |
| S8 | Offline (PWA) | Demo con red cortada | frontend |
| S9 | Entorno terrestre "Remote clinic" | Historia de transferencia a la Tierra, solo JSON | backend-data |
| S10 | Stretch: figura humana clickeable / test de reacción | — | frontend |
| S11 | QA final + README en inglés + guion de demo | Playwright verde, a11y AA, README | qa-auditor |

Después de cada slice: `qa-auditor` corre e2e básicos, se actualiza `docs/progress.md`, commit.

## 7. Riesgos técnicos y plan B
| Riesgo | Plan B |
|---|---|
| Deploy en Vercel bloqueado (falta login / repo remoto) | `npm run build` + `vite preview` local para la demo; deploy manual con `vercel` CLI cuando el usuario se loguee. |
| localStorage vacío o bloqueado (modo privado) | Wrapper con try/catch; la app funciona en memoria y avisa que no se guarda. |
| Gráfico SVG propio se complica | Recharts. |
| PWA rompe el build | Se saca el plugin; offline queda como "funciona sin backend" (ya es cierto tras la carga). |
| Esquema cambia a mitad de camino | Tipos derivados de zod (`z.infer`) → el compilador marca todo lo que hay que tocar. |
| Datos sin fuente para la demo | La mecánica se muestra igual; badges PLACEHOLDER honestos. |
