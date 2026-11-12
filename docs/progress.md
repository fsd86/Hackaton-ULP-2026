# Progreso

## Hecho
- 2026-11-12 — Fase A (planificación): `01-brief.md`, `02-mercado.md`, `03-concepto.md`, `04-arquitectura.md`. Concepto elegido: B "Earth Is Far".
- 2026-11-12 — S0: scaffold Vite + React 18 + TS + Tailwind v4 + zod 3 + Vitest + ESLint. Esquemas zod de todos los JSON, carga con validaciones cruzadas y errores con archivo + campo, `t()` para textos, lógica pura `evaluate` / `escalate`, storage local con fallback en memoria. JSON migrados al nuevo esquema (todo PLACEHOLDER). Nuevos `data/protocols.json` y `config/strings.en.json`. Lint OK, 28/28 tests, build OK.

- 2026-11-12 — S1: shell (header, nav accesible con hash routing, skip link, footer con disclaimer), pantalla de error de contenido, StatusBadge / PlaceholderBadge, selector de entorno persistente y DelayBanner (lógica pura en `src/logic/delay.ts`). Playwright con Edge del sistema (`npm run test:e2e`), smoke desktop + mobile en verde. Lint OK, 34/34 unit, build OK.

- 2026-11-12 — S2: vista Daily check (`#/check`): lista por categoría con última lectura y "due", asistente paso a paso (cómo medir / por qué / frecuencia con override de entorno), inputs number/pair/scale con validación accesible, resultado (StatusBadge), qué hacer y bloque de escalamiento con ETA de respuesta de tierra; historial persistente. `useHashRoute` soporta parámetro (`#/emergency/<id>`). Fechas en locale de la UI ("en"). e2e 6/6 (desktop + mobile).

- 2026-11-12 — S3: Emergency mode (`#/emergency[/id]`): lista con buscador, ejecución paso a paso con tarjetas grandes, "Mark as done" con hora, temporizador opcional (`timer_s`), barra fija con tiempo transcurrido + mensaje de escalamiento con ETA anclada al inicio, log por sesión persistente (retoma al recargar), diálogo de salida accesible. Horas en formato 24 h. e2e 12/12.

## En curso
- S4: vista Downlink report (lógica `src/logic/report.ts` ya escrita y testeada, sin commitear). Datos de S5 cargados en `data/`, sin commitear.

## Bloqueado
- Deploy en Vercel: se hace al final; requiere login del usuario.

## Notas de entorno
- Node y Git son portables (Escritorio), no están en PATH: anteponer al PATH en cada comando.
- Los subagentes no tienen shell en este Windows: escriben código; instalación, lint, tests, build y commits los corre la sesión principal.

## Próximo
- S2 Daily check, S3 Emergency, S4 Downlink report, S5 fuentes y datos reales, S6 status board + gráficos.
