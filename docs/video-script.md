# Video script — Earth Is Far (60–90 s)

Target length: about 88 seconds. The middle of the video follows the **Guided demo** (`data/guided-demo.json`, 14 steps, 90 s on its own): environment → status board → heart-rate alert → the crewmate is **conscious with chest pain** and answers the **One-shot consult** (chest pain, demo answers of a fictional crewmate, counter) → the crewmate **collapses** → Emergency → collapse protocol steps → Downlink report. Nobody asks an unconscious person about their pain: the consult happens while the crewmate can still talk. The demo is trimmed in editing (or advanced with Next) to fit the voice-over. Every figure said aloud comes from `data/sources.json` or is computed by the app:

- Mars one-way delay **3 to 22 minutes**: NASA Science, *Speaking Percy's Language* (`nasa_perseverance_comms`).
- Moon and Mars missions bring **less ability to rely on Earth for emergency medical assistance**: Canadian Space Agency (`csa_why_science_in_space`). Paraphrased, not quoted.
- On a Mars mission, **consulting doctors on Earth in real time may be impractical**: Yule et al. 2023 (`yule_2023_crew_autonomy`). Paraphrased.
- OPQRST and SAMPLE are memory aids used in emergency care: Saranteas et al. 2019, Jayaprakash et al. 2016.
- The answer window (6 to 44 minutes) is the app's own calculation: 2 × the one-way delay.
- The counter "**Avoids between 1 and 2 round trips — about 6 min to 88 min**" is the app's own **estimate range**. Only *complete* question sets count (every question in the set answered); the demo completes 2 (OPQRST and the pain scale). Lower bound: 1 round trip (if the ground batched all its follow-up questions in one message) × the 6-minute shortest round trip. Upper bound: 2 round trips (one per complete set, if the ground asked one set per message) × the 44-minute longest round trip. Both are design assumptions. Always say "estimate" and "between"; never present it as a measured saving.

## Guided demo timing (as defined in `data/guided-demo.json`)

| Step | Duration | Step | Duration |
|---|---|---|---|
| 1 Environment | 6 s | 8 Demo answers from the conscious crewmate | 8 s |
| 2 Status board | 5 s | 9 Counter (estimate range) | 9 s |
| 3 Alert zone | 6 s | 10 Crewmate collapses: Emergency button | 5 s |
| 4 Alert vital | 5 s | 11 Collapse protocol opens | 6 s |
| 5 Ground answer | 5 s | 12 Protocol step marked done | 5 s |
| 6 One-shot consult opens | 6 s | 13 Protocol log | 5 s |
| 7 Chest pain selected, conscious protocol linked | 6 s | 14 Downlink report | 13 s |

## Script

| Time | On screen | Voice-over |
|---|---|---|
| 0:00–0:07 | Black screen, then the status board fades in on the starfield. Title text: "Halfway to Mars." | "Halfway to Mars, a crewmate feels a sharp pain in the chest. Minutes later, they collapse. You are not a doctor." |
| 0:07–0:15 | Text over the board: "Mars → Earth: 3–22 min one way (NASA)". Then: "Less ability to rely on Earth for emergency medical help (Canadian Space Agency)". | "A message takes 3 to 22 minutes to reach Mars, one way. Crews going to Mars can rely less on Earth for emergency medical help." |
| 0:15–0:19 | Cursor clicks **Guided demo**. Step 1: Mars transit vehicle selected, header shows the delay. | "Earth Is Far is a health copilot built around that delay." |
| 0:19–0:28 | Steps 2–5: overall status, the chest zone lights up on the body map, the heart-rate row with its trend, then the **Delay & ground answer** panel. DEMO DATA banner visible. | "With demo data, heart rate needs attention, and the chest lights up. Every value links to its source." |
| 0:28–0:38 | Steps 6–7: **One-shot consult** opens in the Downlink report; "Chest pain or pressure" is selected; the link to the protocol for a conscious crewmate with chest pain shows first. | "The crewmate is still conscious. A medical consult is a conversation, and on Mars every follow-up question costs a round trip. So, while they can talk, the app asks the doctor's usual questions up front: OPQRST for the pain, SAMPLE for the history." |
| 0:38–0:45 | Step 8: the crewmate's answers fill in (onset: Suddenly; "pressure"; centre of the chest; pain 6 of 10; allergies: No). Caption says DEMO answers of a fictional crewmate. | "The crewmate answers in their own words, and the app adds the time, the latest readings and the mission context. It records answers; it does not diagnose." |
| 0:45–0:55 | Step 9: the counter is highlighted: **"Avoids between 1 and 2 round trips — about 6 min to 88 min"**, badge "Estimate range", the assumptions line below. Hold on it. | "The counter is an estimate range. Only complete question sets count. If Earth batches its follow-up questions, this saves one round trip; if it asks one set at a time, up to two. Here that is about 6 to 88 minutes, from the communication delay alone." |
| 0:55–1:05 | Steps 10–13: the crewmate collapses; the red **Emergency** button; protocol *Crewmate collapsed / not responding*; a step is marked done; the timestamped log grows. | "Then the crewmate stops responding. One tap on Emergency: large step-by-step cards, including CPR from a microgravity guideline, each logged with its time." |
| 1:05–1:15 | Step 14: the **Downlink report**: the consult answered before the collapse, the protocol log and the expected answer window highlighted. Click Copy. | "The downlink report sends it all at once: what the crewmate said while conscious, and what the crew did. For Mars, the answer comes 6 to 44 minutes later. So the app says: act now, then report." |
| 1:15–1:20 | Quick cut: **Sources** view, "57 of 79 data points sourced". | "Every data point shows whether it has a verified source. What doesn't, says so." |
| 1:20–1:24 | On-screen text: "Educational prototype — not medical advice. Earth reference ranges, synthetic demo data." | "It's a prototype, and a flight surgeon still has to validate it." |
| 1:24–1:28 | Logo "Earth Is Far", tagline, repository / app link. | "Earth is far. Help shouldn't wait for a second message." |

## Recording tips

- **Window size 1440 × 900** (browser zoom 100 %). That is the size the HUD layout was tuned for.
- **Use the demo data.** On a fresh browser profile the demo readings load on the first visit (DEMO DATA banner). If you removed them, the Guided demo loads them again and removes them at the end. Never record real personal readings or a real consult.
- **Start from the Guided demo button** on the status board. It runs about 90 s on its own; use Pause / Next to match the voice-over, or trim in editing. Esc exits. The demo opens a fresh consult and puts back any consult draft you had when it ends.
- **Hold on the counter** (step 9) long enough to read it; pause the demo there if needed. The numbers depend on the selected environment (Mars transit vehicle).
- **Turn reduced motion off while recording** (Windows: Settings → Accessibility → Visual effects → Animation effects on). With reduced motion on, the demo does not advance by itself and the HUD animations stop.
- **Captions:** burn in captions for the whole voice-over (many judges watch muted). Don't let them cover the demo's own captions or the highlighted element.
- Keep the "Educational prototype — not medical advice" notice visible; don't crop it out.
- Record the voice-over separately and trim the screen recording to fit, rather than rushing the narration.
- Hide the browser bookmarks bar, notifications and any personal tabs before recording.
