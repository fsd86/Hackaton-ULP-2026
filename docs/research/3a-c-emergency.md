# Investigación 3A–C: protocolo de emergencia `crew_collapse_chest_pain`

Fecha de consulta de todas las fuentes: **2026-11-14**. Solo investigación: no se editó `data/` ni código.
Reglas aplicadas: el texto propuesto está parafraseado (nunca copiado); las citas de ubicación tienen ≤15 palabras y sirven solo para localizar el dato; página bloqueada → **UNCONFIRMED**; no encontrado → **PLACEHOLDER**. "Proposed UI text" va en inglés.

Etiqueta usada: **[EARTH]** = "Earth guidance — not adapted to spaceflight".

---

## 0. Fuentes consultadas

| id sugerido | Título | Editor | URL | Estado | Licencia |
|---|---|---|---|---|---|
| `dglrm_cpr_microgravity` (ya existe) | Cardiopulmonary resuscitation (CPR) during spaceflight – a guideline for CPR in microgravity from the DGLRM and ESAM-SMG (Hinkelbein et al., Scand J Trauma Resusc Emerg Med 2020;28:108, publicado 2 nov 2020) | BMC / PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC7607644/ | Leído completo (2 tramos, incluida la bibliografía) | CC BY 4.0 |
| `rcuk_bls_2025` | Adult basic life support guidelines (2025 Resuscitation Guidelines; cita como referencia la guía ERC 2025 Adult BLS) — publicado 27 oct 2025 | Resuscitation Council UK | https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/adult-basic-life-support-guidelines | Leído | © RCUK 2014–2026; la reproducción requiere permiso → solo parafrasear y enlazar |
| `erc_bls_2025` | European Resuscitation Council Guidelines 2025 Adult Basic Life Support (Smyth, Perkins et al., Resuscitation 2025;215 Suppl 1:110771, doi 10.1016/j.resuscitation.2025.110771) | ERC / Elsevier | https://www.erc.edu/science-research/guidelines/guidelines-2025/guidelines-2025-english | **UNCONFIRMED**: la página de ERC solo tiene enlaces; el texto está en resuscitationjournal.com (no leído). Usar RCUK como fuente leída. | Términos ERC/Elsevier (no leídos) |
| `aha_bls_2025` | Part 7: Adult Basic Life Support: 2025 AHA Guidelines for CPR and ECC (Circulation 2025;152(16_suppl_2):S448–S478, doi 10.1161/CIR.0000000000001369) | American Heart Association | https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support | **UNCONFIRMED-blocked** (HTTP 403). También 403: Executive Summary y PDF del algoritmo BLS adulto 2025. | Términos AHA (no leídos) |
| `medlineplus_cpr_adult` | CPR – adult and child after onset of puberty (revisado 2/10/2026) | MedlinePlus (NLM) — contenido A.D.A.M. | https://medlineplus.gov/ency/article/000013.htm | Leído | **NO dominio público**: © 1997–2026 A.D.A.M./Ebix; el pie prohíbe copiar o usar para entrenar IA → solo parafrasear y enlazar |
| `nhlbi_heart_attack_symptoms` | Heart Attack – Symptoms (última actualización 24 mar 2022) | NHLBI (NIH) | https://www.nhlbi.nih.gov/health/heart-attack/symptoms | Leído | Dominio público (U.S. Government work) |
| `medlineplus_heart_attack` | Heart attack (revisado 7/14/2024, actualizado 07/01/2025) | MedlinePlus (NLM) — contenido A.D.A.M. | https://medlineplus.gov/ency/article/000195.htm | Leído | **NO dominio público** (A.D.A.M., mismas restricciones) |
| `aha_heart_attack_signs` | Warning Signs of a Heart Attack | American Heart Association | https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack | **UNCONFIRMED-blocked** (HTTP 403) | Términos AHA |
| `tran_2021_lds_protocol` | Evidence Supporting the Management of Medical Conditions During Long-Duration Spaceflight: Protocol for a Scoping Review (Tran et al., JMIR Res Protoc 2021;10(3):e24323) | JMIR / PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC8088865/ | Leído (contexto; no da manejo clínico) | CC BY 4.0 |
| `amhp_2025_emergencies` | Managing Select Medical Emergencies During Long-Duration Space Missions (Aerosp Med Hum Perform 2025;96(2):143–154) | Aerospace Medical Association | https://asma.kglmeridian.com/view/journals/amhp/96/2/article-p143.xml | **UNCONFIRMED-blocked** (HTTP 403) — sería la fuente clave para dolor torácico/SCA en vuelo | Términos AsMA (no leídos) |

---

## A) Tripulante que no responde

### A1. Lo que dice (y NO dice) la guía de microgravedad (PMC7607644) — re-lectura completa

- **Reconocimiento (respuesta, respiración, pulso):** la guía **no** describe pasos de reconocimiento. Las palabras "breathing", "unresponsive", "consciousness" y "pulse check" **no aparecen** en el texto (verificado en todo el artículo, incluida la bibliografía).
- **Única mención:** la recomendación 1 estructura la RCP en microgravedad como una "cadena de supervivencia" (BLS + ALS); en el resumen de evidencia de esa recomendación se nombran el reconocimiento precoz y la llamada de ayuda como eslabones, sin detallarlos.
  - Ubicación: Recommendation 1, evidence summary — "It consists of early recognition and the call for help, early and effective chest compressions,"
- **Alarma / roles de equipo:** no hay un paso de "alarma". Sí hay datos útiles de equipo:
  - Vía aérea solo con ≥2 rescatadores (ya en el paso 7). Ubicación: Abstract/Results — "Airway management should only be performed if at least two rescuers are present".
  - Acceso venoso solo con más de dos rescatadores (Rec. 16).
  - En órbita baja (LEO), consultar telemedicina ante un paro cardíaco si es factible (Rec. 20). Ubicación: "In low earth orbit telemedicine support SHOULD be consulted in the event of a cardiac".
  - En misiones a Marte, la telemedicina será impracticable durante la RCP por el retraso de comunicación; buscarla solo si hay tripulantes no implicados (Rec. 21). Ubicación: "During space exploration missions to Mars telemedicine support will be impractical during CPR due to".
  - La tripulación tendrá que informar a Mission Control de la emergencia en curso (justificación de Rec. 21). Ubicación: "the crew will be obliged to inform Mission Control of an ongoing medical emergency".
  - La decisión de terminar la RCP la toma el tripulante con mayor cualificación médica (Rec. 22). Ubicación: "The decision to terminate resuscitation SHOULD be made by the crewmember with the highest medical".
- **DEA:** almacenado con el equipo de emergencia (Rec. 11); todos los tripulantes entrenados en el DEA específico de la misión (Rec. 13, ubicación: "All crewmembers SHOULD be trained in the use of the specific AED provided"); en la ISS el desfibrilador forma parte del CHeCS (Crew Health Care System). No describe "ir a buscar el DEA" como paso.
- **Frecuencia/profundidad de compresiones:** **CONFIRMADO que la guía no fija objetivo para microgravedad.** Reporta frecuencias medidas por técnica en estudios (p. ej., Evetts-Russomano ~105/min; handstand >120/min) y menciona como referencia terrestre la profundidad de 50–60 mm de la guía ERC vigente entonces, señalando que algunos métodos no la alcanzaban. Ubicación: "although it still not reached the recommended 50–60 mm of the current ERC guidelines". Esto confirma el `_comment` actual de `protocols.json`.

### A2. Paso 1 — Comprobar respuesta y respiración

| Campo | Propuesta | Fuente / ubicación | Estado |
|---|---|---|---|
| step 1 `text` | "Check if your crewmate responds: tap the shoulders and call their name loudly." | `medlineplus_cpr_adult` — sección pasos, "Shake or tap the person gently." **[EARTH]** | FOUND |
| step 1 `detail` | "If there is no response and breathing is absent or not normal (for example, only gasping), treat it as cardiac arrest and start CPR." | `rcuk_bls_2025` — "If any person is unresponsive with abnormal breathing, cardiac arrest should be assumed."; y "agonal gasping or panting, must be recognised as signs of cardiac arrest." **[EARTH]** | FOUND |
| Límite de tiempo para valorar la respiración (≤10 s) | No usar un número todavía. RCUK no da límite (solo valorar mientras se espera la llamada); MedlinePlus no da segundos. El "10 segundos" aparece en el algoritmo BLS de AHA para profesionales (comprobación simultánea de pulso y respiración), pero esa página devolvió 403. | `aha_bls_2025` | **UNCONFIRMED-blocked** |
| Comentario microgravedad | La guía de microgravedad no detalla este paso (ver A1). | `dglrm_cpr_microgravity` | FOUND (ausencia confirmada) |

### A3. Paso 2 — Alertar a la tripulación y a tierra

| Campo | Propuesta | Fuente / ubicación | Estado |
|---|---|---|---|
| step 2 `text` | "Call for help: alert the rest of the crew and inform Mission Control of the medical emergency." | Llamar a ayuda sin demora: `rcuk_bls_2025` — "activate the speaker function and call 999 without delay." **[EARTH]**; enviar a otra persona a llamar: `medlineplus_cpr_adult` — "Shout for help and send someone to call 911" **[EARTH]**; informar a Mission Control: `dglrm_cpr_microgravity` (justificación Rec. 21) — "the crew will be obliged to inform Mission Control of an ongoing medical emergency" | FOUND |
| step 2 `detail` | "In low Earth orbit, ask for flight-surgeon (telemedicine) support when possible. On distant missions, a live consult during CPR may be impossible because of the signal delay; only an uninvolved crewmate should handle it." | `dglrm_cpr_microgravity` Rec. 20 y Rec. 21 (ubicaciones en A1) | FOUND |
| Traer el DEA (posible paso 2b o parte del detail) | "Have a crewmate bring the AED from the emergency equipment. Start CPR without waiting for it." | DEA guardado con el equipo de emergencia: `dglrm_cpr_microgravity` Rec. 11; usar el DEA en cuanto esté disponible: `rcuk_bls_2025` — "Use an AED as soon as it is available." **[EARTH]**; iniciar RCP aunque no haya desfibrilador: `dglrm_cpr_microgravity` Rec. 14 | FOUND |
| Nota de diseño | Rol "quién lidera": la guía solo asigna al de mayor cualificación médica la decisión de terminar (Rec. 22). No define otros roles → no inventar. | `dglrm_cpr_microgravity` | Roles adicionales: PLACEHOLDER |

### A4. Objetivos de compresión en la Tierra vs. microgravedad

| Dato | Propuesta (informativa, no temporizador) | Fuente / ubicación | Estado |
|---|---|---|---|
| Frecuencia en la Tierra | "On Earth, guidelines ask for 100–120 compressions per minute." | `rcuk_bls_2025` — "Compress the chest at a rate of 100–120"; también `medlineplus_cpr_adult` — "Do 100 to 120 compressions per minute." **[EARTH]** | FOUND |
| Profundidad en la Tierra | "On Earth, guidelines ask for a depth of at least 5 cm and no more than 6 cm." | `rcuk_bls_2025` — "Compress to a depth of at least 5 cm, but not more than 6 cm." **[EARTH]** | FOUND |
| Interrupciones | "Keep pauses in compressions as short as possible." | `rcuk_bls_2025` — "with as few interruptions as possible." **[EARTH]** | FOUND |
| AHA 2025 (rate/depth) | No verificado en la fuente primaria. | `aha_bls_2025` | UNCONFIRMED-blocked |
| Objetivo en microgravedad | "No validated compression rate or depth exists for microgravity yet." | `dglrm_cpr_microgravity` — ausencia confirmada; solo cita los 50–60 mm de ERC como referencia terrestre | FOUND (ausencia) |

Recomendación: mantener la decisión actual de **no poner temporizador/metrónomo**; si se muestran las cifras terrestres, que lleven la etiqueta [EARTH] visible.

---

## B) Tripulante CONSCIENTE con dolor torácico

### B1. Señales de alarma de infarto (todas [EARTH])

| Señal | Proposed UI text | Fuente / ubicación | Estado |
|---|---|---|---|
| Dolor/opresión torácica | "Chest pain, pressure, heaviness or discomfort, in the center or left side." | `nhlbi_heart_attack_symptoms` — "Chest pain, heaviness, or discomfort in the center or left side of the chest" | FOUND |
| Molestia en parte superior del cuerpo | "Pain or discomfort spreading to one or both arms, back, shoulders, neck or jaw." | `nhlbi_heart_attack_symptoms` — "Pain or discomfort in one or both arms, your back, shoulders, neck, jaw" | FOUND |
| Falta de aire | "Shortness of breath at rest or with light activity." | `nhlbi_heart_attack_symptoms` — "Shortness of breath when resting or doing a little bit of physical activity" | FOUND |
| Sudoración | "Heavy sweating without a clear reason." | `nhlbi_heart_attack_symptoms` — "Sweating a lot for no reason" (no dice "sudor frío") | FOUND |
| Náusea/vómito | "Nausea or vomiting." | `nhlbi_heart_attack_symptoms` — "Nausea (feeling sick to the stomach) and vomiting" | FOUND |
| Mareo | "Light-headedness or sudden dizziness." | `nhlbi_heart_attack_symptoms` — "Light-headedness or sudden dizziness" | FOUND |
| Cansancio inusual | "Unusual tiredness without reason, sometimes for days (more common in women)." | `nhlbi_heart_attack_symptoms` — "Feeling unusually tired for no reason, sometimes for days"; "is more common in women" | FOUND |
| Síntomas leves o ausentes | "Symptoms can be mild or absent, especially in older adults and people with diabetes." | `nhlbi_heart_attack_symptoms` — sección "Silent heart attacks"; `medlineplus_heart_attack` (algunas personas, incl. mujeres, con poco o ningún dolor) | FOUND |
| Dolor que no cede con reposo | "Rest may not fully relieve heart-attack pain." | `medlineplus_heart_attack` — rest and nitroglycerin "may not completely relieve the pain of a heart attack." | FOUND |
| Lista AHA (contraste) | — | `aha_heart_attack_signs` | UNCONFIRMED-blocked |

### B2. Qué hacer (persona lega) — todo [EARTH]

| Acción | Proposed UI text | Fuente / ubicación | Estado |
|---|---|---|---|
| Pedir ayuda de emergencia ya, aunque no haya certeza | "Get emergency medical help immediately, even if you are not sure it is a heart attack." | `nhlbi_heart_attack_symptoms` — "Call 9-1-1 for emergency medical care, even if you are not sure" | FOUND |
| Duda angina vs infarto | "If unsure whether it is angina or a heart attack, treat it as an emergency." | `nhlbi_heart_attack_symptoms` — "If you don't know whether your chest pain is angina or a heart attack" | FOUND |
| Cada minuto cuenta | "Act fast: every minute matters." | `nhlbi_heart_attack_symptoms` — "Every minute matters." / "Acting fast can limit damage to your heart" | FOUND |
| No conducir / ambulancia | No aplica a vuelo espacial tal cual (no hay ambulancia). Equivalente espacial = contacto inmediato con cirujano de vuelo (ver B3). | `nhlbi_heart_attack_symptoms` — "An ambulance is the best and safest way to get to the hospital." | FOUND (no trasladable) |
| Aspirina | **No proponer paso de aspirina.** NHLBI solo dice que no se debe retrasar la llamada de emergencia por tomar aspirina u otra cosa, sin dar dosis ni condiciones. MedlinePlus solo menciona aspirina administrada por personal sanitario "unless it would not be safe for you". Ninguna fuente leída da condiciones para que un lego la dé. | `nhlbi_heart_attack_symptoms` — "Never delay calling 9-1-1, taking aspirin or doing anything else"; `medlineplus_heart_attack` (sección tratamiento) | Condiciones para lego: **PLACEHOLDER** (AHA, que suele tratarlo, bloqueada) |
| Mantener en reposo | No encontrado como instrucción explícita en las fuentes leídas. | — | **PLACEHOLDER** |
| Vigilar y estar listo para RCP | No encontrado como frase explícita en NHLBI/MedlinePlus heart attack. Se puede justificar por lógica de protocolo: si deja de responder y no respira normal → `crew_collapse_chest_pain` (fuente: `rcuk_bls_2025`, criterio A2). | `rcuk_bls_2025` (criterio de paro) | Transición: FOUND; "monitor" como paso: PLACEHOLDER |

### B3. Guía específica de vuelo espacial

| Dato | Hallazgo | Fuente | Estado |
|---|---|---|---|
| Consultar telemedicina (paro cardíaco, LEO) | La guía recomienda telemedicina en LEO ante paro; en Marte impracticable durante RCP. **No trata dolor torácico consciente**; "chest pain", "acute coronary syndrome" y "aspirin" no aparecen. Solo cita un estudio sobre infarto seguido de paro en misiones de exploración (ref. 76). | `dglrm_cpr_microgravity` Rec. 20–21 | FOUND (solo para paro) |
| El síndrome coronario agudo es condición prioritaria para misiones largas | El SCA es la 1.ª de 10 condiciones priorizadas, tomadas de la lista del Integrated Medical Model de NASA; el artículo señala que el regreso urgente a la Tierra puede ser inviable. **No da manejo clínico** (es un protocolo). Ubicación: "list of 100 conditions from the Integrated Medical Model Medical Conditions list" | `tran_2021_lds_protocol` | FOUND (contexto) |
| Manejo de SCA en vuelo (resultados de la revisión) | Artículo AMHP 2025 identificado pero bloqueado. | `amhp_2025_emergencies` | UNCONFIRMED-blocked |
| Telemedicina con cirujano de vuelo / kit médico ISS | Solo fuentes secundarias (prensa) en la búsqueda; ningún documento primario NASA/ESA leído que describa el procedimiento ante dolor torácico. Ya existe `nasa_hrp_ongoing_research` (Tempus Pro, dispositivo de telemedicina) como contexto general. | — | **PLACEHOLDER** |
| Contenido del kit médico (aspirina, nitroglicerina, ECG) | No verificado en fuente primaria. | — | **PLACEHOLDER** |

### B4. Propuesta de protocolo separado (solo descripción, no implementado)

- **id:** `crew_chest_pain_conscious`
- **title:** "Crewmate with chest pain (conscious)"
- **trigger (proposed UI text, [EARTH] signs from `nhlbi_heart_attack_symptoms`):**
  - "Chest pain, pressure, heaviness or discomfort"
  - "Pain spreading to arm(s), back, shoulders, neck or jaw"
  - "Shortness of breath at rest or with light activity"
  - "Heavy sweating, nausea or vomiting, light-headedness, with any of the above"
- **escalation:** `"ground"` (igual que el protocolo actual).
- **steps (orden):**
  1. "Treat this as a possible heart attack, even if you are not sure." — `nhlbi_heart_attack_symptoms` [EARTH] — FOUND
  2. "Alert the crew and contact the flight surgeon / Mission Control right away. Every minute matters." — urgencia: `nhlbi_heart_attack_symptoms` [EARTH]; equivalente espacial del "call 9-1-1": **PLACEHOLDER** (sin fuente primaria NASA/ESA para dolor torácico).
  3. "Do not give medication unless the flight surgeon or the onboard medical procedure says so." — PLACEHOLDER (no hay fuente que dé condiciones de aspirina para lego; NHLBI solo dice no retrasar la llamada por ella).
  4. "Keep the crewmate still and stay with them." — PLACEHOLDER (no encontrado explícito).
  5. "If the crewmate stops responding and is not breathing normally, switch to 'Crewmate collapsed' and start CPR." — criterio `rcuk_bls_2025` [EARTH] — FOUND.
- **report_fields sugeridos:** hora de inicio de síntomas; síntomas presentes; si hubo contacto con tierra y cuándo; si pasó a paro (sí/no). (Campos de registro, no afirmaciones clínicas.)
- **status:** `PLACEHOLDER` hasta tener fuente espacial primaria (desbloquear AMHP 2025 o documento NASA/ESA).

Consecuencia para el protocolo actual: renombrar/acotar `crew_collapse_chest_pain` a colapso/paro (p. ej. título "Crewmate collapsed / unresponsive") y mover "chest pain" al protocolo nuevo, para que un tripulante consciente no entre en un flujo de RCP.

---

## C) Disparadores (`trigger`)

| Protocolo | Proposed trigger text | Fuente / ubicación | Estado |
|---|---|---|---|
| `crew_collapse_chest_pain` (colapso) | "Crewmate collapses or does not respond." | `rcuk_bls_2025` — "Suspect cardiac arrest in any person who is unresponsive." [EARTH] | FOUND |
| idem | "Crewmate is not breathing, or only gasping." | `rcuk_bls_2025` — "agonal gasping or panting, must be recognised as signs of cardiac arrest." [EARTH] | FOUND |
| idem (microgravedad) | La guía no lista disparadores. | `dglrm_cpr_microgravity` | ausencia confirmada |
| `crew_chest_pain_conscious` (nuevo) | Ver B4 (dolor/opresión torácica, irradiación, disnea, sudoración/náusea/mareo). | `nhlbi_heart_attack_symptoms` [EARTH] | FOUND |
| Disparadores específicos de vuelo espacial | — | — | PLACEHOLDER |

---

## Advertencias de licencia

- **MedlinePlus Medical Encyclopedia (000013, 000195) NO es dominio público**: es contenido A.D.A.M./Ebix con copyright; el pie prohíbe copiar, distribuir o usarlo para entrenar IA sin consentimiento escrito. Solo parafrasear con enlace. Ojo: las entradas existentes `medlineplus_pulse` (003399, también enciclopedia) están marcadas en `sources.json` como "Public domain" — probablemente incorrecto; revisar.
- **RCUK**: copyright; reproducir requiere permiso → solo paráfrasis + enlace.
- **NHLBI**: dominio público (U.S. Government).
- **PMC7607644 y PMC8088865**: CC BY 4.0 (atribución obligatoria).

---

## Tabla resumen

| Dato | Estado | id de fuente sugerido |
|---|---|---|
| Guía microgravedad: no detalla reconocimiento (respuesta/respiración) | FOUND (ausencia confirmada) | `dglrm_cpr_microgravity` |
| Guía microgravedad: cadena de supervivencia incluye reconocimiento precoz y llamada de ayuda (Rec. 1) | FOUND | `dglrm_cpr_microgravity` |
| Guía microgravedad: informar a Mission Control | FOUND | `dglrm_cpr_microgravity` |
| Guía microgravedad: telemedicina LEO (Rec. 20) / Marte (Rec. 21) | FOUND | `dglrm_cpr_microgravity` |
| Guía microgravedad: decisión de terminar por el más cualificado (Rec. 22) | FOUND | `dglrm_cpr_microgravity` |
| Guía microgravedad: DEA con equipo de emergencia, entrenamiento de todos (Rec. 11, 13) | FOUND | `dglrm_cpr_microgravity` |
| Guía microgravedad: sin objetivo de frecuencia/profundidad | FOUND (ausencia confirmada) | `dglrm_cpr_microgravity` |
| Paso 1 text: tocar y llamar para comprobar respuesta | FOUND [EARTH] | `medlineplus_cpr_adult` |
| Paso 1 detail: no responde + respiración anormal/agónica = paro → RCP | FOUND [EARTH] | `rcuk_bls_2025` |
| Límite ≤10 s para valorar respiración | UNCONFIRMED-blocked | `aha_bls_2025` |
| Paso 2: pedir ayuda sin demora / enviar a alguien a llamar | FOUND [EARTH] | `rcuk_bls_2025`, `medlineplus_cpr_adult` |
| Paso 2: informar a Mission Control + telemedicina | FOUND | `dglrm_cpr_microgravity` |
| Traer DEA / usarlo en cuanto esté | FOUND (parte [EARTH]) | `dglrm_cpr_microgravity`, `rcuk_bls_2025` |
| Roles de equipo más allá de Rec. 22 / nº rescatadores | PLACEHOLDER | — |
| Frecuencia Tierra 100–120/min | FOUND [EARTH] | `rcuk_bls_2025` (+ `medlineplus_cpr_adult`) |
| Profundidad Tierra 5–6 cm | FOUND [EARTH] | `rcuk_bls_2025` |
| Minimizar interrupciones | FOUND [EARTH] | `rcuk_bls_2025` |
| AHA 2025 BLS (cualquier dato) | UNCONFIRMED-blocked | `aha_bls_2025` |
| ERC 2025 BLS texto original | UNCONFIRMED (solo enlaces; texto en revista no leído) | `erc_bls_2025` |
| Señales de infarto (7 ítems) | FOUND [EARTH] | `nhlbi_heart_attack_symptoms` |
| Síntomas leves/ausentes; reposo no alivia | FOUND [EARTH] | `nhlbi_heart_attack_symptoms`, `medlineplus_heart_attack` |
| Señales AHA | UNCONFIRMED-blocked | `aha_heart_attack_signs` |
| Pedir ayuda de emergencia ya, aunque haya duda | FOUND [EARTH] | `nhlbi_heart_attack_symptoms` |
| Aspirina: condiciones para lego | PLACEHOLDER (solo "no retrasar la llamada por ella") | `nhlbi_heart_attack_symptoms` |
| Mantener en reposo / vigilar | PLACEHOLDER | — |
| Transición consciente → paro | FOUND [EARTH] | `rcuk_bls_2025` |
| SCA como condición prioritaria (lista IMM de NASA) | FOUND (contexto) | `tran_2021_lds_protocol` |
| Manejo de SCA en vuelo | UNCONFIRMED-blocked | `amhp_2025_emergencies` |
| Procedimiento NASA/ESA de dolor torácico, kit médico ISS, consulta con cirujano de vuelo | PLACEHOLDER | — |
| Trigger colapso / no responde / no respira o jadea | FOUND [EARTH] | `rcuk_bls_2025` |
| Trigger dolor torácico consciente | FOUND [EARTH] | `nhlbi_heart_attack_symptoms` |
| Triggers específicos de vuelo espacial | PLACEHOLDER | — |
