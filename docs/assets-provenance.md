# Procedencia de assets

Registro de origen, licencia y uso de cada recurso visual que entra en la app. Las fuentes tipográficas tienen licencia OFL (paquetes `@fontsource-variable/*`, ver `package.json`); el resto del aspecto visual está hecho con CSS y SVG propios en el código.

## Imagen del cuerpo del tablero

| Campo | Valor |
|---|---|
| Archivo en la app | `public/hero/body.webp` (1024 × 1536 px, ~285 KB) |
| Original | `public/hero/body.png` (1024 × 1536 px, 2,4 MB). Hoy está fuera del repo, en `../hero-original/body.png`, para no publicarlo en `dist` |
| Cómo se hizo | Generada con IA de imágenes el 13/11/2026 |
| Herramienta usada | ChatGPT (versión gratuita), generador de imágenes de OpenAI |
| Autor de la generación | Equipo SpaceHolders, con ChatGPT (OpenAI) |
| Prompt | Ver sección "Prompt utilizado" más abajo |
| Términos de uso | **A verificar**: revisar los términos de OpenAI (propiedad del contenido generado, uso comercial y público, atribución requerida, restricciones para concursos). Resultado y fecha: _pendiente_ |
| Conversión | PNG → WebP calidad 0,78 con el encoder de Edge (canvas), mismo tamaño en px. Commit `4de8c80` |
| Uso en la app | Cuerpo central del tablero (mezclado con `mix-blend-mode: screen`) y recorte ampliado en "Zone details". Decorativa: `alt=""`; el contenido lo dan los botones de zona y los paneles |
| Relación con la referencia | No deriva de `doc referencia/ref0-objetivo.png`; esa imagen solo se usó como referencia de estilo y no está en la app |

### Prompt utilizado

```
Ultra-detailed, futuristic 3D medical anatomical visualization of a complete human upper body, front-facing, symmetrical, from head to hips, centered composition.

A realistic translucent human body made of glowing cyan-blue glass-like material, with a highly detailed internal anatomical structure visible through the transparent skin.

Anatomical details:
- Fully visible human brain, glowing bright orange and warm amber, with realistic gyri and sulci.
- Detailed facial anatomy, transparent skull structure, visible eyes, muscles, nerves and blood vessels.
- Transparent neck showing cervical vertebrae, trachea, arteries and veins.
- Rib cage and skeletal structures subtly visible.
- Two realistic lungs glowing fiery orange-red with intricate branching bronchial structures.
- Anatomically detailed red human heart positioned centrally between the lungs.
- Visible liver in deep orange-red.
- Detailed stomach glowing golden orange.
- Extensive network of red arteries, blue veins and delicate vascular branches throughout the body.

Visual effects:
- Electric cyan and neon-blue luminous outlines surrounding the entire body.
- Intricate glowing neural and vascular networks.
- Warm orange and red illumination inside the organs, contrasting with the cold blue translucent body.
- Two large futuristic holographic concentric rings: one floating horizontally above the head like a luminous halo, and another surrounding the lower torso at hip level.
- Bright cyan energy particles, tiny glowing sparks and subtle light reflections around the rings.
- Intense luminous blue rim lighting outlining the silhouette.

Composition and rendering:
Perfectly
[PEGAR AQUÍ EL FINAL DEL PROMPT: desde "Perfectly" hasta el último punto]
```

## Pendiente para una persona

1. Pegar el final del prompt donde está marcado (el texto original quedó cortado en "Perfectly").
2. Leer los términos de uso de OpenAI y anotar aquí el resultado (permitido / con condiciones / no permitido) y la fecha.
3. Si los términos piden atribución, agregarla al README y al pie de la app (texto en `config/strings.en.json`).
4. Mencionar la imagen generada con IA en la declaración de uso de IA del envío a NASA Space Apps.

## Imágenes de referencia (no se usan en la app)

`doc referencia/ref0-objetivo.png` y `docs referencias/*`: inspiración visual de terceros. No están en el repo ni en `dist`. No se copiaron textos, números ni gráficos.
