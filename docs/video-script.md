# Video script — Earth Is Far (60–90 s)

Target length: about 88 seconds. The middle of the video follows the **Guided demo** (`data/guided-demo.json`, 14 steps, 90 s on its own): environment → status board → alert → Emergency → protocol steps → **One-shot consult** (chest pain, two demo answers, counter) → Downlink report. The demo is trimmed in editing (or advanced with Next) to fit the voice-over. Every figure said aloud comes from `data/sources.json` or is computed by the app:

- Mars one-way delay **3 to 22 minutes**: NASA Science, *Speaking Percy's Language* (`nasa_perseverance_comms`).
- Moon and Mars missions bring **less ability to rely on Earth for emergency medical assistance**: Canadian Space Agency (`csa_why_science_in_space`). Paraphrased, not quoted.
- On a Mars mission, **consulting doctors on Earth in real time may be impractical**: Yule et al. 2023 (`yule_2023_crew_autonomy`). Paraphrased.
- OPQRST and SAMPLE are memory aids used in emergency care: Saranteas et al. 2019, Jayaprakash et al. 2016.
- The answer window (6 to 44 minutes) is the app's own calculation: 2 × the one-way delay.
- The counter "**Avoids up to 2 round trips — up to 88 min**" is the app's own **maximum estimate**: 2 answered question sets × 1 extra exchange per set (a design assumption) × the 44-minute maximum round trip. Always say "up to" and "estimate"; never present it as a measured saving.

## Guided demo timing (as defined in `data/guided-demo.json`)

| Step | Duration | Step | Duration |
|---|---|---|---|
| 1 Environment | 6 s | 8 Protocol step marked done | 5 s |
| 2 Status board | 5 s | 9 Protocol log | 5 s |
| 3 Alert zone | 6 s | 10 One-shot consult opens | 6 s |
| 4 Alert vital | 5 s | 11 Chest pain selected | 6 s |
| 5 Ground answer | 6 s | 12 Two demo answers | 7 s |
| 6 Emergency button | 4 s | 13 Counter | 10 s |
| 7 Protocol opens | 7 s | 14 Downlink report | 12 s |

## Script

| Time | On screen | Voice-over |
|---|---|---|
| 0:00–0:07 | Black screen, then the status board fades in on the starfield. Title text: "Halfway to Mars." | "Halfway to Mars, a crewmate feels chest pain and collapses. You are not a doctor." |
| 0:07–0:15 | Text over the board: "Mars → Earth: 3–22 min one way (NASA)". Then: "Less ability to rely on Earth for emergency medical help (Canadian Space Agency)". | "A message takes 3 to 22 minutes to reach Mars, one way. Crews going to Mars can rely less on Earth for emergency medical help." |
| 0:15–0:19 | Cursor clicks **Guided demo**. Step 1: Mars transit vehicle selected, header shows the delay. | "Earth Is Far is a health copilot built around that delay." |
| 0:19–0:28 | Steps 2–4: overall status, the chest zone lights up on the body map, the heart-rate row with its trend. DEMO DATA banner visible. | "With demo data, heart rate needs attention, and the chest lights up. Every value links to its source." |
| 0:28–0:32 | Steps 5–6: the **Delay & ground answer** panel, then the red **Emergency** button. | "Then the crewmate stops responding. One tap on Emergency." |
| 0:32–0:43 | Steps 7–9: protocol *Crewmate collapsed / not responding*; a step is marked done; the timestamped log grows. | "Large, step-by-step cards, including CPR from a microgravity guideline. Every step is logged with its time." |
| 0:43–0:52 | Steps 10–11: **One-shot consult** opens in the Downlink report; "Chest pain or pressure" is selected; the "Open the protocol first" note shows. | "Now the part we rethought. A medical consult is a conversation, and on Mars every follow-up question costs a round trip. So the app asks the doctor's usual questions up front: OPQRST for the pain, SAMPLE for the history." |
| 0:52–0:57 | Step 12: two answers are picked (onset: Suddenly; allergies: No). Caption says DEMO. | "The crew answers what they can, and the app adds the time, the latest readings and the mission context." |
| 0:57–1:08 | Step 13: the counter is highlighted: **"Avoids up to 2 round trips — up to 88 min"**, badge "Maximum estimate". Hold on it. | "This counter shows what one complete message can save: up to two round trips, up to 88 minutes here. It's a maximum estimate, based only on the communication delay. No diagnosis, no treatment advice: just one message that leaves nothing to ask." |
| 1:08–1:15 | Step 14: back to the top of the **Downlink report**, the expected answer window highlighted. Click Copy. | "The downlink report sends it all at once. For Mars, the answer comes 6 to 44 minutes later. So the app says: act now, then report." |
| 1:15–1:20 | Quick cut: **Sources** view, "57 of 79 data points sourced". | "Every data point shows whether it has a verified source. What doesn't, says so." |
| 1:20–1:24 | On-screen text: "Educational prototype — not medical advice. Earth reference ranges, synthetic demo data." | "It's a prototype, and a flight surgeon still has to validate it." |
| 1:24–1:28 | Logo "Earth Is Far", tagline, repository / app link. | "Earth is far. Help shouldn't wait for a second message." |

## Recording tips

- **Window size 1440 × 900** (browser zoom 100 %). That is the size the HUD layout was tuned for.
- **Use the demo data.** On a fresh browser profile the demo readings load on the first visit (DEMO DATA banner). If you removed them, the Guided demo loads them again and removes them at the end. Never record real personal readings or a real consult.
- **Start from the Guided demo button** on the status board. It runs about 90 s on its own; use Pause / Next to match the voice-over, or trim in editing. Esc exits. The demo opens a fresh consult and puts back any consult draft you had when it ends.
- **Hold on the counter** (step 13) long enough to read it; pause the demo there if needed. The numbers depend on the selected environment (Mars transit vehicle).
- **Turn reduced motion off while recording** (Windows: Settings → Accessibility → Visual effects → Animation effects on). With reduced motion on, the demo does not advance by itself and the HUD animations stop.
- **Captions:** burn in captions for the whole voice-over (many judges watch muted). Don't let them cover the demo's own captions or the highlighted element.
- Keep the "Educational prototype — not medical advice" notice visible; don't crop it out.
- Record the voice-over separately and trim the screen recording to fit, rather than rushing the narration.
- Hide the browser bookmarks bar, notifications and any personal tabs before recording.
