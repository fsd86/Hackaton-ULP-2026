# Investigación 3a-b: glucosa, sueño y ánimo

- Fecha de consulta de todas las fuentes: **2026-11-14**
- Alcance: `blood_glucose` (mg/dL, glucómetro de dedo), `sleep_hours` (horas), `mood` (escala 1–5).
- Regla: los textos para la UI ("Proposed UI text") van en inglés y son **paráfrasis**. Nunca son copia de la fuente. Las citas entre comillas son solo **localizadores** (≤15 palabras) para encontrar el dato en la página.
- Este documento **no modifica** `data/`. Solo propone.
- Bandera **[EARTH]** = "Earth reference — no spaceflight-specific range". Significa que el dato es de población general en la Tierra y no hay un rango específico para vuelo espacial.
- Licencias: las páginas de CDC, NIH (MedlinePlus, NIDDK, NIMH) y NASA son obras del Gobierno de EE. UU. y por eso son de dominio público. Las demás se indican caso por caso.

---

## 0. Estado actual en `data/` (leído antes de investigar)

| Indicador | Qué hay hoy | Huecos |
|---|---|---|
| `blood_glucose` | Critical <54 y attention 54–<70 (fuente `cdc_low_glucose`). Acciones 15-15 (`cdc_treat_low_glucose`). | El rango `normal` es null, por eso un valor de 76 se ve como "Unknown". No hay rango alto, `how_to_measure`, frecuencia ni texto para normal. |
| `sleep_hours` | Attention <7, normal ≥7 (`cdc_sleep`). | Faltan `how_to_measure`, frecuencia, el texto de qué hacer tras una noche corta y un nivel crítico. |
| `mood` | Escala 1–5 con etiquetas PLACEHOLDER. | No tiene rangos, acciones, `how_to_measure` ni frecuencia. |

---

## 1. Glucosa en sangre (`blood_glucose`)

### G1. Rango normal en ayunas — FOUND [EARTH]
- **Campo:** `ranges[normal]` (solo si la lectura es en ayunas)
- **Números:** normal en ayunas **≤99 mg/dL**; prediabetes **100–125**; diabetes **≥126** (el diagnóstico es de laboratorio, no de glucómetro).
- **Fuente A:** "Diabetes Testing", CDC. URL: https://www.cdc.gov/diabetes/diabetes-testing/index.html (fechada 15-may-2024). Ubicación: sección **"Types of tests"**, tabla del *fasting blood sugar test*, con las filas 99 or below / 100–125 / 126 or above. Dominio público.
- **Fuente B (corrobora y da el piso):** "Blood sugar test", MedlinePlus Medical Encyclopedia (NLM). URL: https://medlineplus.gov/ency/article/003482.htm (Review Date 1/10/2025). Ubicación: **"Normal Results"**, con el localizador "a level of 70 to 99 mg/dL (3.9 and 5.5 mmol/L) is considered normal". Los valores 100–125 y ≥126 están en **"What Abnormal Results Mean"**. Dominio público.
- **Proposed UI text (normal):** "Fasting reading in the usual range for adults (70–99 mg/dL). This is an Earth reference for the general population, not a spaceflight-specific range."
- **Nota de diseño:** el rango 70–99 aplica **solo en ayunas** (tras una noche sin comer). La app hoy no sabe si la lectura es en ayunas. Opciones (para que decida el equipo): (a) agregar en el input un toggle "fasting / not fasting"; (b) asumir ayunas y decirlo en `how_to_measure`. Encaja con los umbrales actuales: <70 attention y <54 critical (`cdc_low_glucose`). Así un 76 en ayunas pasaría a "normal".

### G2. Límite de precisión del glucómetro — FOUND
- **Campo:** nota o `how_to_measure` (descargo de responsabilidad)
- **Dato:** la glucosa medida en sangre venosa (laboratorio) se considera más exacta que la de un pinchazo en el dedo o un monitor continuo. Además, los rangos pueden variar un poco entre laboratorios.
- **Fuente:** MedlinePlus "Blood sugar test" (misma URL que G1). Ubicación: **"Normal Results"**, último párrafo, con el localizador "considered more accurate than blood glucose measured from a fingerstick".
- **Proposed UI text:** "A home meter reading is an estimate; a lab blood test from a vein is more accurate."

### G3. Qué cuenta como "alta" — FOUND (en ayunas) / PARCIAL (sin ayunas) [EARTH]
- **Campo:** `ranges[attention]` (alto)
- **En ayunas:** ≥100 mg/dL queda por encima del rango normal (100–125 se llama *impaired fasting glucose*, un tipo de prediabetes) y ≥126 "usually means" diabetes. Fuente: MedlinePlus, **"What Abnormal Results Mean"**, con el localizador "impaired fasting glucose, a type of prediabetes". También la tabla de CDC Diabetes Testing.
- **Sin ayunas (al azar):** ≥200 mg/dL en un test al azar corresponde a diabetes. Fuente: CDC Diabetes Testing, **"Types of tests"**, fila *random blood sugar test* (200 or above). MedlinePlus dice lo mismo, con el localizador "a result of 200 mg/dL or higher often indicates diabetes" (sección "What Abnormal Results Mean").
- **Metas para personas CON diabetes (no aplican a población sana, solo como contexto):** antes de comer 80–130 mg/dL; 1–2 h después de comer <180 mg/dL. Fuente: "Monitoring Your Blood Sugar", CDC. URL: https://www.cdc.gov/diabetes/diabetes-testing/monitoring-blood-sugar.html. Ubicación: el localizador "Before meals: 80 to 130 mg/dL". Dominio público.
- **Proposed UI text (attention-high, ayunas 100–125):** "Fasting reading above the usual adult range. One meter reading is not a diagnosis; recheck and tell your crew medical officer if it stays high."
- **Proposed UI text (attention-high, ≥126 ayunas o ≥200 al azar):** "High reading. On Earth, values like this are used (with lab tests) to diagnose diabetes. Report it to your crew medical officer."
- **Ojo:** "recheck" y "tell your crew medical officer" son decisiones de UX, no texto de fuente. La fuente solo dice que hay que consultar al proveedor de salud.

### G4. Señales de alarma por glucosa alta — FOUND (contexto: personas con diabetes) [EARTH]
- **Campo:** `ranges[critical]` (alto) y `actions.critical`
- **Números:** si la glucosa **se mantiene ≥300 mg/dL** → ir a emergencias o llamar al 911. Si una persona con diabetes está enferma o tiene **≥250 mg/dL**, la fuente indica medir cada 4–6 h y buscar cetonas en orina.
- **Otras señales de emergencia en la misma fuente:** aliento con olor frutal, vómitos sin poder retener líquidos, dificultad para respirar, varios síntomas de cetoacidosis a la vez.
- **Fuente:** "Diabetic Ketoacidosis", CDC. URL: https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html (fechada 15-may-2024). Ubicación: subsección **"High ketones? Call 911"** dentro de "Testing", con el localizador "Go to the emergency room or call 911 right away". Dominio público.
- **Proposed UI text (critical-high ≥300):** "Very high reading. If it stays this high, or you have fruity breath, vomiting or trouble breathing, this needs urgent medical care — contact ground medical support now."
- **Advertencia:** estos umbrales están escritos para personas con diabetes. Usarlos como "critical" en una población sana es una decisión del equipo y conviene documentarla.

### G5. Síntomas de glucosa alta — FOUND [EARTH]
- **Campo:** `actions.attention` (texto complementario)
- **Dato:** los síntomas comunes son orinar más, mucha sed, mucha hambre incluso después de comer, visión borrosa, cansancio, heridas que no cicatrizan e infecciones frecuentes. Mucha gente no tiene síntomas.
- **Fuente:** "Symptoms & Causes of Diabetes", NIDDK (NIH). URL: https://www.niddk.nih.gov/health-information/diabetes/overview/symptoms-causes (Last Reviewed October 2024). Ubicación: **"What are the symptoms of diabetes?"**, con el localizador "Talk with your primary health care professional about any symptoms". Dominio público.
- **Proposed UI text:** "Signs that can come with high blood sugar: more urination, strong thirst or hunger, blurred vision, tiredness. Many people feel nothing."

### G6. Cómo medir con glucómetro (paso a paso) — FOUND
- **Campo:** `how_to_measure`
- **Fuente:** "Monitoring Your Blood Sugar", CDC. URL: https://www.cdc.gov/diabetes/diabetes-testing/monitoring-blood-sugar.html (fechada mayo 2024). Ubicación: sección **"How to monitor"**, con el localizador "Make sure the meter is charged and ready to use." Dominio público.
- **Proposed UI text (paráfrasis de los pasos de CDC):**
  1. "Check that the meter is charged and ready."
  2. "Wash your hands with soap and warm water, then dry them well."
  3. "Shake or massage your hand to bring blood into your finger."
  4. "Prick the side of your fingertip with the lancet. Gently squeeze from the base of the finger and put a small drop of blood on the test strip."
  5. "Insert the strip into the meter and wait a few seconds for the reading."
  6. "Log the result and note anything that may have affected it (food, exercise, illness)."
  7. "Throw away the used lancet and strip."
  8. "Never share lancets or other monitoring supplies."
- **Nota:** el paso 4 ("side of the fingertip") viene del resumen de búsqueda. La página dice "prick your finger with a lance". **Recomiendo usar "Prick your fingertip"** hasta confirmar la palabra "side".
- **Agregar un paso de UX propio (sin fuente):** "Follow your meter's own instructions." Hay que marcarlo como consejo general.

### G7. Frecuencia — FOUND (y la respuesta honesta es "no hay rutina para sanos")
- **Campo:** `frequency`
- **Personas con diabetes:** la fuente dice que el médico decide cuándo y cada cuánto medir. Fuente: CDC "Monitoring Your Blood Sugar", con el localizador "Your doctor will tell you when and how often to check."
- **Personas sin diabetes:** no hay recomendación de automonitoreo con glucómetro. Lo que existe es **tamizaje clínico**. La USPSTF (grado B, 24-ago-2021) recomienda tamizaje a adultos de 35–70 años con sobrepeso u obesidad, y dice que cada 3 años puede ser razonable si la glucosa es normal. Fuente: "Screening for Prediabetes and Type 2 Diabetes", U.S. Preventive Services Task Force. URL: https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes. Ubicación: sección **"How often?"**, con el localizador "Screening every 3 years may be a reasonable approach". Licencia: AHRQ/USPSTF, contenido del Gobierno de EE. UU. (dominio público, salvo las imágenes que indiquen otra cosa).
- **Además:** CDC indica que quien tenga factores de riesgo pregunte a su médico si debe hacerse el tamizaje (CDC Diabetes Testing, sección "When to get tested").
- **Proposed UI text (`frequency.label`):** "No routine home-check schedule exists for people without diabetes; measure when your mission protocol or medical officer asks, or if you feel unwell." → `every_hours: null`. Que haya un protocolo de misión es una suposición de UX; si se usa, va como PLACEHOLDER.
- **Espacio:** no encontré una frecuencia de glucemia capilar específica para tripulaciones. → **PLACEHOLDER**.

### G8. Glucosa baja — ya está en data (sin cambios)
- `cdc_low_glucose` y `cdc_treat_low_glucose` siguen vigentes. No las volví a consultar.

---

## 2. Sueño diario (`sleep_hours`)

### S1. Horas recomendadas para adultos — FOUND [EARTH]
- **Campo:** `ranges[normal]` (≥7, como ya está)
- **Fuente A (ya existe, `cdc_sleep`):** "FastStats: Sleep in Adults", CDC. URL: https://www.cdc.gov/sleep/data-and-statistics/adults.html (15-may-2024). Ubicación: **"The basics"**, con el localizador "The recommended amount of sleep for adults is at least 7 hours each day."
- **Fuente B (por edad):** "About Sleep", CDC. URL: https://www.cdc.gov/sleep/about/index.html (15-may-2024). Ubicación: tabla **"Getting enough sleep"**. Los valores son: 18–60 años → 7 o más horas; 61–64 → 7–9 h; 65+ → 7–8 h. Dominio público.
- **Fuente C (primaria, consenso de sociedades):** Watson NF et al., "Recommended Amount of Sleep for a Healthy Adult: A Joint Consensus Statement of the AASM and SRS", *SLEEP* 2015;38(6):843–844, DOI 10.5665/sleep.4716. URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC4434546/. Ubicación: **"CONSENSUS STATEMENT"**, con el localizador "Adults should sleep 7 or more hours per night on a regular basis". Licencia: © 2015 Associated Professional Sleep Societies. Se puede citar y parafrasear, no reproducir.
- **Proposed UI text (normal):** "You reached the 7+ hours per day recommended for adults (Earth reference)."

### S2. Por qué importa dormir menos de 7 h / más de 9 h — FOUND [EARTH]
- **Campo:** `actions.attention` y nota informativa
- **Dato:** dormir menos de 7 h de forma habitual se asocia con efectos adversos: aumento de peso, diabetes, hipertensión, enfermedad cardíaca, depresión, peor desempeño, más errores y más accidentes. Si es más de 9 h, el consenso dice que no está claro si implica riesgo; puede ser apropiado para recuperar deuda de sueño o durante una enfermedad. Quien esté preocupado por dormir de menos o de más debe consultar a su proveedor de salud.
- **Fuente:** Watson 2015 (S1-C). Ubicación: "CONSENSUS STATEMENT", con el localizador "uncertain whether sleeping more than 9 hours per night".
- **Proposed UI text (attention):** "Regularly sleeping under 7 hours is linked to worse health, mood and performance, and to more errors. Note it and tell your crew medical officer if it keeps happening."
- **Critical:** ninguna fuente define un umbral "crítico" de horas. → **PLACEHOLDER** (mantener el texto actual).

### S3. Cómo registrar el sueño (diario de sueño) — FOUND
- **Campo:** `how_to_measure`
- **Fuente:** CDC "About Sleep" (S1-B). Ubicación: subsección **"Keeping a sleep diary"**, con el localizador "Your provider may have you keep a diary of your sleep habits." Elementos a anotar: hora de acostarse, despertares nocturnos, hora de levantarse, siestas, ejercicio, alcohol, cafeína y medicamentos.
- **Proposed UI text:**
  1. "Each morning, note when you went to bed and when you woke up."
  2. "Subtract time spent awake during the night to get your hours of sleep."
  3. "Also note naps, caffeine, exercise and any sleep medicine — they help explain changes."
- **Nota:** el paso 2 (restar el tiempo despierto) es una inferencia de UX. La fuente solo pide registrar los despertares.
- **Espacio (contexto):** NASA Standard Measures pide a la tripulación un cuestionario **al despertar** sobre calidad y cantidad de sueño, y usa un **actígrafo** de muñeca. Fuente: "Spaceflight Standard Measures: Characterizing How Humans Adapt in Space", NASA (actualizada 15-nov-2024). URL: https://www.nasa.gov/humans-in-space/spaceflight-standard-measures-characterizing-how-humans-adapt-in-space. Ubicación: secciones **"Sleep quality/team questionnaire"** y **"Actigraphy"**. Dominio público.

### S4. Frecuencia — FOUND (derivado)
- **Campo:** `frequency`
- **Dato:** el registro es una vez al día, al despertar. Lo respaldan dos cosas: la recomendación es "por día" (CDC) y NASA Standard Measures usa un cuestionario al despertar (S3).
- **Proposed UI text:** "Once a day, right after you wake up." → `every_hours: 24`.

### S5. Consejos tras una noche corta / hábitos — FOUND [EARTH]
- **Campo:** `actions.attention` (reemplaza "PLACEHOLDER: what to do after a short night")
- **Fuente:** CDC "About Sleep". Ubicación: sección **"What to do"**, con el localizador "Turning off electronic devices at least 30 minutes before bedtime". Los consejos de la fuente son: horario fijo para acostarse y levantarse, dormitorio silencioso, relajado y fresco, apagar pantallas al menos 30 min antes, evitar comidas grandes y alcohol cerca de la hora de dormir, limitar la cafeína por la tarde y noche, y mantenerse activo.
- **Proposed UI text:** "Tonight, keep a regular bedtime, turn off screens 30 minutes before sleep, and avoid caffeine late in the day."
- **Cuándo consultar:** si los problemas de sueño son frecuentes, o si hay síntomas como dificultad para dormirse, despertares frecuentes o somnolencia diurna aunque se haya dormido lo suficiente. Ubicación: sección **"Management"**, con el localizador "Talk to your healthcare provider if you regularly have problems sleeping."
- **Proposed UI text:** "If short or poor sleep happens regularly, or you are sleepy during the day despite enough sleep, tell your crew medical officer."

### S6. Sueño en vuelo espacial — FOUND
- **Horas asignadas en la ISS: ~8.5 h/día.**
  - Fuente A: "Sleeping in space", Canadian Space Agency (modificada 17-dic-2025). URL: https://www.asc-csa.gc.ca/eng/astronauts/living-in-space/sleeping-in-space.asp. Ubicación: **"Sleeping vertically"**, con el localizador "astronauts are allotted about 8.5 hours for sleep every day". Licencia: Crown copyright (Gobierno de Canadá); ver sus términos. **Nota:** el primer intento de fetch dio ECONNRESET y el segundo funcionó.
  - Fuente B (peer-reviewed): Barger LK et al., "Prevalence of sleep deficiency and hypnotic use among astronauts before, during, and after spaceflight: an observational study", *Lancet Neurology* 2014;13(9):904–912, DOI 10.1016/S1474-4422(14)70122-X. URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC4188436/. Ubicación: Discussion, primer párrafo, con el localizador "NASA regulations that mandate 8·5 hours of protected time for sleep". Licencia: © 2014 Elsevier (manuscrito de autor financiado por NIH). Se puede citar, no reproducir.
- **Sueño real medido en la ISS: ~6.09 h** de media, por actigrafía (Barger 2014). En la ISS, el **75 %** de los tripulantes (12/16) reportó uso de medicación para dormir. Ubicación: Results y Abstract ("sleeping pill use was pervasive during spaceflight").
- **Descartado:** medios secundarios dicen que "solo el 24 % de los episodios en la ISS llegó a ≥7 h", pero mi lectura de la Tabla 2 no lo confirmó. **No usar** ese porcentaje.
- **Riesgo NASA HRP:** "Risk from Inadequate Sleep and Irregular Schedules", NASA (actualizada 16-may-2025). URL: https://www.nasa.gov/reference/risk-from-inadequate-sleep-and-irregular-schedules/. Ubicación: el localizador "Astronauts witness 16 sunrises and sunsets per day". La página no trae cifras de horas. Contramedidas que menciona: iluminación LED que simula el ciclo luz-oscuridad de la Tierra y tiempos asignados para relajarse y cuidarse. Dominio público. La página de resumen `nasa_hrp_risks` (ya existe) enlaza este riesgo en "Risks Involving Behavioral Performance and Human Factors".
- **Proposed UI text (`why_it_matters`):** "On the ISS, about 8.5 hours a day are set aside for sleep, yet studies measured closer to 6 hours. NASA counts inadequate sleep and irregular schedules among the risks of spaceflight."
- **[EARTH]:** no existe un rango de horas de sueño "normal" específico para vuelo espacial. Las 8.5 h son tiempo **asignado**, no un umbral de salud.

---

## 3. Ánimo (`mood`)

### M1. NASA: qué miden en órbita — FOUND (sin instrumento con nombre)
- NASA Standard Measures incluye un cuestionario **antes de dormir** sobre ánimo, cohesión y desempeño del equipo, y habitabilidad. La página **no nombra** el instrumento de ánimo. Fuente: "Spaceflight Standard Measures…" (S3), sección **"Sleep quality/team questionnaire"**.
- El riesgo HRP es "Risk of Behavioral Conditions and Psychiatric Disorders". Está enlazado desde `nasa_hrp_risks` (https://www.nasa.gov/reference/risk-of-behavioral-conditions-and-psychiatric-disorders/). **No consulté esa subpágina en detalle.**
- **Encontrado de forma indirecta, sin usar:** según resultados de búsqueda (diapositivas NTRS 2026, APEX), NASA ha usado el *Profile of Mood States* (POMS) y el BDI-II en análogos. **No lo verifiqué en fuente primaria.** Además, POMS y BDI-II son instrumentos comerciales con copyright y licencia paga, así que no sirven para un prototipo libre. → **UNCONFIRMED / no recomendado**.

### M2. Instrumento validado y libre: PHQ-2 — FOUND
- **Ítems** (período: últimas 2 semanas; pregunta raíz: cuán seguido le molestaron estos problemas):
  1. Poco interés o placer en hacer cosas (anhedonia).
  2. Sentirse decaído, deprimido o sin esperanza.
  - Respuestas por ítem: Not at all = 0; Several days = 1; More than half the days = 2; Nearly every day = 3.
  - Fuente de la redacción: "Patient Health Questionnaire-2 (PHQ-2)", National HIV Curriculum (Universidad de Washington, financiado por HRSA). URL: https://www.hiv.uw.edu/page/mental-health-screening/phq-2. Ubicación: tabla del instrumento, con el localizador "Little interest or pleasure in doing things". Licencia de la página: © 2026 National HIV Curriculum. El instrumento en sí es libre (ver abajo).
  - **Para la UI: usar la redacción oficial de los ítems sin parafrasear.** Un instrumento validado pierde su validez si se reescribe, y su licencia permite reproducirlo (ver Licencia). Es la única excepción a la regla de paráfrasis y conviene registrarla en `docs/si-log.md` o en las decisiones del equipo.
- **Puntaje:** suma de 0 a 6. **Corte ≥3**, el punto óptimo para tamizaje (sensibilidad 82.9 % y especificidad 90.0 % para depresión mayor, según la tabla de la misma página UW). Un corte de 2 aumenta la sensibilidad.
  - Fuente primaria del corte: Kroenke K, Spitzer RL, Williams JBW. "The Patient Health Questionnaire-2: validity of a two-item depression screener", *Medical Care* 2003;41(11):1284–1292, PMID 14583691. URL: https://pubmed.ncbi.nlm.nih.gov/14583691/. **UNCONFIRMED-blocked:** PubMed pidió cookies y no mostró el abstract. El dato del corte está corroborado por la página UW y por la CTN Library.
- **Qué hacer con un positivo:** evaluar más a fondo con el PHQ-9, otro instrumento diagnóstico o una entrevista. Fuente: UW (misma URL), y CTN Library, con el localizador "Positive screens should be followed up with the PHQ-9".
- **Licencia — FOUND:**
  - NIDA Clinical Trials Network Dissemination Library, "NIDA CTN – Patient Health Questionnaire-2 (PHQ-2)". URL: https://ctnlibrary.org/instrument/nida-clinical-trials-network-patient-health-questionnaire-2-phq-2. Ubicación: el localizador "No permission required to reproduce, translate, display or distribute." Atribución: desarrollado por Spitzer, Williams, Kroenke y colegas, con una beca educativa de Pfizer.
  - Sitio oficial PHQ Screeners (Pfizer). URL: https://www.phqscreeners.com/select-screener. Dice que no se necesita permiso para reproducir, traducir, mostrar o distribuir los screeners. **La página no menciona explícitamente el PHQ-2**; menciona PHQ-9, GAD-7 y los módulos del PHQ. El enlace a los términos de uso de Pfizer no fue consultado.
  - El PDF del formulario NIDA (cde.nida.nih.gov) dio **ENOTFOUND** (DNS) → UNCONFIRMED-blocked. El aviso de licencia ya está confirmado por la CTN Library.
- **Frecuencia:** la USPSTF (grado B, 20-jun-2023) **no encontró evidencia** sobre la frecuencia óptima del tamizaje de depresión. Fuente: "Screening for Depression and Suicide Risk in Adults". URL: https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-depression-suicide-risk-adults. Ubicación: **"Screening Intervals"**, con el localizador "found no evidence on the optimal frequency of screening for depression". Como el PHQ-2 pregunta por las **últimas 2 semanas**, lo coherente es aplicarlo **cada 2 semanas** como mínimo. Es una inferencia, no una recomendación de la fuente.
- **[EARTH]:** validado en atención primaria y obstetricia en la Tierra. No hay validación ni corte específico para tripulaciones espaciales.

### M3. Por qué el PHQ-2 no encaja directamente en la escala 1–5 diaria
- El PHQ-2 tiene 2 ítems, una ventana de 2 semanas y un puntaje de 0 a 6. La escala actual es de 1 ítem, diaria y de 1 a 5. Mapear un 1–5 diario a un corte del PHQ-2 **no está validado** y equivaldría a inventar un umbral.
- No encontré un instrumento validado, libre, de 1 ítem y diario con etiquetas 1–5 que pueda citar. → Las etiquetas 1–5 y los rangos de la escala actual siguen como **PLACEHOLDER**.
- **Opciones (solo se describen; decide el equipo):**
  - **A. Dos capas:** mantener el 1–5 diario como **registro personal sin rangos** (status siempre "logged", sin semáforo) y agregar un **check-in PHQ-2 cada 2 semanas** con rangos sourceados: 0–2 → normal; ≥3 → attention (sugerir PHQ-9 o conversar con el médico de vuelo). Requiere un nuevo indicador `mood_phq2` (kind "questionnaire") y cambios de esquema y UI.
  - **B. Reemplazar** el 1–5 por el PHQ-2 (pierde el registro diario).
  - **C. Dejar** el 1–5 con etiquetas neutras de UX (p. ej., "Very low" … "Very good") marcadas como diseño propio, no clínico, y sin rangos médicos.
- **Proposed UI text (PHQ-2, attention ≥3):** "Your answers suggest low mood or loss of interest over the last two weeks. This is a screening result, not a diagnosis — please talk to your crew medical officer or flight surgeon, who may follow up with a longer questionnaire."
- **Proposed UI text (PHQ-2, 0–2):** "No sign of low mood on this two-week check. Keep checking in."

### M4. Guía de crisis — FOUND (solo Tierra / EE. UU.)
- **Dato:** 988 Suicide & Crisis Lifeline (llamar o enviar texto al 988, o chat en 988lifeline.org). En situaciones con riesgo de vida, llamar al 911.
- **Fuente:** "Depression", NIMH (NIH). URL: https://www.nimh.nih.gov/health/topics/depression (Last reviewed December 2024). Ubicación: recuadro de crisis, con el localizador "988 Suicide & Crisis Lifeline". Dominio público.
- La página de SAMHSA sobre 988 (https://www.samhsa.gov/mental-health/988) dio **403** → UNCONFIRMED-blocked. No hace falta: NIMH ya respalda el dato.
- **[EARTH] y solo EE. UU.:** en órbita la vía equivalente es el soporte médico y psicológico de tierra (`escalation: "ground"`). No encontré una fuente pública de NASA que describa ese canal → **PLACEHOLDER**.
- **Proposed UI text (crisis, on Earth only):** "If you are thinking about harming yourself: on Earth in the U.S., call or text 988; in an emergency, call 911. In flight, contact ground medical support immediately." (La segunda frase es PLACEHOLDER sin fuente.)
- **Nota:** el PHQ-2 **no** incluye ítems sobre suicidio; el PHQ-9 sí (USPSTF, sección "Screening Tests").

---

## 4. Tabla resumen

| # | Dato | Estado | Source id sugerido |
|---|---|---|---|
| G1 | Glucosa en ayunas normal 70–99 (≤99) mg/dL | FOUND [EARTH] | `cdc_diabetes_testing`, `medlineplus_blood_sugar_test` |
| G2 | Meter menos exacto que laboratorio venoso | FOUND | `medlineplus_blood_sugar_test` |
| G3a | Alta en ayunas 100–125 / ≥126 | FOUND [EARTH] | `cdc_diabetes_testing`, `medlineplus_blood_sugar_test` |
| G3b | Al azar ≥200 | FOUND [EARTH] | `cdc_diabetes_testing` |
| G3c | Metas en diabetes 80–130 / <180 (solo contexto) | FOUND [EARTH] | `cdc_monitor_glucose` |
| G4 | Alarma: se mantiene ≥300; ≥250 → medir cetonas; síntomas de cetoacidosis → 911 | FOUND [EARTH] (población con diabetes) | `cdc_dka` |
| G5 | Síntomas de glucosa alta | FOUND [EARTH] | `niddk_diabetes_symptoms` |
| G6 | Pasos de uso del glucómetro | FOUND | `cdc_monitor_glucose` |
| G7a | Frecuencia en diabetes: la decide el médico | FOUND | `cdc_monitor_glucose` |
| G7b | Sin diabetes: sin rutina; tamizaje USPSTF cada 3 años (35–70 con sobrepeso) | FOUND [EARTH] | `uspstf_prediabetes` |
| G7c | Frecuencia en vuelo | PLACEHOLDER | — |
| S1 | ≥7 h adultos (por edad: 7–9 / 7–8) | FOUND [EARTH] | `cdc_sleep` (existente), `cdc_about_sleep`, `aasm_srs_sleep_consensus` |
| S2 | Riesgos de <7 h; >9 h incierto | FOUND [EARTH] | `aasm_srs_sleep_consensus` |
| S2b | Umbral crítico de sueño | PLACEHOLDER | — |
| S3 | Diario de sueño (qué anotar) | FOUND | `cdc_about_sleep` |
| S3b | Cuestionario al despertar + actígrafo (NASA) | FOUND | `nasa_standard_measures` |
| S4 | Frecuencia diaria, al despertar | FOUND (derivado) | `cdc_sleep`, `nasa_standard_measures` |
| S5 | Higiene del sueño / cuándo consultar | FOUND [EARTH] | `cdc_about_sleep` |
| S6a | 8.5 h asignadas en ISS | FOUND | `csa_sleeping_in_space`, `barger_2014_astronaut_sleep` |
| S6b | ~6.09 h medidas en ISS; 75 % usó medicación | FOUND | `barger_2014_astronaut_sleep` |
| S6c | "24 % de noches ≥7 h" (medios) | UNCONFIRMED (no coincide con la tabla) | — |
| S6d | Riesgo HRP de sueño (16 amaneceres, LEDs) | FOUND | `nasa_hrp_sleep_risk` (+ `nasa_hrp_risks`) |
| M1 | NASA: cuestionario de ánimo antes de dormir (sin nombre) | FOUND | `nasa_standard_measures` |
| M1b | POMS / BDI-II en NASA | UNCONFIRMED (y con licencia comercial) | — |
| M2a | PHQ-2: ítems y opciones 0–3 | FOUND | `uw_phq2` |
| M2b | Corte ≥3, sensibilidad/especificidad | FOUND (secundaria); primaria UNCONFIRMED-blocked | `uw_phq2`, `kroenke_2003_phq2` |
| M2c | Positivo → PHQ-9 / entrevista | FOUND | `uw_phq2`, `ctn_phq2` |
| M2d | Licencia libre ("No permission required…") | FOUND | `ctn_phq2`, `phqscreeners` |
| M2e | PDF NIDA del formulario | UNCONFIRMED-blocked (DNS) | — |
| M2f | Frecuencia óptima: sin evidencia (USPSTF) | FOUND | `uspstf_depression` |
| M3 | Etiquetas y rangos de la escala diaria 1–5 | PLACEHOLDER | — |
| M4a | Crisis: 988 / 911 (EE. UU.) | FOUND [EARTH] | `nimh_depression` |
| M4b | Página SAMHSA 988 | UNCONFIRMED-blocked (403) | — |
| M4c | Canal de crisis en vuelo | PLACEHOLDER | — |

### URLs de los ids nuevos sugeridos
- `cdc_diabetes_testing` — https://www.cdc.gov/diabetes/diabetes-testing/index.html
- `medlineplus_blood_sugar_test` — https://medlineplus.gov/ency/article/003482.htm
- `cdc_monitor_glucose` — https://www.cdc.gov/diabetes/diabetes-testing/monitoring-blood-sugar.html
- `cdc_dka` — https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html
- `niddk_diabetes_symptoms` — https://www.niddk.nih.gov/health-information/diabetes/overview/symptoms-causes
- `uspstf_prediabetes` — https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes
- `cdc_about_sleep` — https://www.cdc.gov/sleep/about/index.html
- `aasm_srs_sleep_consensus` — https://pmc.ncbi.nlm.nih.gov/articles/PMC4434546/
- `nasa_standard_measures` — https://www.nasa.gov/humans-in-space/spaceflight-standard-measures-characterizing-how-humans-adapt-in-space
- `csa_sleeping_in_space` — https://www.asc-csa.gc.ca/eng/astronauts/living-in-space/sleeping-in-space.asp
- `barger_2014_astronaut_sleep` — https://pmc.ncbi.nlm.nih.gov/articles/PMC4188436/
- `nasa_hrp_sleep_risk` — https://www.nasa.gov/reference/risk-from-inadequate-sleep-and-irregular-schedules/
- `uw_phq2` — https://www.hiv.uw.edu/page/mental-health-screening/phq-2
- `ctn_phq2` — https://ctnlibrary.org/instrument/nida-clinical-trials-network-patient-health-questionnaire-2-phq-2
- `phqscreeners` — https://www.phqscreeners.com/select-screener
- `kroenke_2003_phq2` — https://pubmed.ncbi.nlm.nih.gov/14583691/ (UNCONFIRMED-blocked)
- `uspstf_depression` — https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-depression-suicide-risk-adults
- `nimh_depression` — https://www.nimh.nih.gov/health/topics/depression
