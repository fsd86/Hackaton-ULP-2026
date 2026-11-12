# Log de uso de IA (SI)

Una línea por uso relevante. Sirve para completar la descripción de uso de IA que pide la entrega.

| Fecha y hora | Agente / herramienta | Tarea | Resultado |
|---|---|---|---|
| 2026-11-12 | Claude Code (Opus 5.5) + WebSearch | Fase A: brief, investigación de mercado con fuentes, 3 conceptos puntuados, arquitectura y plan de slices | docs/01–04 creados; concepto B elegido, pendiente de aprobación humana |
| 2026-11-12 | Subagente backend-data-engineer (Sonnet) | S0: scaffold, esquemas zod, carga/validación, evaluate/escalate, storage, migración de JSON, tests | Escrito sin shell; la sesión principal corrió install/lint/test/build y corrigió 1 bug (zod aceptaba "PLACEHOLDER: ..." como URL) |
| 2026-11-12 | Claude Code (Opus 5.5) + WebSearch/WebFetch | Verificación de fuentes para S5 (CDC, MedlinePlus, NASA, ESA, guía de RCP en microgravedad) | Lista de fuentes con citas textuales; sin umbrales inventados |
| 2026-11-12 | Subagente frontend-engineer (Sonnet) | S1: shell, navegación, error screen, entorno, DelayBanner | Escrito sin shell; la sesión principal corrigió 3 errores de tipos (z.record → z.object en el tema), agregó favicon y configuró Playwright con Edge |
