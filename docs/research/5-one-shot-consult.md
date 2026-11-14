# Investigación 5 — "One-shot consult" (Downlink report)

- Fecha de consulta de todas las URLs: **2026-11-14**. Investigador: agente de investigación médica (WebSearch/WebFetch; los PDF se descargaron con WebFetch y se extrajo el texto con `pdftotext` local).
- Este documento **no modifica** `data/` ni código. Formato y reglas como en `docs/research/3a-verificacion.md`.
- Estados: **FOUND** (leí el dato en la página/PDF), **UNCONFIRMED** (la página existe pero el bot no pudo leerla: 403, reCAPTCHA, cookies), **PLACEHOLDER** (no encontré fuente).
- Las citas entre comillas son **localizadores de ≤15 palabras**, no texto para la UI. Los textos de UI propuestos (EN) son paráfrasis propias.
- Las citas de páginas HTML vienen de WebFetch (un modelo resume la página): **el verificador debe reabrir cada URL**, como en 3a. Las citas de PDF (WHO, MCA, IMHA) salen del texto extraído literalmente.
- **[EARTH]** = referencia terrestre (emergencias, enfermería, marina mercante); no hay checklist publicado específico de vuelo espacial para esto (ver §C.4).
- **(UX)** = decisión de diseño, no dato de fuente.

## 0. Reglas de producto que salen de esta investigación

1. **La consulta no diagnostica.** El formato SBAR tiene una "A" (Assessment = "qué creés que tiene el paciente") y la proforma marítima tiene una sección "5.0 diagnosis". **La app no debe generar ni sugerir esas secciones.** Se reemplazan por "Crew observations" (datos) y "Questions for the ground team". Si el tripulante quiere escribir su propia impresión, va en texto libre, sin sugerencias de la app (UX).
2. **No recomendar medicación**: preguntar qué medicamentos *se tomaron* es recolección de datos (SAMPLE "M", proforma 6.1), no recomendación. La app nunca propone dosis ni fármacos.
3. **La consulta no reemplaza ni retrasa el protocolo de emergencia.** Si el síntoma es dolor torácico, colapso, etc., la app debe abrir primero `crew_chest_pain_conscious` / `crew_collapse_chest_pain` (ya existentes), y el one-shot consult queda como paso posterior (UX; coherente con NHLBI "Every minute matters", ya verificado en 3a E33).
4. **Retardo**: las fuentes ya cargadas dan 3–22 min ida (`nasa_perseverance_comms`) y "hasta 20 min" ida (`nasa_hrp_distance`). Los papers nuevos dicen **"hasta 40 min" ida y vuelta** (EIMO) y **"20 a 40 min"** (Yule). El "~44 min" del concepto es 2 × 22 y es aritmética propia: en la UI conviene escribir "up to about 40 minutes or more for a question and its answer" y citar las fuentes, o mostrar el cálculo 2 × 3–22 min citando `nasa_perseverance_comms` (UX).

---

## A) OPQRST — evaluación de dolor/síntoma

| # | Campo | Pregunta propuesta (EN) | Fuente (id sugerido) | Localizador (sección / ≤15 palabras) | Estado |
|---|---|---|---|---|---|
| A0 | Qué es OPQRST y que se usa para dolor | (no es pregunta; texto de ayuda) "These questions follow OPQRST, a checklist clinicians use to describe pain." | `saranteas_2019_trauma_pain_opqrst` | Sección sobre evaluación del dolor: "OPQRST is the acronym of Onset of the event" | FOUND |
| A0b | OPQRST usado para dolor torácico | — (justifica usarlo en "Chest pain") | `uchida_2026_chest_pain_opqrst` | Methods: "Chest pain symptoms were evaluated using the OPQRST method." | FOUND |
| A1 | **O — Onset** | "When did it start, and what were you doing at that moment?" + "Did it start suddenly or gradually?" | `prachanukool_2023_ed_pain_opqrst` (Table 4) + `mca_scmg_ch13_radio_advice` (3.2) | Table 4 "Focused ED Assessment of Pain": "What were they doing when it started and how did it start". SCMG 3.2: "how did the illness begin (suddenly, slowly…)" | FOUND |
| A2 | **P — Provocation/Palliation** | "Does anything make it better or worse (for example moving, breathing, resting, position)?" | `prachanukool_2023_ed_pain_opqrst` | Table 4: "What makes it better or worse". Los ejemplos entre paréntesis son (UX). | FOUND |
| A3 | **Q — Quality** | "Describe it in your own words. For example: pressure, sharp, burning, cramping, stabbing." | `prachanukool_2023_ed_pain_opqrst` | Table 4: "(eg, cramping, stabbing, burning, electric shock, pressure)" | FOUND |
| A4 | **R — Region/Radiation** | "Where exactly do you feel it? Does it spread or move anywhere else?" (opción: tocar zona en un esquema del cuerpo, UX) | `prachanukool_2023_ed_pain_opqrst` | Table 4: "Where do they feel it and does it move elsewhere" | FOUND |
| A5 | **S — Severity** | Ver §D (escala 0–10) | `prachanukool_2023_ed_pain_opqrst` + §D | Table 4: "On a scale of 1–10, or mild/moderate/severe" (ojo: dice **1–10**) | FOUND |
| A6 | **T — Time** | "Is it constant, or does it come and go? Has it changed since it started?" | `prachanukool_2023_ed_pain_opqrst` + `mca_scmg_ch13_radio_advice` (3.5) | Table 4: "is it constant or intermittent". SCMG 3.5: "describe the course of his present illness from the beginning" | FOUND |
| A7 | Fuente EMS oficial de OPQRST (StatPearls "EMS Pain Assessment And Management", NBK554543) | — | `statpearls_ems_pain_assessment` | https://www.ncbi.nlm.nih.gov/books/NBK554543/ — devuelve pantalla reCAPTCHA | UNCONFIRMED |
| A8 | OPQRST/PQRSTU para síntomas **no dolorosos** (Open RN Nursing Skills 2e, cap. 2.5, CC BY 4.0 según búsqueda) | — | `openrn_nursing_skills_pqrstu` | https://wtcs.pressbooks.pub/nursingskills/chapter/2-5-reason-for-seeking-health-care/ — HTTP 403 | UNCONFIRMED |
| A9 | NHTSA National EMS Education Standards 2021 (History Taking) | — | `nhtsa_ems_education_standards_2021` | https://www.EMS.gov/assets/EMS_Education-Standards_2021_FNL.pdf — 403; copia CBP >10 MB; copia Idaho ECONNREFUSED | UNCONFIRMED |

Detalle de fuentes A:

- `prachanukool_2023_ed_pain_opqrst` — Prachanukool T, George N, Bowman J, Ito K, Ouchi K. "Best Practices in End of Life and Palliative Care in the Emergency Department". Clin Geriatr Med 2023;39(4):575–597. URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC11300921/ — Table 4 "Focused ED Assessment of Pain". **Licencia**: author manuscript en PMC, sin licencia CC declarada → "PMC Copyright Notice; cite and paraphrase only". **Ojo**: la tabla está atribuida a Friese G., EMS1 Online (2020) — es fuente secundaria peer-reviewed de un contenido EMS.
- `saranteas_2019_trauma_pain_opqrst` — Saranteas T et al. "Pain is vital in resuscitation in trauma". SICOT-J 2019. URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC6694744/ — **CC BY 4.0**. Lista O "Onset of the event", P "Provocation or palliation", Q "Quality of the pain", R "Region and radiation", S "Severity", T "Time (history)". Nombra NRS, VAS y VRS sin dar el rango.
- `uchida_2026_chest_pain_opqrst` — Uchida M et al. (Japanese Circulation Society). "Association Between Symptom Characteristics, Knowledge Sources, and Patient Interpretation of Acute Coronary Syndrome…". Circ Rep 2026;8(4). URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC13065442/ — **CC BY-NC-ND 4.0**. Solo menciona OPQRST una vez (Methods), no lo define.

## B) SAMPLE — historia focalizada

| # | Campo | Pregunta propuesta (EN) | Fuente (id sugerido) | Localizador | Estado |
|---|---|---|---|---|---|
| B0 | Qué es SAMPLE y dónde se usa | Ayuda: "SAMPLE is a short history checklist used in emergency care." | `jayaprakash_2016_sample_history` + `who_icrc_bec_quick_cards` | Jayaprakash, Background: ATLS y PALS usan "SAMPLE" para la historia focalizada. WHO card "ABCDE APPROACH": recuadro "SAMPLE History" | FOUND |
| B1 | **S — Signs/Symptoms** | "What symptoms do you have? List all of them, starting with the one that bothers you most." | `jayaprakash_2016_sample_history` + `mca_scmg_ch13_radio_advice` (3.3–3.4) | Jayaprakash Methods: "S – Symptom onset, timing and duration". SCMG: "3.4 list all his complaints and symptoms"; lesiones 3.3 "in order of importance or severity" | FOUND |
| B2 | **A — Allergies** | "Do you have any known allergies? If yes, what happens when you react?" | `jayaprakash_2016_sample_history` + `mca_scmg_ch13_radio_advice` (3.10) | "A – Allergies and nature of reaction". SCMG "3.10 list any known allergies" | FOUND |
| B3a | **M — Medications (antes)** | "List every medicine or supplement you were taking before this started: name, dose and how often." | `mca_scmg_ch13_radio_advice` (3.9) + `jayaprakash_2016_sample_history` | SCMG: "3.9 list all medicines/tablets/drugs which the patient was taking before" | FOUND |
| B3b | **M — Medications (desde el inicio)** | "List every medicine taken since this started: name, dose and the time you took it." | `mca_scmg_ch13_radio_advice` (6.1) + `who_icrc_bec_quick_cards` (SBAR) | SCMG 6.1: "give the dose(s) and the times given". WHO SBAR: "time of last adrenaline dose to anticipate return symptoms" (ejemplo de por qué importa la hora) | FOUND |
| B4 | **P — Past history** | "Any important past illnesses, injuries or operations?" | `jayaprakash_2016_sample_history` + `mca_scmg_ch13_radio_advice` (3.6) | SCMG: "3.6 give any important past illnesses/ injuries/ operations" | FOUND |
| B5 | **L — Last oral intake** | "When did you last eat or drink?" | `jayaprakash_2016_sample_history` + `who_icrc_bec_quick_cards` | Jayaprakash: "L – Time of last oral intake". WHO card: "Last oral intake". **No** encontré fuente autoritativa que pida además *qué* se comió → no agregar. | FOUND |
| B6 | **E — Events** | "What were you doing just before this started? Describe what happened." | `jayaprakash_2016_sample_history` + `mca_scmg_ch13_radio_advice` (lesión 3.1–3.2) | "E – Events leading up to acute illness". SCMG lesión: "3.1 exactly how did the injuries arise?" / "3.2 how long ago was that?" | FOUND |

Detalle de fuentes B:

- `jayaprakash_2016_sample_history` — Jayaprakash N, Ali R, Kashyap R, Bennett C, Kogan A, Gajic O. "The incorporation of focused history in checklist for early recognition and treatment of acute illness and injury". BMC Emerg Med 2016;16(1):35. URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC5006415/ — **CC BY 4.0**. Ojo: los ejemplos de M y P del paper son clínicos (anticoagulantes, CHF…) → **no** llevarlos a la UI.
- `who_icrc_bec_quick_cards` — WHO-ICRC Basic Emergency Care: approach to the acutely ill and injured — Quick Cards. WHO/ICRC 2018 (ISBN 978-92-4-151308-1; página de publicación con fecha 30-oct-2018). PDF: https://cdn.who.int/media/docs/default-source/integrated-health-services-(ihs)/csy/bec-quick-cards/becp-edu29-pdf-en-finl.pdf (enlazado desde https://www.who.int/publications/i/item/9789241513081). **Licencia CC BY-NC-SA 3.0 IGO** (declarada en la página de la publicación; el PDF de las tarjetas no trae su propia línea de licencia). Implica: uso no comercial y **las adaptaciones deben llevar la misma licencia** → usar solo nombres de ítems y paráfrasis breves, citar. Cards con "SAMPLE History" y tablas "Key Findings from the SAMPLE History and Secondary Exam" en: trauma, dificultad respiratoria, shock, estado mental alterado. **Esas tablas tienen columna "REMEMBER…" con diagnósticos y tratamientos: NO usar en la app.**

## C) Datos mínimos que necesita el médico remoto

### C.1 Estructura del mensaje (SBAR)

| # | Dato | Uso en la app | Fuente (id) | Localizador | Estado |
|---|---|---|---|---|---|
| C1 | SBAR = Situation, Background, Assessment, Recommendation | Ordenar el mensaje del downlink | `ihi_sbar_tool` | "concrete communication mechanism"; S "a concise statement of the problem"; B "pertinent and brief information related to the situation"; A "analysis and considerations of options"; R "action requested/recommended" | FOUND |
| C2 | SBAR handover (versión clínica WHO) | Situation = datos básicos + motivo en palabras del paciente; Background = 2–4 aspectos clave + intervenciones | `who_icrc_bec_quick_cards` (tarjeta "TRANSFER AND HANDOVER", p. 230) | "Situation: Basic patient information (e.g. age, sex); chief complaint"; "Background: 2-4 most important and relevant aspects" | FOUND |
| C3 | AHRQ TeamSTEPPS "Tool: SBAR" | (respaldo, dominio público EE. UU.) | `ahrq_teamstepps_sbar` | https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/sbar.html — HTTP 403 | UNCONFIRMED |

**Adaptación propuesta (UX, no de la fuente):** S = "What is happening" (síntoma principal en palabras del tripulante + inicio). B = SAMPLE + lo que ya se hizo. **A → "Crew observations"** (signos vitales, OPQRST, fotos) — sin interpretación de la app. **R → "Questions for the ground team"** (ver C14). Hay que decir explícitamente en el doc de diseño que se modificó la "A" para cumplir la regla de no diagnosticar.

- `ihi_sbar_tool` — "SBAR Tool: Situation-Background-Assessment-Recommendation". Institute for Healthcare Improvement. URL: https://www.ihi.org/library/tools/sbar-tool-situation-background-assessment-recommendation — **"© Institute for Healthcare Improvement. All Rights Reserved."** → solo citar y parafrasear.

### C.2 Checklist de consulta médica remota (análogo marítimo, el más cercano al caso "sin médico a bordo, con retardo")

Fuente principal: **Ship Captain's Medical Guide (22.ª ed.), Cap. 13 "External assistance"**, Maritime and Coastguard Agency (UK). PDF: https://assets.publishing.service.gov.uk/media/5da84a23ed915d429d114666/mcga-shs_capt_guide_chap13.pdf — recuadro p. 210–211 "Information to be ready when requesting RADIO MEDICAL ADVICE" (formato A enfermedad / B lesión). **Licencia**: página gov.uk "Open Government Licence v3.0, except where otherwise stated", © Crown copyright. **Advertencia: edición RETIRADA** ("This publication was withdrawn on 17 October 2019"; marca de agua "WITHDRAWN PUBLICATION"). La edición vigente es la 24.ª (dic-2024, de pago, TSO). La nota vigente **MGN 623** confirma que el SCMG sigue incluyendo esa proforma (ver C13). → Usar como **referencia histórica/analógica [EARTH]**, no como norma vigente.

| # | Dato | Pregunta / campo propuesto (EN) | Fuente (id) | Localizador | Estado |
|---|---|---|---|---|---|
| C4 | Preparar todo antes de llamar | Texto de intro: "Fill this in before you transmit, so the ground team gets everything in one message." | `mca_scmg_ch13_radio_advice` + `imha_2013_maritime_telemedicine_consensus` | SCMG: "Complete the appropriate form or notes before asking for assistance." IMHA §19: "pre-call form for onboard assembly of data" | FOUND [EARTH] |
| C5 | Fecha y hora del reporte | Auto: timestamp (UTC / mission elapsed time) (UX) | `mca_scmg_ch13_radio_advice` | Illness 1.3: "date and time (GMT)" | FOUND [EARTH] |
| C6 | Datos básicos (edad, sexo); nombre opcional | Auto desde perfil del tripulante (UX); nombre opcional por confidencialidad | `mca_scmg_ch13_radio_advice` + `who_icrc_bec_quick_cards` | SCMG: "Age, sex and ethnic origin are more important than the patient's name." WHO: "Basic patient information (e.g. age, sex)" | FOUND [EARTH] |
| C7 | Motivo principal en palabras del paciente | "In your own words, what is the main problem?" | `who_icrc_bec_quick_cards` + `mca_scmg_ch13_radio_advice` | WHO: "chief complaint (the patient's initial description of the problem…)". SCMG 3.3: "what did the patient first complain of?" | FOUND |
| C8 | Inicio y evolución | (= A1, A6) "When did it begin, how did it begin, how has it changed since?" | `mca_scmg_ch13_radio_advice` | 3.1 "when did the illness first begin?"; 3.5 course "to the present time" | FOUND [EARTH] |
| C9 | Signos vitales | "Attach your latest readings: temperature, pulse, breathing rate (and blood pressure, oxygen saturation if available)." La app adjunta las últimas lecturas registradas de `heart_rate`, `blood_pressure`, `body_temperature`, `blood_glucose` con hora (UX) | `mca_scmg_ch13_radio_advice` + `who_icrc_bec_quick_cards` | SCMG 4.1: "temperature, pulse and respiration". WHO "NORMAL ADULT VITAL SIGNS": pulse, respiratory rate, systolic BP, "Oxygen Saturation" | FOUND [EARTH] |
| C10 | Aspecto general y de la zona afectada; fotos | "Describe how you look and feel overall, and how the affected area looks (swelling, color, movement). Add a photo if you can." | `mca_scmg_ch13_radio_advice` + `mca_mgn623_tmas` | SCMG 4.2–4.4: "describe the general appearance"; "(swelling, tenderness, lack of movement…)". MGN 623 §3: "useful to supplement this information with photographs" | FOUND [EARTH] |
| C11 | Pruebas ya hechas y resultado | "Any tests or measurements already done? What were the results?" | `mca_scmg_ch13_radio_advice` | 4.5: "what tests have you done and with what result" | FOUND [EARTH] |
| C12 | Qué se hizo ya y cómo respondió | "What has already been done (first aid, rest, anything else)? Did it change anything?" | `mca_scmg_ch13_radio_advice` + `who_icrc_bec_quick_cards` | SCMG 6.2: "how has the patient responded to the treatment given?"; lesión 5.1 "describe the first-aid". WHO SBAR Background: "important ABCDE findings/ interventions" | FOUND [EARTH] |
| C13 | Lesión: pérdida de conciencia, memoria, sangrado | (solo síntoma "Injury") "Did you lose consciousness, even briefly? Do you remember everything that happened?" / "Any bleeding? About how much?" | `mca_scmg_ch13_radio_advice` | Lesión 3.8: "does the patient remember everything that happened"; 4.4 "did the patient lose any blood?" | FOUND [EARTH] |
| C14 | Qué preocupa y qué se necesita saber | "What worries you most right now?" / "What do you most need the ground team to answer?" | `mca_scmg_ch13_radio_advice` | 7.1 "what problems are worrying you now?"; 7.2 "what do you think you need to be advised on?" | FOUND [EARTH] |
| C15 | Entorno / logística | Auto (UX): fase de misión, ubicación (tránsito / superficie), tiempo de retardo actual, recursos médicos a bordo (inventario del kit) | `mca_scmg_ch13_radio_advice` + `imha_2013_maritime_telemedicine_consensus` + `mca_mgn623_tmas` | SCMG 1.4–1.6 posición, puerto más cercano, "local weather"; "have a list of drugs and appliances available". IMHA §17: "TMAS also need to be party to location, weather" | FOUND [EARTH] — el mapeo a nave espacial es (UX) |
| C16 | Anotar la respuesta y repetirla | Para la fase de respuesta: "Write down the reply and read it back in your next message." (UX) | `mca_scmg_ch13_radio_advice` | "Get any advice you are given down in writing… and repeat back" | FOUND [EARTH] |
| C17 | **Excluir** diagnóstico propio guiado | La app no muestra la sección "diagnosis / differential diagnosis" de la proforma | `mca_scmg_ch13_radio_advice` | 5.1 "what do you think the diagnosis is?" — **no usar** | FOUND (exclusión deliberada) |
| C18 | **No propuesto**: alcohol/drogas, historia familiar/social, etnia | Probablemente ya en historia médica pre-vuelo; decisión del equipo | `mca_scmg_ch13_radio_advice` | 3.7, 3.8, 3.11 | FOUND (no recomendado para la UI) |

Otras fuentes C.2:

- `mca_mgn623_tmas` — "MGN 623 (M+F) Telemedical Advice Service (TMAS) For Ships At Sea". Maritime and Coastguard Agency, publicado diciembre 2019. URL: https://assets.publishing.service.gov.uk/media/5dfb5e7c40f0b6666f27712c/MGN_623__M_F__telemedical_advice_service__TMAS__for_ships_at_sea.pdf — §3: "The SCMG includes guidance on the information to provide to the TMAS". **Licencia**: "© Crown Copyright 2019"; contenido gov.uk normalmente OGL v3.0 (no declarado en el PDF → confirmar).
- `imha_2013_maritime_telemedicine_consensus` — "Maritime telemedicine – state of the art. Consensus". IMHA/NCMM workshop, Malta, febrero 2013 (T. Carter). URL: https://www.imha.net/0104114%20MALTA%20Workshop%20consensus%20paper.pdf — §17 y §19. **Licencia**: no declarada → "See publisher terms; cite and paraphrase only". Es documento de consenso de una asociación profesional, no peer-reviewed.

### C.3 Vuelo espacial: retardo y autonomía

| # | Dato | Texto propuesto (EN) | Fuente (id) | Localizador | Estado |
|---|---|---|---|---|---|
| C19 | Retardo Marte ida y vuelta ≤40 min | "On a Mars mission, a question and its answer can take up to about 40 minutes to travel." | `levin_2023_eimo` | "The 2-way communication delay for a Mars mission may be as long as 40 minutes." | FOUND |
| C20 | Retardo de superficie 20–40 min; "40+ min" | (contexto) | `yule_2023_crew_autonomy` | "will vary between 20 and 40 min"; Key Points "up to 40+ minutes" | FOUND |
| C21 | Consulta en tiempo real poco práctica | "Live back-and-forth with doctors on Earth may not be practical, so this form gathers what they will ask in one message." | `yule_2023_crew_autonomy` | "consulting in real time via long distance communications may be impractical" | FOUND |
| C22 | Mitigación: checklists, herramientas y protocolos | (justifica la función) | `yule_2023_crew_autonomy` | delay "can be mitigated by use of checklists, development of clinical guidance tools" | FOUND |
| C23 | Hoy: datos médicos se envían a tierra para interpretación | "Today, medical data from orbit are sent to flight surgeons on the ground." | `levin_2023_eimo` | "Medical data are transmitted to the ground for interpretation" | FOUND |
| C24 | Ancho de banda limita imágenes/video | (nota para fotos: comprimir, UX) | `levin_2023_eimo` | limits ability to "transmit high resolution images, video, and other telemedical data" | FOUND |
| C25 | EIMO: la primacía médica pasa a la nave | (contexto educativo) | `levin_2023_eimo` | "EIMO is the transition of medical primacy from terrestrial to space-based assets." | FOUND |
| C26 | ISS: conferencias médicas privadas regulares y a pedido | "On the ISS, crew talk privately with flight surgeons regularly and whenever they ask." | `jones_2008_iss_medical_operations` | Abstract: "Private medical conferences (PMCs) are conducted regularly and upon crew request" | FOUND |
| C27 | Retardo empeora consulta procedimental (simulación 4 s) | (contexto; opcional) | `yeam_2026_comm_delay_suturing` | "The delay group required more time to complete five sutures" | FOUND |

- `levin_2023_eimo` — Levin DR, Steller J, Anderson A, Lemery J, Easter B, Hilmers DC, Lehnhardt KR (incluye autores de NASA JSC). "Enabling Human Space Exploration Missions Through Progressively Earth Independent Medical Operations (EIMO)". IEEE Open J Eng Med Biol 2023;4:162–167. URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC10810302/ — **CC BY 4.0**.
- `yule_2023_crew_autonomy` — Yule S et al. "Crew Autonomy During Simulated Medical Event Management on Long Duration Space Exploration Missions". Hum Factors 2023;65(6):1221–1234. URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC10466940/ — **CC BY-NC 4.0**.
- `jones_2008_iss_medical_operations` — Jones JA (NASA JSC). "International Space Station Medical Operations". NASA NTRS 20080010877 (preprint, 2008). URL: https://ntrs.nasa.gov/citations/20080010877 — "Work of the US Gov. Public Use Permitted."
- `yeam_2026_comm_delay_suturing` — Yeam A et al. "Communication delay increases procedure time and instructor task load during simulated suturing by novices". npj Microgravity 2026;12:83. URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC13623917/ — **CC BY 4.0**. Es delay lunar (4 s), muestra chica.

### C.4 Lo que NO encontré

| # | Dato | Estado |
|---|---|---|
| C28 | Lista oficial NASA/ESA de "qué datos enviar al flight surgeon" en una consulta con retardo | PLACEHOLDER (Yule y EIMO no listan datos; Jones no especifica) |
| C29 | Fuente que diga explícitamente "anticipar las preguntas del médico y mandarlas en un solo mensaje" en vuelo espacial | PLACEHOLDER — la idea one-shot se apoya en: retardo (C19–C21) + mitigación por checklists (C22) + práctica marítima de llenar la proforma antes (C4). Presentarla como **diseño inspirado en**, no como norma. |
| C30 | ESA: documentos de telemedicina / consulta médica de tripulación | PLACEHOLDER (no buscado a fondo; sin resultado útil) |

## D) Escala de intensidad del dolor 0–10

| # | Dato | Texto propuesto (EN) | Fuente (id) | Localizador | Estado |
|---|---|---|---|---|---|
| D1 | Escala numérica 0–10 con anclas | "How strong is it right now, from 0 (no pain) to 10 (pain as bad as you can imagine)?" | `krebs_2009_peg_pain_scale` | Measures (BPI): items rated 0 ("no pain") to 10 ("pain as bad as you can imagine") | FOUND |
| D2 | 0–10 es formato familiar y extendido | (justificación) | `krebs_2009_peg_pain_scale` | Discussion: "a format that has become familiar to patients and clinicians" | FOUND |
| D3 | NRS 0–10 válida; ancla alternativa "maximum pain" | — | `pathak_2018_pain_scales` | §2.3.3: 0 "no pain", 10 "maximum pain"; §4.3 "enough response options to allow for adequate precision" | FOUND |
| D4 | **Salvedad**: la NRS tuvo la tasa de error más alta en esa población | Ofrecer también palabras: "None / Mild / Moderate / Severe" (UX) | `pathak_2018_pain_scales` + `prachanukool_2023_ed_pain_opqrst` | §3.4: 64 % respuestas incorrectas con NRS; Table 4 "or mild/moderate/severe" | FOUND |
| D5 | Añadir "peor en las últimas 24 h" / "promedio" | No propuesto (Krebs usa promedio de la última semana; para consulta aguda conviene "right now"; decisión UX) | — | — | (UX) |
| D6 | StatPearls "Pain Assessment" (NBK556098) | — | `statpearls_pain_assessment` | https://www.ncbi.nlm.nih.gov/books/NBK556098/ — reCAPTCHA; statpearls.com 403 | UNCONFIRMED |

- `krebs_2009_peg_pain_scale` — Krebs EE et al. "Development and Initial Validation of the PEG, a Three-item Scale Assessing Pain Intensity and Interference". J Gen Intern Med 2009;24(6):733–738. URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC2686775/ — "© The Author(s) 2009", sin CC explícita → cite and paraphrase only.
- `pathak_2018_pain_scales` — Pathak A, Sharma S, Jensen MP. "The utility and validity of pain intensity rating scales for use in developing countries". Pain Rep 2018;3(5):e672. URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC6181466/ — **CC BY 4.0**.
- Nota: `prachanukool_2023` dice "1–10"; Krebs/Pathak "0–10". Usar **0–10** (0 = sin dolor permite reportar "ya no duele").

## E) Lista de síntomas propuesta para el consult

| Síntoma (UI, EN) | Módulos | Justificación | Fuentes | Nota |
|---|---|---|---|---|
| **Chest pain or pressure** | OPQRST + SAMPLE | OPQRST usado para dolor torácico; SAMPLE en tarjeta WHO de shock (fila "Chest pain") | `uchida_2026_chest_pain_opqrst`, `who_icrc_bec_quick_cards`, `jayaprakash_2016_sample_history` | **Antes** abrir `crew_chest_pain_conscious` (regla 0.3). No mostrar la columna diagnóstica de WHO. |
| **Abdominal pain** | OPQRST + SAMPLE | Estudio prehospitalario de dolor abdominal registra ítems S-A-M-P-L-E y O-P-Q-R-S-T | `larsson_2022_prehospital_abdominal_pain` | Según WebFetch, el paper lista los ítems pero quizá no usa las siglas — **verificar**. |
| **Headache** | OPQRST + SAMPLE | Solo por ser dolor (fuentes generales de dolor) | `prachanukool_2023_ed_pain_opqrst`, `saranteas_2019_trauma_pain_opqrst`, `jayaprakash_2016_sample_history` | Sin fuente específica de cefalea → marcar como inferencia. |
| **Injury** | SAMPLE + preguntas de lesión (C13); OPQRST para el dolor asociado | Proforma de lesión SCMG; tarjeta WHO trauma con SAMPLE; OPQRST en dolor por trauma | `mca_scmg_ch13_radio_advice`, `who_icrc_bec_quick_cards`, `saranteas_2019_trauma_pain_opqrst` | |
| **Shortness of breath / difficulty breathing** | SAMPLE + inicio/evolución (C8) — **sin OPQRST** | Tarjeta WHO "Approach to the patient with difficulty in breathing" usa SAMPLE | `who_icrc_bec_quick_cards`, `mca_scmg_ch13_radio_advice` | No encontré fuente que aplique OPQRST a disnea. Severidad 0–10 de disnea: Prachanukool menciona NRS 0–10 para disnea (Table 6, contexto paliativo) — opcional, no propuesto. |
| **Fever or feeling unwell** | SAMPLE + inicio/evolución + temperatura (C9) — **sin OPQRST** | Proforma de enfermedad SCMG; tarjeta WHO de shock (fila "Fever") | `mca_scmg_ch13_radio_advice`, `who_icrc_bec_quick_cards`, `cdc_fever` (existente) | |
| **Other** | SAMPLE + texto libre | General | `jayaprakash_2016_sample_history` | |

- `larsson_2022_prehospital_abdominal_pain` — Larsson G, Hansson P, Olsson E, Herlitz J, Andersson Hagiwara M. "Prehospital assessment of patients with abdominal pain triaged to self-care at home: an observation study". BMC Emerg Med 2022;22:92. URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC9164890/ — **CC BY 4.0**. Table 2: cumplimiento por ítem (p. ej. "Last oral intake" 11.2 %, "Events" 21.4 %) — dato útil para la narrativa: incluso en tierra se omiten ítems; un formulario los asegura.

---

## Tabla resumen

| Dato | Estado | Source id sugerido |
|---|---|---|
| A0 OPQRST definición / uso en dolor | FOUND | `saranteas_2019_trauma_pain_opqrst` |
| A0b OPQRST en dolor torácico | FOUND | `uchida_2026_chest_pain_opqrst` |
| A1 Onset | FOUND | `prachanukool_2023_ed_pain_opqrst`, `mca_scmg_ch13_radio_advice` |
| A2 Provocation/Palliation | FOUND | `prachanukool_2023_ed_pain_opqrst` |
| A3 Quality | FOUND | `prachanukool_2023_ed_pain_opqrst` |
| A4 Region/Radiation | FOUND | `prachanukool_2023_ed_pain_opqrst` |
| A5 Severity | FOUND | `prachanukool_2023_ed_pain_opqrst` (+ D) |
| A6 Time | FOUND | `prachanukool_2023_ed_pain_opqrst`, `mca_scmg_ch13_radio_advice` |
| A7 StatPearls EMS pain | UNCONFIRMED | `statpearls_ems_pain_assessment` |
| A8 Open RN PQRSTU (otros síntomas) | UNCONFIRMED | `openrn_nursing_skills_pqrstu` |
| A9 NHTSA EMS Education Standards | UNCONFIRMED | `nhtsa_ems_education_standards_2021` |
| B0 SAMPLE definición | FOUND | `jayaprakash_2016_sample_history`, `who_icrc_bec_quick_cards` |
| B1 Signs/Symptoms | FOUND | `jayaprakash_2016_sample_history`, `mca_scmg_ch13_radio_advice` |
| B2 Allergies | FOUND | `jayaprakash_2016_sample_history` |
| B3a Medications antes | FOUND | `mca_scmg_ch13_radio_advice` |
| B3b Medications desde el inicio | FOUND | `mca_scmg_ch13_radio_advice` |
| B4 Past history | FOUND | `jayaprakash_2016_sample_history` |
| B5 Last oral intake | FOUND | `jayaprakash_2016_sample_history` |
| B6 Events | FOUND | `jayaprakash_2016_sample_history` |
| C1 SBAR (IHI) | FOUND | `ihi_sbar_tool` |
| C2 SBAR handover (WHO) | FOUND | `who_icrc_bec_quick_cards` |
| C3 SBAR (AHRQ) | UNCONFIRMED | `ahrq_teamstepps_sbar` |
| C4 Preparar formulario antes de llamar | FOUND [EARTH] | `mca_scmg_ch13_radio_advice`, `imha_2013_maritime_telemedicine_consensus` |
| C5 Fecha/hora | FOUND [EARTH] | `mca_scmg_ch13_radio_advice` |
| C6 Edad/sexo, nombre opcional | FOUND [EARTH] | `mca_scmg_ch13_radio_advice` |
| C7 Motivo en palabras propias | FOUND | `who_icrc_bec_quick_cards` |
| C8 Inicio y evolución | FOUND [EARTH] | `mca_scmg_ch13_radio_advice` |
| C9 Signos vitales | FOUND [EARTH] | `mca_scmg_ch13_radio_advice`, `who_icrc_bec_quick_cards` |
| C10 Aspecto / fotos | FOUND [EARTH] | `mca_scmg_ch13_radio_advice`, `mca_mgn623_tmas` |
| C11 Pruebas hechas | FOUND [EARTH] | `mca_scmg_ch13_radio_advice` |
| C12 Qué se hizo y respuesta | FOUND [EARTH] | `mca_scmg_ch13_radio_advice` |
| C13 Lesión: conciencia, sangrado | FOUND [EARTH] | `mca_scmg_ch13_radio_advice` |
| C14 Qué preocupa / qué preguntar | FOUND [EARTH] | `mca_scmg_ch13_radio_advice` |
| C15 Entorno / recursos a bordo | FOUND [EARTH] (mapeo UX) | `mca_scmg_ch13_radio_advice`, `imha_2013_maritime_telemedicine_consensus` |
| C16 Anotar y repetir respuesta | FOUND [EARTH] | `mca_scmg_ch13_radio_advice` |
| C19 Retardo Marte ≤40 min ida y vuelta | FOUND | `levin_2023_eimo` |
| C20 Retardo 20–40 min | FOUND | `yule_2023_crew_autonomy` |
| C21 Tiempo real poco práctico | FOUND | `yule_2023_crew_autonomy` |
| C22 Mitigar con checklists | FOUND | `yule_2023_crew_autonomy` |
| C23 Datos médicos a tierra (hoy) | FOUND | `levin_2023_eimo` |
| C24 Ancho de banda limita imágenes | FOUND | `levin_2023_eimo` |
| C25 Definición EIMO | FOUND | `levin_2023_eimo` |
| C26 ISS conferencias médicas privadas | FOUND | `jones_2008_iss_medical_operations` |
| C27 Retardo alarga procedimiento guiado | FOUND | `yeam_2026_comm_delay_suturing` |
| C28 Lista NASA/ESA de datos a enviar | PLACEHOLDER | — |
| C29 Fuente explícita "one-shot" en vuelo | PLACEHOLDER | — |
| C30 ESA telemedicina | PLACEHOLDER | — |
| D1 NRS 0–10 con anclas | FOUND | `krebs_2009_peg_pain_scale` |
| D2 0–10 familiar/extendido | FOUND | `krebs_2009_peg_pain_scale` |
| D3 NRS válida, ancla "maximum pain" | FOUND | `pathak_2018_pain_scales` |
| D4 Alternativa verbal mild/moderate/severe | FOUND | `pathak_2018_pain_scales`, `prachanukool_2023_ed_pain_opqrst` |
| D6 StatPearls Pain Assessment | UNCONFIRMED | `statpearls_pain_assessment` |
| E Abdominal pain OPQRST+SAMPLE | FOUND (verificar siglas) | `larsson_2022_prehospital_abdominal_pain` |
| E Headache OPQRST | FOUND (inferencia por "dolor") | `prachanukool_2023_ed_pain_opqrst` |

**Conteo (filas de la tabla resumen):** FOUND 46 · UNCONFIRMED 5 · PLACEHOLDER 3.

## Pendiente para el verificador

1. Reabrir todas las URLs de PMC/IHI (las citas vienen de WebFetch).
2. Confirmar si `larsson_2022` usa literalmente las siglas SAMPLE/OPQRST.
3. Intentar a mano (navegador): StatPearls NBK554543 / NBK556098, AHRQ SBAR, Open RN 2.5, NHTSA 2021 → a `docs/verificacion-manual.md`.
4. Decidir si se acepta una edición **retirada** del SCMG como análogo histórico (alternativa: comprar/consultar la 24.ª ed.).
5. Licencias restrictivas: WHO (NC-SA), Uchida (NC-ND), Yule (NC), IHI (all rights reserved) → solo paráfrasis corta + enlace.
