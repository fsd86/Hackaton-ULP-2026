# 02 — Mercado: soluciones parecidas y huecos

Búsqueda web hecha el 2026-11-12. Las fuentes son mayormente páginas de agencias, NTRS (servidor de reportes técnicos de NASA) y prensa; no verifiqué el estado actual de cada proyecto más allá de esas páginas. Ninguna cifra de este documento se usa en la app sin pasar antes por `data/sources.json`.

## 1. Contexto que define el problema
- **Cinco peligros (RIDGE)** del NASA Human Research Program: Radiation, Isolation & confinement, Distance from Earth, Gravity fields, hostile/closed Environments. NASA remarca que interactúan entre sí. — [NASA HRP Hazards](https://www.nasa.gov/hrp/hazards), [NASA STEM: Five hazards](https://www.nasa.gov/stem-content/five-hazards-of-human-spaceflight/)
- **Demora de comunicaciones a Marte:** ~4 a 24 min solo ida según una revisión de NASA (otras fuentes dan 3–22 o "hasta ~20 min"). Eso descarta la telemedicina en tiempo real. — [NASA NTRS, literatura sobre demora](https://ntrs.nasa.gov/api/citations/20240006867/downloads/Proof_Slides_Parisi_Megan_969.pdf), [NASA: Mission ops con demora](https://www.nasa.gov/wp-content/uploads/2015/05/missionops_human_in_the_loop_over_time_delay_ops_lessons.pdf), [Live Science: simulación MarsCrew134](https://www.livescience.com/43634-mock-mars-mission-video-remote-surgery-marscrew134.html)
- **El "médico" a bordo no es médico:** el Crew Medical Officer recibe ~40–80 h de entrenamiento preflight según la fuente (otra dice ~60 h, nivel paramédico); el ultrasonido recibe apenas 2–3 h. — [NASA NTRS (AMOS)](https://ntrs.nasa.gov/api/citations/20240012964/downloads/Amos%20Paper%20with%20Figures%20and%20Legends.pdf), [Healthcare IT News](https://www.healthcareitnews.com/news/international-space-station-teaches-healthcare-about-telemedicine)

## 2. Soluciones existentes

### 2.1 Sistemas de agencias espaciales (operativos o en desarrollo)
| Solución | Qué hace | Estado | Fuente |
|---|---|---|---|
| **Bio-Monitor / Astroskin** (CSA, Carré Technologies) | Prenda wearable: ECG, FC, respiración, presión, temperatura de piel, SpO₂, sueño, actividad. Los datos se **bajan a Tierra** para análisis. | En la ISS desde 2019. | [CSA Bio-Monitor](https://www.asc-csa.gc.ca/eng/sciences/astroskin.asp), [Smithsonian Air & Space](https://www.smithsonianmag.com/air-space-magazine/canadian-astronaut-will-test-new-bio-monitor-shirt-space-180961270/) |
| **Reaction Self Test** (NASA, versión del PVT-B) | Test de vigilancia psicomotora de ≤5 min que avisa al astronauta cuando su rendimiento cae por fatiga. Sin entrenamiento ni hardware extra. | En la ISS desde 2009. | [NASA Spinoff 2013](https://spinoff.nasa.gov/Spinoff2013/hm_1.html), [UPenn](https://www.med.upenn.edu/uep/astronaut.html), [NTRS](https://ntrs.nasa.gov/citations/20090029851) |
| **ISS Food Intake Tracker (ISS FIT)** | App de iPad para registrar comidas; calorías, sodio, hidratación. **Funciona sin internet.** Hecha por crowdsourcing (TopCoder). | En la ISS desde 2016. | [Challenge.gov case study](https://www.challenge.gov/toolkit/case-studies/iss-food-intake-tracker), [ESA Diet tracker](https://www.esa.int/Newsroom/Diet_tracker_in_space) |
| **AMOS — Autonomous Medical Officer Support** | Guía *just-in-time* para ultrasonido (vejiga, riñón) en lugar de entrenamiento previo + guía en vivo desde tierra. | Demostraciones / desarrollo. | [NTRS AMOS](https://ntrs.nasa.gov/api/citations/20220014327/downloads/Ebert_AMOS%20IWS%202023%20abstract_20220916.pdf) |
| **Clinical Decision Support System (CDSS) / Medical Data Architecture** (NASA ExMC) | Sistema a bordo para prevención, detección, diagnóstico y tratamiento en misiones clase Marte. | Concepto y requisitos; no encontré despliegue. | [NTRS 20220017856](https://ntrs.nasa.gov/citations/20220017856), [NTRS CDS Path to Requirements](https://ntrs.nasa.gov/api/citations/20210025824/downloads/IWS2022_CDS_PathtoRequirements_03Dec2021_FINAL.pdf) |
| **EIMO — Earth-Independent Medical Operations** (ConOps 2024) | Transferencia gradual de decisiones médicas de tierra a la nave. 5 componentes, incluye "Acute and Emergent Decision Making". | Concepto. | [NTRS 20240001402](https://ntrs.nasa.gov/citations/20240001402) |
| **HERMES** (Baylor / TRISH) | Plataforma de recolección y monitoreo semi-autónomo de datos biomédicos en órbita. | Investigación. | [BCM HERMES](https://bcm.edu/academic-centers/space-medicine/translational-research-institute/research/hermes) |
| **PHM for astronauts** | Pronóstico de salud basado en historia clínica electrónica de la tripulación. | Propuesta académica. | [PHM Society](https://papers.phmsociety.org/index.php/phmconf/article/download/2333/1310) |

### 2.2 Proyectos de hackatones previos (Space Apps)
| Proyecto | Idea | Fuente |
|---|---|---|
| Microdoze (2018) | Alerta cuando los vitales se apartan de una línea base sacada de literatura médica. | [Space Apps 2018](https://2018.spaceappschallenge.org/challenges/can-you-build/bring-your-own-solution/teams/microdoze) |
| Team Jaime (2018) | Monitoreo autónomo con datos del Bio-Monitor de la CSA. | [Space Apps 2018](https://2018.spaceappschallenge.org/challenges/can-you-build/bring-your-own-solution/teams/team-jaime) |
| Spacemed (2018) | Monitoreo de señales vitales + biomecánica. | [Space Apps 2018](https://2018.spaceappschallenge.org/challenges/can-you-build/make-sense-out-mars/teams/spacemed-1) |
| AstroMind Tracker (2017) | Seguimiento de salud mental. | [Space Apps 2017](https://2017.spaceappschallenge.org/challenges/ideate-and-create/small-spaces-big-ideas/teams/astromind-tracker) |
| Sleep Shift Scheduling Tool (2020) | Herramienta de turnos de sueño. | [Space Apps 2020](https://2020.spaceappschallenge.org/challenges/sustain/sleep-shift-scheduling-tool/teams/space-hackers) |

> Patrón dominante: **dashboard de vitales + alerta por umbral**. Es lo que la mayoría de los equipos va a volver a hacer en 2026.

### 2.3 Análogos en la Tierra (medicina remota / sin conexión)
| Solución | Qué hace | Fuente |
|---|---|---|
| GOES (Outdoor Health & Safety) | Guías offline de primeros auxilios hechas por médicos de emergencia; consulta en vivo requiere señal. | [App Store](https://apps.apple.com/us/app/-/id1576527901), [Outdoor Retailer](https://thedaily.outdoorretailer.com/news/show-news/innovation-award-winner-goes-puts-a-wilderness-doctor-in-the-palm-of-your-hand/) |
| VisualDx (Botswana) | Soporte de decisión clínica adaptado para usarse sin internet. | [VisualDx Global Health](https://visualdx.com/global-health/botswana) |
| Kawan Sehat | Registro y consulta para agentes de salud rurales sin conexión. | [Fair Future Foundation](https://fairfuturefoundation.org/kawan-sehat-app-revolutionizes-rural-health-care-access) |
| WHO ETAT / Frontline / SMART Guidelines | Triage y soporte de decisión para trabajadores de salud en emergencias y bajos recursos. | [WHO L4 Mobile Reference](https://www.who.int/tools/CCC/l4-mobile-reference-app), [WHO Bulletin](https://cdn.who.int/media/docs/default-source/bulletin/online-first/blt.23.290863.pdf) |
| App de primeros auxilios para trabajadores no entrenados (Sudáfrica) | CDSS en smartphone para personal sin formación. | [AJIC](https://ajic.wits.ac.za/article/view/13573) |

## 3. Huecos (dónde podemos aportar)

| # | Hueco | Evidencia | Oportunidad para el MVP |
|---|---|---|---|
| H1 | **Los sistemas operativos miden, pero mandan los datos a Tierra para interpretarlos.** El astronauta no recibe "qué significa y qué hago". | Bio-Monitor baja datos a Tierra; ISS FIT y RST cubren un solo dominio cada uno. | Cerrar el ciclo **medir → interpretar → actuar** a bordo, en una sola herramienta. |
| H2 | **Nadie diseña alrededor de la demora de comunicaciones.** El CDSS/EIMO de NASA sigue siendo concepto. | NTRS ExMC/EIMO; demora de 4–24 min a Marte. | Que la guía cambie según el entorno: en la ISS "llamá a tierra"; camino a Marte "actuá ahora, reportá después" — y mostrar **cuándo llegaría** la respuesta de tierra. |
| H3 | **Guía de emergencia para no médicos, paso a paso.** AMOS lo hace solo para ultrasonido; las apps terrestres no consideran microgravedad ni el equipo a bordo. | AMOS; GOES; WHO. | Protocolos de emergencia en tarjetas grandes, con temporizadores, que registran lo hecho. |
| H4 | **Traspaso a tierra.** Cuando la respuesta tarda 40 min ida y vuelta, el mensaje tiene que ser completo la primera vez. | NASA "fewer back-and-forth exchanges" (mission ops con demora). | Generar un **reporte de bajada** estructurado (valores, tendencia, acciones ya tomadas). |
| H5 | **Proyectos de hackatón = dashboards genéricos con umbrales sin fuente.** | Patrón de 2017–2020. | Diferenciarse por **validez** (cada umbral con fuente o marcado PLACEHOLDER) y por una idea central distinta. |
| H6 | **Transferencia a la Tierra** pedida en el video, poco atendida por herramientas espaciales. | Video 02:13; apps rurales existen pero aisladas. | Mismo motor, otro set de JSON: "entorno" = puesto rural / base antártica con su propia demora para llegar a un médico. |

## 4. Conclusión para el concepto
El espacio libre no es "otro dashboard": es un **copiloto de salud que asume que tierra está lejos**. Combina H1 + H2 + H3 + H4, y H6 sale casi gratis por la regla de datos en JSON.
