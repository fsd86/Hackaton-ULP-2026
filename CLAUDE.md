# NASA Space Apps 2026 — Práctica (MVP)

## Objetivo
Construir un MVP funcional y desplegable para el desafío en `docs/00-desafio.md`.
Rúbrica de jueces (base): Impact, Creativity, Validity, Relevance, Presentation. Se detalla en `docs/01-brief.md`.

## REGLA CLAVE: nada de contenido hardcodeado
- Todo el contenido (indicadores, umbrales, textos, instrucciones, fuentes, entornos) vive en `data/*.json` y `config/*.json`.
- El código solo lee esos archivos y los muestra. Cambiar un dato = editar un JSON, sin tocar componentes.
- Validá los JSON con un esquema (por ejemplo zod) al cargar la app, para que un dato mal escrito falle con un mensaje claro.
- Datos sin fuente verificada se marcan `"status": "PLACEHOLDER"`. Nunca inventes umbrales médicos, cifras ni citas.

## Reglas generales
- Idioma de la interfaz y del README: inglés. Comunicación interna y comentarios de trabajo: español.
- Stack mínimo: Next.js o Vite + React + TypeScript + Tailwind. Desplegable en Vercel. Sin base de datos salvo que haga falta de verdad.
- Trabajá en slices chicos (≤90 min), cada uno desplegable, con un commit claro.
- Sin secretos en el repo: usá `.env` (ignorado por git) y `.env.example`.
- Nada de assets, código o marca de terceros sin licencia. Inspirarse sí, copiar no.
- Accesibilidad: contraste AA, navegación por teclado, el color nunca es la única señal.
- Toda afirmación científica visible en la app debe tener su fuente en `data/sources.json`.
- Al terminar cada slice: actualizá `docs/progress.md`. Cada vez que uses IA de forma relevante: una línea en `docs/si-log.md`.

## Comandos (completar cuando exista el scaffold)
- Desarrollo: `npm run dev`
- Build: `npm run build`
- Tests: `npm test`
- Lint: `npm run lint`

## Estructura
- `docs/` — brief, mercado, concepto, arquitectura, progreso, decisiones, log de IA.
- `data/` — contenido editable (indicators, environments, sources).
- `config/` — ajustes de la app (nombre, tema, idioma, funciones activas).
- `.claude/agents/` — subagentes: architect, frontend-engineer, backend-data-engineer, qa-auditor.

## Cómo delegar
Usá el subagente adecuado según la tarea y pedile siempre un resumen corto del resultado.
