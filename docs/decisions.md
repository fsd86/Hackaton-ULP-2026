# Decisiones

| Fecha | Decisión | Opciones consideradas | Por qué |
|---|---|---|---|
| 2026-11-12 | Concepto B "Earth Is Far": copiloto de salud que usa la demora de comunicaciones como variable de diseño | A: dashboard con figura humana; C: Buddy Check entre pares | Mejor puntaje (26/30); responde el escenario del video; llena huecos H1–H4 (ver 02-mercado.md) |
| 2026-11-12 | Vite + React + TS + Tailwind + zod, sin backend; SVG propio para gráficos; hash routing propio | Next.js; Recharts; react-router | Menos piezas; build estático para Vercel; datos en el bundle = offline |
| 2026-11-12 | Textos de interfaz en `config/strings.en.json`; nuevo `data/protocols.json` | Textos en componentes | Regla clave de CLAUDE.md: nada hardcodeado |
| 2026-11-12 | `realtime_threshold_s` en config como parámetro de diseño, no médico | Inferir de la demora | Separar decisiones de diseño de datos médicos que requieren fuente |
| 2026-11-13 | Deploy manual en Netlify arrastrando `dist`; no se usa Vercel | Vercel CLI (requiere login); deploy por repo (GitHub no accesible desde esta red) | Decisión del usuario; `public/_headers` ya replica los headers de seguridad |
| 2026-11-13 | **No** correr `npm audit fix --force`; vulnerabilidades anotadas para revisar después (ver abajo) | Forzar el fix (instala versiones fuera del rango fijado y cambios mayores: zod 4, typescript-eslint) | Riesgo de romper build/tests a mitad del rediseño; casi todo es tooling de desarrollo |

## Pendiente de revisar: `npm audit` (2026-11-13)

12 vulnerabilidades (8 moderadas, 2 altas, 2 críticas). Ninguna se arregló todavía.

| Paquete | Severidad | Qué es | Afecta a | Fix disponible |
|---|---|---|---|---|
| `tinypool` ≤2.1.1 (vía vitest) | Crítica | Prototype pollution → RCE en opciones del worker | Solo tests (dev) | `vitest` 3.2.7 (patch) |
| `@vitest/mocker` / `vitest` ≤4.1.10 | Moderada | Path traversal y code injection en mocks | Solo tests (dev) | `vitest` 3.2.7 (patch) |
| `vite` 7.0.0–7.3.6 (incluye `launch-editor`) | Alta | Bypass de `server.fs.deny` en Windows, lectura de archivos por el WebSocket del dev server, etc. | Dev server / preview, no el `dist` publicado | `vite` 7.3.8 (minor) |
| `zod` <4.6.6 | Alta | Consumo de memoria validando colecciones enormes | Runtime (valida JSON propios + localStorage) | `zod` 4.6.7 (**mayor**, cambia la API) |
| `minimatch` 7–11 (vía typescript-eslint) | Moderada | DoS por amplificación de globs | Solo lint (dev) | `typescript-eslint` (cambio mayor según npm) |

Sugerencia para cuando se revise: subir a mano `vite` y `vitest` a sus patches (bajo riesgo) y volver a correr todo; dejar `zod` 4 para después de la entrega (exposición baja: solo valida datos propios).
