# Verificación independiente 5 — "One-shot consult" (Downlink report)

- Fecha de verificación: **2026-11-14**. Verificador independiente: cada URL se volvió a abrir (WebFetch). Para las citas que pasaron por resumidor (PMC, IHI) se descargó además el HTML con `curl` y se buscó el texto literal con `grep`. Los PDF (WHO, MCA SCMG, MGN 623, IMHA) se descargaron y se extrajo el texto con `pdftotext`. No se usaron las citas del investigador.
- Insumo: `docs/research/5-one-shot-consult.md`. Este documento **no modifica** `data/`, código ni el documento de investigación.
- Veredictos: **VERIFIED** (dato en la página, paráfrasis fiel) · **VERIFIED-WITH-EDIT** (dato presente, pero el texto debe cambiar: se da el texto final en inglés) · **REJECTED** (no está o está mal → PLACEHOLDER) · **BLOCKED** (no se deja leer por bot → PLACEHOLDER y a `docs/verificacion-manual.md`).
- Las citas entre comillas son localizadores de ≤15 palabras, no texto para la UI.
- **[EARTH]** = referencia terrestre (marina mercante, emergencias); en la UI: "Earth reference — no spaceflight-specific value".
- **(UX)** = decisión de diseño, no dato de fuente. No lleva source id.

## 0. Hallazgos transversales

1. **Citas literales confirmadas.** Prachanukool Table 4, Krebs (anclas BPI), Levin (EIMO), Yule y la página IHI se confirmaron con `grep` sobre el HTML descargado; coinciden con lo que dijo el investigador.
2. **WHO: la tarjeta TRAUMA no tiene SAMPLE.** En el PDF de Quick Cards, "SAMPLE" aparece solo en la tarjeta ABCDE (recuadro "SAMPLE History"), DIFFICULTY IN BREATHING, SHOCK y ALTERED MENTAL STATUS. El investigador decía que también en trauma: **falso** (fila W1). Afecta la justificación del síntoma "Injury".
3. **Columnas "REMEMBER…" de WHO son diagnósticas y de tratamiento.** Ej.: fila "Chest pain" → "Heart attack (give aspirin if indicated)"; "Fever or HIV" → "Infection". **No usar ninguna fila de esas tablas** como fuente de síntomas en la app; citar WHO solo por el nombre de los ítems SAMPLE y por SBAR.
4. **MGN 623 original fue retirada el 22-oct-2026** y reemplazada por "MGN 623 (M+F) Amendment 1" (gov.uk dice "Amendment 1 changes references only"). La frase de las fotos sigue en §1.3 del Amendment 1. → Cambiar URL de `mca_mgn623_tmas` (fila L1). Licencia en la página: OGL v3.0.
5. **SCMG 22.ª ed. retirada** (gov.uk: "This publication was withdrawn on 17 October 2019"; PDF con marca "WITHDRAWN PUBLICATION"). Aceptable solo como **análogo histórico [EARTH]**, y así debe decirlo la nota de la fuente. La misma página dice que la 23.ª estaba disponible; según búsqueda, la vigente es la 24.ª (MIN 718, dic-2024, de pago) — no verificado su contenido.
6. **Retardo: ninguna cifra de estas fuentes se usa como número en la app.** Levin ("2-way… may be as long as 40 minutes") y Yule ("between 20 and 40 min"; "up to 40+ minutes") son contexto citado. Yule no dice si 20–40 es ida o ida y vuelta. El "~44 min" del concepto es aritmética (2 × 22) y no tiene fuente propia. **La app calcula el ida y vuelta solo desde `data/environments.json`** (`comm_delay_one_way_s` × 2, hoy Mars transit 180–1320 s → 6–44 min, fuente `nasa_perseverance_comms` / `nasa_hrp_distance`; ISS y otros `null`).
7. **Licencias confirmadas:** Saranteas, Jayaprakash, Levin, Pathak, Larsson, Yeam = CC BY 4.0; Uchida = CC BY-NC-ND 4.0; Yule = CC BY-NC 4.0; WHO BEC = CC BY-NC-SA 3.0 IGO (página de la publicación); IHI = "All Rights Reserved"; Krebs = "© The Author(s) 2009" (los ítems BPI se reproducen "with permission from Dr. Charles Cleeland"); Prachanukool = author manuscript sin CC; Jones (NTRS) = "Work of the US Gov. Public Use Permitted."; SCMG / MGN 623 = OGL v3.0 en la página gov.uk; IMHA = sin licencia declarada.
8. **Anclas BPI con copyright.** "pain as bad as you can imagine" es el ancla del Brief Pain Inventory (instrumento con permiso del autor). Para no reproducir un instrumento con derechos, el texto final usa el ancla de Pathak (CC BY): 0 "no pain", 10 "maximum pain" (fila D1).

---

## Tabla A — OPQRST

| # | Dato | URL | Veredicto | Nota (lo que vi / localizador) | Texto final (EN) si VERIFIED-WITH-EDIT |
|---|---|---|---|---|---|
| A0 | OPQRST: qué es, uso en dolor agudo | https://pmc.ncbi.nlm.nih.gov/articles/PMC6694744/ | VERIFIED-WITH-EDIT | "appraise patients based on OPQRST"; "Onset of the event, Provocation or palliation, Quality…". La fuente lo llama **acrónimo** para dolor agudo, no "checklist clinicians use". | "These questions follow OPQRST, a memory aid used to assess acute pain." |
| A0b | OPQRST usado en dolor torácico | https://pmc.ncbi.nlm.nih.gov/articles/PMC13065442/ | VERIFIED | Única mención: "Chest pain symptoms were evaluated using the OPQRST method." CC BY-NC-ND. | — |
| A1 | O — Onset | https://pmc.ncbi.nlm.nih.gov/articles/PMC11300921/ + SCMG | VERIFIED | Table 4: "What were they doing when it started and how did it start"; T: "When did the pain start". SCMG 3.2 "(suddenly, slowly, …)". | — |
| A2 | P — Provocation/Palliation | PMC11300921 | VERIFIED | "What makes it better or worse". Los ejemplos (moving, breathing, resting, position) son **(UX)**. | — |
| A3 | Q — Quality | PMC11300921 | VERIFIED-WITH-EDIT | Ejemplos de la fuente: "cramping, stabbing, burning, electric shock, pressure". "sharp" **no está**. | "Describe it in your own words. For example: cramping, stabbing, burning, electric shock, pressure." |
| A4 | R — Region/Radiation | PMC11300921 | VERIFIED | "Where do they feel it and does it move elsewhere". Esquema corporal = (UX). | — |
| A5 | S — Severity | PMC11300921 | VERIFIED-WITH-EDIT | "On a scale of 1–10, or mild/moderate/severe" — dice **1–10**. La app usa 0–10 de D1/D3. | Usar el texto de D1 + opción verbal de D4. |
| A6 | T — Time | PMC11300921 + SCMG | VERIFIED | "is it constant or intermittent"; SCMG 3.5 "from the beginning to the present time". | — |
| A7 | StatPearls EMS Pain Assessment (NBK554543) | https://www.ncbi.nlm.nih.gov/books/NBK554543/ | BLOCKED | reCAPTCHA (reintentado) | — |
| A8 | Open RN Nursing Skills 2.5 (PQRSTU) | https://wtcs.pressbooks.pub/nursingskills/chapter/2-5-reason-for-seeking-health-care/ | BLOCKED | HTTP 403 (reintentado) | — |
| A9 | NHTSA EMS Education Standards 2021 | https://www.EMS.gov/assets/EMS_Education-Standards_2021_FNL.pdf | BLOCKED | "Access Denied" (Akamai) con curl y WebFetch | — |

## Tabla B — SAMPLE

| # | Dato | URL | Veredicto | Nota | Texto final (EN) si VERIFIED-WITH-EDIT |
|---|---|---|---|---|---|
| B0 | SAMPLE: qué es | https://pmc.ncbi.nlm.nih.gov/articles/PMC5006415/ + WHO Quick Cards PDF | VERIFIED-WITH-EDIT | "ATLS and PALS recommend the use of the acronym 'SAMPLE'". WHO tarjeta ABCDE: recuadro "SAMPLE History" (Signs & Symptoms, Allergies, Medications, PMH, Last oral intake, Events). | "SAMPLE is a memory aid that emergency care courses use for taking a short, focused history." |
| B1 | S — Signs/Symptoms | PMC5006415 + SCMG | VERIFIED | Jayaprakash S: "Symptom onset, timing and duration"; SCMG enf. 3.4 "list all his complaints and symptoms"; lesión 3.3 "in order of importance or severity". | — |
| B2 | A — Allergies | PMC5006415 + SCMG | VERIFIED | "Allergies and nature of reaction"; SCMG 3.10 "list any known allergies". | — |
| B3a | M — medicación previa | SCMG + PMC5006415 | VERIFIED-WITH-EDIT | SCMG 3.9 "medicines/tablets/drugs… taking before the present illness… dose(s) and how often". "supplement" **no está**. | "List all medicines you were taking before this started: name, dose and how often." |
| B3b | M — medicación desde el inicio | SCMG | VERIFIED-WITH-EDIT | SCMG 6.1 "taken or been given since the illness began… dose(s) and the times given". **Quitar la cita WHO** (ejemplo de adrenalina = tratamiento). Es historia, no recomendación. | "List all medicines taken or given since this started: name, dose and the time of each dose." |
| B4 | P — Past history | SCMG + PMC5006415 | VERIFIED | SCMG 3.6 "important past illnesses/ injuries/ operations". No llevar los ejemplos clínicos de Jayaprakash (CHF…). | — |
| B5 | L — Last oral intake | PMC5006415 + WHO | VERIFIED | "Time of last oral intake"; WHO "Last oral intake". | — |
| B6 | E — Events | PMC5006415 + SCMG | VERIFIED | "Events leading up to acute illness"; SCMG lesión 3.1 "exactly how did the injuries arise?". Se solapa con A1: mostrar una sola vez si ambos módulos están activos (UX). | — |
| W1 | WHO tarjeta TRAUMA con "SAMPLE" | WHO Quick Cards PDF | REJECTED | Texto de la tarjeta "APPROACH TO THE PATIENT WITH TRAUMA" sin "SAMPLE". SAMPLE solo en ABCDE, DIB, SHOCK, AMS. | — |

## Tabla C — Datos para el médico remoto

| # | Dato | URL | Veredicto | Nota | Texto final (EN) si VERIFIED-WITH-EDIT |
|---|---|---|---|---|---|
| C1 | SBAR (IHI) | https://www.ihi.org/library/tools/sbar-tool-situation-background-assessment-recommendation | VERIFIED | Literal: "concrete communication mechanism"; S "a concise statement of the problem"; A "analysis and considerations of options — what you found/think". © IHI All Rights Reserved. La app **cambia** la A (no diagnosticar). | — |
| C2 | SBAR handover (WHO) | WHO Quick Cards PDF, tarjeta "TRANSFER AND HANDOVER" | VERIFIED | "Basic patient information (e.g. age, sex); chief complaint"; "2-4 most important and relevant aspects". La "Assessment" WHO = "What you think is wrong" → **no usar**. | — |
| C3 | AHRQ TeamSTEPPS SBAR | https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/sbar.html | BLOCKED | HTTP 403 (reintentado) | — |
| C4 | Preparar todo antes de llamar | SCMG PDF + IMHA PDF | VERIFIED [EARTH] | "Complete the appropriate form or notes before asking for assistance." IMHA §19 "pre-call form for onboard assembly of data" (lo plantea como documentación **requerida a futuro**, no como práctica establecida). "so the ground team gets everything in one message" = (UX). | — |
| C5 | Fecha y hora | SCMG | VERIFIED [EARTH] | 1.3 "date and time (GMT)" | — |
| C6 | Edad, sexo; nombre opcional | SCMG + WHO | VERIFIED [EARTH] | "Age, sex and ethnic origin are more important than the patient's name"; 2.1 "name of casualty (optional)". Etnia no se propone (C18). | — |
| C7 | Motivo en palabras propias | WHO + SCMG | VERIFIED | WHO "the patient's initial description of the problem"; SCMG 3.3 "what did the patient first complain of?" | — |
| C8 | Inicio y evolución | SCMG | VERIFIED [EARTH] | 3.1 "when did the illness first begin?"; 3.5 "to the present time" | — |
| C9 | Signos vitales | SCMG + WHO | VERIFIED [EARTH] | SCMG 4.1 "temperature, pulse and respiration"; WHO "NORMAL ADULT VITAL SIGNS" incluye presión sistólica y "Oxygen Saturation". Adjuntar glucosa = (UX). **No** mostrar los valores normales WHO (no fueron verificados como rangos de la app). | — |
| C10 | Aspecto general / zona; fotos | SCMG + MGN 623 Amendment 1 | VERIFIED-WITH-EDIT [EARTH] | SCMG 4.2 "describe the general appearance"; 4.4 "(swelling, tenderness, lack of movement, and so on)". "color" **no está**. MGN 623 Amdt 1 §1.3: "sometimes useful to supplement this information with photographs". | "Describe your general appearance and how the affected area looks (for example swelling, tenderness or reduced movement). Add a photo if you can." |
| C11 | Pruebas hechas | SCMG | VERIFIED [EARTH] | 4.5 "what tests have you done and with what result" | — |
| C12 | Qué se hizo y cómo respondió | SCMG | VERIFIED-WITH-EDIT [EARTH] | Lesión 5.1 "describe the first-aid and other treatment"; enf. 6.2 "how has the patient responded". "rest" **no está**. Quitar cita WHO (habla de intervenciones clínicas). | "What first aid or other care has already been given? How did you respond to it?" |
| C13 | Lesión: conciencia, memoria, sangrado | SCMG | VERIFIED [EARTH] | Lesión 3.8 "remember everything that happened, or did he lose consciousness"; 4.4 "did the patient lose any blood? If so, how much?" | — |
| C14 | Qué preocupa / qué se necesita saber | SCMG | VERIFIED [EARTH] | 7.1 "what problems are worrying you now?"; 7.2 "what do you think you need to be advised on?" | — |
| C15 | Entorno / recursos a bordo | SCMG + IMHA | VERIFIED [EARTH] (mapeo UX) | SCMG "list of drugs and appliances available"; 1.6 "local weather (if relevant)"; IMHA §17 "party to location, weather, sea condition". El retardo mostrado sale **solo** de `environments.json`. | — |
| C16 | Anotar y repetir la respuesta | SCMG | VERIFIED [EARTH] | "Get any advice you are given down in writing… and repeat back". "in your next message" = adaptación por retardo (UX). | — |
| C17 | Excluir diagnóstico guiado | SCMG | VERIFIED (exclusión) | 5.0 "diagnosis"; 5.1 "what do you think the diagnosis is?"; 5.2 diferencial. No mostrar. | — |
| C18 | No propuesto: alcohol/drogas, familia, social, etnia | SCMG | VERIFIED (exclusión) | Enf. 3.7, 3.8, 3.11; 2.2 "ethnic origin" | — |
| C19 | Retardo Marte ida y vuelta ≤40 min | https://pmc.ncbi.nlm.nih.gov/articles/PMC10810302/ | VERIFIED-WITH-EDIT | Literal: "communication delay for a Mars mission may be as long as 40 minutes". **Solo texto citado, nunca cifra de cálculo.** | "On a Mars mission, the two-way communication delay may be as long as 40 minutes." |
| C20 | Retardo 20–40 min; "40+" | https://pmc.ncbi.nlm.nih.gov/articles/PMC10466940/ | VERIFIED (contexto) | "will vary between 20 and 40 min depending upon the relative positions"; "up to 40+ minutes". No dice si es ida o ida y vuelta → **no usar como cifra**. | — |
| C21 | Consulta en tiempo real poco práctica | PMC10466940 | VERIFIED-WITH-EDIT | "consulting in real time via long distance communications may be impractical" (para misiones largas tipo Marte). "gathers what they will ask" exagera: son preguntas habituales, no las del médico. | "On long missions such as to Mars, consulting doctors on Earth in real time may be impractical." + (UX) "This form collects common questions in advance so one message carries as much as possible." |
| C22 | Mitigar con checklists | PMC10466940 | VERIFIED | "mitigated by use of checklists, development of clinical guidance tools, and establishing protocols" | — |
| C23 | Hoy los datos médicos van a tierra | PMC10810302 | VERIFIED | Literal, en contexto ISS: "Medical data are transmitted to the ground for interpretation where a designated flight surgeon…" | — |
| C24 | Ancho de banda limita imágenes | PMC10810302 | VERIFIED | "affect the ability to transmit high resolution images, video, and other telemedical data" | — |
| C25 | Definición EIMO | PMC10810302 | VERIFIED | "EIMO is the transition of medical primacy from terrestrial to space-based assets" | — |
| C26 | ISS: conferencias médicas privadas | https://ntrs.nasa.gov/citations/20080010877 | VERIFIED | "Private medical conferences (PMCs) are conducted regularly and upon crew request". Preprint 2008 (antiguo: decir "in 2008"). | — |
| C27 | Retardo alarga procedimiento guiado | https://pmc.ncbi.nlm.nih.gov/articles/PMC13623917/ | VERIFIED (contexto) | "The delay group required more time to complete five sutures"; retardo 4 s vs ~400 ms, n = 8 (4 por grupo), "diminishing effect by the fifth suture". | — |
| L1 | URL/estado de `mca_mgn623_tmas` | https://www.gov.uk/government/publications/mgn-623-mf-amendment-1-telemedical-advice-service-tmas-for-ships-at-sea/mgn-623-mf-amendment-1-telemedical-advice-service-tmas-for-ships-at-sea | VERIFIED-WITH-EDIT | Original "withdrawn on 22 October 2026"; Amendment 1 (22-oct-2026) §1.3 mantiene la frase de la proforma y las fotos. OGL v3.0. | Usar la URL del Amendment 1 (ver fuentes). |

C28, C29, C30 siguen **PLACEHOLDER** (no se buscó fuente nueva). La idea "one-shot" debe presentarse como **diseño inspirado en** C4 + C19–C22, no como norma de vuelo espacial.

## Tabla D — Escala 0–10

| # | Dato | URL | Veredicto | Nota | Texto final (EN) si VERIFIED-WITH-EDIT |
|---|---|---|---|---|---|
| D1 | NRS 0–10 con anclas | https://pmc.ncbi.nlm.nih.gov/articles/PMC6181466/ + https://pmc.ncbi.nlm.nih.gov/articles/PMC2686775/ | VERIFIED-WITH-EDIT | Krebs literal: "from 0 ("no pain") to 10 ("pain as bad as you can imagine")" — ancla del BPI, reproducida "with permission". Pathak (CC BY): 0 "no pain", 10 "maximum pain". "right now" = (UX). | "How strong is it right now, from 0 (no pain) to 10 (maximum pain)?" |
| D2 | 0–10 formato familiar | PMC2686775 | VERIFIED | "a format that has become familiar to patients and clinicians" | — |
| D3 | NRS válida, opciones suficientes | PMC6181466 | VERIFIED | §2.3.3 "11-point NRS… 0 indicates 'no pain'"; §4.3 "enough response options to allow for adequate precision" | — |
| D4 | Alternativa verbal | PMC6181466 + PMC11300921 | VERIFIED-WITH-EDIT | 64 % de respuestas incorrectas con NRS en **202 adultos de Nepal con baja alfabetización**: no generalizar a tripulantes. La opción verbal se apoya en Prachanukool "or mild/moderate/severe". "None" = (UX). | Opción: "None / Mild / Moderate / Severe". Nota (opcional): "Some people find words easier than numbers." (UX) |
| D6 | StatPearls Pain Assessment (NBK556098) | https://www.ncbi.nlm.nih.gov/books/NBK556098/ | BLOCKED | reCAPTCHA | — |

## Tabla E — Síntomas

| Síntoma | URL | Veredicto | Nota | Edición |
|---|---|---|---|---|
| Chest pain or pressure | PMC13065442 + WHO + PMC5006415 | VERIFIED-WITH-EDIT | OPQRST: Uchida. SAMPLE: tarjeta WHO SHOCK tiene SAMPLE, pero su fila "Chest pain" es diagnóstico + aspirina → **no citar esa fila**. | Fuentes: `uchida_2026_chest_pain_opqrst`, `jayaprakash_2016_sample_history`. Antes abrir `crew_chest_pain_conscious` (UX). |
| Abdominal pain | https://pmc.ncbi.nlm.nih.gov/articles/PMC9164890/ | VERIFIED | No usa las siglas: lista los 12 ítems (Signs and symptoms… Onset, Provokes or Palliates, Quality, Radiates, Severity, Time) con iniciales en negrita (Table 2). "Last oral intake" 11.2 %, "Events" 21.4 %. | Decir "items", no "acronyms". |
| Headache | (fuentes generales de dolor) | VERIFIED (inferencia) | Sin fuente específica de cefalea; OPQRST se aplica por ser dolor. Marcar como inferencia (UX). | — |
| Injury | SCMG (formato B) + PMC6694744 | VERIFIED-WITH-EDIT | La tarjeta WHO TRAUMA **no** tiene SAMPLE (W1). Respaldo: proforma de lesión SCMG; OPQRST en dolor por trauma (Saranteas). | Fuentes: `mca_scmg_ch13_radio_advice`, `saranteas_2019_trauma_pain_opqrst`, `jayaprakash_2016_sample_history`. |
| Shortness of breath | WHO DIB card + SCMG | VERIFIED | Tarjeta "DIFFICULTY IN BREATHING": "Key Findings from the SAMPLE History". Sin OPQRST. No usar columna REMEMBER. | — |
| Fever or feeling unwell | SCMG (formato A) + `cdc_fever` | VERIFIED-WITH-EDIT | La fila WHO "Fever or HIV → Infection" es diagnóstica: **no citar**. | Fuentes: `mca_scmg_ch13_radio_advice`, `jayaprakash_2016_sample_history`, `cdc_fever`. |
| Other | PMC5006415 | VERIFIED | SAMPLE general + texto libre | — |

---

## Conteo de veredictos

| Sección | VERIFIED | VERIFIED-WITH-EDIT | REJECTED | BLOCKED |
|---|---|---|---|---|
| A (11) | 5 | 3 | 0 | 3 |
| B + W1 (9) | 5 | 3 | 1 | 0 |
| C + L1 (28) | 22 | 5 | 0 | 1 |
| D (5) | 2 | 2 | 0 | 1 |
| E (7) | 4 | 3 | 0 | 0 |
| **Total (60)** | **38** | **16** | **1** | **5** |

---

## Listo para cargar

Solo ítems VERIFIED / VERIFIED-WITH-EDIT. Reglas: la app **no diagnostica** ni sugiere tratamiento o medicación; preguntar qué se tomó es historia. Ítems [EARTH] llevan el aviso. **(UX)** sin source id.

### Texto de ayuda / contexto

| id sugerido | Texto (EN) | Fuente |
|---|---|---|
| `intro` | "Fill this in before you transmit, so the ground team gets as much as possible in one message." | `mca_scmg_ch13_radio_advice` [EARTH] (primera mitad); resto (UX) |
| `why_delay` | "On long missions such as to Mars, consulting doctors on Earth in real time may be impractical." | `yule_2023_crew_autonomy` |
| `why_checklist` | "Checklists and clinical guidance tools can help crews work with long communication delays." | `yule_2023_crew_autonomy` |
| `today_iss` | "On the ISS, medical data are sent to flight surgeons on the ground for interpretation." | `levin_2023_eimo` |
| `opqrst_help` | "These questions follow OPQRST, a memory aid used to assess acute pain." | `saranteas_2019_trauma_pain_opqrst` |
| `sample_help` | "SAMPLE is a memory aid that emergency care courses use for taking a short, focused history." | `jayaprakash_2016_sample_history` |
| `not_diagnosis` | "This report collects information only. It does not diagnose or suggest treatment." | (UX) |
| `delay_line` | Calculado: "Round trip now: {2×min}–{2×max} min" desde `environments.json` | fuentes del entorno — **no** usar 40 / 20–40 / 44 de los papers |

### Lista de síntomas

| id | Label (EN) | Módulos | Fuentes | Nota |
|---|---|---|---|---|
| `chest_pain` | "Chest pain or pressure" | OPQRST + SAMPLE + pain_scale + remote_min | `uchida_2026_chest_pain_opqrst`, `jayaprakash_2016_sample_history` | Primero abrir `crew_chest_pain_conscious` (UX) |
| `abdominal_pain` | "Abdominal pain" | OPQRST + SAMPLE + pain_scale + remote_min | `larsson_2022_prehospital_abdominal_pain` | — |
| `headache` | "Headache" | OPQRST + SAMPLE + pain_scale + remote_min | `saranteas_2019_trauma_pain_opqrst`, `prachanukool_2023_ed_pain_opqrst` | Inferencia (UX): aplicado por ser dolor |
| `injury` | "Injury" | SAMPLE + injury_extra + OPQRST + pain_scale + remote_min | `mca_scmg_ch13_radio_advice` [EARTH], `saranteas_2019_trauma_pain_opqrst` | — |
| `breathing` | "Shortness of breath or difficulty breathing" | SAMPLE + remote_min (sin OPQRST) | `who_icrc_bec_quick_cards`, `mca_scmg_ch13_radio_advice` | — |
| `fever_unwell` | "Fever or feeling unwell" | SAMPLE + remote_min (sin OPQRST) | `mca_scmg_ch13_radio_advice` [EARTH], `cdc_fever` | — |
| `other` | "Other" | SAMPLE + remote_min | `jayaprakash_2016_sample_history` | — |

### Set 1 — OPQRST (en orden)

| id | Pregunta (EN) | Tipo de respuesta | Fuente |
|---|---|---|---|
| `o_when` | "When did it start, and what were you doing at that moment?" | time + free text | `prachanukool_2023_ed_pain_opqrst` |
| `o_how` | "Did it start suddenly or gradually?" | choice (Suddenly / Gradually / Not sure) | `mca_scmg_ch13_radio_advice` [EARTH] |
| `p` | "Does anything make it better or worse (for example moving, breathing, resting, position)?" | free text | `prachanukool_2023_ed_pain_opqrst` (ejemplos UX) |
| `q` | "Describe it in your own words. For example: cramping, stabbing, burning, electric shock, pressure." | free text (+ chips opcionales con esas 5 palabras) | `prachanukool_2023_ed_pain_opqrst` |
| `r` | "Where exactly do you feel it? Does it spread or move anywhere else?" | free text (+ esquema corporal, UX) | `prachanukool_2023_ed_pain_opqrst` |
| `s` | → `pain_now` (Set 4) | 0–10 | ver Set 4 |
| `t` | "Is it constant, or does it come and go? Has it changed since it started?" | choice (Constant / Comes and goes) + free text | `prachanukool_2023_ed_pain_opqrst`, `mca_scmg_ch13_radio_advice` |

### Set 2 — SAMPLE (en orden)

| id | Pregunta (EN) | Tipo | Fuente |
|---|---|---|---|
| `s_symptoms` | "What symptoms do you have? List all of them, starting with the one that bothers you most." | free text (lista) | `jayaprakash_2016_sample_history`, `mca_scmg_ch13_radio_advice` |
| `a_allergies` | "Do you have any known allergies? If yes, what happens when you react?" | choice (No / Yes) + free text | `jayaprakash_2016_sample_history`, `mca_scmg_ch13_radio_advice` |
| `m_before` | "List all medicines you were taking before this started: name, dose and how often." | free text (lista) | `mca_scmg_ch13_radio_advice` [EARTH], `jayaprakash_2016_sample_history` |
| `m_since` | "List all medicines taken or given since this started: name, dose and the time of each dose." | free text (lista) + time | `mca_scmg_ch13_radio_advice` [EARTH] |
| `p_past` | "Any important past illnesses, injuries or operations?" | free text | `mca_scmg_ch13_radio_advice`, `jayaprakash_2016_sample_history` |
| `l_last_intake` | "When did you last eat or drink?" | time | `jayaprakash_2016_sample_history`, `who_icrc_bec_quick_cards` |
| `e_events` | "What were you doing just before this started? Describe what happened." | free text (omitir si ya se respondió `o_when`, UX) | `jayaprakash_2016_sample_history` |

### Set 3 — Datos mínimos para el médico remoto (estructura S-B-"Observations"-Questions, UX sobre SBAR)

| id | Pregunta / campo (EN) | Tipo | Fuente |
|---|---|---|---|
| `timestamp` | Auto: date and time (UTC / mission time) | auto | `mca_scmg_ch13_radio_advice` [EARTH] |
| `basic_info` | Auto: age, sex (name optional) | auto | `mca_scmg_ch13_radio_advice` [EARTH], `who_icrc_bec_quick_cards` |
| `chief_complaint` | "In your own words, what is the main problem?" | free text | `who_icrc_bec_quick_cards`, `mca_scmg_ch13_radio_advice` |
| `course` | "When did it begin, how did it begin, and how has it changed since?" (omitir si OPQRST activo, UX) | free text | `mca_scmg_ch13_radio_advice` [EARTH] |
| `vitals` | "Attach your latest readings: temperature, pulse, breathing rate (and blood pressure, oxygen saturation if available)." + adjuntar lecturas registradas con hora | auto + numeric | `mca_scmg_ch13_radio_advice` [EARTH], `who_icrc_bec_quick_cards` |
| `appearance` | "Describe your general appearance and how the affected area looks (for example swelling, tenderness or reduced movement). Add a photo if you can." | free text + photo | `mca_scmg_ch13_radio_advice`, `mca_mgn623_tmas` [EARTH] |
| `tests` | "Any tests or measurements already done? What were the results?" | free text | `mca_scmg_ch13_radio_advice` [EARTH] |
| `care_given` | "What first aid or other care has already been given? How did you respond to it?" | free text | `mca_scmg_ch13_radio_advice` [EARTH] |
| `injury_loc` (solo Injury) | "Did you lose consciousness, even briefly? Do you remember everything that happened?" | choice (No / Yes / Not sure) + free text | `mca_scmg_ch13_radio_advice` [EARTH] |
| `injury_blood` (solo Injury) | "Any bleeding? About how much?" | choice (No / Yes) + free text | `mca_scmg_ch13_radio_advice` [EARTH] |
| `worries` | "What worries you most right now?" | free text | `mca_scmg_ch13_radio_advice` [EARTH] |
| `questions` | "What do you most need the ground team to answer?" | free text | `mca_scmg_ch13_radio_advice` [EARTH] |
| `context` | Auto: mission phase, location, current round-trip delay (de `environments.json`), on-board medical kit list | auto | `mca_scmg_ch13_radio_advice`, `imha_2013_maritime_telemedicine_consensus` [EARTH]; mapeo (UX) |
| `readback` (respuesta) | "Write down the reply and read it back in your next message." | free text | `mca_scmg_ch13_radio_advice` [EARTH]; "next message" (UX) |

Excluidos a propósito: diagnóstico / diagnóstico diferencial (SCMG 5.0), "Assessment" de SBAR, alcohol/drogas, historia familiar/social, etnia.

### Set 4 — Escala de dolor

| id | Pregunta (EN) | Tipo | Fuente |
|---|---|---|---|
| `pain_now` | "How strong is it right now, from 0 (no pain) to 10 (maximum pain)?" | 0–10 (11 botones, con etiqueta en 0 y 10) | `pathak_2018_pain_scales`, `krebs_2009_peg_pain_scale` |
| `pain_words` (alternativa) | "None / Mild / Moderate / Severe" | choice | `prachanukool_2023_ed_pain_opqrst` ("None" UX) |

### Fuentes nuevas propuestas para `data/sources.json` (accessed `2026-11-14`, status `VERIFIED`)

| id | title | publisher | url | license | note (EN) |
|---|---|---|---|---|---|
| `prachanukool_2023_ed_pain_opqrst` | Best Practices in End of Life and Palliative Care in the Emergency Department (Prachanukool et al., Clin Geriatr Med 2023) | Clinics in Geriatric Medicine / PMC (author manuscript) | https://pmc.ncbi.nlm.nih.gov/articles/PMC11300921/ | PMC author manuscript, no CC license; cite and paraphrase only | Table 4 outlines OPQRST questions for a focused pain assessment (adapted from EMS1). |
| `saranteas_2019_trauma_pain_opqrst` | Pain is vital in resuscitation in trauma (Saranteas et al., SICOT-J 2019) | SICOT-J / PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC6694744/ | CC BY 4.0 | Defines OPQRST (Onset, Provocation/palliation, Quality, Region/radiation, Severity, Time) for acute pain. |
| `uchida_2026_chest_pain_opqrst` | Association Between Symptom Characteristics, Knowledge Sources, and Patient Interpretation of Acute Coronary Syndrome (Uchida et al., Circ Rep 2026) | Circulation Reports / PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC13065442/ | CC BY-NC-ND 4.0; cite only | A chest-pain registry evaluated symptoms with the OPQRST method. |
| `jayaprakash_2016_sample_history` | The incorporation of focused history in checklist for early recognition and treatment of acute illness and injury (Jayaprakash et al., BMC Emerg Med 2016) | BMC Emergency Medicine / PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC5006415/ | CC BY 4.0 | ATLS and PALS recommend the SAMPLE acronym for a focused history. |
| `who_icrc_bec_quick_cards` | WHO-ICRC Basic Emergency Care: approach to the acutely ill and injured — Quick Cards (2018) | World Health Organization / ICRC | https://cdn.who.int/media/docs/default-source/integrated-health-services-(ihs)/csy/bec-quick-cards/becp-edu29-pdf-en-finl.pdf | CC BY-NC-SA 3.0 IGO (per publication page https://www.who.int/publications/i/item/9789241513081); item names and short paraphrase only | Lists SAMPLE history items and an SBAR handover format; diagnostic columns are not used. |
| `ihi_sbar_tool` | SBAR Tool: Situation-Background-Assessment-Recommendation | Institute for Healthcare Improvement | https://www.ihi.org/library/tools/sbar-tool-situation-background-assessment-recommendation | © IHI, All Rights Reserved; cite and paraphrase only | SBAR is a structured way to frame a message that needs a clinician's attention. |
| `mca_scmg_ch13_radio_advice` | The Ship Captain's Medical Guide, 22nd ed., Chapter 13: External assistance (withdrawn edition) | Maritime and Coastguard Agency (UK) | https://assets.publishing.service.gov.uk/media/5da84a23ed915d429d114666/mcga-shs_capt_guide_chap13.pdf | Open Government Licence v3.0 (gov.uk page); © Crown copyright | Historical maritime checklist of information to prepare before requesting radio medical advice; edition withdrawn in 2019. |
| `mca_mgn623_tmas` | MGN 623 (M+F) Amendment 1: Telemedical advice service (TMAS) for ships at sea | Maritime and Coastguard Agency (UK) | https://www.gov.uk/government/publications/mgn-623-mf-amendment-1-telemedical-advice-service-tmas-for-ships-at-sea/mgn-623-mf-amendment-1-telemedical-advice-service-tmas-for-ships-at-sea | Open Government Licence v3.0 | The ship medical guide includes a form for TMAS information; photographs can help. |
| `imha_2013_maritime_telemedicine_consensus` | Maritime telemedicine – state of the art. Consensus (IMHA/NCMM workshop, Malta, 2013) | International Maritime Health Association | https://www.imha.net/0104114%20MALTA%20Workshop%20consensus%20paper.pdf | No license stated; cite and paraphrase only | Consensus calls for a pre-call form to assemble data on board before contacting telemedical services. |
| `levin_2023_eimo` | Enabling Human Space Exploration Missions Through Progressively Earth Independent Medical Operations (EIMO) (Levin et al., IEEE OJEMB 2023) | IEEE Open Journal of Engineering in Medicine and Biology / PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC10810302/ | CC BY 4.0 | Two-way delay for Mars may reach 40 minutes; ISS medical data go to ground flight surgeons. |
| `yule_2023_crew_autonomy` | Crew Autonomy During Simulated Medical Event Management on Long Duration Space Exploration Missions (Yule et al., Hum Factors 2023) | Human Factors / PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC10466940/ | CC BY-NC 4.0; cite and paraphrase only | Real-time consults may be impractical on Mars missions; checklists and guidance tools can mitigate delay. |
| `jones_2008_iss_medical_operations` | International Space Station Medical Operations (Jones, 2008 preprint) | NASA Technical Reports Server | https://ntrs.nasa.gov/citations/20080010877 | Work of the U.S. Government; public use permitted | ISS crews hold private medical conferences regularly and on request (2008). |
| `yeam_2026_comm_delay_suturing` | Communication delay increases procedure time and instructor task load during simulated suturing by novices (Yeam et al., npj Microgravity 2026) | npj Microgravity / PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC13623917/ | CC BY 4.0 | In a small simulation (n = 8), a 4-second delay lengthened a remotely guided procedure. |
| `krebs_2009_peg_pain_scale` | Development and Initial Validation of the PEG, a Three-item Scale Assessing Pain Intensity and Interference (Krebs et al., J Gen Intern Med 2009) | Journal of General Internal Medicine / PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC2686775/ | © The Author(s) 2009; BPI items used with permission; cite and paraphrase only | 0–10 pain ratings are a format familiar to patients and clinicians. |
| `pathak_2018_pain_scales` | The utility and validity of pain intensity rating scales for use in developing countries (Pathak et al., Pain Rep 2018) | PAIN Reports / PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC6181466/ | CC BY 4.0 | The 0–10 NRS (0 no pain, 10 maximum pain) gives enough options for precise ratings. |
| `larsson_2022_prehospital_abdominal_pain` | Prehospital assessment of patients with abdominal pain triaged to self-care at home: an observation study (Larsson et al., BMC Emerg Med 2022) | BMC Emergency Medicine / PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC9164890/ | CC BY 4.0 | Ambulance records of abdominal pain often missed history items such as last oral intake (11%). |

### Afirmaciones sobre retardo que la app NO debe usar como cifra

- "may be as long as 40 minutes" (2-way, Mars) — `levin_2023_eimo`: solo como texto citado.
- "between 20 and 40 min" / "up to 40+ minutes" — `yule_2023_crew_autonomy`: no dice si es ida o ida y vuelta; solo contexto.
- "~44 min" (2 × 22) — aritmética sin fuente propia; no escribirlo como dato.
- 4 s (Luna, simulación) — `yeam_2026_comm_delay_suturing`: condición experimental, no retardo real.
- Cualquier valor mostrado de ida y vuelta = 2 × `comm_delay_one_way_s` de `data/environments.json`; si es `null`, mensaje conservador.

### Siguen PLACEHOLDER / BLOCKED

C28, C29, C30 (PLACEHOLDER). A7, A8, A9, C3, D6 (BLOCKED → `docs/verificacion-manual.md` #11–15). W1 (REJECTED).
