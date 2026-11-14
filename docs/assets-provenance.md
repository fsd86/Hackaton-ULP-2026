# Procedencia de assets

Registro de origen, licencia y uso de cada recurso visual que entra en la app. Las fuentes tipográficas tienen licencia OFL (paquetes `@fontsource-variable/*`, ver `package.json`); el resto del aspecto visual está hecho con CSS y SVG propios en el código.

## Imagen del cuerpo del tablero

| Campo | Valor |
|---|---|
| Archivo en la app | `public/hero/body.webp` (1024 × 1536 px, ~285 KB) |
| Original | `public/hero/body.png` (1024 × 1536 px, 2,4 MB). Hoy está fuera del repo, en `../hero-original/body.png`, para no publicarlo en `dist` |
| Cómo se hizo | Generada con IA de imágenes el 13/11/2026 |
| Herramienta usada | **[COMPLETAR: herramienta y versión]** |
| Prompt | **[COMPLETAR: prompt exacto usado]** |
| Autor de la generación | **[COMPLETAR]** |
| Términos de uso | **A verificar:** revisar los términos de la herramienta (uso comercial y público, atribución requerida, restricciones para concursos). |
| Conversión | PNG → WebP calidad 0,78 con el encoder de Edge (canvas), mismo tamaño en px. Commit `4de8c80`. |
| Uso en la app | Cuerpo central del tablero (mezclado con `mix-blend-mode: screen`) y recorte ampliado en "Zone details". Decorativa: `alt=""`; el contenido lo dan los botones de zona y los paneles. |
| Relación con la referencia | No deriva de `doc referencia/ref0-objetivo.png`; esa imagen solo se usó como referencia de estilo y no está en la app. |

### Pendiente para una persona
1. Completar herramienta, prompt y autor.
2. Leer los términos de uso de la herramienta y anotar aquí el resultado (permitido / con condiciones / no permitido) y la fecha.
3. Si los términos piden atribución, agregarla al README y al pie de la app (texto en `config/strings.en.json`).

## Imágenes de referencia (no se usan en la app)

- `doc referencia/ref0-objetivo.png` y `docs referencias/*`: inspiración visual de terceros. No están en el repo ni en `dist`. No se copiaron textos, números ni gráficos.
