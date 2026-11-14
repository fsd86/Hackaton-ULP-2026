# Video script — Earth Is Far (60–90 s)

Target length: about 85 seconds. The middle of the video follows the **Guided demo** (`data/guided-demo.json`: environment → status board → alert → Emergency → protocol steps → Downlink report). Every figure said aloud comes from `data/sources.json`:

- Mars one-way delay **3 to 22 minutes**: NASA Science, *Speaking Percy's Language* (`nasa_perseverance_comms`).
- Moon and Mars missions bring **less ability to rely on Earth for emergency medical assistance**: Canadian Space Agency, *Why do we conduct science experiments in space?* (`csa_why_science_in_space`). Paraphrased, not quoted.
- The answer window (6 to 44 minutes) is the app's own calculation: 2 × the one-way delay. It is not a separate source.

| Time | On screen | Voice-over |
|---|---|---|
| 0:00–0:08 | Black screen, then the status board fades in on the starfield. Title text: "Halfway to Mars." | "Halfway to Mars, a crewmate feels chest pain and collapses. You are not a doctor." |
| 0:08–0:18 | Text over the board: "Mars → Earth: 3–22 min one way (NASA)". Then: "Less ability to rely on Earth for emergency medical help (Canadian Space Agency)". | "A message takes 3 to 22 minutes to reach Mars, one way. The Canadian Space Agency says crews going to the Moon and Mars can rely less on Earth for emergency medical help." |
| 0:18–0:24 | Cursor clicks **Guided demo**. Caption step 1: Mars transit vehicle selected, header shows the delay. | "Earth Is Far is a health copilot built around that delay." |
| 0:24–0:34 | Steps 2–3: overall status, then the alert zone lights up on the body map and the zone details open. DEMO DATA banner visible. | "The status board shows the crewmate's latest readings. Here, with demo data, heart rate needs attention, and the chest lights up on the body map." |
| 0:34–0:42 | Steps 4–5: the heart-rate vital row with its trend, then the **Delay & ground answer** panel. | "Every reading has a trend, and every value links to its source. This panel shows when Earth could answer at the earliest and latest." |
| 0:42–0:48 | Step 6: the red **Emergency** button is highlighted. | "Then the crewmate stops responding. One tap on Emergency." |
| 0:48–1:02 | Steps 7–9: protocol *Crewmate collapsed / not responding* opens; a step is marked done; the next appears; the timestamped log grows. | "Large, step-by-step cards: check response, call for help, start CPR with a method from a microgravity CPR guideline. Every step is logged with its time." |
| 1:02–1:14 | Step 10: **Downlink report**, the expected answer window highlighted. Click Copy. | "The downlink report sends ground everything in one message, readings, trends and the action log, so no back-and-forth. For Mars, an answer comes 6 to 44 minutes later. So the app says: act now, then report." |
| 1:14–1:20 | Quick cut: Daily check "How to measure" card, then the **Sources** view with verification counts. | "Daily checks explain how to measure, for non-experts. All content is JSON, checked on load, and traced to 45 verified sources." |
| 1:20–1:25 | On-screen text: "Educational prototype — not medical advice. Earth reference ranges, synthetic demo data." | "It's a prototype: Earth reference ranges, demo data, and a flight surgeon still has to validate it." |
| 1:25–1:30 | Logo "Earth Is Far", tagline, repository / app link. | "Earth is far. Help shouldn't be. Try the guided demo and help us validate it." |

## Recording tips

- **Window size 1440 × 900** (browser zoom 100 %). That is the size the HUD layout was tuned for.
- **Use the demo data.** On a fresh browser profile the demo readings load on the first visit (DEMO DATA banner). If you removed them, the Guided demo loads them again for the walkthrough and removes them at the end. Never record real personal readings.
- **Start from the Guided demo button** on the status board. It runs about 90 s on its own; use Pause / Next if the voice-over needs more time. Esc exits.
- **Turn reduced motion off while recording** (Windows: Settings → Accessibility → Visual effects → Animation effects on). With reduced motion on, the demo does not advance by itself and the HUD animations stop. Turn it back on afterwards if you use it.
- **Captions:** burn in captions for the whole voice-over (many judges watch muted). The Guided demo's own on-screen captions can stay; don't let the burned-in captions cover them or the highlighted element.
- Keep the "Educational prototype — not medical advice" notice visible; don't crop it out.
- Record the voice-over separately and trim the screen recording to fit, rather than rushing the narration.
- Hide the browser bookmarks bar, notifications and any personal tabs before recording.
