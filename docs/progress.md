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

- 2026-11-12 — Arreglos de QA en 4 grupos: G1 datos/umbrales (`be858dc`), G4 seguridad (`17d889d`), G2 robustez (`4a55936`), G3 accesibilidad/config (`4ffe37d`) + ajuste de la suite QA (`13d5cfc`). 9/9 mayores arreglados, 11/12 menores (T12 parcial). Unit 98/98, e2e 39/39, QA 62/63 (el único fallo es el 403 anti-bot de CDC), axe 0 violaciones.

- 2026-11-12 — Headers para Netlify (`3483e92`): `public/_headers` con los mismos headers de seguridad que `vercel.json` + test unitario que los mantiene sincronizados.

- 2026-11-13 — Rediseño visual etapa 1 (WIP, `af129bf`): tablero estilo HUD con mapa del cuerpo por zonas (`bodyZones`), VitalCard + Sparkline, paneles FramePanel / CalloutLines, íconos por indicador; header compacto con pestañas, selector de entorno y demora (las fuentes de la demora pasan al panel "Ground answer" del tablero); lecturas demo sintéticas en `data/demo-readings.json` validadas con zod + DemoBanner; fuentes Space Grotesk / JetBrains Mono (@fontsource, OFL). Arreglo: Vite incrustaba subsets chicos de fuentes como `data:` y la CSP (`font-src 'self'`) los bloqueaba → `assetsInlineLimit` excluye `.woff2`. Tests: fixture con `demoReadings`, selectores QA al header nuevo. Unit 99/99, e2e 39/39 (+3 skip), QA 62/63 (único fallo: 403 anti-bot de CDC). Las imágenes de `docs referencias/` quedan fuera del repo (inspiración de terceros, sin licencia).

- 2026-11-13 — 4 arreglos post-rediseño, un commit cada uno: `CLAUDE.md` con deploy manual en Netlify (`97c0e2b`); Emergency es el primer foco del teclado en todos los tamaños, en móvil coincide con el orden visual y en lg+ se dibuja al final con `lg:order-last` (`8000b3e`); banner DEMO DATA en móvil como franja fija de una línea (~44 px en vez de ~120 px) con texto corto y botón "Remove" (nombre accesible "Remove demo data") (`a0beced`); la demora del header enlaza sus fuentes en todas las vistas con `SourceLinks compact` ("Sources 1 2", ≥24 px, nombre accesible "Source 1: NASA Science") (`2ceddc2`). Textos nuevos en `strings.en.json`. Lint OK, unit 99/99, e2e 39/39 (+3 skip), QA 62/63 (único fallo: 403 anti-bot de CDC), detector de hardcode 0.

- 2026-11-13 — Resources oficiales (5 PDF en `doc resources/`: NASA HRP hazards / risks / ongoing research, CSA radiación / ciencia en la ISS): análisis en `docs/06-resources-analisis.md`. Ninguno trae umbrales ni frecuencias: rangos y acciones siguen igual. 4 fuentes nuevas VERIFIED y `nasa_hrp_hazards` corregida (URL, fecha, notas). Con respaldo explícito: `hazards` de frecuencia cardíaca y presión (`gravity`) y de ánimo (`isolation`, `radiation`, `distance`), `why_it_matters` del ánimo y descripción de la estación espacial dejan de ser PLACEHOLDER. Las 12 sugerencias de contenido y concepto quedan sin implementar en el doc 06.

- 2026-11-14 — Rediseño etapa 2A (tablero HUD, referencia `doc referencia/ref0-objetivo.png`, sin copiar textos ni números): `public/hero/body.webp` (2,4 MB PNG → 285 KB, `4de8c80`); `data/hazards.json` con los 5 hazards de NASA y fuente + `config/app.json` → `hero` (imagen, anclajes en %) (`38b8bbd`); HUD (`422d834`): cuerpo translúcido con `screen`, halo y plataforma girando, barrido de escaneo, puntos de zona accesibles; izquierda inclinada (Vital signs, estado por zona, tendencia destacada); derecha (detalle de zona con hazards y qué hacer, demora y respuesta de Tierra, hazards de NASA); estado general bajo el cuerpo; móvil en una columna; reduced motion apaga todo; sin imagen, cuerpo SVG. 3 iteraciones contra la referencia (mezcla "screen" rota por contextos de apilamiento, bordes luminosos, equilibrio de columnas). Unit 104/104, e2e 39/39, QA 62/63 (403 de CDC), axe 0 violaciones.

- 2026-11-14 — 3 ajustes del HUD, un commit cada uno: anillos de la plataforma completos con el banner demo (`--hero-top` suma el banner, `3be42ef`); columnas laterales parejas (Delay & ground answer pasa a la izquierda y el último panel de cada columna crece hasta el borde, `41f23c4`); sin lecturas, el estado general sube al tope de la columna derecha y "Go to daily check" queda a 479 px a 1440x900 (`f92f3d6`). Lint OK, unit 104/104, e2e 39/39, QA 62/63 (403 de CDC), axe 0. Build final en `dist` (843 KB) listo para arrastrar a Netlify.

- 2026-11-14 — Etapa 2B del HUD (5 bloques, un commit cada uno): demo sembrada en la primera visita con flag `features.demo_on_first_visit` y marca `eif.demo_seeded` (nunca resiembra; chip DEMO una vez por panel) (`d4dd15e`); gráficos en paneles: traza de pulso decorativa "not an ECG", anillo de conteos, barras de lecturas, mapa de calor por peor estado de zona con leyenda icono+texto, líneas suaves monótonas (`572cf92`); cuerpo más grande con título compacto, anillos a 888 px a 1440x900 con banner, y el foco ya no salta al cargar (`0d6b7d3`); acentos cálidos `theme.warm` y fondo espacial por código `theme.space` (estrellas + horizonte) (`949c13e`); zoom de la zona en Zone details con la misma imagen (`4560488`). Tests e2e parten de visita ya sembrada (fixture) + test nuevo de primera visita; QA usa storageState con la marca. Lint OK, unit 108/108, e2e 41/41 (3 skip).

## En curso
- Rediseño visual: etapa 2A commiteada; próximas etapas a definir.

## Bloqueado
- Nada.

## Notas de entorno
- Node (v26) y Git están instalados en esta máquina y en el PATH; no hace falta anteponer nada.
- Los subagentes no tienen shell en este Windows: escriben código; instalación, lint, tests, build y commits los corre la sesión principal.
- npm 11 no corre scripts de instalación sin aprobación (`esbuild`, `@tailwindcss/oxide`); hoy build y tests andan igual.

## Próximo
- Deploy manual en Netlify arrastrando `dist` (después de `npm run build`).
- T12 pendiente: `hazards` de glucosa, temperatura y sueño (sin respaldo explícito en los resources) y actualizar las URLs de fuentes que redirigen.
- Decidir cuáles de las sugerencias del doc 06 entran (vista Hazards, mapa del cuerpo por riesgos, nuevos indicadores).
- S11: README en inglés con link al deploy, capturas y tabla requisito → feature.
