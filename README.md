# NASA Space Apps 2026 — Práctica

MVP de práctica. Este README se reescribe en inglés cuando la app esté lista.

## Cómo arrancar
1. Abrí una terminal en esta carpeta y corré `git init` (una sola vez).
2. Abrí Claude Code con `claude`.
3. Instalá los plugins:
   - `/plugin install vercel@claude-plugins-official`
   - `/plugin install playwright@claude-plugins-official`
   - `/plugin install frontend-design@claude-plugins-official`
4. Abrí `PROMPT-ARRANQUE.md`, copiá el bloque de código y pegalo en Claude Code.

## Cómo cambiar el contenido (cuando lleguen los resources)
Todo el contenido de la app está en archivos JSON; no hace falta tocar el código.

| Quiero cambiar… | Edito… |
|---|---|
| Indicadores, umbrales, instrucciones de medición | `data/indicators.json` |
| Entornos (nave, estación, base lunar…) | `data/environments.json` |
| Fuentes citadas en la app | `data/sources.json` |
| Nombre, tema, idioma, funciones activas | `config/app.json` |

Después de editar, pedile a Claude Code: "validá los datos y ajustá el diseño si hace falta".

## Datos de ejemplo
Los archivos de `data/` son **placeholders**: tienen la estructura, pero ningún umbral real. Los valores reales deben venir de fuentes oficiales (NASA Human Research Program, NASA OSDR y los resources del desafío) y cargarse con su fuente en `sources.json`.
