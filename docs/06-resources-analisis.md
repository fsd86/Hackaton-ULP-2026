# 06 — Análisis de los resources oficiales

Fecha: 2026-11-13. Fuente: los 5 PDF de `doc resources/` (al lado del repo), que son impresiones del 13/11/2026 de páginas web oficiales, más `docs/00-desafio.md`.

**Conclusión corta:** los recursos son de contexto (hazards, riesgos, investigación en curso). **Ninguno trae umbrales médicos, rangos, frecuencias de medición ni pasos de tratamiento**, así que no pueden reemplazar los PLACEHOLDER de rangos, acciones ni frecuencias. Sí respaldan de forma explícita: qué hazards afectan a ciertos indicadores, el "por qué importa" del ánimo, la descripción de la estación espacial y, sobre todo, el concepto central de la app (distancia y demora con la Tierra → menos ayuda médica desde Tierra).

**Criterio usado:** un dato solo se cambió si el texto del recurso lo dice sin interpretación. Lo que requiere un paso de inferencia quedó como sugerencia (sección 4).

---

## 1. Recursos, uno por uno

### 1.1 5 Hazards of Human Spaceflight — NASA HRP
- **Qué es:** página de NASA HRP con los cinco hazards: radiación espacial, aislamiento y confinamiento, distancia de la Tierra, campos de gravedad ("gravity (and the lack of it)") y ambientes hostiles o cerrados. Aclara que los hazards "pueden alimentarse unos a otros".
- **URL oficial:** https://www.nasa.gov/hrp/hazards/ (última actualización de la página: 12/06/2026).
- **Licencia:** no figura en el PDF. Es una obra del Gobierno de EE. UU., en dominio público (mismo criterio que las otras fuentes de NASA y CDC en `sources.json`). Las imágenes o videos de terceros que pudiera incluir la página no se usan.
- **Qué respalda:** la taxonomía de 5 hazards que ya usa el esquema (`Hazard` = radiation, isolation, distance, gravity, environment). La descripción de "Distance from Earth" dice que instrucciones, suministros y **atención médica** se vuelven más difíciles de recibir desde la Tierra. Es el núcleo del concepto "Earth Is Far".
- **Uso en la app:** ya era la fuente `nasa_hrp_hazards`. Corregí la URL (barra final), la fecha de acceso y las notas con los 5 hazards textuales.

### 1.2 Risks of Human Spaceflight — NASA HRP
- **Qué es:** catálogo de los riesgos de salud que NASA HRP asocia a los 5 hazards, en tres grupos: fisiología humana, desempeño conductual y radiación espacial. Riesgos listados: sistema inmune alterado; función sensoriomotora y vestibular; adaptaciones cardiovasculares; enfermedad por descompresión; interacción huésped-microorganismo; hipoxia; alimentación y nutrición inadecuadas; lesiones en caminatas espaciales; menor capacidad cardiorrespiratoria y musculoesquelética; SANS (cambios en ojos y cerebro); cambios óseos; cambios conductuales y trastornos psiquiátricos; trabajo en equipo inadecuado; **sueño inadecuado y horarios irregulares**; soporte de sistemas inadecuado; lesiones por cargas dinámicas; cáncer por radiación.
- **URL oficial:** https://www.nasa.gov/hrp/risks/ (última actualización: 21/07/2026).
- **Licencia:** igual que 1.1, no figura en el PDF; obra del Gobierno de EE. UU.
- **Qué respalda, explícitamente:**
  - **Frecuencia cardíaca y presión arterial → hazard `gravity`.** Texto: "Weightlessness alters blood circulation and how the heart and blood vessels function, potentially increasing the risk of cardiovascular events". La ingravidez es el hazard de gravedad ("gravity (and the lack of it)", según 1.1).
  - **Ánimo → hazards `isolation`, `radiation` y `distance`.** Texto: "Isolation, radiation, distance from Earth, and other intense space stressors may all take a toll on the mental health of the crew".
  - **Sueño:** existe un riesgo propio ("chronic sleep loss", "irregularities in their internal biological clocks"), pero el texto **no lo ata a un hazard concreto** ("multiple hazards simultaneously"). Por eso no se asignó hazard al sueño.
- **Uso en la app:** fuente nueva `nasa_hrp_risks`, citada por frecuencia cardíaca, presión arterial y ánimo. Llena en parte el campo `hazards` (pendiente T12 del QA) y el "por qué importa" del ánimo.

### 1.3 Ongoing HRP Research — NASA HRP
- **Qué es:** lista de estudios en curso y pasados. En Artemis II: ARCHeR (bienestar, actividad y patrones de sueño en espacio profundo), biomarcadores inmunes y Standard Measures. En órbita terrestre baja: B-Complex, presión del líquido cefalorraquídeo, CIPHER, pilotaje manual para alunizajes, Standard Measures ("a consistent set of physiological and psychological measurements"), Thigh Cuff, hemostasia venosa, Zero T2 (ejercicio sin cinta) y **Tempus Pro** (dispositivo comercial de telemedicina "to collect and integrate health data, potentially enabling remote, near real-time diagnoses"). Estudios pasados: inmunidad, alimentos, Omics Archive, jardinería espacial y salud de la columna.
- **URL oficial:** https://www.nasa.gov/hrp/ongoing-hrp-research/ (última actualización: 18/08/2026).
- **Licencia:** igual que 1.1, no figura en el PDF; obra del Gobierno de EE. UU.
- **Qué respalda:** que NASA monitorea **sueño, bienestar y actividad** en vuelo (ARCHeR) y que existe una batería estándar de medidas fisiológicas y psicológicas. Valida el enfoque del Daily check y la idea de registrar ánimo y sueño, pero **no da valores ni frecuencias**.
- **Uso en la app:** fuente nueva `nasa_hrp_ongoing_research`, todavía no citada por ningún dato (ver sugerencias 4.2 y 4.8). Aparece en la vista Sources.

### 1.4 Monitoring radiation for astronaut health — Agencia Espacial Canadiense (CSA)
- **Qué es:** nota de prensa del 26/02/2026 sobre el contrato para el instrumento CANS (Canadian Active Neutron Spectrometer), que mide de forma continua y autónoma la exposición a radiación de neutrones.
- **URL oficial:** https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp
- **Licencia:** **no figura en el PDF.** Es un sitio del Gobierno de Canadá (Crown copyright); la reutilización se rige por los términos del sitio. **Pendiente verificar** antes de reproducir texto. La app solo cita y enlaza, no copia.
- **Qué respalda:** que la radiación es un desafío clave más allá de la atmósfera, y la cifra de que los neutrones aportan **cerca del 30 % de la radiación total en la ISS**. No hay ningún indicador de radiación en la app, así que no respalda ningún dato actual.
- **Uso en la app:** fuente nueva `csa_radiation_monitoring`, sin citar todavía (ver sugerencia 4.3).

### 1.5 Why do we conduct science experiments in space? — CSA
- **Qué es:** página institucional sobre la ciencia canadiense en la ISS. Dice que las misiones a la Luna y Marte implican más ingravidez, más radiación, más aislamiento lejos de casa, **"increased delays in communication with Earth"** y **"less ability to rely on Earth for food, materials, and emergency medical assistance"**. También menciona beneficios en la Tierra (equilibrio, osteoporosis, enfermedad cardiovascular, diabetes tipo 2) y unos 200 experimentos en la ISS a la vez.
- **URL oficial:** https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp (modificada el 28/10/2025).
- **Licencia:** igual que 1.4, no figura en el PDF y queda pendiente de verificar.
- **Qué respalda:** **el concepto completo de la app** (más demora con la Tierra → menos ayuda médica de emergencia desde Tierra) y la descripción de la ISS como "the orbiting laboratory".
- **Uso en la app:** fuente nueva `csa_why_science_in_space`. Respalda la nueva descripción del entorno "Space station" (ver 2) y debería citarse en el README y el pitch (ver sugerencia 4.9).

### 1.6 00-desafio.md
Pide usar NASA HRP y recursos públicos de otras agencias para decidir qué indicadores son útiles, cómo los afectan los hazards y cuándo un resultado necesita atención. Los recursos responden a la parte de **hazards → sistemas del cuerpo**. Las preguntas sobre **"when might a result warrant attention"** y **"what actions"** siguen sin respuesta en estos recursos, así que los rangos y acciones siguen apoyados en CDC y MedlinePlus, o quedan en PLACEHOLDER.

---

## 2. Cambios aplicados a los datos

| Archivo | Cambio | Respaldo explícito |
|---|---|---|
| `data/sources.json` | `nasa_hrp_hazards`: URL `…/hrp/hazards/`, acceso 2026-11-13, notas con los 5 hazards | 1.1 |
| `data/sources.json` | Nuevas, todas VERIFIED: `nasa_hrp_risks`, `nasa_hrp_ongoing_research`, `csa_radiation_monitoring`, `csa_why_science_in_space` | 1.2–1.5 |
| `data/sources.json` | `_comment`: cada fuente lleva su propia fecha en `accessed` | — |
| `data/indicators.json` | `heart_rate.hazards` = `["gravity"]`; se suma la fuente `nasa_hrp_risks` | 1.2 (cardiovascular) |
| `data/indicators.json` | `blood_pressure.hazards` = `["gravity"]`; se suma la fuente `nasa_hrp_risks` | 1.2 (cardiovascular) |
| `data/indicators.json` | `mood.hazards` = `["isolation", "radiation", "distance"]`; `why_it_matters` deja de ser PLACEHOLDER; `source_ids` = `nasa_hrp_hazards`, `nasa_hrp_risks` | 1.2 (conductual) |
| `data/environments.json` | `space_station.description` deja de ser PLACEHOLDER: "A crewed orbiting station, like the International Space Station (an orbiting laboratory)…" | 1.5 |

**Siguen en PLACEHOLDER**, porque ningún recurso los respalda:
- Rangos, acciones y frecuencias de todos los indicadores.
- Etiquetas de la escala de ánimo.
- `how_to_measure` de presión, glucosa, temperatura, sueño y ánimo.
- Demora de la ISS y de la clínica remota.
- Descripción de la clínica remota.
- Pasos de reconocimiento y aviso del protocolo de RCP.
- `nasa_osdr`, que no está entre los recursos.

Los 6 indicadores siguen con `status: "PLACEHOLDER"`, porque cada uno conserva partes sin fuente.

---

## 3. Lo que NO se hizo, a propósito
- **No se asignaron hazards** a glucosa, temperatura ni sueño. El texto no los ata a un hazard (ver 4.1). Sigue pendiente parte de T12.
- **No se reescribió** el "por qué importa" de frecuencia cardíaca, presión, glucosa, temperatura y sueño: no son PLACEHOLDER. Ver sugerencia 4.1.
- **No se usó la cifra del 30 % de neutrones** en la descripción de la ISS: el panel de entorno no muestra fuentes para la descripción, y sería una afirmación científica sin cita visible.

---

## 4. Cambios sugeridos por los recursos (sin implementar)

### Contenido
1. **Reescribir el "por qué importa"** de frecuencia cardíaca y presión con el texto cardiovascular de NASA (ingravidez → circulación y función del corazón y los vasos), y el del sueño con "Risk of Inadequate Sleep and Irregular Schedules". La fuente ya existe (`nasa_hrp_risks`).
2. **Temperatura corporal:** relacionarla con el riesgo de sistema inmune alterado (virus latentes que se reactivan, cambios del microbioma → enfermarse). Hoy sería una inferencia (el recurso no habla de fiebre); hace falta una fuente que vincule fiebre e inmunidad en vuelo antes de asignar el hazard `environment`.
3. **Indicadores nuevos que sugieren los riesgos:**
   - Exposición a radiación (lectura de dosímetro). CSA: CANS; neutrones ≈30 % en la ISS.
   - Chequeo de visión simple (SANS).
   - Mareo o desorientación tras cambios de gravedad (sensoriomotor; relevante al llegar a la Luna o a Marte).
   - Registro de ejercicio (pérdida ósea y muscular; Zero T2).
   - Ingesta y alimentación (riesgo nutricional).
   - Erupciones en la piel (sistema inmune).

   Todos necesitan fuentes con umbrales antes de pasar de PLACEHOLDER.
4. **Protocolo de emergencia "después de una caminata espacial":** el recurso nombra la enfermedad por descompresión y la hipoxia como riesgos de las EVA. Sin pasos con fuente, sería solo PLACEHOLDER.
5. **Completar la escala de ánimo** con una batería validada: Standard Measures incluye medidas psicológicas, pero el PDF no las detalla. Hay que buscar la fuente primaria.

### Concepto y diseño
6. **Mapa del cuerpo por riesgos, no solo por indicadores:** cabeza (SANS, conducta, sueño), tórax (cardiovascular), esqueleto (huesos y músculo), piel (inmune). Cada zona podría listar los riesgos de NASA aunque todavía no haya medición.
7. **Vista "Hazards"** con los 5 hazards, sus riesgos y qué indicadores los vigilan. Hoy los hazards son solo chips en el Daily check. Reforzaría Relevance y Validity en la rúbrica.
8. **Alinear el Daily check con la idea de Standard Measures y ARCHeR:** un set fijo y consistente que incluya bienestar, actividad y sueño. El Downlink report funcionaría como "data bank" para el médico de vuelo.
9. **Usar la CSA como respaldo explícito del concepto** en el README y el pitch: "increased delays in communication with Earth" + "less ability to rely on Earth for … emergency medical assistance".
10. **Integración con dispositivos (Tempus Pro):** dejar previsto en la arquitectura un import de lecturas de un dispositivo de telemedicina, en vez de solo tipearlas.
11. **Entorno "Remote clinic (Earth)":** la CSA y el video del desafío hablan del beneficio en la Tierra. Puede justificarse en el pitch, pero su descripción y su demora siguen sin fuente.
12. **Transiciones de gravedad por entorno:** los overrides por entorno podrían sumar avisos de readaptación (Luna y Marte al llegar, la Tierra al volver), según el riesgo sensoriomotor.
