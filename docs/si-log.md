# Log de uso de IA (SI)

Una línea por uso relevante. Sirve para completar la descripción de uso de IA que pide la entrega.

| Fecha y hora | Agente / herramienta | Tarea | Resultado |
|---|---|---|---|
| 2026-11-12 | Claude Code (Opus 5.5) + WebSearch | Fase A: brief, investigación de mercado con fuentes, 3 conceptos puntuados, arquitectura y plan de slices | docs/01–04 creados; concepto B elegido, pendiente de aprobación humana |
| 2026-11-12 | Subagente backend-data-engineer (Sonnet) | S0: scaffold, esquemas zod, carga/validación, evaluate/escalate, storage, migración de JSON, tests | Escrito sin shell; la sesión principal corrió install/lint/test/build y corrigió 1 bug (zod aceptaba "PLACEHOLDER: ..." como URL) |
| 2026-11-12 | Claude Code (Opus 5.5) + WebSearch/WebFetch | Verificación de fuentes para S5 (CDC, MedlinePlus, NASA, ESA, guía de RCP en microgravedad) | Lista de fuentes con citas textuales; sin umbrales inventados |
| 2026-11-12 | Subagente frontend-engineer (Sonnet) | S1: shell, navegación, error screen, entorno, DelayBanner | Escrito sin shell; la sesión principal corrigió 3 errores de tipos (z.record → z.object en el tema), agregó favicon y configuró Playwright con Edge |
| 2026-11-12 | Subagente frontend-engineer (Sonnet) | S2: Daily check (asistente, inputs, resultado, escalamiento con ETA, historial) + e2e | La sesión principal corrigió el nombre accesible del botón "Open indicator" (fallaba el e2e) y el locale de fechas |
| 2026-11-12 | Subagente backend-data-engineer (Sonnet), en paralelo | S5 (datos): fuentes VERIFIED, rangos y acciones con fuente, demoras Marte/Luna, protocolo de RCP en microgravedad | Solo con fuentes verificadas; lo demás PLACEHOLDER. La sesión principal adaptó 2 tests de esquema |
| 2026-11-12 | Subagente frontend-engineer (Sonnet) | S3: Emergency mode + e2e | Pasó lint/build/e2e a la primera; revisión visual con capturas de Playwright |
| 2026-11-12 | Subagente backend-data-engineer (Sonnet), en paralelo | S4 (lógica): `buildReport` puro + 8 tests | La sesión principal pasó las horas a 24 h y quitó un import sin uso |
| 2026-11-12 | Subagente frontend-engineer (Sonnet) | S4 vista de reporte + S5 vista de fuentes, SourceLinks y e2e | Pasó lint/build/60 unit/20 e2e a la primera; la sesión principal separó los commits por slice |
| 2026-11-12 | Subagente backend-data-engineer (Sonnet), en paralelo | S6 (lógica): `buildBoard` y `buildTrend` + 12 tests | Verde a la primera |
| 2026-11-12 | Subagente frontend-engineer (Sonnet) | S6: Status board, TrendChart SVG, fix de pliegue en móvil, e2e | Verde a la primera; revisión visual con capturas |
