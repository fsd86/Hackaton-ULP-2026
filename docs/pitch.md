# Earth Is Far — Health guidance for when help is light-minutes away

## The problem
Halfway to Mars, a crewmate feels a sharp pain in the chest, and minutes later collapses. You are not a doctor, and the flight surgeon is far away: a command takes **3 to 22 minutes** to reach Mars one way, depending on planetary orbits (NASA Science [1]). Double that before an answer comes back. From the Moon the signal takes **1.27 s** on average (ESA [2]), so lunar crews can still talk to the ground. Mars crews can't. The Canadian Space Agency writes that Moon and Mars missions bring longer communication delays and **less ability to rely on Earth for emergency medical assistance** [3]. NASA's Human Research Program lists **five hazards** of human spaceflight, one of them distance from Earth: the farther the crew travels, the harder it is to get medical care from Earth [4][5].

A medical consult is a conversation. The doctor asks, the patient answers, the doctor asks again. On the ISS, medical data go to flight surgeons on the ground for interpretation (Levin et al. [7]). On a Mars mission, consulting doctors on Earth in real time may be impractical (Yule et al. [8]): every follow-up question costs a full round trip.

## The signature idea: a One-shot consult
**We rethought the medical consult for a delayed conversation.** Instead of a chat with Earth, the crew answers *in advance* the questions a doctor would usually ask back, and sends everything in one message.

- **Pick the main problem** (chest pain, abdominal pain, headache, injury, breathing, fever or feeling unwell, other). Chest pain first points to the step-by-step protocol: act now, consult after.
- **Answer by module,** using structures from emergency care: **OPQRST** for acute pain (Saranteas et al. [9]), **SAMPLE** for a short focused history (Jayaprakash et al. [10]), a 0–10 pain scale, injury questions and the minimum data for a remote physician. The idea of filling in a form *before* asking for radio medical advice comes from maritime practice (UK MCA, *Ship Captain's Medical Guide* [11]); the app labels it as an Earth reference.
- **The app fills in what it already knows:** UTC time, latest readings with their time, environment, current delay and on-board kit.
- **A live counter shows the payoff as a range:** "Avoids between 1 and *N* round trips — about *A* to *B* min". It is computed by the app, not taken from a paper. Only **complete** question sets count (every question in the set answered); *N* = complete sets. The upper bound assumes the ground would ask one set per message (*N* round trips at the longest one-way delay); the lower bound assumes it would batch all its follow-up questions in one message (1 round trip at the shortest delay). Both assumptions live in `config/app.json` and are shown under the counter. On the Mars transit vehicle (3–22 min one way), two complete sets read "Avoids between 1 and 2 round trips — about 6 min to 88 min", labeled **Estimate range**. With no complete set it claims nothing; without a verified delay it shows no minutes.
- **No diagnosis, no treatment advice.** It only collects information. 28 questions, each with its source; 14 sources behind the module, from an independent verification pass (60 items: 38 VERIFIED, 16 VERIFIED-WITH-EDIT, 1 REJECTED, 5 BLOCKED; only the first two were loaded).

Checklists and clinical guidance tools can help crews work with long communication delays (Yule et al. [8]). The One-shot consult is that idea, turned into a form that fits in one transmission.

## What else the app does
- **Status board:** a HUD body map with status by zone, vital-sign cards and 7-day trend charts. A dotted line extrapolates the trend for 24 h, labeled "Trend extrapolation (demo) — not a medical prediction": no states, no thresholds. Status is always color plus icon plus text.
- **Daily check:** a wizard for 6 indicators: how to measure, why it matters, status, what to do and who to escalate to (self, crew, or flight surgeon on the ground).
- **Emergency mode:** an always-visible red button opens large step-by-step cards, each logged with a timestamp. *Crewmate collapsed / not responding* includes microgravity CPR from the DGLRM/ESAM-SMG guideline [6].
- **Downlink report:** one complete message for the flight surgeons with readings, trends, the emergency log, the One-shot consult and the expected answer window (now + 2 × one-way delay).
- **Guided demo:** about 90 seconds, in the challenge's order: a heart-rate alert; the crewmate is conscious with chest pain and answers the One-shot consult (demo answers of a fictional crewmate); the counter; then the crewmate collapses and the crew follows the collapse protocol; the Downlink report carries both. It leaves nothing saved.

## What makes it different
- **The delay is a design variable,** not a footnote. Escalation says *"Act now with the crew protocol, then report to ground"* when the delay is above a configurable threshold, and the consult is built to avoid round trips.
- **Validity you can see.** The Sources view counts coverage **per data point**: 57 of 79 instructions, thresholds, actions, protocol steps and delays have a verified source today. The rest shows "No verified source yet" instead of a made-up number. 62 sources, 61 verified, each with URL, access date and licence.
- **All content is data.** Indicators, protocols, consult questions, environments and texts live in JSON checked against a schema on load.
- **No backend.** Everything stays in the browser.

## Honest limits
- **Educational prototype, not medical advice.** A flight surgeon must validate it. A notice on every screen says so.
- **The counter is an estimate range.** "One round trip if the ground batches its questions" and "one per complete set if it asks set by set" are our design assumptions, not measured figures, and the minutes come only from the environment's delay (no analysis or reply time).
- Health ranges are **Earth references** and none has been validated for spaceflight; the app labels each one. Several consult items are maritime or Earth emergency references and are labeled too.
- **Still without a verified source:** all 6 indicators have at least one part unsourced (frequency, a critical threshold, or actions); the chest-pain protocol's alert, medication and positioning steps; the delays of the space station and the remote clinic.
- **Demo data is synthetic** and labeled DEMO DATA. No offline mode yet. No photo attachment in the consult.

## Sources
1. NASA Science, *Speaking Percy's Language: How to Talk So Perseverance Will Listen*: https://science.nasa.gov/blog/speaking-percys-language-how-to-talk-so-perseverance-will-listen/
2. ESA, *Ten things you didn't know about the Moon: Moon calling Earth*: https://www.esa.int/ESA_Multimedia/Images/2021/09/Ten_things_you_didn_t_know_about_the_Moon_-_Moon_calling_Earth
3. Canadian Space Agency, *Why do we conduct science experiments in space?*: https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp
4. NASA Human Research Program, *5 Hazards of Human Spaceflight*: https://www.nasa.gov/hrp/hazards/
5. NASA Human Research Program, *Hazard: Distance From Earth*: https://www.nasa.gov/hrp/hazard-distance-from-earth/
6. Hinkelbein et al. (2020), DGLRM/ESAM-SMG *Guideline for CPR in microgravity*, Scand J Trauma Resusc Emerg Med: https://pmc.ncbi.nlm.nih.gov/articles/PMC7607644/
7. Levin et al. (2023), *Enabling Human Space Exploration Missions Through Progressively Earth Independent Medical Operations*, IEEE OJEMB: https://pmc.ncbi.nlm.nih.gov/articles/PMC10810302/
8. Yule et al. (2023), *Crew Autonomy During Simulated Medical Event Management on Long Duration Space Exploration Missions*, Human Factors: https://pmc.ncbi.nlm.nih.gov/articles/PMC10466940/
9. Saranteas et al. (2019), *Pain is vital in resuscitation in trauma*, SICOT-J: https://pmc.ncbi.nlm.nih.gov/articles/PMC6694744/
10. Jayaprakash et al. (2016), *The incorporation of focused history in checklist for early recognition and treatment of acute illness and injury*, BMC Emerg Med: https://pmc.ncbi.nlm.nih.gov/articles/PMC5006415/
11. Maritime and Coastguard Agency (UK), *The Ship Captain's Medical Guide*, 22nd ed., Chapter 13: External assistance (withdrawn edition): https://assets.publishing.service.gov.uk/media/5da84a23ed915d429d114666/mcga-shs_capt_guide_chap13.pdf

Market gaps: see docs/02-mercado.md (CSA Bio-Monitor, NASA NTRS on CDSS/EIMO and AMOS, past Space Apps entries).
