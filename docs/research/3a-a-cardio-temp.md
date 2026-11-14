# Investigación 3a-A — Frecuencia cardíaca, presión arterial y temperatura corporal

- Fecha de consulta de todas las fuentes: **2026-11-14**.
- Alcance: `heart_rate` (bpm), `blood_pressure` (mmHg, sistólica/diastólica), `body_temperature` (°C).
- Método: solo se registra lo que se vio en una página efectivamente descargada (WebFetch). Lo que no se pudo descargar queda **UNCONFIRMED**; lo que no tiene fuente queda **PLACEHOLDER**.
- Los textos de "Proposed UI text" están en inglés y son **paráfrasis** (no copias). Las citas entre comillas son solo localizadores (≤15 palabras).
- Este documento **no modifica** `data/`. Es insumo para quien edite `data/indicators.json` y `data/sources.json`.

> **Aviso de licencia importante (sorpresa):** los artículos de la *MedlinePlus Medical Encyclopedia* (`medlineplus.gov/ency/...`) **no son de dominio público**. La página de uso de contenido de MedlinePlus los lista como contenido de A.D.A.M. "protected by U.S. copyright laws" y solo permite enlaces directos. Por lo tanto: (1) la entrada existente `medlineplus_pulse` en `data/sources.json` tiene la licencia mal puesta ("Public domain"); debería decir algo como "Copyrighted (A.D.A.M. Medical Encyclopedia via MedlinePlus); linking allowed, paraphrase only". (2) Todo texto derivado de esas páginas debe ser paráfrasis propia + enlace, nunca copia. Fuente: "Using Content from MedlinePlus", NLM, https://medlineplus.gov/about/using/usingcontent/ (sección sobre materiales con copyright; localizador: "Any content from the A.D.A.M. Medical Encyclopedia").

> **Referencias terrestres:** todos los rangos y umbrales de este documento son para adultos en la Tierra. No se encontró ningún rango específico de vuelo espacial para HR, PA o temperatura. Cada dato numérico lleva la bandera **Earth reference — no spaceflight-specific range**.

---

## 1. Fuentes consultadas

| id sugerido | Título | Editor | URL | Fecha de la página | Licencia | Estado de descarga |
|---|---|---|---|---|---|---|
| `medlineplus_pulse` (existente) | Pulse | MedlinePlus (NLM) / A.D.A.M. | https://medlineplus.gov/ency/article/003399.htm | Review Date 1/1/2025 | Copyright A.D.A.M.; solo enlace + paráfrasis | OK |
| `medlineplus_palpitations` | Heart palpitations | MedlinePlus (NLM) / A.D.A.M. | https://medlineplus.gov/ency/article/003081.htm | Review Date 6/4/2026 | Copyright A.D.A.M. | OK |
| `medlineplus_bradycardia` | Slow heart rate - bradycardia | MedlinePlus (NLM) / A.D.A.M. | https://medlineplus.gov/ency/article/007856.htm | Review Date 7/21/2026 | Copyright A.D.A.M. | OK |
| `cdc_bp` (existente) | About High Blood Pressure | CDC | https://www.cdc.gov/high-blood-pressure/about/index.html | Last updated Oct 13, 2026 | Dominio público (US Gov) | OK |
| `cdc_bp_measure` | Measuring Your Blood Pressure | CDC | https://www.cdc.gov/high-blood-pressure/measure/index.html | Last updated Oct 13, 2026 | Dominio público (US Gov) | OK |
| `nhs_bp_test` | Blood pressure test | NHS (UK) | https://www.nhs.uk/conditions/blood-pressure-test/ | Last reviewed 25 Nov 2025 | Crown copyright; ver términos del sitio NHS | OK |
| `aha_bp_home` | Monitoring Your Blood Pressure at Home | American Heart Association | https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/monitoring-your-blood-pressure-at-home | — | Ver términos AHA | **403 Forbidden → UNCONFIRMED** |
| `medlineplus_body_temp_norms` | Body temperature norms | MedlinePlus (NLM) / A.D.A.M. | https://medlineplus.gov/ency/article/001982.htm | Review Date 1/1/2025 | Copyright A.D.A.M. | OK |
| `medlineplus_temperature_measurement` | Temperature measurement | MedlinePlus (NLM) / A.D.A.M. | https://medlineplus.gov/ency/article/003400.htm | Review Date 1/14/2026 | Copyright A.D.A.M. | OK |
| `medlineplus_fever` | Fever | MedlinePlus (NLM) / A.D.A.M. | https://medlineplus.gov/ency/article/003090.htm | Review Date 7/31/2024 | Copyright A.D.A.M. | OK |
| `medlineplus_hypothermia` | Hypothermia | MedlinePlus (NLM) / A.D.A.M. | https://medlineplus.gov/ency/article/000038.htm | Review Date 10/14/2025 | Copyright A.D.A.M. | OK |
| `cdc_fever` (existente) | Definitions of Signs, Symptoms, and Conditions of Ill Travelers | CDC Port Health | https://www.cdc.gov/port-health/php/definitions-symptoms-reportable-illness/index.html | (no re-consultada hoy; verificada 2026-11-12) | Dominio público | No re-descargada |
| `nasa_cardiovascular_vision` | Cardiovascular and Vision Laboratory | NASA (Human Health & Performance) | https://www.nasa.gov/directorates/esdmd/hhp/cardiovascular-and-vision | Last updated Mar 11, 2025 | Dominio público (US Gov) | OK |
| `nasa_standard_measures` | Spaceflight Standard Measures: Characterizing How Humans Adapt in Space | NASA | https://www.nasa.gov/humans-in-space/spaceflight-standard-measures-characterizing-how-humans-adapt-in-space | Last updated Nov 15, 2024 | Dominio público (US Gov) | OK |
| `nasa_std3001_medical_care_tb` | NASA-STD-3001 Technical Brief: Spaceflight Experience and Medical Care (OCHMO-TB-033) | NASA OCHMO | https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-033-spaceflight-experience-medical-care.pdf | — | Dominio público (US Gov) | **PDF descargado pero texto no extraíble → UNCONFIRMED** |
| (licencias) | Using Content from MedlinePlus | NLM | https://medlineplus.gov/about/using/usingcontent/ | — | — | OK |

---

## 2. HEART RATE (`heart_rate`, bpm)

### 2.1 how_to_measure — ya existe en `data/`, re-verificado

| Campo | Proposed UI text (EN, paráfrasis) | Valores | Fuente | Ubicación en la página |
|---|---|---|---|---|
| heart_rate.how_to_measure paso 1 | "At the wrist: lay your index and middle fingers flat on the inside of the opposite wrist, just below the thumb, and press until you feel the beat." | — | `medlineplus_pulse` | Sección de medición; localizador: "index and middle finger over the underside of your opposite wrist" |
| heart_rate.how_to_measure paso 2 (NUEVO matiz) | "At the neck: sit or lie down first, then press gently with two fingers in the soft hollow beside the Adam's apple. Never press both sides of the neck at once — it can reduce blood flow to the head and make you faint." | — | `medlineplus_pulse` | Localizador: "Sit or lie down before taking the neck pulse." |
| heart_rate.how_to_measure paso 3 | "Count the beats for a full minute, or count for 30 s and multiply by 2 (15 s × 4 or 10 s × 6 also work)." | 60 s; 30×2; 15×4; 10×6 | `medlineplus_pulse` | Sección de conteo |

Nota: la página también aclara que el pulso **no** debe usarse durante una emergencia médica (no se exploró más).

### 2.2 frequency — **PLACEHOLDER**

- No se encontró una recomendación autorizada de frecuencia de medición del pulso en reposo (ni terrestre ni para astronautas).
- NASA Standard Measures (`nasa_standard_measures`) mide frecuencia cardíaca **solo dentro de las pruebas sensoriomotoras antes y después de la misión** (localizador: "movement, balance, heart rate, and blood pressure"); la página no da frecuencia ni menciona medición en vuelo. Útil como contexto, no como frecuencia de automonitoreo.
- Sugerencia de UI mientras tanto: `"PLACEHOLDER: no authoritative self-monitoring frequency found."`

### 2.3 ranges

| Campo | Proposed UI text | Valores | Fuente | Ubicación | Bandera |
|---|---|---|---|---|---|
| heart_rate.ranges.normal | "Typical resting adult pulse: 60–100 beats per minute." | 60–100 bpm | `medlineplus_pulse` | Sección de valores normales (adultos y niños ≥10 años) | Earth reference — no spaceflight-specific range |
| heart_rate.actions.attention (contexto bajo) | "Well-trained athletes can rest at 40–60 bpm, and a pulse under 60 can be normal during sleep." | 40–60 bpm atletas; <60 en sueño | `medlineplus_pulse` (atletas), `medlineplus_bradycardia` (sueño/atletas) | Bradycardia: sección de definición, localizador "below 60 beats per minute" | Earth reference |
| heart_rate.ranges.attention (alto) — confirma corte | "A resting pulse over 100 bpm is called tachycardia." | >100 bpm | `medlineplus_palpitations` | Localizador: "over 100 beats per minute" | Earth reference |
| heart_rate.ranges.attention (bajo) — confirma corte | "A pulse under 60 bpm is called bradycardia; it is not always a problem." | <60 bpm | `medlineplus_bradycardia` | Definición | Earth reference |

Los cortes 60/100 de `data/` quedan confirmados por tres páginas coherentes.

### 2.4 attention → acción (refuerzo)

| Campo | Proposed UI text | Valores | Fuente | Ubicación |
|---|---|---|---|---|
| heart_rate.actions.attention texto | "Contact a health care professional promptly if your pulse is over 100 bpm at rest and you have not been exercising, anxious or feverish." | >100 bpm | `medlineplus_palpitations` | Sección "When to Contact a Medical Professional" |
| heart_rate.actions.attention texto | "Contact a health care professional if a slow pulse comes with symptoms such as tiredness, weakness, lightheadedness or confusion." | — | `medlineplus_bradycardia` | Sección de cuándo contactar al proveedor |

### 2.5 critical — umbral numérico **PLACEHOLDER**; señales de alarma **FOUND**

- Ninguna fuente consultada da un **número** de pulso que sea emergencia por sí solo. No inventar un rango `critical` numérico.
- Sí hay **síntomas de alarma** (red flags). Propuesta: el estado `critical` se dispara por síntomas declarados, no por el número (decisión de diseño a tomar por el equipo).

| Campo | Proposed UI text | Fuente | Ubicación |
|---|---|---|---|
| heart_rate.actions.critical texto 1 | "If a fast or irregular heartbeat comes with fainting or loss of alertness, chest pain, shortness of breath, unusual sweating, or dizziness, treat it as an emergency and get help immediately." | `medlineplus_palpitations` | Sección "When to Contact…", localizador: "Call 911 or the local emergency number" |
| heart_rate.actions.critical texto 2 | "If a slow pulse comes with chest pain, trouble breathing or fainting, get emergency help right away." | `medlineplus_bradycardia` | Sección de cuándo llamar al 911 |

Bandera: Earth reference — "911 / emergency" se traduce en la app a escalada `ground` (decisión de diseño, no médica).

---

## 3. BLOOD PRESSURE (`blood_pressure`, mmHg)

### 3.1 how_to_measure — **FOUND** (CDC, dominio público)

Fuente: `cdc_bp_measure`, secciones "How to measure your blood pressure at home" y "Tips for an accurate blood pressure reading".

| Campo | Proposed UI text (EN, paráfrasis) | Valores | Ubicación |
|---|---|---|---|
| blood_pressure.how_to_measure paso 1 | "For 30 minutes before measuring, do not eat, drink (including caffeine), smoke, drink alcohol or exercise." | 30 min | Tips; localizador: "exercised within 30 minutes" |
| paso 2 | "Empty your bladder first." | — | Tips |
| paso 3 | "Sit in a chair with your back supported, feet flat and legs uncrossed, and rest quietly for at least 5 minutes." | ≥5 min | How to measure at home |
| paso 4 | "Rest your arm on a table so the cuff is level with your chest." | altura del pecho | How to measure at home |
| paso 5 | "Wrap the cuff snugly around your bare upper arm." | — | Localizador: "Place the cuff on your bare upper arm" |
| paso 6 | "Stay still and do not talk while the cuff inflates and measures." | — | Tips |
| paso 7 | "Take at least two readings 1–2 minutes apart and log every result." | ≥2 lecturas; 1–2 min | How to measure at home |
| paso 8 (opcional) | "Follow your monitor's own instructions as well." | — | **No** es de CDC: el NHS (`nhs_bp_test`) dice que las instrucciones varían según el aparato y hay que seguir al fabricante. |

Complemento NHS (`nhs_bp_test`, sección de medición en casa): coincide en sentarse, brazo extendido apoyado en la mesa, manguito en el brazo, quedarse quieto, esperar ~1 minuto antes de repetir (localizador: "Outstretch your arm, rest it on a table and relax"). CDC no menciona monitores de muñeca ni tamaño de manguito.

Nota espacial: "sentado con pies planos" y "brazo a la altura del pecho" son instrucciones de gravedad terrestre; en microgravedad la postura no tiene el mismo efecto hidrostático (ver §5). No se encontró una adaptación oficial para vuelo → señalarlo en la UI como referencia terrestre.

### 3.2 frequency — **FOUND (solo terrestre)** + AHA **UNCONFIRMED**

| Campo | Proposed UI text | Valores | Fuente | Ubicación | Bandera |
|---|---|---|---|---|---|
| blood_pressure.frequency.label | "Measure at the same time each day; your care team (here: flight surgeon) decides how often." | diario, misma hora | `cdc_bp_measure` | How to measure at home; la página no fija un calendario | Earth reference |
| blood_pressure.frequency.label (alternativa con número) | "When home monitoring is requested, take readings twice a day — morning and evening — for the number of days your clinician sets." | 2/día (mañana y noche) | `nhs_bp_test` | Sección de medición en casa; localizador: "once in the morning and once in the evening" | Earth reference |
| frequency.every_hours sugerido | 12 (si se adopta la pauta NHS) | 12 h | `nhs_bp_test` | idem | Earth reference — decisión de diseño adoptarla |
| AHA home monitoring | — | — | `aha_bp_home` | **HTTP 403 → UNCONFIRMED**. No usar nada de AHA. | — |

Práctica en la ISS: **PLACEHOLDER**. NASA Standard Measures mide PA solo pre/post-vuelo dentro de las pruebas sensoriomotoras (`nasa_standard_measures`). No se encontró documento oficial descargable con la frecuencia rutinaria en órbita.

### 3.3 ranges — ya existen, re-verificados hoy (`cdc_bp`, tabla "Blood Pressure Categories", sección Diagnosis)

| Categoría | Valores (mmHg) | Bandera |
|---|---|---|
| Normal | sistólica <120 **y** diastólica <80 | Earth reference |
| Elevated | 120–129 **y** <80 | Earth reference |
| Stage 1 hypertension | 130–139 **o** 80–89 | Earth reference |
| Stage 2 hypertension | ≥140 **o** ≥90 | Earth reference |
| Severe hypertension (sin síntomas) | >180 y/o >120 → llamar al profesional de salud | Earth reference |
| Hypertensive emergency (con síntomas) | >180 y/o >120 + síntomas → llamar al 911 | Earth reference |

Coincide con `data/indicators.json` (corte crítico >180 / >120, exclusivo). Dato extra NHS (`nhs_bp_test`): en casa se considera alta desde **135/85** (en consulta desde 140/90). Es un criterio distinto al de CDC; **no mezclar** — se registra solo como contexto.

Presión baja: **PLACEHOLDER**. NHS solo dice que puede causar mareo o desmayo, sin número (localizador: "dizziness or fainting").

### 3.4 actions

| Campo | Proposed UI text | Fuente | Ubicación | Estado |
|---|---|---|---|---|
| blood_pressure.actions.attention texto 2 | — | — | Ninguna fuente consultada da una acción específica para "elevated" a "stage 2" más allá de que el proveedor puede repetir mediciones en varias visitas (`cdc_bp`, "measure your blood pressure regularly"). | **PLACEHOLDER** |
| blood_pressure.actions.critical texto 1 (ya existe) | "Severe hypertension without symptoms: contact a health care professional (here: ground control)." | `cdc_bp` | Tabla, fila Severe Hypertension | FOUND |
| blood_pressure.actions.critical texto 2 (ya existe) | "With chest pain, shortness of breath, back pain, numbness, weakness, vision changes or difficulty speaking, it is a hypertensive emergency: get emergency help now." | `cdc_bp` | Localizador: "Hypertensive Emergency (If you have any of these symptoms" | FOUND |

---

## 4. BODY TEMPERATURE (`body_temperature`, °C)

### 4.1 how_to_measure — **FOUND**

Fuente principal: `medlineplus_temperature_measurement` (copyright A.D.A.M.: solo paráfrasis + enlace).

| Campo | Proposed UI text (EN, paráfrasis) | Valores | Ubicación |
|---|---|---|---|
| body_temperature.how_to_measure paso 1 (ya existe, `cdc_fever`) | "Use a thermometer reading rather than guessing — a measured temperature is preferred." | — | `cdc_fever` (no re-consultada hoy) |
| paso 2 | "Wait at least 1 hour after hard exercise or a hot bath, and 20–30 minutes after eating, smoking or drinking something hot or cold." | 1 h; 20–30 min | Sección de preparación |
| paso 3 | "Clean the thermometer before and after use with cool soapy water or rubbing alcohol." | — | Sección de preparación |
| paso 4 | "Oral: place the probe under your tongue, close your mouth and breathe through your nose. Leave it for 3 minutes or until it beeps." | 3 min | Localizador: "Leave the thermometer in the mouth for 3 minutes" |
| paso 5 (alternativa) | "Armpit: put the thermometer in the armpit and hold your arm against your body for 5 minutes or until it beeps." | 5 min | Sección axilar |
| paso 6 | "Readings depend on the site: ear and rectal are usually 0.3–0.6 °C higher than oral; armpit and forehead are usually 0.3–0.6 °C lower. Always note which method you used." | ±0.3–0.6 °C | Sección "Normal Results" |
| nota | "Plastic strip thermometers measure skin temperature and are not recommended for general home use." | — | Sección de tipos de termómetro |

### 4.2 frequency — **PLACEHOLDER**

No se encontró ninguna recomendación autorizada de frecuencia de medición de temperatura (ni terrestre ni ISS). NASA Standard Measures no menciona temperatura.

### 4.3 ranges

| Campo | Proposed UI text | Valores | Fuente | Ubicación | Bandera |
|---|---|---|---|---|---|
| body_temperature.ranges.normal | "Normal body temperature varies; studies report a range of about 36.1–37.2 °C, with 37 °C as the commonly accepted average. It is lowest in the early morning." | 36.1–37.2 °C (prom. 37 °C) | `medlineplus_body_temp_norms` | Localizador: "can have a wide range, from 97°F (36.1°C) to 99°F (37.2°C)" | Earth reference — no spaceflight-specific range |
| body_temperature.ranges.attention (fiebre, ya existe) | "Fever: 38 °C or higher." | ≥38 °C | `cdc_fever` (existente); concordante con `medlineplus_body_temp_norms` ("over 100.4°F (38°C)") | — | Earth reference |
| body_temperature.ranges.critical (alto) | "Fever of 40.6 °C or higher: contact a health care professional right away." | ≥40.6 °C | `medlineplus_fever` | Sección "When to Contact a Medical Professional" | Earth reference |
| body_temperature.ranges.critical (bajo) | "Below 35 °C is hypothermia, a dangerously low temperature: call for emergency help." | <35 °C | `medlineplus_hypothermia` | Localizador: "dangerously low body temperature, below 95°F (35°C)" | Earth reference |

**Brecha y conflicto a decidir (sorpresa):**
- Entre 37.2 y 38 °C ninguna fuente define estado → requiere `"allow_gaps": true` o una decisión de diseño explícita.
- Entre 35 y 36.1 °C tampoco hay estado definido.
- `medlineplus_fever` dice que un adulto **probablemente** tiene fiebre con temperatura oral por encima de 37.2–37.5 °C según la hora (localizador: "temperature measured in the mouth is above 99°F to 99.5°F"), lo que **no coincide** con el corte ≥38 °C de CDC/MedlinePlus norms. Recomendación: mantener ≥38 °C (`cdc_fever`, dominio público) y mencionar la diferencia en la nota de la fuente.
- La fiebre de MedlinePlus se mide en grados por encima de la temperatura habitual de cada persona (`medlineplus_temperature_measurement`: 1–1.5 °F por encima de lo normal), lo que respalda pedir una línea base personal.

### 4.4 actions

| Campo | Proposed UI text | Fuente | Ubicación | Estado |
|---|---|---|---|---|
| body_temperature.actions.normal | "Your temperature is within the {range.normal.min}–{range.normal.max} {unit} range reported as normal." | `medlineplus_body_temp_norms` | §4.3 | FOUND |
| body_temperature.actions.attention texto 2 | "A mild fever with no other problems often needs no treatment: drink fluids and rest. Remove extra layers; a lukewarm sponge bath can help. Avoid cold baths, ice or alcohol rubs, which can cause shivering." | `medlineplus_fever` | Sección "Home Care"; localizador: "lower, not eliminate, the fever" | FOUND (los consejos de medicamentos se omiten a propósito: no corresponde a una app educativa) |
| body_temperature.actions.attention texto 3 | "Contact a health care professional if a fever stays at or above 39.4 °C, lasts more than 48–72 hours, or keeps coming back for a week or more." | `medlineplus_fever` | Sección "When to Contact…"; localizador: "stays at or keeps rising above 103°F (39.4°C)" | FOUND |
| body_temperature.actions.critical texto 1 | "With fever plus confusion or being hard to wake, trouble breathing or walking, blue lips or nails, a severe headache with stiff neck, or a seizure: get emergency help now." | `medlineplus_fever` | Localizador: "911 or the local emergency number" | FOUND |
| body_temperature.actions.critical texto 2 | "Suspected hypothermia (below 35 °C, uncontrollable shivering, confusion, drowsiness, slow breathing or heart rate): get emergency help immediately." | `medlineplus_hypothermia` | Secciones de síntomas y "When to Contact…" | FOUND |

Bandera de todas: Earth reference — no spaceflight-specific range. "911" → escalada `ground` en la app (decisión de diseño).

---

## 5. Contexto de vuelo espacial (para `why_it_matters` o notas)

| Campo | Proposed UI text | Valores | Fuente | Ubicación | Estado |
|---|---|---|---|---|---|
| heart_rate / blood_pressure.why_it_matters | "In weightlessness about 2 liters of fluid shift from the legs toward the head, and the body responds by reducing total blood volume." | ~2 L | `nasa_cardiovascular_vision` | Recuadro "Fun Fact"; localizador: "approximately 2 liters of fluid move from the lower to the upper body" | FOUND |
| blood_pressure.why_it_matters | "Back in gravity, many crew members feel faint when standing (orthostatic intolerance); without countermeasures more than 60% of astronauts can be affected." | >60% | `nasa_cardiovascular_vision` | Localizador: "more than 60% of astronauts can be affected by orthostatic intolerance" | FOUND |
| contexto de monitoreo | "NASA's Standard Measures test heart rate and blood pressure, together with movement and balance, before and after missions." | — | `nasa_standard_measures` | Sección Sensorimotor | FOUND |
| contexto de monitoreo | NASA-STD-3001 pide evaluar, registrar y seguir la tendencia de signos vitales en misión; ortostatismo = PA baja + FC alta. | — | `nasa_std3001_medical_care_tb` | El PDF se descargó pero su texto **no se pudo extraer** (sin herramienta PDF en este entorno). Solo se vio en el snippet del buscador. | **UNCONFIRMED** |
| frecuencia rutinaria ISS | — | — | No se encontró documento oficial descargable. | — | **PLACEHOLDER** |
| rangos específicos de vuelo | — | — | No se encontró ninguna fuente con rangos de HR/PA/temperatura para vuelo. | — | **PLACEHOLDER** |

Fuente existente relacionada: `nasa_hrp_risks` ya dice que la ingravidez altera la circulación y la función del corazón y los vasos.

---

## 6. Tabla resumen

| # | Dato | Estado | Source id sugerido |
|---|---|---|---|
| 1 | heart_rate.how_to_measure muñeca | FOUND | `medlineplus_pulse` |
| 2 | heart_rate.how_to_measure cuello (sentarse/acostarse; nunca ambos lados) | FOUND | `medlineplus_pulse` |
| 3 | heart_rate.how_to_measure conteo | FOUND | `medlineplus_pulse` |
| 4 | heart_rate.frequency | PLACEHOLDER | — |
| 5 | heart_rate.ranges.normal 60–100 bpm | FOUND | `medlineplus_pulse` |
| 6 | heart_rate excepciones (atletas 40–60, sueño <60) | FOUND | `medlineplus_pulse`, `medlineplus_bradycardia` |
| 7 | heart_rate taquicardia >100 / bradicardia <60 + cuándo consultar | FOUND | `medlineplus_palpitations`, `medlineplus_bradycardia` |
| 8 | heart_rate.actions.critical (síntomas de alarma) | FOUND | `medlineplus_palpitations`, `medlineplus_bradycardia` |
| 9 | heart_rate.ranges.critical numérico | PLACEHOLDER | — |
| 10 | blood_pressure.how_to_measure (7 pasos) | FOUND | `cdc_bp_measure` |
| 11 | blood_pressure.frequency (misma hora diaria / 2 por día mañana y noche) | FOUND (Earth only) | `cdc_bp_measure`, `nhs_bp_test` |
| 12 | blood_pressure.ranges (categorías) | FOUND | `cdc_bp` |
| 13 | blood_pressure.critical (severa / emergencia con síntomas) | FOUND | `cdc_bp` |
| 14 | blood_pressure.actions.attention (qué hacer en elevated–stage 2) | PLACEHOLDER | — |
| 15 | blood_pressure presión baja (umbral) | PLACEHOLDER | — |
| 16 | AHA home BP monitoring | UNCONFIRMED-blocked (403) | `aha_bp_home` |
| 17 | body_temperature.how_to_measure oral/axilar | FOUND | `medlineplus_temperature_measurement` |
| 18 | body_temperature.how_to_measure esperas previas y limpieza | FOUND | `medlineplus_temperature_measurement` |
| 19 | body_temperature diferencias por sitio (±0.3–0.6 °C) | FOUND | `medlineplus_temperature_measurement` |
| 20 | body_temperature.frequency | PLACEHOLDER | — |
| 21 | body_temperature.ranges.normal 36.1–37.2 °C | FOUND | `medlineplus_body_temp_norms` |
| 22 | body_temperature fiebre ≥38 °C | FOUND | `cdc_fever` (existente), `medlineplus_body_temp_norms` |
| 23 | body_temperature fiebre alta ≥40.6 °C / persistente ≥39.4 °C / >48–72 h | FOUND | `medlineplus_fever` |
| 24 | body_temperature síntomas de emergencia con fiebre | FOUND | `medlineplus_fever` |
| 25 | body_temperature hipotermia <35 °C | FOUND | `medlineplus_hypothermia` |
| 26 | body_temperature cuidado en casa de fiebre leve | FOUND | `medlineplus_fever` |
| 27 | Espacio: desplazamiento de ~2 L de líquido; intolerancia ortostática >60% | FOUND | `nasa_cardiovascular_vision` |
| 28 | Espacio: Standard Measures HR y PA pre/post-vuelo | FOUND | `nasa_standard_measures` |
| 29 | Espacio: NASA-STD-3001 signos vitales en misión | UNCONFIRMED (PDF no extraíble) | `nasa_std3001_medical_care_tb` |
| 30 | Espacio: frecuencia rutinaria de monitoreo en la ISS | PLACEHOLDER | — |
| 31 | Espacio: rangos específicos de vuelo para HR/PA/temperatura | PLACEHOLDER | — |

**Totales:** FOUND 22 · UNCONFIRMED 2 · PLACEHOLDER 7.

**Corrección pendiente en `data/sources.json` (no aplicada aquí):** la licencia de `medlineplus_pulse` debe cambiar de "Public domain" a copyright A.D.A.M. (solo enlace + paráfrasis).
