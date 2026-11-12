# Prompt de arranque (pegar en Claude Code, modelo Opus 5.5, esfuerzo alto)

```
Leé CLAUDE.md y docs/00-desafio.md. Vamos a practicar un hackatón: quiero un MVP funcionando y desplegable.

Fase A (planificación, guardá cada resultado en docs/):
1. 01-brief.md: qué pide el desafío (obligatorio vs opcional) y rúbrica de jueces con 5 criterios: Impact, Creativity, Validity, Relevance, Presentation, cada uno con qué evidencia daría un 10/10.
2. 02-mercado.md: soluciones parecidas existentes y huecos (buscá en la web, con fuentes).
3. 03-concepto.md: 3 conceptos realmente distintos, puntuados contra la rúbrica y contra el esfuerzo posible. Elegí uno y justificá.
4. 04-arquitectura.md: stack mínimo, estructura, esquema de los JSON de data/ y config/, y plan de slices.
Frená y mostrame el concepto elegido antes de pasar a la Fase B.

Fase B (construcción):
- Respetá la REGLA CLAVE de CLAUDE.md: nada de contenido hardcodeado; todo en data/*.json y config/*.json.
- Usá los archivos de ejemplo que ya existen en data/ y config/ como punto de partida; ajustá su esquema si el concepto lo pide.
- Trabajá en slices chicos con commit en cada uno y probá con Playwright.
- Después de cada slice, actualizá docs/progress.md.
- Al final: desplegá en Vercel y actualizá el README con cómo reemplazar los datos cuando lleguen los resources oficiales.
```
