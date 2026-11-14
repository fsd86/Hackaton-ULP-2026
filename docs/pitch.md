# Earth Is Far — Health guidance for when help is light-minutes away

## The problem
Halfway to Mars, a crewmate collapses. You are not a doctor, and the flight surgeon is far away: a command takes **3 to 22 minutes** to reach Mars one way, depending on planetary orbits (NASA Science, *Speaking Percy's Language* [1]). Double that before an answer comes back. From the Moon the signal takes **1.27 s** on average (ESA [2]), so lunar crews can still talk to the ground. Mars crews can't. The Canadian Space Agency writes that Moon and Mars missions bring longer communication delays and **less ability to rely on Earth for emergency medical assistance** [3]. NASA's Human Research Program lists **five hazards** of human spaceflight: radiation, isolation and confinement, distance from Earth, gravity fields, and hostile or closed environments [4]. On distance, it says that the farther the crew travels, the harder it is to get medical care from Earth [4]; Mars missions face a delay of up to 20 minutes one way [5].

## Why nobody solves it today
Our market review (docs/02-mercado.md) found:
- **Agency tools measure, but Earth interprets.** CSA's Bio-Monitor sends its data down to Earth for analysis. Tools like ISS FIT and the Reaction Self Test each cover a single domain.
- **No tool is designed around the delay.** NASA's on-board Clinical Decision Support System and Earth-Independent Medical Operations are still concepts.
- **No step-by-step emergency guidance for non-doctors.** AMOS covers ultrasound only, and Earth first-aid apps ignore microgravity.
- **Past Space Apps entries** were mostly vital-sign dashboards with unsourced thresholds.

## What the app does
- **Status board:** a HUD body map with health status by zone, vital-sign cards and trend charts, and the NASA hazards each indicator watches. Status always shows as color plus icon plus text.
- **Daily check:** a guided wizard for 6 indicators (heart rate, blood pressure, blood glucose, body temperature, sleep, mood). For each one it covers how to measure, why it matters, input, status, what to do and who to escalate to (self, crew, or flight surgeon on the ground).
- **Emergency mode:** an always-visible red button opens large step-by-step cards. Each step is logged with a timestamp and a running timer. The protocols are *Crewmate collapsed / not responding*, which includes microgravity CPR from the DGLRM/ESAM-SMG guideline [6], and *Crewmate with chest pain (conscious)*, which links to the collapse protocol.
- **Downlink report:** one complete message for the flight surgeons, so no back-and-forth is needed. It includes readings with trends, the emergency action log, the information to include, and the expected answer window. You can copy it or download it as .txt or .json.
- **Environments:** Mars transit vehicle, lunar base, space station and remote Earth clinic. The selected environment's delay changes the guidance.

## What makes it different
- **The communication delay is a design variable.** When ground help is needed and the delay is above a configurable threshold, the app says *"Act now with the crew protocol, then report to ground"*. It also shows when Earth's answer could arrive at the earliest and latest.
- **Every claim can be traced.** 45 verified sources, each with a URL, access date and license. A Sources view shows verification counts and where each source is cited.
- **All content is data.** Indicators, ranges, protocols, environments and texts live in JSON files that are checked against a schema when the app loads. Changing the mission means editing JSON, not code.
- **No backend.** Readings stay in the browser.

## Honest limits
- This is an **educational prototype and not medical advice**. A flight surgeon must validate it. A notice on every screen says so.
- Health ranges are **Earth references** (CDC, MedlinePlus, NHS, AASM/SRS). None has been validated for spaceflight, and the app labels each one.
- **Still PLACEHOLDER:**
  - All 6 indicators, for these reasons: there is no sourced measuring frequency for heart rate, glucose, temperature or mood; heart rate and sleep have no critical threshold; blood pressure has no low-pressure threshold or attention action; mood has no labels, ranges or actions.
  - The chest-pain protocol's alert, medication and positioning steps.
  - The communication delays for the space station and the remote clinic.
  - NASA OSDR, which is not used.
- **Demo data is synthetic** and labeled DEMO DATA, and you can remove it.
- The app does not work offline yet.

## Sources
1. NASA Science, *Speaking Percy's Language: How to Talk So Perseverance Will Listen*: https://science.nasa.gov/blog/speaking-percys-language-how-to-talk-so-perseverance-will-listen/
2. ESA, *Ten things you didn't know about the Moon: Moon calling Earth*: https://www.esa.int/ESA_Multimedia/Images/2021/09/Ten_things_you_didn_t_know_about_the_Moon_-_Moon_calling_Earth
3. Canadian Space Agency, *Why do we conduct science experiments in space?*: https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp
4. NASA Human Research Program, *5 Hazards of Human Spaceflight*: https://www.nasa.gov/hrp/hazards/
5. NASA Human Research Program, *Hazard: Distance From Earth*: https://www.nasa.gov/hrp/hazard-distance-from-earth/
6. Hinkelbein et al. (2020), DGLRM/ESAM-SMG *Guideline for CPR in microgravity*, Scand J Trauma Resusc Emerg Med: https://pmc.ncbi.nlm.nih.gov/articles/PMC7607644/

Market gaps: see docs/02-mercado.md (CSA Bio-Monitor, NASA NTRS on CDSS/EIMO and AMOS, past Space Apps entries).
