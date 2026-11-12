# Progreso

## Hecho
- 2026-11-12 — Fase A (planificación): `01-brief.md`, `02-mercado.md`, `03-concepto.md`, `04-arquitectura.md`. Concepto elegido: B "Earth Is Far".
- 2026-11-12 — S0: scaffold Vite + React 18 + TS + Tailwind v4 + zod 3 + Vitest + ESLint. Esquemas zod de todos los JSON, carga con validaciones cruzadas y errores con archivo + campo, `t()` para textos, lógica pura `evaluate` / `escalate`, storage local con fallback en memoria. JSON migrados al nuevo esquema (todo PLACEHOLDER). Nuevos `data/protocols.json` y `config/strings.en.json`. Lint OK, 28/28 tests, build OK.

## En curso
- S1: shell de la app (layout, navegación, pantalla de error) + selector de entorno + DelayBanner.

## Bloqueado
- Deploy en Vercel: se hace al final; requiere login del usuario.

## Notas de entorno
- Node y Git son portables (Escritorio), no están en PATH: anteponer al PATH en cada comando.
- Los subagentes no tienen shell en este Windows: escriben código; instalación, lint, tests, build y commits los corre la sesión principal.

## Próximo
- S2 Daily check, S3 Emergency, S4 Downlink report, S5 fuentes y datos reales, S6 status board + gráficos.
