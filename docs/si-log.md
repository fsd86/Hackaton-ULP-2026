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
| 2026-11-12 | Subagente qa-auditor (Sonnet) | Suite QA Playwright + axe + auditoría estática | Escribió 6 specs y la auditoría; la sesión principal los corrió, hizo la prueba manual de no-hardcode y redactó `docs/qa-report.md` (el agente no puede escribir reportes) |
| 2026-11-12 | Subagente backend-data-engineer (Sonnet) | G1: rangos exclusivos + validación de cobertura, límites de plausibilidad, plantillas de umbrales, quitar vínculo BP→RCP | Verde a la primera (82 unit, 25 e2e) |
| 2026-11-12 | Claude Code (Opus 5.5) | G4: CSP y headers en vercel.json reflejados en `vite preview`; .env.example | Verificado con e2e bajo CSP |
| 2026-11-12 | Subagente frontend-engineer (Sonnet) | G2: validación de storage, ErrorBoundary, aviso de descarte, borrar datos, sesión vieja | La sesión principal borró un re-export sobrante y corrigió un test QA que esperaba 30 s a un timer inexistente |
| 2026-11-12 | Subagente frontend-engineer (Sonnet) | G3: contraste, foco, "no frequency", flags de config, scroll-margin, h1, categorías, detalles de entorno | La sesión principal corrigió 1 error de tipos (Ref) y 1 selector de test; actualizó 4 tests QA que probaban el comportamiento viejo |
| 2026-11-13 | Claude Code (Opus 5.5) | Reinstalación limpia, restaurar tests/, corregir fixture y selectores QA al header rediseñado, fuentes fuera de data: URI por la CSP, commit WIP del rediseño, docs | Unit 99/99, e2e 39/39, QA 62/63 (403 de CDC) |
| 2026-11-13 | Claude Code (Opus 5.5) | Lectura de los 5 PDF de resources (NASA HRP, CSA), análisis 06, fuentes nuevas, hazards y PLACEHOLDER con respaldo explícito | 4 fuentes nuevas; 3 indicadores con hazards; 2 PLACEHOLDER reemplazados; 12 sugerencias sin implementar |
| 2026-11-14 | Claude Code (Opus 5.5) | Etapa 2A: WebP del cuerpo, hazards.json + config hero, HUD del tablero, 3 iteraciones visuales contra la referencia | Lint/build OK, unit 104/104, e2e 39/39, QA 62/63 (403 CDC), axe 0 |
| 2026-11-14 | Claude Code (Opus 5.5) | 3 ajustes del HUD (anillos con banner demo, columnas parejas, CTA vacío sin scroll) + build final | Medidos con Playwright a 1280x800, 1440x900 y 1920x1080; todos los tests en verde salvo el 403 de CDC |
