# Verificación independiente 3a — cardio/temperatura, glucosa/sueño/ánimo, emergencia

- Fecha de verificación: **2026-11-14**. Verificador independiente: cada URL se volvió a abrir con WebFetch; no se usaron las citas de los investigadores.
- Insumos: `docs/research/3a-a-cardio-temp.md`, `docs/research/3a-b-glucose-sleep-mood.md`, `docs/research/3a-c-emergency.md`, `data/sources.json`.
- Este documento **no modifica** `data/`, código ni los documentos de investigación.
- Veredictos:
  - **VERIFIED**: el dato está en la página y la paráfrasis es fiel.
  - **VERIFIED-WITH-EDIT**: el dato está, pero el texto de UI debe cambiar (se da el texto final en inglés).
  - **REJECTED**: no está en la página, está mal o exagera → vuelve a PLACEHOLDER.
  - **BLOCKED**: la página no se deja leer por un bot (403, cookies, PDF ilegible) → PLACEHOLDER en la app y va a `docs/verificacion-manual.md`.
- Las citas entre comillas son localizadores de ≤15 palabras, no texto para la UI.
- **[EARTH]** = "Earth reference — no spaceflight-specific value". Debe mostrarse en la UI junto a cada dato marcado así.

## 0. Hallazgos transversales

1. **Licencia de la MedlinePlus Medical Encyclopedia (`/ency/`) — confirmado.** La página "Using Content from MedlinePlus" dice que todo contenido de la A.D.A.M. Medical Encyclopedia está protegido por copyright, que reutilizarlo requiere permiso escrito y que se permiten enlaces directos. El pie de cada artículo dice "© 1997- 2026 A.D.A.M., a business unit of Ebix, Inc." y prohíbe duplicar el contenido y usarlo en sistemas de IA sin consentimiento.
   - **La entrada existente `medlineplus_pulse` en `data/sources.json` tiene la licencia mal**: dice "Public domain (U.S. Government work)". Debe decir: `"Copyrighted (A.D.A.M. Medical Encyclopedia via MedlinePlus); linking allowed, own paraphrase only"`.
   - El doc 3a-b marcó `medlineplus_blood_sugar_test` (003482) como "Dominio público": **error**, es A.D.A.M. igual que las demás.
2. **`cdc_bp` cargó hoy sin problema** con WebFetch (tabla completa, "Updated: October 13, 2026"). Igual se lista en la verificación manual porque en sesiones anteriores devolvió 403.
3. Tres páginas de la American Heart Association, la de AsMA (AMHP 2025) y SAMHSA devolvieron **403**. PubMed pide cookies. El PDF NASA OCHMO-TB-033 se descarga pero no se puede extraer texto (no hay Python ni herramienta PDF en este entorno).
4. Patrón de error más frecuente en las propuestas: **agregar palabras que la fuente no dice** ("resting", "side of the fingertip", "flight surgeon", "call their name", "spreading to", "stay still") o **quitar el contexto "para personas con diabetes"**.

---

## Tabla 1 — `3a-a-cardio-temp.md` (frecuencia cardíaca, presión arterial, temperatura)

| # | Dato | URL | Veredicto | Nota (lo que vi / localizador) | Texto final (EN) si VERIFIED-WITH-EDIT |
|---|---|---|---|---|---|
| A1 | HR how_to_measure: muñeca | https://medlineplus.gov/ency/article/003399.htm | VERIFIED | "index and middle finger over the underside of your opposite wrist"; "Press with flat fingers until you feel the pulse" | — |
| A2 | HR how_to_measure: cuello, sentarse, nunca ambos lados | idem 003399 | VERIFIED | "Sit or lie down before taking the neck pulse"; "can slow the flow of blood to the head" | — |
| A3 | HR how_to_measure: conteo 60 s / 30×2 / 15×4 / 10×6 | idem 003399 | VERIFIED | "count the beats for 30 seconds and multiply by 2"; 10 o 15 s × 6 o 4 | — |
| A4 | HR normal 60–100 bpm | idem 003399 | VERIFIED [EARTH] | "Children 10 years and older, and adults (including seniors): 60 to 100" | — |
| A5 | HR: atletas 40–60; sueño <60 | 003399 + https://medlineplus.gov/ency/article/007856.htm | VERIFIED-WITH-EDIT [EARTH] | Atletas: "Well-trained athletes: 40 to 60". Sueño: "During sleep, a person's heart rate can fall below 60". La fuente no dice que en el sueño "sea normal". | "Well-trained athletes can have a resting pulse of 40–60 bpm, and heart rate can fall below 60 bpm during sleep." |
| A6 | Taquicardia >100 bpm | https://medlineplus.gov/ency/article/003081.htm | VERIFIED-WITH-EDIT [EARTH] | "If your heart rate is fast (over 100 beats per minute)… tachycardia". La fuente no dice "resting". | "A heart rate over 100 bpm is called tachycardia." |
| A7 | Bradicardia <60, no siempre es un problema | 007856 | VERIFIED [EARTH] | "slower than normal, below 60 beats per minute"; algunos atletas tienen ritmo normal <60 | — |
| A8 | Attention: >100 sin ejercicio/ansiedad/fiebre → consultar | 003081 | VERIFIED-WITH-EDIT [EARTH] | Sección "Contact your provider right away": "more than 100 beats per minute (without exercise, anxiety, or fever)". "Promptly" es más débil que "right away" y "at rest" no está. | "Contact a health care professional right away if your pulse is over 100 bpm and you have not been exercising and are not anxious or feverish." |
| A9 | Attention: pulso lento con síntomas → consultar | 007856 | VERIFIED [EARTH] | "Contact your provider if: You develop symptoms of bradycardia" (tiredness, weakness, lightheadedness, confusion en la lista) | — |
| A10 | Critical: palpitaciones + síntomas → emergencia | 003081 | VERIFIED-WITH-EDIT [EARTH] | Lista 911: "Loss of alertness (consciousness)", chest pain, shortness of breath, unusual sweating, dizziness or lightheadedness. La fuente habla de palpitaciones, no de "fast or irregular heartbeat"; no dice "fainting". | "If palpitations come with loss of alertness (consciousness), chest pain, shortness of breath, unusual sweating, or dizziness or lightheadedness, get emergency help immediately." |
| A11 | Critical: pulso lento + dolor torácico, dificultad respiratoria o desmayo → emergencia | 007856 | VERIFIED [EARTH] | "Call 911 or the local emergency number right away if you have:" chest pain, breathing difficulty, fainting | — |
| A12 | BP how_to_measure (7 pasos CDC) | https://www.cdc.gov/high-blood-pressure/measure/index.html | VERIFIED-WITH-EDIT [EARTH] | Cargó (Updated Oct 13, 2026). Está: no comer ni beber 30 min antes; fumar, alcohol, cafeína o ejercicio dentro de 30 min pueden subir la lectura; vaciar vejiga; silla con respaldo ≥5 min; pies planos, piernas sin cruzar; brazo en mesa a la altura del pecho; manguito en brazo desnudo "snug but not tight"; no hablar; ≥2 lecturas "1 or 2 minutes apart"; registrar. **No dice "stay still"** ni "quietly". | Ver textos finales en "Listo para cargar" §BP. |
| A13 | BP: seguir instrucciones del aparato | https://www.nhs.uk/conditions/blood-pressure-test/ | VERIFIED [EARTH] | "Machines may be slightly different, so follow the instructions" | — |
| A14 | BP frequency: misma hora cada día (CDC) | cdc measure | VERIFIED-WITH-EDIT [EARTH] | "Measure your blood pressure at the same time each day." La parte "your care team (flight surgeon) decides how often" **no está en CDC**. | "Measure your blood pressure at the same time each day." |
| A15 | BP frequency: 2 veces al día, mañana y noche (NHS) | nhs.uk | VERIFIED [EARTH] | "once in the morning and once in the evening"; el médico fija cuántos días. `every_hours: 12` es **decisión de diseño**, no dato. | — |
| A16 | BP ranges (normal, elevated, stage 1, stage 2) | https://www.cdc.gov/high-blood-pressure/about/index.html | VERIFIED [EARTH] | Tabla completa; and/or exactos como en el doc. | — |
| A17 | BP critical: severa sin síntomas / emergencia con síntomas | idem cdc_bp | VERIFIED [EARTH] | "Higher than 180 and/or Higher than 120"; síntomas: chest pain, shortness of breath, back pain, numbness, weakness, change in vision, difficulty speaking. "(here: ground control)" es mapeo de diseño, debe quedar marcado así. | — |
| A18 | BP home 135/85 (NHS) solo contexto | nhs.uk | VERIFIED [EARTH] | "135/85 or higher when checked at home". No mezclar con CDC. | — |
| A19 | AHA home monitoring | https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/monitoring-your-blood-pressure-at-home | BLOCKED | HTTP 403 (reintentado hoy) | — |
| A20 | Temp how_to_measure: oral 3 min, axilar 5 min | https://medlineplus.gov/ency/article/003400.htm | VERIFIED | "Leave the thermometer in the mouth for 3 minutes or until the device beeps"; axila "Wait for 5 minutes" | — |
| A21 | Temp: esperas previas y limpieza | 003400 | VERIFIED | 1 h tras ejercicio fuerte o baño caliente; 20–30 min tras fumar, comer, bebida fría o caliente; "cool, soapy water or rubbing alcohol" | — |
| A22 | Temp: diferencias por sitio | 003400 | VERIFIED-WITH-EDIT | La fuente da **0.5 °F a 1 °F**, no "0.3–0.6 °C". La conversión es correcta pero hay que mostrar el número de la fuente. | "Readings depend on the site: ear and rectal readings are about 0.5–1 °F (about 0.3–0.6 °C) higher than oral; armpit and forehead readings are about 0.5–1 °F (about 0.3–0.6 °C) lower. Always note which method you used." |
| A23 | Temp: tiras plásticas no recomendadas | 003400 | VERIFIED | "measure skin temperature, not body temperature" | — |
| A24 | Temp normal 36.1–37.2 °C, promedio 37 °C, más baja temprano | https://medlineplus.gov/ency/article/001982.htm | VERIFIED [EARTH] | "from 97°F (36.1°C) to 99°F (37.2°C)"; "generally accepted as 98.6°F (37°C)"; "lowest in the early morning" | — |
| A25 | Temp actions.normal (plantilla con rango) | 001982 | VERIFIED [EARTH] | Depende de A24 | — |
| A26 | Fiebre ≥38 °C | https://www.cdc.gov/port-health/php/definitions-symptoms-reportable-illness/index.html (+ 001982) | VERIFIED [EARTH] | CDC: "100.4°F [38°C] or greater"; "measured temperature is the preferred and most accurate method". MedlinePlus dice "over 100.4°F" (estricto >). | — |
| A27 | Fiebre ≥40.6 °C → contactar ya | https://medlineplus.gov/ency/article/003090.htm | VERIFIED-WITH-EDIT [EARTH] | Está en "contact a provider right away", con la salvedad "unless it comes down readily with treatment". **No es** una indicación de emergencia (911). Ponerlo en `ranges.critical` es decisión de diseño. | "A temperature of 40.6 °C or higher that does not come down readily with treatment: contact a health care professional right away." |
| A28 | Fiebre ≥39.4 °C persistente / >48–72 h / recurrente ≥1 semana | 003090 | VERIFIED [EARTH] | "stays at or keeps rising above 103°F (39.4°C)"; 48 a 72 horas; vuelve durante una semana o más | — |
| A29 | Fiebre: señales de emergencia | 003090 | VERIFIED-WITH-EDIT [EARTH] | Lista 911: no se despierta fácil o está confundido; "Cannot walk"; dificultad para respirar; labios, lengua o uñas azules; "very bad headache or a stiff neck"; convulsión. La propuesta decía "headache **with** stiff neck" y "trouble walking": ambos cambian la fuente. | "With a fever plus any of these — confusion or being hard to wake, inability to walk, difficulty breathing, blue lips, tongue or nails, a very bad headache or a stiff neck, or a seizure — get emergency help now." |
| A30 | Fiebre leve: cuidados en casa | 003090 | VERIFIED [EARTH] | Fluidos y descanso; quitar capas; baño tibio; "Do not use cold baths, ice, or alcohol rubs" (provocan escalofríos) | — |
| A31 | Hipotermia <35 °C → emergencia | https://medlineplus.gov/ency/article/000038.htm | VERIFIED [EARTH] | "dangerously low body temperature, below 95°F (35°C)"; "Call 911… anytime you suspect someone has hypothermia" | — |
| A32 | Hipotermia: síntomas | 000038 | VERIFIED [EARTH] | Escalofríos incontrolables, confusión, somnolencia, respiración o ritmo cardíaco lentos | — |
| A33 | Espacio: ~2 L de líquido hacia arriba; baja el volumen sanguíneo | https://www.nasa.gov/directorates/esdmd/hhp/cardiovascular-and-vision | VERIFIED | "approximately 2 liters of fluid move from the lower to the upper body"; "reduce total blood volume" (en el texto principal, no en el Fun Fact) | — |
| A34 | Espacio: intolerancia ortostática >60 % | idem | VERIFIED-WITH-EDIT | "more than 60% of astronauts can be affected by orthostatic intolerance **if no countermeasures are used**". "Many crew members feel faint" exagera: es un "puede". | "After returning to gravity, more than 60% of astronauts can be affected by orthostatic intolerance (feeling faint when standing up) if no countermeasures are used." |
| A35 | Espacio: Standard Measures mide HR y PA antes y después | https://www.nasa.gov/humans-in-space/spaceflight-standard-measures-characterizing-how-humans-adapt-in-space | VERIFIED | "movement, balance, heart rate, and blood pressure before and after their missions"; la página no menciona temperatura | — |
| A36 | NASA-STD-3001 OCHMO-TB-033: signos vitales en misión | https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-033-spaceflight-experience-medical-care.pdf | BLOCKED | PDF descargado (1.4 MB) pero texto comprimido no extraíble | — |
| L1 | Licencia `medlineplus_pulse` | https://medlineplus.gov/about/using/usingcontent/ | VERIFIED (corrección) | "Any content from the A.D.A.M. Medical Encyclopedia" protegido; "allowable to make single direct links" | Licencia: "Copyrighted (A.D.A.M. Medical Encyclopedia via MedlinePlus); linking allowed, own paraphrase only" |

Los ítems PLACEHOLDER del doc (frecuencia HR, frecuencia temperatura, rango crítico numérico de HR, acción attention PA, presión baja, frecuencia ISS, rangos de vuelo) **siguen PLACEHOLDER**; no se buscó fuente nueva.

---

## Tabla 2 — `3a-b-glucose-sleep-mood.md` (glucosa, sueño, ánimo)

| # | Dato | URL | Veredicto | Nota (lo que vi / localizador) | Texto final (EN) si VERIFIED-WITH-EDIT |
|---|---|---|---|---|---|
| G1 | Glucosa en ayunas normal 70–99 mg/dL | https://www.cdc.gov/diabetes/diabetes-testing/index.html + https://medlineplus.gov/ency/article/003482.htm | VERIFIED [EARTH] | CDC: "99 mg/dL or below" (fasting). MedlinePlus: "a level of 70 to 99 mg/dL… is considered normal". **Licencia de 003482 mal en el doc: es A.D.A.M., no dominio público.** Solo aplica a lecturas en ayunas. | — |
| G2 | Glucómetro menos exacto que laboratorio venoso | 003482 | VERIFIED | "Blood glucose measured by a blood test from a vein is considered more accurate than" fingerstick | — |
| G3a | En ayunas 100–125 (prediabetes) / ≥126 | CDC testing + 003482 | VERIFIED [EARTH] | "impaired fasting glucose, a type of prediabetes"; "126 mg/dL… or higher usually means you have diabetes". "Recheck / tell your crew medical officer" es UX, debe marcarse así. | — |
| G3b | Al azar ≥200 | CDC testing + 003482 | VERIFIED [EARTH] | CDC random test: "200 mg/dL or above"; MedlinePlus "often means you have diabetes" | — |
| G3c | Metas para personas con diabetes 80–130 / <180 | https://www.cdc.gov/diabetes/diabetes-testing/monitoring-blood-sugar.html | VERIFIED [EARTH] solo contexto | "80 to 130 mg/dL" antes de comer; "Below 180" 1–2 h después; para la mayoría de personas con diabetes no embarazadas. **No usar como rango de la app.** | — |
| G4 | ≥300 sostenido / ≥250 → cetonas / señales de DKA | https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html | VERIFIED-WITH-EDIT [EARTH] | "If you have diabetes and you're sick or your blood sugar is 250 mg/dL or above"; 911 si "Blood sugar stays at 300 mg/dL or above", aliento frutal, vómitos, dificultad para respirar. **Todo escrito para personas con diabetes**; la propuesta lo presentaba como general. | "For people with diabetes, CDC advises emergency care if blood sugar stays at 300 mg/dL or above, or with fruity-smelling breath, vomiting that prevents keeping food or drink down, or trouble breathing. Contact ground medical support now." |
| G5 | Síntomas de glucosa alta | https://www.niddk.nih.gov/health-information/diabetes/overview/symptoms-causes | VERIFIED-WITH-EDIT [EARTH] | La lista es de síntomas **de diabetes**, no "de glucosa alta". "Many people with type 2 diabetes have no symptoms". | "Common symptoms of diabetes include urinating more, feeling very thirsty or very hungry, blurred vision and tiredness. Many people with type 2 diabetes have no symptoms." |
| G6 | Pasos del glucómetro | CDC monitoring | VERIFIED-WITH-EDIT | 8 pasos presentes. **No dice "side of the fingertip"**; dice "Use a lance to prick your finger". Paso 6: la fuente solo dice "Track and record your results" (lo de comida/ejercicio/enfermedad no está). Página dirigida a personas con diabetes. | Ver "Listo para cargar" §Glucosa. |
| G7a | En diabetes, el médico decide la frecuencia | CDC monitoring | VERIFIED | "Your doctor will tell you when and how often to check" | — |
| G7b | USPSTF: tamizaje 35–70 con sobrepeso; cada 3 años | https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes | VERIFIED [EARTH] | Grado B, 24-ago-2021; "Screening every 3 years may be a reasonable approach". Es tamizaje clínico, no automonitoreo. | — |
| G7c | Label "No routine home-check schedule exists for people without diabetes" | — | REJECTED | Ninguna fuente leída dice eso: es una inferencia por ausencia. → `frequency.label` PLACEHOLDER, `every_hours: null`. | — |
| S1 | ≥7 h adultos; por edad 7+ / 7–9 / 7–8 | https://www.cdc.gov/sleep/data-and-statistics/adults.html + https://www.cdc.gov/sleep/about/index.html + https://pmc.ncbi.nlm.nih.gov/articles/PMC4434546/ | VERIFIED [EARTH] | "at least 7 hours each day"; tabla 18–60 "7 or more hours", 61–64 "7–9", 65+ "7–8"; consenso "7 or more hours per night on a regular basis" | — |
| S2 | <7 h asociado a efectos adversos; >9 h incierto | PMC4434546 | VERIFIED-WITH-EDIT [EARTH] | Lista: aumento de peso, diabetes, hipertensión, cardiopatía, depresión, peor desempeño, más errores y accidentes. Dice "depression", no "mood". "Tell your crew medical officer" es UX. | "Regularly sleeping less than 7 hours is linked to health problems, including depression, and to worse performance, more errors and more accidents. If it keeps happening, tell your crew medical officer." |
| S3 | Diario de sueño (qué anotar) | CDC About Sleep | VERIFIED-WITH-EDIT [EARTH] | "Your provider may have you keep a diary": acostarse, despertares nocturnos, levantarse, siestas, ejercicio, alcohol/cafeína, medicación. El paso "restar el tiempo despierto" **no es de la fuente**. | Ver "Listo para cargar" §Sueño. |
| S3b | NASA: cuestionario al despertar + actígrafo | NASA Standard Measures | VERIFIED | Encuesta tras despertar sobre calidad y cantidad de sueño; monitor de muñeca "activity level and light exposure patterns" | — |
| S4 | Frecuencia: 1 vez al día al despertar | — | REJECTED (como dato) | Ninguna fuente fija "una vez al día". La "recomendación por día" de CDC es de cantidad, no de frecuencia de registro. Se puede usar como **decisión de diseño** etiquetada, sin source id. | — |
| S5 | Hábitos tras noche corta | CDC About Sleep | VERIFIED [EARTH] | "Turning off electronic devices at least 30 minutes before bedtime"; misma hora de acostarse; cafeína tarde/noche | — |
| S5b | Cuándo consultar | CDC About Sleep | VERIFIED-WITH-EDIT [EARTH] | "Talk to your healthcare provider if you regularly have problems sleeping"; "Feeling sleepy or tired even after getting enough sleep" aparece como señal de mala calidad de sueño | "If you regularly have problems sleeping, or feel sleepy or tired even after enough sleep, tell your crew medical officer." |
| S6a | ISS: ~8.5 h asignadas al sueño | https://www.asc-csa.gc.ca/eng/astronauts/living-in-space/sleeping-in-space.asp + https://pmc.ncbi.nlm.nih.gov/articles/PMC4188436/ | VERIFIED | CSA: "allotted about 8.5 hours for sleep every day" (mod. 2025-12-17). Barger: "mandate 8·5 hours of protected time for sleep" | — |
| S6b | ISS: 6.09 h medidas; 75 % usó medicación | PMC4188436 | VERIFIED | "6.09 ± 0.67 hours"; "75% (12/16) of crewmembers reported using sleep promoting medications" (12 de 16 que respondieron) | — |
| S6c | "24 % de noches ≥7 h" | — | REJECTED | El propio investigador lo descartó; no se encontró en la fuente | — |
| S6d | Riesgo HRP sueño: 16 amaneceres; LED; tiempo de descanso | https://www.nasa.gov/reference/risk-from-inadequate-sleep-and-irregular-schedules/ | VERIFIED | "Astronauts witness 16 sunrises and sunsets per day"; iluminación LED; "designated times for relaxation and self-care". Sin cifras de horas. | — |
| S6e | why_it_matters sueño | CSA + Barger + NASA HRP | VERIFIED | Texto propuesto fiel ("closer to 6 hours" ≈ 6.09) | — |
| M1 | NASA: cuestionario de ánimo antes de dormir | NASA Standard Measures | VERIFIED | Encuesta antes de dormir: mood, team cohesion, performance, habitability. Sin nombre de instrumento. | — |
| M1b | POMS / BDI-II en NASA | — | REJECTED | Sin fuente primaria (solo snippets de búsqueda) | — |
| M2a | PHQ-2: ítems, pregunta raíz, 0–3 | https://www.hiv.uw.edu/page/mental-health-screening/phq-2 | VERIFIED | "Over the last 2 weeks, how often have you been bothered…"; ítems "Little interest or pleasure in doing things" / "Feeling down, depressed or hopeless"; 0/1/2/3 | — |
| M2b | Corte ≥3; sens. 82.9 %, esp. 90.0 % | UW PHQ-2 | VERIFIED (fuente secundaria) | "a score of 3 as the optimal cutpoint"; tabla para prevalencia 7 %: sens 82.9 %, esp 90.0 %, **PPV 38.4 %** (muchos falsos positivos: decirlo) | — |
| M2b' | Kroenke 2003 (primaria) | https://pubmed.ncbi.nlm.nih.gov/14583691/ | BLOCKED | PubMed muestra "Cookies must be enabled", sin abstract | — |
| M2c | Positivo → PHQ-9 / entrevista | UW + https://ctnlibrary.org/instrument/nida-clinical-trials-network-patient-health-questionnaire-2-phq-2 | VERIFIED | "Patients who screen positive should be further evaluated with the PHQ-9" | — |
| M2d | Licencia libre PHQ-2 | CTN + https://www.phqscreeners.com/select-screener | VERIFIED | CTN: "No permission required to reproduce, translate, display or distribute." phqscreeners: "All PHQ, GAD-7 screeners… no permission is required" (no nombra PHQ-2 explícitamente; CTN sí) | — |
| M2e | PDF NIDA del formulario | (cde.nida.nih.gov, sin URL exacta en el doc) | BLOCKED | DNS ENOTFOUND según el investigador; no reintentable sin URL. No hace falta: CTN cubre la licencia. | — |
| M2f | USPSTF: sin evidencia de frecuencia óptima | https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-depression-suicide-risk-adults | VERIFIED [EARTH] | "found no evidence on the optimal frequency of screening for depression". "Cada 2 semanas" es inferencia de diseño (no de la fuente). | — |
| M3a | Texto PHQ-2 ≥3 (attention) | UW | VERIFIED | Fiel: "screening result, not a diagnosis"; seguimiento con cuestionario más largo | — |
| M3b | Texto PHQ-2 0–2 ("No sign of low mood") | UW | VERIFIED-WITH-EDIT | Un puntaje 1–2 sí indica algún síntoma; "no sign" exagera. | "Your answers are below the screening cut-off on this two-week check. Keep checking in, and talk to your crew medical officer any time you feel low." |
| M4a | Crisis: 988 (llamar/texto/chat) y 911 | https://www.nimh.nih.gov/health/topics/depression | VERIFIED [EARTH, solo EE. UU.] | "call or text the 988 Suicide & Crisis Lifeline"; chat 988lifeline.org; "In life-threatening situations, call 911." La frase "In flight, contact ground medical support" es PLACEHOLDER. | — |
| M4b | SAMHSA 988 | https://www.samhsa.gov/mental-health/988 | BLOCKED | HTTP 403 | — |

---

## Tabla 3 — `3a-c-emergency.md` (protocolo `crew_collapse_chest_pain`)

| # | Dato | URL | Veredicto | Nota (lo que vi / localizador) | Texto final (EN) si VERIFIED-WITH-EDIT |
|---|---|---|---|---|---|
| E1 | Guía microgravedad no describe reconocimiento (respuesta/respiración) | https://pmc.ncbi.nlm.nih.gov/articles/PMC7607644/ | VERIFIED (ausencia) | Leí el texto completo (0–175 k caracteres, incluida bibliografía): "unresponsive", "breathing", "pulse check", "chest pain", "aspirin" no aparecen | — |
| E2 | Rec. 1: cadena de supervivencia con reconocimiento precoz y llamada de ayuda | PMC7607644 | VERIFIED | "It consists of early recognition and the call for help" | — |
| E3 | Informar a Mission Control | PMC7607644 | VERIFIED | "the crew will be obliged to inform Mission Control of an ongoing medical emergency" | — |
| E4 | Telemedicina LEO (Rec. 20) / Marte (Rec. 21) | PMC7607644 | VERIFIED | "In low earth orbit telemedicine support SHOULD be consulted in the event of a cardiac arrest"; "impractical during CPR due to the communicational time-delay"; solo con tripulantes no implicados | — |
| E5 | Rec. 22: decisión de terminar por el más cualificado | PMC7607644 | VERIFIED | "crewmember with the highest medical qualification" | — |
| E6 | DEA con el equipo de emergencia; todos entrenados (Rec. 11, 13); RCP sin esperar (Rec. 14) | PMC7607644 | VERIFIED | "integral part of the emergency equipment"; "All crewmembers SHOULD be trained in the use of the specific AED"; "CPR SHOULD start" aunque no haya desfibrilación | — |
| E7 | Vía aérea ≥2 rescatadores; acceso venoso >2 | PMC7607644 | VERIFIED | "at least two rescuers are present and the patient has been restrained" (ojo: también exige paciente sujeto) | — |
| E8 | Sin objetivo de frecuencia/profundidad en microgravedad; cita 50–60 mm ERC | PMC7607644 | VERIFIED | "still not reached the recommended 50–60 mm of the current ERC guidelines" | — |
| E9 | Paso 1 text: comprobar respuesta | https://medlineplus.gov/ency/article/000013.htm | VERIFIED-WITH-EDIT [EARTH] | "Shake or tap the person gently"; "Shout, 'Are you OK?'". La fuente **no** dice "tap the shoulders" ni "call their name". Licencia A.D.A.M. | "Check if your crewmate responds: tap or gently shake them and shout, \"Are you OK?\"" |
| E10 | Paso 1 detail: no responde + respiración anormal/jadeo = paro → RCP | https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/adult-basic-life-support-guidelines | VERIFIED [EARTH] | "If a person is unresponsive with abnormal breathing, assume they are in cardiac arrest"; "agonal gasping or panting" como signo de paro. (La frase exacta difiere levemente de la cita del investigador; el contenido coincide.) | — |
| E11 | Límite ≤10 s para valorar respiración | https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support | BLOCKED | HTTP 403 (reintentado) | — |
| E12 | Paso 2 text: pedir ayuda + informar a Mission Control | RCUK + 000013 + PMC7607644 | VERIFIED [EARTH + espacio] | RCUK "call 999 without delay"; MedlinePlus "Shout for help and send someone to call 911"; Mission Control (E3) | — |
| E13 | Paso 2 detail: telemedicina | PMC7607644 | VERIFIED-WITH-EDIT | La fuente dice "telemedicine support", no "flight surgeon"; y es "in the event of a cardiac arrest", no "when possible". | "In low Earth orbit, telemedicine support should be consulted during a cardiac arrest. On a Mars mission, a live consult during CPR is impractical because of the communication delay; try it only if crewmates not involved in the CPR are available." |
| E14 | Traer el DEA; no esperar para empezar RCP | PMC7607644 + RCUK | VERIFIED | "Use an AED as soon as it is available" (RCUK) + Rec. 11/14 | — |
| E15 | Frecuencia Tierra 100–120/min | RCUK + 000013 | VERIFIED [EARTH] | "Compress the chest at a rate of 100-120 min-1"; "Do 100 to 120 compressions per minute" | — |
| E16 | Profundidad Tierra 5–6 cm | RCUK | VERIFIED [EARTH] | "at least 5 cm, but not more than 6 cm" | — |
| E17 | Mínimas interrupciones | RCUK | VERIFIED [EARTH] | "with as few interruptions as possible" | — |
| E18 | Texto "No validated compression rate or depth exists for microgravity yet." | PMC7607644 | VERIFIED-WITH-EDIT | La guía (2020) no da objetivo; "exists… yet" generaliza a toda la literatura, que no se verificó. | "The 2020 microgravity CPR guideline gives no target compression rate or depth for microgravity." |
| E19 | AHA 2025 BLS (rate/depth) | cpr.heart.org | BLOCKED | HTTP 403 | — |
| E20 | ERC 2025 BLS texto | https://www.erc.edu/science-research/guidelines/guidelines-2025/guidelines-2025-english | BLOCKED | La página carga pero solo tiene enlaces; el texto está en la revista Resuscitation (no leído) | — |
| E21 | Señal: dolor/opresión torácica centro o izquierda | https://www.nhlbi.nih.gov/health/heart-attack/symptoms | VERIFIED [EARTH] | "Chest pain, heaviness, or discomfort in the center or left side" | — |
| E22 | Señal: molestia en parte superior del cuerpo | NHLBI | VERIFIED-WITH-EDIT [EARTH] | Lista brazos, espalda, hombros, cuello, mandíbula **y zona sobre el ombligo**; no dice "spreading to". | "Pain or discomfort in one or both arms, the back, shoulders, neck, jaw or upper belly." |
| E23 | Señal: falta de aire en reposo o con poca actividad | NHLBI | VERIFIED [EARTH] | "Shortness of breath when resting or doing a little bit of physical activity" | — |
| E24 | Señal: sudoración sin motivo | NHLBI | VERIFIED [EARTH] | "Sweating a lot for no reason" | — |
| E25 | Señal: náusea o vómito | NHLBI | VERIFIED [EARTH] | "Nausea (feeling sick to the stomach) and vomiting" | — |
| E26 | Señal: mareo | NHLBI | VERIFIED [EARTH] | "Light-headedness or sudden dizziness" | — |
| E27 | Señal: cansancio inusual (más en mujeres) | NHLBI | VERIFIED [EARTH] | "Feeling unusually tired for no reason, sometimes for days"; "(this is more common in women)" | — |
| E28 | Síntomas leves o ausentes (mayores, diabetes) | NHLBI + https://medlineplus.gov/ency/article/000195.htm | VERIFIED [EARTH] | NHLBI: silent heart attacks "more common in older adults and in people who have high blood sugar or diabetes"; MedlinePlus: "little or no chest pain" | — |
| E29 | El reposo puede no aliviar el dolor | 000195 + NHLBI | VERIFIED [EARTH] | "may not completely relieve the pain of a heart attack" | — |
| E30 | Señales AHA | https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack | BLOCKED | HTTP 403 | — |
| E31 | Pedir ayuda ya aunque haya duda | NHLBI | VERIFIED [EARTH] | "even if you are not sure that you're having a heart attack" | — |
| E32 | Duda angina vs infarto → emergencia | NHLBI | VERIFIED [EARTH] | "If you don't know whether your chest pain is angina or a heart attack, call 9-1-1" | — |
| E33 | "Every minute matters" | NHLBI | VERIFIED [EARTH] | "Every minute matters."; "Acting fast can limit damage to your heart" | — |
| E34 | Aspirina: no proponer paso | NHLBI + 000195 | VERIFIED (decisión correcta) | "Never delay calling 9-1-1, taking aspirin or doing anything else"; MedlinePlus solo aspirina por personal sanitario "unless it would not be safe for you". Sin condiciones para lego → paso de aspirina sigue PLACEHOLDER. | — |
| E35 | Transición consciente → paro (criterio RCUK) | RCUK | VERIFIED [EARTH] | Igual que E10 | — |
| E36 | SCA 1.ª de 10 condiciones priorizadas (lista IMM) | https://pmc.ncbi.nlm.nih.gov/articles/PMC8088865/ | VERIFIED (contexto) | "(1) acute coronary syndrome"; "prioritized 10 medical conditions among the list of 100 conditions"; regreso de emergencia "an impossibility". CC BY 4.0. | — |
| E37 | AMHP 2025 manejo SCA en vuelo | https://asma.kglmeridian.com/view/journals/amhp/96/2/article-p143.xml | BLOCKED | HTTP 403 | — |
| E38 | Trigger: colapsa o no responde | RCUK | VERIFIED [EARTH] | "Suspect cardiac arrest in any person who is unresponsive." | — |
| E39 | Trigger: no respira o solo jadea | RCUK | VERIFIED [EARTH] | "agonal gasping or panting" | — |
| E40 | Trigger nuevo protocolo dolor torácico consciente | NHLBI | VERIFIED-WITH-EDIT [EARTH] | Mismo problema que E22 ("spreading") | Triggers: "Chest pain, pressure, heaviness or discomfort"; "Pain or discomfort in one or both arms, the back, shoulders, neck, jaw or upper belly"; "Shortness of breath at rest or with light activity"; "Heavy sweating, nausea or vomiting, or light-headedness, with any of the above" |
| E41 | B4 paso 1 "Treat this as a possible heart attack, even if you are not sure." | NHLBI | VERIFIED [EARTH] | Igual que E31 | — |
| E42 | B4 paso 5 "switch to Crewmate collapsed and start CPR" | RCUK | VERIFIED [EARTH] | Igual que E10 | — |

Siguen PLACEHOLDER (sin cambio): roles de equipo más allá de Rec. 22; equivalente espacial del "call 911" para dolor torácico (B4 paso 2, parte de vuelo); medicación (B4 paso 3); "mantener quieto" (B4 paso 4); kit médico ISS; triggers específicos de vuelo.

---

## Conteo de veredictos

| Doc | VERIFIED | VERIFIED-WITH-EDIT | REJECTED | BLOCKED |
|---|---|---|---|---|
| 3a-a (37 filas, incl. L1) | 25 | 10 | 0 | 2 |
| 3a-b (36 filas) | 22 | 7 | 4 | 3 |
| 3a-c (42 filas) | 32 | 5 | 0 | 5 |
| **Total (115)** | **79** | **22** | **4** | **10** |

(L1 se cuenta como VERIFIED: es la confirmación de que la licencia actual está mal.)

---

## Listo para cargar

Solo ítems VERIFIED y VERIFIED-WITH-EDIT. **Todo lo marcado [EARTH] debe mostrar en la UI el aviso "Earth reference — no spaceflight-specific value".** Textos de diseño (no de fuente) se marcan **(UX)**.

### Fuentes nuevas propuestas para `data/sources.json` (accessed `2026-11-14`, status `VERIFIED`)

| id | title | publisher | url | license | note (EN, una línea) |
|---|---|---|---|---|---|
| `medlineplus_palpitations` | Heart palpitations | MedlinePlus (NLM) / A.D.A.M. Medical Encyclopedia | https://medlineplus.gov/ency/article/003081.htm | Copyrighted (A.D.A.M.); linking allowed, own paraphrase only | A heart rate over 100 bpm is called tachycardia; lists when to seek emergency or prompt care. |
| `medlineplus_bradycardia` | Slow heart rate - bradycardia | MedlinePlus (NLM) / A.D.A.M. | https://medlineplus.gov/ency/article/007856.htm | Copyrighted (A.D.A.M.); linking allowed, own paraphrase only | Bradycardia is a heart rate below 60 bpm; it can be normal in athletes and during sleep. |
| `cdc_bp_measure` | Measuring Your Blood Pressure | CDC | https://www.cdc.gov/high-blood-pressure/measure/index.html | Public domain (U.S. Government work) | How to take an accurate home blood pressure reading. |
| `nhs_bp_test` | Blood pressure test | NHS (UK) | https://www.nhs.uk/conditions/blood-pressure-test/ | Crown copyright; see NHS website terms | Home monitoring is usually done morning and evening; home readings of 135/85 or higher are usually considered high. |
| `medlineplus_body_temp_norms` | Body temperature norms | MedlinePlus (NLM) / A.D.A.M. | https://medlineplus.gov/ency/article/001982.htm | Copyrighted (A.D.A.M.); linking allowed, own paraphrase only | Normal body temperature ranges from about 36.1 to 37.2 °C; the accepted average is 37 °C. |
| `medlineplus_temperature_measurement` | Temperature measurement | MedlinePlus (NLM) / A.D.A.M. | https://medlineplus.gov/ency/article/003400.htm | Copyrighted (A.D.A.M.); linking allowed, own paraphrase only | How to take an oral or armpit temperature and how readings differ by site. |
| `medlineplus_fever` | Fever | MedlinePlus (NLM) / A.D.A.M. | https://medlineplus.gov/ency/article/003090.htm | Copyrighted (A.D.A.M.); linking allowed, own paraphrase only | Home care for fever and when to contact a professional or get emergency help. |
| `medlineplus_hypothermia` | Hypothermia | MedlinePlus (NLM) / A.D.A.M. | https://medlineplus.gov/ency/article/000038.htm | Copyrighted (A.D.A.M.); linking allowed, own paraphrase only | Hypothermia is a body temperature below 35 °C and needs emergency help. |
| `nasa_cardiovascular_vision` | Cardiovascular and Vision Laboratory | NASA | https://www.nasa.gov/directorates/esdmd/hhp/cardiovascular-and-vision | Public domain (U.S. Government work) | In weightlessness about 2 L of fluid shifts toward the head; orthostatic intolerance after flight. |
| `nasa_standard_measures` | Spaceflight Standard Measures: Characterizing How Humans Adapt in Space | NASA | https://www.nasa.gov/humans-in-space/spaceflight-standard-measures-characterizing-how-humans-adapt-in-space | Public domain (U.S. Government work) | Crews do sensorimotor tests with heart rate and blood pressure before and after missions, plus sleep and mood questionnaires and actigraphy. |
| `cdc_diabetes_testing` | Diabetes Testing | CDC | https://www.cdc.gov/diabetes/diabetes-testing/index.html | Public domain (U.S. Government work) | Fasting blood sugar of 99 mg/dL or below is normal; 100–125 prediabetes; 126 or above diabetes. |
| `medlineplus_blood_sugar_test` | Blood sugar test | MedlinePlus (NLM) / A.D.A.M. | https://medlineplus.gov/ency/article/003482.htm | Copyrighted (A.D.A.M.); linking allowed, own paraphrase only | A fasting level of 70–99 mg/dL is normal; a lab test from a vein is more accurate than a fingerstick. |
| `cdc_monitor_glucose` | Monitoring Your Blood Sugar | CDC | https://www.cdc.gov/diabetes/diabetes-testing/monitoring-blood-sugar.html | Public domain (U.S. Government work) | Step-by-step use of a blood sugar meter, written for people with diabetes. |
| `cdc_dka` | Diabetic Ketoacidosis | CDC | https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html | Public domain (U.S. Government work) | For people with diabetes: emergency signs including blood sugar that stays at 300 mg/dL or above. |
| `niddk_diabetes_symptoms` | Symptoms & Causes of Diabetes | NIDDK (NIH) | https://www.niddk.nih.gov/health-information/diabetes/overview/symptoms-causes | Public domain (U.S. Government work) | Common symptoms of diabetes; many people with type 2 diabetes have none. |
| `uspstf_prediabetes` | Screening for Prediabetes and Type 2 Diabetes | U.S. Preventive Services Task Force | https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes | Public domain (U.S. Government work, AHRQ) | Clinical screening for adults 35–70 with overweight or obesity; every 3 years may be reasonable. |
| `cdc_about_sleep` | About Sleep | CDC | https://www.cdc.gov/sleep/about/index.html | Public domain (U.S. Government work) | Sleep needs by age, healthy sleep habits and keeping a sleep diary. |
| `aasm_srs_sleep_consensus` | Recommended Amount of Sleep for a Healthy Adult (AASM/SRS joint consensus, Watson et al., SLEEP 2015) | SLEEP / PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC4434546/ | © 2015 Associated Professional Sleep Societies; cite and paraphrase only | Adults should regularly sleep 7 or more hours; less is linked to adverse health outcomes. |
| `csa_sleeping_in_space` | Sleeping in space | Canadian Space Agency | https://www.asc-csa.gc.ca/eng/astronauts/living-in-space/sleeping-in-space.asp | Crown copyright (Government of Canada); see the site's terms and conditions | Astronauts are allotted about 8.5 hours for sleep each day. |
| `barger_2014_astronaut_sleep` | Prevalence of sleep deficiency and hypnotic use among astronauts (Barger et al., Lancet Neurology 2014) | Lancet Neurology / PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC4188436/ | © 2014 Elsevier; cite and paraphrase only | ISS crew averaged about 6.1 hours of sleep per night by actigraphy; 75% of responding ISS crew used sleep medication. |
| `nasa_hrp_sleep_risk` | Risk from Inadequate Sleep and Irregular Schedules | NASA Human Research Program | https://www.nasa.gov/reference/risk-from-inadequate-sleep-and-irregular-schedules/ | Public domain (U.S. Government work) | ISS crews see 16 sunrises a day; LED lighting and scheduled rest are countermeasures. |
| `uw_phq2` | Patient Health Questionnaire-2 (PHQ-2) | National HIV Curriculum (University of Washington) | https://www.hiv.uw.edu/page/mental-health-screening/phq-2 | © 2026 National HIV Curriculum (page); instrument free to reproduce (see `ctn_phq2`) | PHQ-2 items and scoring; a score of 3 or more is the usual screening cut-off. |
| `ctn_phq2` | NIDA CTN – Patient Health Questionnaire-2 (PHQ-2) | NIDA Clinical Trials Network Dissemination Library | https://ctnlibrary.org/instrument/nida-clinical-trials-network-patient-health-questionnaire-2-phq-2 | Instrument: no permission required to reproduce, translate, display or distribute | PHQ-2 developed by Spitzer, Williams, Kroenke and colleagues; positive screens are followed up with the PHQ-9. |
| `uspstf_depression` | Screening for Depression and Suicide Risk in Adults | U.S. Preventive Services Task Force | https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-depression-suicide-risk-adults | Public domain (U.S. Government work, AHRQ) | No evidence on the optimal frequency of depression screening. |
| `nimh_depression` | Depression | NIMH (NIH) | https://www.nimh.nih.gov/health/topics/depression | Public domain (U.S. Government work) | In the U.S., call or text 988 (Suicide & Crisis Lifeline); in life-threatening situations call 911. |
| `rcuk_bls_2025` | Adult basic life support guidelines (2025) | Resuscitation Council UK | https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/adult-basic-life-support-guidelines | © Resuscitation Council UK; reproduction requires permission — paraphrase and link only | Unresponsive with abnormal breathing means cardiac arrest; on Earth, compress 100–120/min, 5–6 cm deep. |
| `medlineplus_cpr_adult` | CPR - adult and child after onset of puberty | MedlinePlus (NLM) / A.D.A.M. | https://medlineplus.gov/ency/article/000013.htm | Copyrighted (A.D.A.M.); linking allowed, own paraphrase only | Check responsiveness, shout for help, 100–120 compressions per minute. |
| `nhlbi_heart_attack_symptoms` | Heart Attack - Symptoms | NHLBI (NIH) | https://www.nhlbi.nih.gov/health/heart-attack/symptoms | Public domain (U.S. Government work) | Heart attack warning signs; get emergency care even if you are not sure. |
| `medlineplus_heart_attack` | Heart attack | MedlinePlus (NLM) / A.D.A.M. | https://medlineplus.gov/ency/article/000195.htm | Copyrighted (A.D.A.M.); linking allowed, own paraphrase only | Rest may not relieve heart-attack pain; some people have little or no chest pain. |
| `tran_2021_lds_protocol` | Evidence Supporting the Management of Medical Conditions During Long-Duration Spaceflight: Protocol for a Scoping Review (Tran et al., 2021) | JMIR Research Protocols / PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC8088865/ | CC BY 4.0 | Acute coronary syndrome is first among 10 conditions prioritized for long-duration missions. |

**Corrección a fuente existente:** `medlineplus_pulse.license` → `"Copyrighted (A.D.A.M. Medical Encyclopedia via MedlinePlus); linking allowed, own paraphrase only"`.

### heart_rate

| Campo destino | Texto final (EN) | Números | Fuente | [EARTH] |
|---|---|---|---|---|
| `how_to_measure[0]` | "At the wrist: place your index and middle fingers flat on the inside of the opposite wrist, below the base of the thumb, and press until you feel the pulse." | — | `medlineplus_pulse` | — |
| `how_to_measure[1]` | "At the neck: sit or lie down first, then press gently with two fingers in the soft hollow beside the Adam's apple. Never press both sides of the neck at once — it can slow blood flow to the head and cause fainting." | — | `medlineplus_pulse` | — |
| `how_to_measure[2]` | "Count the beats for a full minute, or count for 30 seconds and multiply by 2 (15 s × 4 or 10 s × 6 also work)." | 60 s; 30×2; 15×4; 10×6 | `medlineplus_pulse` | — |
| `ranges[normal]` | "Typical resting adult pulse: 60–100 beats per minute." | min 60, max 100 | `medlineplus_pulse` | Sí |
| `ranges[attention]` (alto) — nota | "A heart rate over 100 bpm is called tachycardia." | >100 | `medlineplus_palpitations` | Sí |
| `ranges[attention]` (bajo) — nota | "A pulse under 60 bpm is called bradycardia; it is not always a problem." | <60 | `medlineplus_bradycardia` | Sí |
| `actions.attention.text` (contexto bajo) | "Well-trained athletes can have a resting pulse of 40–60 bpm, and heart rate can fall below 60 bpm during sleep." | 40–60; <60 | `medlineplus_pulse`, `medlineplus_bradycardia` | Sí |
| `actions.attention.text` | "Contact a health care professional right away if your pulse is over 100 bpm and you have not been exercising and are not anxious or feverish." | >100 | `medlineplus_palpitations` | Sí |
| `actions.attention.text` | "Contact a health care professional if a slow pulse comes with symptoms such as tiredness, weakness, lightheadedness or confusion." | — | `medlineplus_bradycardia` | Sí |
| `actions.critical.text` (por síntomas, no por número) | "If palpitations come with loss of alertness (consciousness), chest pain, shortness of breath, unusual sweating, or dizziness or lightheadedness, get emergency help immediately." | — | `medlineplus_palpitations` | Sí |
| `actions.critical.text` | "If a slow pulse comes with chest pain, trouble breathing or fainting, get emergency help right away." | — | `medlineplus_bradycardia` | Sí |
| `why_it_matters` | "In weightlessness about 2 liters of fluid shift from the lower to the upper body, and the body responds by reducing total blood volume." | ~2 L | `nasa_cardiovascular_vision` | No (dato de vuelo) |
| `why_it_matters` / nota | "NASA's Standard Measures test heart rate and blood pressure, together with movement and balance, before and after missions." | — | `nasa_standard_measures` | No |

`ranges[critical]` numérico y `frequency`: siguen **PLACEHOLDER**. "Emergency/911" → `escalation: "ground"` es mapeo de diseño (UX).

### blood_pressure

| Campo destino | Texto final (EN) | Números | Fuente | [EARTH] |
|---|---|---|---|---|
| `how_to_measure[0]` | "Do not eat or drink for 30 minutes before measuring. Smoking, alcohol, caffeine or exercise in the 30 minutes before can raise the reading." | 30 min | `cdc_bp_measure` | Sí |
| `how_to_measure[1]` | "Empty your bladder first." | — | `cdc_bp_measure` | Sí |
| `how_to_measure[2]` | "Sit in a chair with your back supported for at least 5 minutes before measuring, feet flat on the floor and legs uncrossed." | ≥5 min | `cdc_bp_measure` | Sí (postura terrestre) |
| `how_to_measure[3]` | "Rest your arm on a table so the cuff is at chest height." | — | `cdc_bp_measure` | Sí (postura terrestre) |
| `how_to_measure[4]` | "Put the cuff on your bare upper arm, snug but not tight." | — | `cdc_bp_measure` | Sí |
| `how_to_measure[5]` | "Do not talk while the reading is taken." | — | `cdc_bp_measure` | Sí |
| `how_to_measure[6]` | "Take at least two readings 1–2 minutes apart and record every result." | ≥2; 1–2 min | `cdc_bp_measure` | Sí |
| `how_to_measure[7]` | "Monitors differ slightly, so also follow your device's instructions." | — | `nhs_bp_test` | — |
| `frequency.label` | "Measure your blood pressure at the same time each day." | — | `cdc_bp_measure` | Sí |
| `frequency.label` (alternativa) | "When home monitoring is requested, readings are usually taken twice a day, morning and evening, for the number of days your clinician sets." | 2/día | `nhs_bp_test` | Sí — `every_hours: 12` es decisión de diseño (UX) |
| `ranges` (sin cambios) | normal <120 y <80; elevated 120–129 y <80; stage 1 130–139 o 80–89; stage 2 ≥140 o ≥90; critical >180 y/o >120 | ver | `cdc_bp` | Sí |
| `actions.critical.text` | "Severe hypertension without symptoms: contact a health care professional (in flight: ground medical support)." | >180 / >120 | `cdc_bp` | Sí; "(in flight: …)" es UX |
| `actions.critical.text` | "With chest pain, shortness of breath, back pain, numbness, weakness, a change in vision or difficulty speaking, it is a hypertensive emergency: get emergency help now." | — | `cdc_bp` | Sí |
| `why_it_matters` | "After returning to gravity, more than 60% of astronauts can be affected by orthostatic intolerance (feeling faint when standing up) if no countermeasures are used." | >60 % | `nasa_cardiovascular_vision` | No |
| nota de contexto (opcional) | "On Earth, home readings of 135/85 or higher are usually considered high (UK NHS); this app uses the CDC categories." | 135/85 | `nhs_bp_test` | Sí |

`actions.attention` específica y umbral de presión baja: **PLACEHOLDER**.

### body_temperature

| Campo destino | Texto final (EN) | Números | Fuente | [EARTH] |
|---|---|---|---|---|
| `how_to_measure[0]` (existente) | "Use a thermometer reading rather than guessing — a measured temperature is preferred." | — | `cdc_fever` | — |
| `how_to_measure[1]` | "Wait at least 1 hour after hard exercise or a hot bath, and 20–30 minutes after eating, smoking or drinking something hot or cold." | 1 h; 20–30 min | `medlineplus_temperature_measurement` | — |
| `how_to_measure[2]` | "Clean the thermometer before and after use with cool soapy water or rubbing alcohol." | — | `medlineplus_temperature_measurement` | — |
| `how_to_measure[3]` | "Oral: place the probe under your tongue, close your mouth and breathe through your nose. Leave it for 3 minutes or until it beeps." | 3 min | `medlineplus_temperature_measurement` | — |
| `how_to_measure[4]` | "Armpit: put the thermometer in the armpit and hold your arm against your body for 5 minutes or until it beeps." | 5 min | `medlineplus_temperature_measurement` | — |
| `how_to_measure[5]` | "Readings depend on the site: ear and rectal readings are about 0.5–1 °F (about 0.3–0.6 °C) higher than oral; armpit and forehead readings are about 0.5–1 °F (about 0.3–0.6 °C) lower. Always note which method you used." | 0.5–1 °F | `medlineplus_temperature_measurement` | Sí |
| `how_to_measure[6]` (nota) | "Plastic strip thermometers measure skin temperature and are not recommended for general home use." | — | `medlineplus_temperature_measurement` | — |
| `ranges[normal]` | "Normal body temperature varies; studies report a range of about 36.1–37.2 °C, with 37 °C as the commonly accepted average. It is lowest in the early morning." | min 36.1, max 37.2 | `medlineplus_body_temp_norms` | Sí |
| `ranges[attention]` (existente) | "Fever: 38 °C or higher." | ≥38 | `cdc_fever` | Sí |
| `ranges[critical]` alto | "A temperature of 40.6 °C or higher that does not come down readily with treatment: contact a health care professional right away." | ≥40.6 | `medlineplus_fever` | Sí — la fuente no lo llama emergencia; usarlo como "critical" es decisión de diseño |
| `ranges[critical]` bajo | "Below 35 °C is hypothermia, a dangerously low body temperature: get emergency help." | <35 | `medlineplus_hypothermia` | Sí |
| `actions.normal.text` | "Your temperature is within the {range.normal.min}–{range.normal.max} {unit} range reported as normal." | — | `medlineplus_body_temp_norms` | Sí |
| `actions.attention.text` | "A mild fever with no other problems often needs no treatment: drink fluids and rest. Remove extra layers; a lukewarm sponge bath can help. Avoid cold baths, ice or alcohol rubs, which can cause shivering." | — | `medlineplus_fever` | Sí |
| `actions.attention.text` | "Contact a health care professional if a fever stays at or above 39.4 °C, lasts more than 48–72 hours, or keeps coming back for a week or more." | 39.4; 48–72 h | `medlineplus_fever` | Sí |
| `actions.critical.text` | "With a fever plus any of these — confusion or being hard to wake, inability to walk, difficulty breathing, blue lips, tongue or nails, a very bad headache or a stiff neck, or a seizure — get emergency help now." | — | `medlineplus_fever` | Sí |
| `actions.critical.text` | "Suspected hypothermia (below 35 °C, uncontrollable shivering, confusion, drowsiness, slow breathing or heart rate): get emergency help immediately." | <35 | `medlineplus_hypothermia` | Sí |

Huecos 35–36.1 °C y 37.2–38 °C sin estado: requieren `allow_gaps` o decisión explícita. `frequency`: **PLACEHOLDER**.

### blood_glucose

| Campo destino | Texto final (EN) | Números | Fuente | [EARTH] |
|---|---|---|---|---|
| `ranges[normal]` (solo en ayunas) | "Fasting reading in the usual range for adults (70–99 mg/dL)." | min 70, max 99 | `cdc_diabetes_testing`, `medlineplus_blood_sugar_test` | Sí — y aclarar "fasting only" |
| `ranges[attention]` alto (ayunas 100–125) | "Fasting reading above the usual adult range. One meter reading is not a diagnosis; recheck and tell your crew medical officer if it stays high." | 100–125 | `cdc_diabetes_testing`, `medlineplus_blood_sugar_test` | Sí; "recheck/crew medical officer" = UX |
| `ranges[attention]` alto (≥126 ayunas / ≥200 al azar) | "High reading. On Earth, values like this are used, together with lab tests, to diagnose diabetes. Report it to your crew medical officer." | ≥126; ≥200 | `cdc_diabetes_testing`, `medlineplus_blood_sugar_test` | Sí; "Report…" = UX |
| `actions.critical.text` (solo si el equipo decide usarlo) | "For people with diabetes, CDC advises emergency care if blood sugar stays at 300 mg/dL or above, or with fruity-smelling breath, vomiting that prevents keeping food or drink down, or trouble breathing. Contact ground medical support now." | ≥300 | `cdc_dka` | Sí — **umbral escrito para personas con diabetes**; usarlo como `ranges[critical]` en tripulación sana es decisión de diseño documentada |
| `actions.attention.text` | "Common symptoms of diabetes include urinating more, feeling very thirsty or very hungry, blurred vision and tiredness. Many people with type 2 diabetes have no symptoms." | — | `niddk_diabetes_symptoms` | Sí |
| `how_to_measure[0]` | "Check that the meter is charged and ready." | — | `cdc_monitor_glucose` | — |
| `how_to_measure[1]` | "Wash your hands with soap and warm water and dry them well." | — | `cdc_monitor_glucose` | — |
| `how_to_measure[2]` | "Massage or shake your hand to bring blood into your finger." | — | `cdc_monitor_glucose` | — |
| `how_to_measure[3]` | "Prick your finger with the lancet. Gently squeeze from the base of the finger and put a small drop of blood on the test strip." | — | `cdc_monitor_glucose` | — |
| `how_to_measure[4]` | "Put the strip in the meter and wait for the reading." | — | `cdc_monitor_glucose` | — |
| `how_to_measure[5]` | "Record the result." | — | `cdc_monitor_glucose` | — |
| `how_to_measure[6]` | "Throw away the used lancet and strip." | — | `cdc_monitor_glucose` | — |
| `how_to_measure[7]` | "Never share lancets or other monitoring supplies." | — | `cdc_monitor_glucose` | — |
| `how_to_measure[8]` (nota) | "A home meter reading is an estimate; a lab blood test from a vein is more accurate." | — | `medlineplus_blood_sugar_test` | — |
| nota de contexto (no rango) | "For people with diabetes, common targets are 80–130 mg/dL before meals and below 180 mg/dL 1–2 hours after eating." | 80–130; <180 | `cdc_monitor_glucose` | Sí — **no usar como rango de la app** |
| nota de frecuencia (no `frequency.label`) | "For people with diabetes, their doctor sets when and how often to check. For adults without diabetes, clinical screening (not home checks) every 3 years may be reasonable for ages 35–70 with overweight or obesity." | 3 años; 35–70 | `cdc_monitor_glucose`, `uspstf_prediabetes` | Sí |

`frequency.label` → **PLACEHOLDER**, `every_hours: null` (G7c rechazado). Toggle "fasting / not fasting": decisión del equipo.

### sleep_hours

| Campo destino | Texto final (EN) | Números | Fuente | [EARTH] |
|---|---|---|---|---|
| `ranges[normal]` (sin cambios) | "You reached the 7+ hours per day recommended for adults." | ≥7 | `cdc_sleep`, `aasm_srs_sleep_consensus` | Sí |
| nota por edad | "Recommended sleep: 7 or more hours (ages 18–60), 7–9 hours (61–64), 7–8 hours (65 and older)." | ver | `cdc_about_sleep` | Sí |
| `actions.attention.text` | "Regularly sleeping less than 7 hours is linked to health problems, including depression, and to worse performance, more errors and more accidents. If it keeps happening, tell your crew medical officer." | <7 | `aasm_srs_sleep_consensus` | Sí; última frase = UX |
| `actions.attention.text` | "Tonight, keep a regular bedtime, turn off screens 30 minutes before sleep, and avoid caffeine late in the day." | 30 min | `cdc_about_sleep` | Sí |
| `actions.attention.text` | "If you regularly have problems sleeping, or feel sleepy or tired even after enough sleep, tell your crew medical officer." | — | `cdc_about_sleep` | Sí; "crew medical officer" = UX por "healthcare provider" |
| `how_to_measure[0]` | "Each morning, note when you went to bed and when you woke up." | — | `cdc_about_sleep` | — |
| `how_to_measure[1]` | "Also note times you woke during the night, naps, caffeine or alcohol, exercise and any medicine — they help explain changes." | — | `cdc_about_sleep` | — |
| `how_to_measure[2]` (opcional, UX) | "(UX) Subtract time spent awake during the night to estimate your hours of sleep." | — | sin fuente → marcar UX | — |
| `why_it_matters` | "On the ISS, about 8.5 hours a day are set aside for sleep, yet studies measured closer to 6 hours. NASA counts inadequate sleep and irregular schedules among the risks of spaceflight." | 8.5 h; ~6.09 h | `csa_sleeping_in_space`, `barger_2014_astronaut_sleep`, `nasa_hrp_sleep_risk` | No — las 8.5 h son tiempo asignado, no umbral de salud |
| nota (espacio) | "NASA crews fill in a sleep questionnaire after waking and wear a wrist activity monitor." | — | `nasa_standard_measures` | No |
| nota (espacio) | "ISS crews see 16 sunrises and sunsets a day; LED lighting that mimics Earth's day–night cycle helps them sleep." | 16 | `nasa_hrp_sleep_risk` | No |

`frequency` "once a day after waking" = decisión de diseño (UX), sin source id. Umbral crítico: **PLACEHOLDER**.

### mood

| Campo destino | Texto final (EN) | Números | Fuente | [EARTH] |
|---|---|---|---|---|
| nota (espacio) | "NASA crews answer a short questionnaire before sleep about mood, team cohesion, performance and habitability." | — | `nasa_standard_measures` | No |
| nuevo `mood_phq2` (si el equipo elige opción A o B): ítems **textuales** | Stem: "Over the last 2 weeks, how often have you been bothered by the following problems?" Items: "Little interest or pleasure in doing things"; "Feeling down, depressed or hopeless". Options: Not at all (0), Several days (1), More than half the days (2), Nearly every day (3). | 0–6 | `uw_phq2`, `ctn_phq2` (licencia) | Sí — validado en la Tierra; registrar la excepción de copia textual en decisiones |
| `mood_phq2.ranges[normal]` | 0–2: "Your answers are below the screening cut-off on this two-week check. Keep checking in, and talk to your crew medical officer any time you feel low." | 0–2 | `uw_phq2` | Sí |
| `mood_phq2.ranges[attention]` | ≥3: "Your answers suggest low mood or loss of interest over the last two weeks. This is a screening result, not a diagnosis — please talk to your crew medical officer or flight surgeon, who may follow up with a longer questionnaire." | ≥3 | `uw_phq2`, `ctn_phq2` | Sí |
| nota | "No evidence defines the best interval for depression screening." | — | `uspstf_depression` | Sí — "cada 2 semanas" = UX |
| crisis (solo Tierra/EE. UU.) | "If you are thinking about harming yourself: on Earth in the U.S., call or text 988 or chat at 988lifeline.org; in a life-threatening situation, call 911." | 988; 911 | `nimh_depression` | Sí; la frase de vuelo sigue PLACEHOLDER |

Escala diaria 1–5 (etiquetas y rangos): **PLACEHOLDER**.

### protocols: `crew_collapse_chest_pain` (colapso / paro)

| Campo destino | Texto final (EN) | Fuente | [EARTH] |
|---|---|---|---|
| `trigger[]` | "Crewmate collapses or does not respond." | `rcuk_bls_2025` | Sí |
| `trigger[]` | "Crewmate is not breathing, or only gasping." | `rcuk_bls_2025` | Sí |
| `steps[0].text` | "Check if your crewmate responds: tap or gently shake them and shout, \"Are you OK?\"" | `medlineplus_cpr_adult` | Sí |
| `steps[0].detail` | "If there is no response and breathing is absent or not normal (for example, only gasping), treat it as cardiac arrest and start CPR." | `rcuk_bls_2025` | Sí |
| `steps[1].text` | "Call for help: alert the rest of the crew and inform Mission Control of the medical emergency." | `rcuk_bls_2025`, `medlineplus_cpr_adult`, `dglrm_cpr_microgravity` | Parcial (llamar ayuda = Tierra; Mission Control = guía de vuelo) |
| `steps[1].detail` | "In low Earth orbit, telemedicine support should be consulted during a cardiac arrest. On a Mars mission, a live consult during CPR is impractical because of the communication delay; try it only if crewmates not involved in the CPR are available." | `dglrm_cpr_microgravity` | No |
| `steps[]` nuevo (2b o detail) | "Have a crewmate bring the AED from the emergency equipment. Start CPR without waiting for it, and use the AED as soon as it is available." | `dglrm_cpr_microgravity`, `rcuk_bls_2025` | Parcial |
| nota informativa (sin temporizador) | "On Earth, guidelines ask for 100–120 compressions per minute, at least 5 cm and no more than 6 cm deep, with as few pauses as possible." | `rcuk_bls_2025` (+ `medlineplus_cpr_adult` para 100–120) | Sí |
| nota informativa | "The 2020 microgravity CPR guideline gives no target compression rate or depth for microgravity." | `dglrm_cpr_microgravity` | No |
| nota | "Airway management should only be attempted with at least two rescuers and the patient restrained; the decision to stop CPR rests with the crewmember with the highest medical qualification." | `dglrm_cpr_microgravity` | No |

### protocols: nuevo `crew_chest_pain_conscious` (solo partes verificadas; el protocolo sigue PLACEHOLDER hasta tener fuente de vuelo)

| Campo destino | Texto final (EN) | Fuente | [EARTH] |
|---|---|---|---|
| `trigger[]` | "Chest pain, pressure, heaviness or discomfort" | `nhlbi_heart_attack_symptoms` | Sí |
| `trigger[]` | "Pain or discomfort in one or both arms, the back, shoulders, neck, jaw or upper belly" | `nhlbi_heart_attack_symptoms` | Sí |
| `trigger[]` | "Shortness of breath at rest or with light activity" | `nhlbi_heart_attack_symptoms` | Sí |
| `trigger[]` | "Heavy sweating, nausea or vomiting, or light-headedness, with any of the above" | `nhlbi_heart_attack_symptoms` | Sí |
| nota de señales | "Unusual tiredness without reason, sometimes for days, is more common in women. Symptoms can be mild or absent, especially in older adults and people with diabetes. Rest may not fully relieve heart-attack pain." | `nhlbi_heart_attack_symptoms`, `medlineplus_heart_attack` | Sí |
| `steps[0]` | "Treat this as a possible heart attack, even if you are not sure. If you can't tell angina from a heart attack, treat it as an emergency." | `nhlbi_heart_attack_symptoms` | Sí |
| `steps[1]` (parte urgencia) | "Act fast: every minute matters." (el canal de vuelo "flight surgeon / Mission Control" sigue PLACEHOLDER) | `nhlbi_heart_attack_symptoms` | Sí |
| `steps[4]` | "If the crewmate stops responding and is not breathing normally, switch to 'Crewmate collapsed' and start CPR." | `rcuk_bls_2025` | Sí |
| `why_it_matters` / contexto | "Acute coronary syndrome is first among 10 conditions prioritized for long-duration missions, where an emergency return to Earth may be impossible." | `tran_2021_lds_protocol` | No |

Pasos de medicación y "keep still": **PLACEHOLDER**.
