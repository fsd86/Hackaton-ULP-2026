# Decisiones

| Fecha | Decisión | Opciones consideradas | Por qué |
|---|---|---|---|
| 2026-11-12 | Concepto B "Earth Is Far": copiloto de salud que usa la demora de comunicaciones como variable de diseño | A: dashboard con figura humana; C: Buddy Check entre pares | Mejor puntaje (26/30); responde el escenario del video; llena huecos H1–H4 (ver 02-mercado.md) |
| 2026-11-12 | Vite + React + TS + Tailwind + zod, sin backend; SVG propio para gráficos; hash routing propio | Next.js; Recharts; react-router | Menos piezas; build estático para Vercel; datos en el bundle = offline |
| 2026-11-12 | Textos de interfaz en `config/strings.en.json`; nuevo `data/protocols.json` | Textos en componentes | Regla clave de CLAUDE.md: nada hardcodeado |
| 2026-11-12 | `realtime_threshold_s` en config como parámetro de diseño, no médico | Inferir de la demora | Separar decisiones de diseño de datos médicos que requieren fuente |
