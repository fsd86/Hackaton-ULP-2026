# 03 — Conceptos

Tres conceptos con **ideas centrales distintas** (no variantes del mismo dashboard). Puntuados 1–5 contra la rúbrica de `01-brief.md` y contra el esfuerzo para un equipo chico en ~48 h. Los huecos H1–H6 son los de `02-mercado.md`.

---

## Concepto A — "Mission Health Console" (el dashboard bien hecho)
**Idea central:** un tablero de salud con figura humana clickeable. Cada zona del cuerpo muestra sus indicadores con código de color + ícono; se cargan valores a mano, se ven gráficos de evolución y recordatorios de medición. Selector de entorno (nave / estación / base lunar).

- **Flujo principal:** abrir → ver cuerpo con estados → tocar zona → ver indicador, cómo medirlo, por qué importa → cargar valor → ver estado y acción sugerida.
- **Cubre:** R1, R2, R3, R5, R6, R7; opcionales O1, O2, O4, O5, O6.
- **Flojo en:** R4 (emergencia queda como una pantalla más), H2, H4.
- **Riesgo:** es el patrón que repite casi todo el mundo (H5). Bueno pero olvidable.

## Concepto B — "Earth Is Far": copiloto de salud que asume demora de comunicaciones ✅
**Idea central:** la **demora con tierra es una variable del diseño**. Cada entorno trae su demora de comunicación (ISS ≈ casi tiempo real; Luna ≈ segundos; Marte ≈ 4–24 min solo ida, *con fuente*). La app usa eso para decidir **cómo guiar**:
- Cada estado de un indicador tiene un **nivel de escalamiento**: *self-care* → *crew* → *flight surgeon*.
- Si hace falta tierra y la demora supera el umbral configurado, la app dice **"act now with the crew protocol, then report"** y muestra un contador: *"Ground's answer could arrive at ~14:52 at the earliest"*.
- Tres modos:
  1. **Daily check** (rutina): asistente guiado por indicador → cómo medir → por qué importa → cargar valor → estado (color + ícono + texto) → qué hacer → a quién escalar.
  2. **Emergency** (botón rojo grande siempre visible): protocolos en tarjetas paso a paso, letras grandes, temporizadores, cada paso se registra con hora. Escenario del video: "crewmate collapses with chest pain".
  3. **Downlink report**: arma automáticamente un mensaje completo para los flight surgeons (lecturas, tendencias, pasos ya hechos, hora) para que no haga falta ida y vuelta. Copiar / descargar.
- **Extras con buena relación costo/valor:** gráficos de tendencia, recordatorios según la frecuencia del JSON, panel de fuentes, funciona offline (PWA).
- **Transferencia a la Tierra (H6):** el mismo motor con un entorno "Remote clinic — 6 h to nearest doctor". Solo JSON.
- **Cubre:** R1–R7 completos; O1, O2, O4, O5, O9 (+ O6 como stretch).
- **Riesgo principal:** los protocolos de emergencia y los umbrales necesitan **fuentes reales**; sin ellas se ven como PLACEHOLDER. Mitigación: la demo se apoya en la *mecánica* (demora → escalamiento → reporte), que es válida aunque los umbrales estén pendientes, y se poblan 3–4 indicadores con fuente antes de presentar.

## Concepto C — "Buddy Check": salud conductual y monitoreo entre pares
**Idea central:** los astronautas subestiman sus propios síntomas, sobre todo los conductuales. Cada tripulante evalúa a **otro** con un chequeo corto y gamificado: test de tiempo de reacción en el navegador (inspirado en el Reaction Self Test de NASA), escala de ánimo, sueño, y preguntas observacionales ("¿tu compañero está más irritable?"). Puntos de tripulación por constancia; tablero del equipo.

- **Flujo principal:** recordatorio → elegir compañero → test de reacción + preguntas → resultado del equipo → sugerencias.
- **Cubre:** R1, R2, R6, R7 (aislamiento); O1, O3, O4.
- **Flojo en:** R4 (emergencia física), R3 para indicadores fisiológicos (presión, glucosa, temperatura quedan afuera o forzados).
- **Riesgo:** validez del test de reacción y de los umbrales de fatiga; necesita varios usuarios para lucirse en la demo; se aleja del escenario del video.

---

## Puntuación

Escala 1–5 (5 = mejor). En **Esfuerzo**, 5 = más fácil de terminar bien en 48 h. Pesos: los 5 criterios valen 1 cada uno; esfuerzo vale 1 (lo usamos como desempate de factibilidad).

| Criterio | A · Console | B · Earth Is Far | C · Buddy Check |
|---|---|---|---|
| **Impact** | 3 — útil en rutina, débil en emergencia | **5** — prevención + emergencia + reporte sin depender de tierra; transferible a la Tierra | 3 — ataca un riesgo real (conductual) pero parcial |
| **Creativity** | 2 — patrón visto muchas veces | **4** — la demora como variable de diseño no la vimos en hackatones ni en apps terrestres | **4** — monitoreo entre pares es original |
| **Validity** | 4 — umbrales simples de documentar | 4 — mecánica sólida; protocolos de emergencia exigen buenas fuentes | 3 — test de reacción/umbrales de fatiga difíciles de validar en un navegador |
| **Relevance** | 4 — cubre muchos opcionales | **5** — responde directo el escenario del video y las 5 preguntas del desafío | 2 — deja afuera la mitad de los indicadores pedidos |
| **Presentation** | 4 — muy visual (figura humana) | **5** — demo con historia: "halfway to Mars…" + botón de emergencia + contador de demora | 3 — necesita varios jugadores para mostrarse |
| **Esfuerzo (5 = fácil)** | **4** | 3 | 3 |
| **Total (/30)** | 21 | **26** | 18 |

## Elección: **B — "Earth Is Far"** (nombre de trabajo)

**Por qué:**
1. **Responde el escenario exacto del video** ("halfway to Mars, your crewmate collapses — what should you do?"). Ningún otro concepto lo pone en el centro. Eso maximiza Relevance y Presentation.
2. **Llena huecos reales (H1–H4)** que ni las apps de las agencias ni los hackatones previos cubren: interpretar a bordo, adaptar la guía a la demora, guiar emergencias a no médicos y traspasar a tierra en un solo mensaje. Alineado con la dirección que NASA describe para EIMO/CDSS.
3. **Absorbe lo mejor de A** sin depender de él: color + ícono, gráficos, recordatorios y entornos entran como slices; la figura humana queda como stretch.
4. **La regla "todo en JSON" juega a favor:** la demora, el equipo disponible, los protocolos y los umbrales son datos. Cambiar a "Remote clinic on Earth" es editar JSON → argumento fuerte de Impact.
5. **Validez honesta:** la mecánica (demora → escalamiento → reporte) es correcta aunque falten umbrales; lo no verificado se muestra como PLACEHOLDER en vez de inventarse.

**Qué tomamos de C:** si sobra tiempo, el test de reacción como un "indicador" más del Daily check (fuente: Reaction Self Test de NASA), sin la parte multiusuario.

**Qué NO hacemos:** diagnóstico automático, IA que "decide" tratamientos, wearables reales, backend/base de datos, cuentas de usuario.

**Riesgos y mitigación:**
| Riesgo | Mitigación |
|---|---|
| Protocolos de emergencia sin fuente verificada | Estructura completa en JSON con `PLACEHOLDER`; antes de la demo poblar 1 protocolo con fuente oficial (p. ej. guías de primeros auxilios / RCP de organismos reconocidos) o mostrarlo explícitamente como placeholder. |
| Demora "inventada" | Valores de demora solo con fuente (NTRS para Marte); el umbral "a partir de cuánto actuar sin tierra" es un parámetro de diseño en `config/`, no un dato médico, y se documenta así. |
| Se percibe como "app médica que reemplaza al médico" | Disclaimer visible + el escalamiento siempre termina en flight surgeon. |
| Alcance | Slices ordenados por valor de demo; lo de abajo de la línea se corta sin dolor. |
