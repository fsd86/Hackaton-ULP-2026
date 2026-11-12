# 01 — Brief del desafío

**Desafío:** *Create Health Monitoring Software for Astronauts on Space Missions* (NASA Space Apps 2026, autor: Agencia Espacial Brasileña).
Fuente: `docs/00-desafio.md` (enunciado + transcripción del video de Rodrigo Leonardi).

## 1. El problema en una frase
En misiones largas y cada vez más autónomas de la Tierra, los astronautas (que **no son médicos**) tienen que detectar por sí mismos cambios en su salud y saber **qué hacer**, incluso en una emergencia, cuando el soporte médico de tierra llega con demora o no llega.

## 2. Qué pide — obligatorio vs. opcional

### Obligatorio (sin esto no cumplimos el desafío)
| # | Requisito | Dónde lo dice |
|---|---|---|
| R1 | Software que **recolecte indicadores de salud** (cualquier input: teclado, clics, cámara; cualquier dato que represente un indicador). | Objetivo + "Objectives" |
| R2 | Permitir al astronauta **evaluar** su estado de salud (interpretar los valores). | Objetivo |
| R3 | Permitir **actuar**: guía de tratamientos / mejoras de salud y **qué hacer cuando un valor no es normal**. | Objetivo + video 01:09 |
| R4 | **Guía para emergencias** ("tu compañero colapsa con dolor de pecho: ¿qué hacés?"). | Video 00:36–01:09 |
| R5 | Asumir que **no son médicos**: explicar **cómo tomar cada medida** y **por qué importa**. | Video 01:09 + "Potential considerations" |
| R6 | Herramienta **visual**; la UI presenta métricas y diagnóstico con claridad. | "Objectives" |
| R7 | Basar los indicadores en riesgos reales del vuelo espacial (NASA HRP: 5 peligros). | Background + video 01:41 |

> R4 aparece fuerte en el video aunque el texto escrito lo pone como "guidance on treatments". Lo tratamos como obligatorio porque el autor del desafío lo usa como escenario central.

### Opcional / "puntos extra"
| # | Idea sugerida | Nota |
|---|---|---|
| O1 | **Recordatorios** para tomar mediciones como parte de la rutina. | El video lo dice explícitamente ("you can go further"). |
| O2 | **Adaptar a entornos**: nave en tránsito, estación, rover, base lunar/planetaria. | Video 01:41 + considerations. |
| O3 | **Gamificación** para fomentar hábitos saludables. | |
| O4 | **Gráficos dinámicos** de evolución en el tiempo. | |
| O5 | **Código de color** de estado de un vistazo. | Ojo accesibilidad: el color nunca es la única señal. |
| O6 | **Figura humana clickeable** con info por parte del cuerpo. | Ejemplo explícito del enunciado. |
| O7 | Animaciones e interactividad. | |
| O8 | Usar datos reales de **NASA OSDR** para inspirar / probar. | |
| O9 | Transferencia a la Tierra: comunidades remotas con poco acceso a salud. | Ángulo de impacto del video 02:13. |

### Indicadores mencionados explícitamente
Presión arterial, frecuencia cardíaca, glucemia, temperatura corporal, horas de sueño diarias, estado de ánimo. Ejemplos adicionales del texto: glucosa en mg/dL, imágenes de ultrasonido.

### Peligros (NASA HRP) y problemas de salud asociados
- **Peligros:** radiación, aislamiento y confinamiento, distancia a la Tierra, campos de gravedad alterados, ambiente cerrado hostil.
- **Problemas:** cambios inmunes, pérdida de densidad ósea, eventos cardiovasculares, nutrición inadecuada, salud conductual.

### Preguntas que el desafío sugiere responder
1. ¿Qué mediciones se pueden hacer en el espacio?
2. ¿Por qué hace falta cada examen?
3. ¿Cómo afectan los peligros espaciales a cada indicador?
4. ¿Cuándo un resultado amerita atención de la tripulación o de los flight surgeons en tierra?
5. ¿Qué acciones previenen una condición crítica?

> Nuestro MVP debería responder estas 5 preguntas **por indicador**, con fuente. Es la columna vertebral de `data/indicators.json`.

## 3. Restricciones propias (de CLAUDE.md)
- Nada hardcodeado: contenido en `data/*.json` y `config/*.json`, validado con zod.
- Sin umbrales médicos inventados: lo que no tenga fuente verificada va como `"status": "PLACEHOLDER"` y la UI lo muestra como tal.
- UI y README en inglés. Accesibilidad AA, teclado, color no es la única señal.
- Desplegable en Vercel, sin base de datos salvo necesidad real.

## 4. Rúbrica de jueces — qué evidencia daría 10/10

Los 5 criterios base de Space Apps. Para cada uno: qué miran, y qué tenemos que **mostrar** (no solo decir) en la demo/README para sacar 10.

### Impact — ¿cuánto podría mejorar la situación?
- **10/10 se ve así:**
  - Un escenario concreto resuelto de punta a punta en la demo: "halfway to Mars, comms delay 20 min, crewmate con dolor de pecho" → la app guía paso a paso sin depender de tierra.
  - Cubre los dos modos de uso: **rutina diaria** (prevención) y **emergencia** (respuesta).
  - Funciona **offline** (en Marte no hay internet en tiempo real) — demostrado en vivo cortando la red.
  - Ruta clara de transferencia a la Tierra (comunidades remotas, Antártida, plataformas petroleras) sin cambiar código: solo otro set de JSON.
- **Evidencia:** video/demo del flujo de emergencia, toggle offline, sección "Earth use" en el README con el mismo motor y otros datos.

### Creativity — ¿qué tan original e innovador es?
- **10/10 se ve así:**
  - Una idea central que no sea "un dashboard de signos vitales más". Algo memorable en una frase.
  - Al menos una interacción que los jueces no hayan visto en otros proyectos (p. ej. cuerpo interactivo que cambia según el entorno/gravedad, modo "buddy check" entre tripulantes, latencia de comunicación con tierra como variable del diseño).
  - Decisiones de diseño justificadas por el contexto espacial (guantes, poca luz, microgravedad, estrés), no genéricas.
- **Evidencia:** una frase-gancho en el título; comparación explícita con lo existente (`02-mercado.md`) mostrando el hueco que llenamos.

### Validity — ¿es científicamente válido y factible?
- **10/10 se ve así:**
  - **Cada** afirmación científica visible tiene una fuente clickeable (`data/sources.json`), con fecha de consulta.
  - Ningún umbral inventado: lo no verificado está marcado `PLACEHOLDER` y la UI lo dice honestamente.
  - Indicadores elegidos por estar ligados a riesgos del NASA HRP y ser **medibles a bordo** con equipo realista.
  - Disclaimer claro: herramienta de apoyo, no reemplaza al flight surgeon.
  - Técnicamente funciona: desplegado, tests pasando, datos validados con esquema.
- **Evidencia:** panel "Sources" en la app, tests con Playwright, esquema zod, link al deploy.

### Relevance — ¿qué tan bien responde al desafío?
- **10/10 se ve así:**
  - Cumple **todos** los obligatorios R1–R7 y lo muestra con un checklist en el README que mapea requisito → pantalla.
  - Toca varios opcionales del enunciado (recordatorios, entornos, gráficos, color, figura humana) — no todos, pero bien hechos.
  - Responde las 5 preguntas del desafío por indicador.
  - Usa los recursos sugeridos (NASA HRP, OSDR) de forma visible.
- **Evidencia:** tabla "Challenge requirement → Feature" en README y en la presentación.

### Presentation — ¿qué tan claro y atractivo se comunica?
- **10/10 se ve así:**
  - Demo de ≤ 2–3 min que cuenta una historia (el escenario de Marte del video) en vez de recorrer menús.
  - App que se entiende sin explicación: un astronauta cansado sabe qué hacer en < 10 s.
  - Visualmente pulida, accesible (AA, teclado), responsive.
  - README en inglés con link al deploy, capturas, cómo cambiar los datos y fuentes.
- **Evidencia:** video corto, deploy público en Vercel, capturas, README limpio.

## 5. Implicancias para el MVP
1. El flujo de **emergencia** y el de **"valor anormal → qué hago"** son lo que más rubro cubre (Impact + Relevance). Van primero.
2. La credibilidad (Validity) depende de los datos con fuente: hay que poblar al menos 3–4 indicadores con fuentes reales antes de la demo, o mostrar con honestidad los PLACEHOLDER.
3. Creativity sale de la **idea central**, no de sumar features. Se decide en `03-concepto.md`.
