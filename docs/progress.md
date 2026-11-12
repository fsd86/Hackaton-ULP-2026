# Progreso

## Hecho
- 2026-11-12 — Fase A (planificación): `01-brief.md`, `02-mercado.md`, `03-concepto.md`, `04-arquitectura.md`. Concepto elegido: B "Earth Is Far".
- 2026-11-12 — S0: scaffold Vite + React 18 + TS + Tailwind v4 + zod 3 + Vitest + ESLint. Esquemas zod de todos los JSON, carga con validaciones cruzadas y errores con archivo + campo, `t()` para textos, lógica pura `evaluate` / `escalate`, storage local con fallback en memoria. JSON migrados al nuevo esquema (todo PLACEHOLDER). Nuevos `data/protocols.json` y `config/strings.en.json`. Lint OK, 28/28 tests, build OK.

- 2026-11-12 — S1: shell (header, nav accesible con hash routing, skip link, footer con disclaimer), pantalla de error de contenido, StatusBadge / PlaceholderBadge, selector de entorno persistente y DelayBanner (lógica pura en `src/logic/delay.ts`). Playwright con Edge del sistema (`npm run test:e2e`), smoke desktop + mobile en verde. Lint OK, 34/34 unit, build OK.

- 2026-11-12 — S2: vista Daily check (`#/check`): lista por categoría con última lectura y "due", asistente paso a paso (cómo medir / por qué / frecuencia con override de entorno), inputs number/pair/scale con validación accesible, resultado (StatusBadge), qué hacer y bloque de escalamiento con ETA de respuesta de tierra; historial persistente. `useHashRoute` soporta parámetro (`#/emergency/<id>`). Fechas en locale de la UI ("en"). e2e 6/6 (desktop + mobile).

- 2026-11-12 — S3: Emergency mode (`#/emergency[/id]`): lista con buscador, ejecución paso a paso con tarjetas grandes, "Mark as done" con hora, temporizador opcional (`timer_s`), barra fija con tiempo transcurrido + mensaje de escalamiento con ETA anclada al inicio, log por sesión persistente (retoma al recargar), diálogo de salida accesible. Horas en formato 24 h. e2e 12/12.

- 2026-11-12 — S4: Downlink report (`#/report`): `buildReport` puro (ventana de respuesta esperada = ahora + 2×demora, lecturas del período con tendencia, log de emergencia, checklist de `report_fields`, aviso de placeholders, disclaimer), vista con período 24 h / todo, copiar al portapapeles con fallback, descarga .txt y .json.
- 2026-11-12 — S5: datos con fuentes verificadas (11 fuentes VERIFIED: CDC presión / glucosa / fiebre / sueño, MedlinePlus pulso, NASA HRP, NASA Perseverance comms, ESA Luna, guía DGLRM/ESAM de RCP en microgravedad). Rangos con fuente para presión, pulso, glucosa baja, fiebre y sueño; demoras Marte 180–1320 s y Luna 1,27 s; protocolo con pasos de RCP en microgravedad. Indicadores y protocolo siguen PLACEHOLDER porque tienen partes sin fuente (frecuencias, algunos pasos y acciones); ánimo, ISS y clínica remota completos PLACEHOLDER. Vista Sources con resumen de verificación, "cited by" y anclas `#/sources/<id>`; links de fuente en Daily check, Emergency y DelayBanner.

- 2026-11-12 — S6: Status board (`#/`): estado general, contadores (ícono + texto), "Needs attention" con link a `#/check/<id>`, "Due now", tarjetas por indicador con TrendChart SVG propio (franjas de rango, marcadores con forma por estado, `pair` con línea sólida/punteada, `role="img"` + tabla alternativa), selector 24 h / 7 d / todo. Lógica pura `buildBoard` / `buildTrend`. Barra de emergencia compacta en móvil. Lint OK, 60/60 unit, 25/25 e2e (+1 skip intencional).

- 2026-11-12 — QA (qa-auditor): suite `tests/qa/` (demo completo, axe, teclado, no-hardcode, perf, seguridad). 45 ok / 18 fallos (13 bugs reales, 5 falsos positivos del test). 0 bloqueantes, 9 mayores, 12 menores, 13 tickets. Ver `docs/qa-report.md`. `vercel.json` listo.

## En curso
- Nada. S0–S6 completos.

## Bloqueado
- Deploy en Vercel: requiere que el usuario inicie sesión en la CLI de Vercel (GitHub no es accesible desde esta red, así que el deploy es por CLI, no por repo).

## Notas de entorno
- Node y Git son portables (Escritorio), no están en PATH: anteponer al PATH en cada comando.
- Los subagentes no tienen shell en este Windows: escriben código; instalación, lint, tests, build y commits los corre la sesión principal.

## Próximo
- Deploy en Vercel (después del login del usuario).
- Tickets de `docs/qa-report.md`, priorizando T1 (validación de inputs), T3 (storage corrupto), T4 (contraste) y T8 (presión → RCP).
