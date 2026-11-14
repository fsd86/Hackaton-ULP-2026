# Earth Is Far

**Health guidance for when help is light-minutes away.**
A NASA Space Apps Challenge 2026 project for the challenge *Create Health Monitoring Software for Astronauts on Space Missions* (author: Brazilian Space Agency).

> **Educational prototype, not medical advice.** A flight surgeon must validate it before anyone relies on it. The app says so on every screen.

## What it is

Earth Is Far is a browser app that helps astronauts who are not doctors check their own health, understand the result and act on it, even when the flight surgeon is minutes of signal delay away. A command takes 3 to 22 minutes to reach Mars one way (NASA Science), and the Canadian Space Agency notes that Moon and Mars missions mean less ability to rely on Earth for emergency medical assistance. The app treats that **communication delay as a design variable**: when ground help is needed and the delay is above a configurable threshold, it says to act now with the crew protocol and then report to ground, and it shows the earliest and latest time an answer from Earth could arrive. Every scientific claim in the app links to a source, and all content lives in JSON files, not in code.

**The signature feature is the One-shot consult:** a medical consult rethought for a delayed conversation. Instead of a question-and-answer loop with Earth, where every follow-up costs a full round trip, the crew answers in advance the questions a doctor would usually ask back and sends everything in one message. A counter shows how many round trips that can avoid, as a maximum estimate computed only from the environment's communication delay.

| Status board (demo data) | One-shot consult counter |
|---|---|
| ![Status board with the body map, vital signs and trends; demo data, Mars transit vehicle](docs/screenshots/status-board.webp) | ![One-shot consult counter: Avoids up to 2 round trips, up to 88 min, labeled Maximum estimate](docs/screenshots/one-shot-consult-counter.webp) |

### Key features

- **One-shot consult (Downlink report).** Pick the main problem (chest pain, abdominal pain, headache, injury, breathing, fever or feeling unwell, other), then answer by module: OPQRST for acute pain, SAMPLE for a focused history, a 0–10 pain scale, injury questions and the minimum data for a remote physician. Chest pain first links to the step-by-step protocol. The app fills in the UTC time, the latest readings with their time and the mission context (environment, delay, on-board kit). 28 questions, each with its source (14 sources, loaded only from an independent verification pass). It does not diagnose or suggest treatment. The answers go into the report text and JSON, with "not answered" where blank; the draft is saved on the device and removed by Clear saved data.
- **Round-trip counter.** "Avoids up to *N* round trips — up to *X* min", labeled **Maximum estimate**. *N* = question sets with at least one answer × `consult.round_trips_per_answered_set` (1, a design assumption in `config/app.json`); *X* = *N* × 2 × the selected environment's sourced one-way delay, plus the figure at the shortest delay when there is a range. On the Mars transit vehicle (3–22 min one way), two answered sets read "up to 88 min (12 min at the shortest delay)". No paper figures and no analysis time are used; without a verified delay it shows no minutes.
- **Status board (HUD).** A body figure with clickable zones (head, chest, abdomen, arm, whole body). Each zone shows the worst status of its indicators, and the zone details panel lists the readings, the NASA hazards each indicator watches and what to do. Vital-sign rows, 7-day trend charts, a status ring and the delay / ground-answer panel sit around the body. Status is always color **plus** icon **plus** text.
- **Honest trend extrapolation.** Each 7-day chart can extend a dotted, neutral least-squares line 24 h past the last reading (`hud.projection` in `config/app.json`: design parameters, not medical), after a "Now" divider and labeled "Trend extrapolation (demo) — not a medical prediction". It never predicts a status or a range crossing.
- **Daily check.** A step-by-step wizard for 6 indicators (heart rate, blood pressure, blood glucose, body temperature, sleep, mood). For each one it explains **how to measure** in plain words, why it matters and how often, then takes the value, shows the status, what to do and who to escalate to (self, crew or flight surgeon on the ground), with the expected answer time.
- **Emergency mode.** An always-visible red Emergency button opens large step-by-step cards. Each step is marked as done with a timestamp, with a running timer and a log that survives a reload. Protocols: *Crewmate collapsed / not responding* (recognition and call for help from Earth guidance, plus microgravity CPR from the DGLRM/ESAM-SMG guideline) and *Crewmate with chest pain (conscious)*, which links to the collapse protocol.
- **Downlink report.** One complete message for the flight surgeons, so no back-and-forth is needed: readings with trends, the emergency action log, the One-shot consult, a checklist of what to include, and the **ground answer window** (now + 2 × the one-way delay). Copy it, or download it as `.txt` or `.json`.
- **Environments.** Mars transit vehicle, lunar surface base, space station and remote clinic on Earth. The selected environment's delay changes the escalation guidance.
- **Guided demo.** A button on the status board runs a scripted walkthrough of about 90 seconds (a Mars emergency with demo data) that ends with the One-shot consult and its counter. It restores the environment, emergency log, consult draft and demo data when it ends.
- **Sources view with per-datum coverage.** Every source with URL, access date, licence and verification status, and where each source is cited. A verification summary counts coverage **per data point** (each instruction, threshold, action, protocol step and environment delay): today **57 of 79 data points are sourced** (indicators 44 of 61, protocol steps 11 of 14, environment delays 2 of 4), computed by `src/logic/coverage.ts`. Unsourced data never shows a raw PLACEHOLDER marker: the UI says "No verified source yet".
- **Accessibility.** Keyboard navigation, skip link, AA contrast, reduced-motion support, and axe checks in the QA suite.
- **No backend.** Readings stay in the browser (localStorage). Demo readings are synthetic, labeled DEMO DATA and removable.

### Screenshots

Desktop at 1280 × 800 and one phone view (Pixel 7). Demo data, Mars transit vehicle.

| | |
|---|---|
| ![Daily check result for a heart rate of 104 bpm: Attention, sources, Earth reference note and what to do](docs/screenshots/daily-check-result.webp) | ![Emergency protocol Crewmate collapsed / not responding, step 2 of 8, with sources and Mark as done](docs/screenshots/emergency-protocol.webp) |
| Daily check result | Emergency protocol step |
| ![Downlink report with the expected answer window and the one-way delay](docs/screenshots/downlink-report.webp) | ![Sources view: 57 of 79 data points sourced and the coverage table per indicator](docs/screenshots/sources-coverage.webp) |
| Downlink report | Sources coverage |

<img src="docs/screenshots/status-board-mobile.webp" alt="Status board on a phone: environment, delay, demo banner and body map" width="300">

## Run it

**Prerequisites:** Node.js and npm. The project is developed and tested with **Node.js 26**. Vite 7 needs at least Node 20.19 or 22.12.

```bash
npm install
npm run dev        # development server (Vite)
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
npm run lint       # ESLint
npm test           # unit tests (Vitest)
```

End-to-end and QA tests use Playwright with the **installed Microsoft Edge** (`channel: "msedge"`), so no browser download is needed. They build the app and serve it on port 4173. Run them with one worker:

```bash
npx playwright test --workers=1                                       # e2e suite (tests/e2e)
npx playwright test -c tests/qa/playwright.qa.config.ts --workers=1   # QA suite (tests/qa): axe, keyboard, no-hardcode, perf, security, motion
```

Test layout: `tests/unit` (Vitest: schemas, evaluation, escalation, delay, report, trends, guided demo, headers), `tests/e2e` (Playwright: one spec per view, robustness, guided demo; desktop and Pixel 7 projects), `tests/qa` (audits). The QA check on the CDC page can fail with HTTP 403 from the site's bot protection; that is a known external issue.

### Deploy

Manual deploy on **Netlify**: run `npm run build` and drag the `dist/` folder onto Netlify. `public/_headers` is copied into `dist/` and sets the security headers (Content-Security-Policy with `'self'` only, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`). `vercel.json` carries the same headers for an optional Vercel deploy, and a unit test keeps the two in sync. The app needs no environment variables (see `.env.example`).

## Data-driven structure

All content lives in JSON. Components only read and display it. Changing the mission means editing JSON, not code.

| File | What it holds |
|---|---|
| `data/indicators.json` | The 6 indicators: unit, input type and plausibility limits, how to measure, why it matters, frequency, ranges (normal / attention / critical) with notes, actions, escalation level, NASA hazards, body zone, icon, sources, status, Earth reference flag |
| `data/protocols.json` | Emergency protocols: triggers, steps (text, detail, optional timer, link to another protocol), escalation, report fields, sources |
| `data/environments.json` | Mission environments: description, one-way communication delay (min/max seconds) with sources, equipment, indicator overrides |
| `data/hazards.json` | NASA HRP's five hazards of human spaceflight, with a short paraphrase and source |
| `data/sources.json` | Every source: title, publisher, URL, access date, licence, notes, status |
| `data/demo-readings.json` | Synthetic DEMO DATA covering about 7 days (status is evaluated from the ranges, never stored) |
| `data/consult.json` | The One-shot consult: help texts, symptoms, question sets (OPQRST, SAMPLE, pain scale, injury, remote physician) and answer types, each with sources or marked as design text |
| `data/guided-demo.json` | The Guided demo script (scenario, demo consult answers and steps) |
| `config/app.json` | App name, tagline, theme tokens, feature flags, realtime threshold, disclaimer, body image, HUD layout (including the trend extrapolation) and the consult counter assumption |
| `config/strings.en.json` | Every UI text (English) |

**Validation.** All files are validated with **zod** when the app loads, plus cross-checks (every `source_ids` entry exists, ranges touch without gaps or overlaps, linked protocols exist, consult modules and `skip_if` references exist, guided demo step durations add up to the declared total and its demo consult answers are valid options). A mistake shows a content error screen listing the **file**, the **field path** (for example `indicators[2].ranges[1].min` in `data/indicators.json`) and the problem in plain words.

**VERIFIED vs PLACEHOLDER.** Anything without a verified source is marked `"status": "PLACEHOLDER"` (or its text starts with `PLACEHOLDER:`), and the UI shows a placeholder badge. The schema refuses `VERIFIED` without at least one source, and a `VERIFIED` source needs a real http(s) URL and an access date. Nobody invents medical thresholds, figures or quotes. Design parameters (escalation levels, `realtime_threshold_s`, body zones, chosen measuring intervals) are labeled as design decisions in each file's `_comment`.

**Earth reference flag.** `earth_reference: true` on an indicator or protocol step means the value comes from Earth guidance (CDC, MedlinePlus, NHS, AASM/SRS, NHLBI, Resuscitation Council UK) with no spaceflight-specific value. The UI then shows "Earth reference — no spaceflight-specific value." next to it, plus an optional `reference_note`.

### How to add or replace data

1. Edit the JSON in `data/` (or `config/`). Keep to what the source says: paraphrase, don't copy.
2. Add the source to `data/sources.json` with `url`, `accessed` (YYYY-MM-DD), `license`, `notes` and `"status": "VERIFIED"`, and reference its `id` in `source_ids`.
3. Set `status` to `VERIFIED` only when every part (how to measure, frequency, ranges, actions) has a source; set `earth_reference` when the source is Earth guidance.
4. Rebuild (`npm run build`): JSON is bundled at build time, so a deployed `dist/` needs a new build.
5. Run `npm test` (schemas, citations) and the e2e suite. If a file is wrong, the app and the tests name the file and field.

### How the Guided demo is defined

`data/guided-demo.json` holds a `scenario` (environment `spacecraft`, alert indicator `heart_rate`, protocol `crew_collapse_chest_pain`, and `consult`: symptom `chest_pain` with two DEMO answers, "Suddenly" for onset and "No" for known allergies) and a list of `steps`. Each step has a `route` (hash of the view), a CSS `target` to highlight (may use `{zone}` / `{indicator}`), a `caption_key` from `config/strings.en.json`, a `duration_ms`, and an optional `action` (`set_environment`, `select_alert_zone`, `open_protocol`, `mark_step_done`, `open_consult`, `select_consult_symptom`, `fill_consult_demo`). The loader checks that the demo answers are real options of questions in that symptom's modules. `design_total_duration_ms` must equal the sum of the step durations (90 s today). The flow (14 steps): environment → status board → alert zone → alert vital → ground answer → Emergency button → protocol → two steps marked done with the log → One-shot consult opened → chest pain selected → two demo answers → the counter → Downlink report with the answer window. With reduced motion on, the demo does not advance by itself (use Next). When it ends (Finish, Esc or a reload), the environment, emergency session and log, consult draft and demo readings go back to how they were. The `guided_demo` flag in `config/app.json` turns the button on or off.

## Sources and verification

- `data/sources.json` lists **62 sources: 61 VERIFIED, 1 PLACEHOLDER** (NASA OSDR, not used yet). By access date: 10 on 2026-11-12, 5 on 2026-11-13, 46 on 2026-11-14. Main publishers: MedlinePlus / A.D.A.M. (10), CDC (9 + 1 CDC Port Health), NASA Human Research Program (5), NASA (3), Canadian Space Agency (3), plus NASA Science, NASA NTRS, ESA, NHS, NIH institutes (NIDDK, NIMH, NHLBI), USPSTF, Resuscitation Council UK, WHO/ICRC, the UK Maritime and Coastguard Agency and peer-reviewed papers (including the DGLRM/ESAM-SMG microgravity CPR guideline and the OPQRST / SAMPLE / crew-autonomy papers behind the One-shot consult).
- **Coverage per data point** (Sources view, `src/logic/coverage.ts`): 57 of 79 sourced. Indicators 44 of 61, protocol steps 11 of 14, environment delays 2 of 4. A data point counts as sourced when it cites at least one source and has no unverified text; a range also needs a defined limit; a frequency marked as a design decision does not count.
- **How they were researched.** Research agents gathered candidate facts per topic (`docs/research/3a-a-cardio-temp.md`, `3a-b-glucose-sleep-mood.md`, `3a-c-emergency.md`). An **independent verification pass** then reopened every URL without using the researchers' quotes (`docs/research/3a-verificacion.md`). Of 115 items: 79 VERIFIED, 22 VERIFIED-WITH-EDIT (the UI text was corrected to match the source), 4 REJECTED and 10 BLOCKED. Only VERIFIED and VERIFIED-WITH-EDIT items were loaded; rejected and blocked items stay PLACEHOLDER. The One-shot consult went through the same process (`docs/research/5-one-shot-consult.md`, `5-verificacion.md`): of 60 items, 38 VERIFIED, 16 VERIFIED-WITH-EDIT, 1 REJECTED and 5 BLOCKED; only the first two groups were loaded into `data/consult.json`. The official challenge resources (NASA HRP and CSA PDFs) are analysed in `docs/06-resources-analisis.md`.
- **Manual checks pending.** `docs/verificacion-manual.md` lists 10 pages that block bots (403, cookies or unreadable PDF): CDC blood pressure, AHA home monitoring, NASA OCHMO-TB-033, PHQ-2 (Kroenke 2003), SAMHSA 988, AHA and ERC basic life support 2025, AHA heart attack signs, AsMA medical emergencies 2025, and the NIDA PHQ-2 form. Data that depends on them stays PLACEHOLDER until a person checks them in a browser.

## AI usage declaration

This project was built with heavy AI assistance. Every relevant use is logged in `docs/si-log.md`.

**What AI did** (Claude Code with Claude Opus, plus project subagents defined in `.claude/agents/`):
- **Planning:** challenge brief, market review with sources, three scored concepts, architecture and slice plan (`docs/01`–`04`).
- **Code:** the `architect` subagent (Opus) defined the stack and JSON schemas; the `frontend-engineer` and `backend-data-engineer` subagents (Sonnet) wrote schemas, loaders, logic and UI; the main session ran install, lint, tests and build and fixed the bugs found.
- **Tests and QA:** unit and e2e tests, and the `qa-auditor` subagent's Playwright + axe suite and static audit (`docs/qa-report.md`).
- **Research and verification:** web research of sources, a separate independent verification pass, and reading the official challenge PDFs.
- **Docs:** pitch, progress log, this README and the video script.
- **Body image:** `public/hero/body.webp` was **generated with ChatGPT (free version, OpenAI image generator) on 2026-11-13 by the SpaceHolders team**. The prompt is recorded in `docs/assets-provenance.md` (its final part is still to be pasted). **OpenAI's terms of use are pending verification by the team** (ownership, public use, attribution, contest rules); the result will be noted there and, if attribution is required, added here and in the app.
- **Screenshots** in `docs/screenshots/` were captured from the running app with a Playwright script.

**What humans did:** chose the challenge and approved the concept, made the product and design decisions (Netlify deploy, design parameters, what stays PLACEHOLDER), generated the body image, reviewed the results, and own the pending manual source checks and the remaining body image provenance items (final part of the prompt, OpenAI terms).

**Not included:** the third-party visual reference images used for style inspiration are not in the repository or in `dist/`, and no text, numbers or graphics were copied from them. All other visuals are the project's own CSS and SVG; fonts are OFL (`@fontsource-variable/space-grotesk`, `@fontsource-variable/jetbrains-mono`).

## Limitations

- **Not medical advice.** This is an educational prototype. It needs validation by a flight surgeon.
- **All 6 indicators are still PLACEHOLDER overall,** because some part has no verified source:
  - Heart rate: no measuring frequency and no numeric critical threshold.
  - Blood pressure: no low-pressure threshold and no sourced "what to do" for the attention range (the 12-hour interval is a design choice based on the NHS morning-and-evening pattern).
  - Blood glucose: no measuring frequency for people without diabetes; ranges are fasting references with no fasting / not-fasting toggle yet.
  - Body temperature: no measuring frequency; 35–36.1 °C and 37.2–38 °C are not defined by the sources and show as "unknown".
  - Sleep: no critical threshold (the once-a-day interval is a design choice).
  - Mood: a personal 1–5 log with no labels, ranges or actions; a validated screen (PHQ-2) is verified but not implemented.
- **Chest-pain protocol is partial:** the alert channel, medication and positioning steps are PLACEHOLDER. The collapse protocol is VERIFIED but its recognition and call-for-help steps are Earth guidance.
- **Earth ranges are not validated for spaceflight.** Every range is an Earth reference for adults and carries that label in the app.
- **The consult counter is a maximum estimate.** "1 extra exchange per answered question set" is a design assumption, not a measured figure, and the minutes come only from the environment's delay (no reading, analysis or reply time). The consult only collects information: no diagnosis, no treatment advice, no photo attachment. Several of its items are maritime or Earth emergency references and are labeled as such.
- **The trend extrapolation is not a prediction.** It is a straight line through demo readings, shown only to illustrate the chart.
- **Delays:** space station and remote clinic have no sourced communication delay yet.
- **Demo data is synthetic** (DEMO DATA), not real measurements.
- **No offline mode yet** (no service worker / PWA).
- **Manual source verification is pending** for the 10 pages in `docs/verificacion-manual.md`. The body image provenance still lacks the end of the prompt and the check of OpenAI's terms of use.

## Licence

- **Content sources keep their own licences,** recorded per source in `data/sources.json`: U.S. Government works are public domain (CDC, NASA, NIH, AHRQ); Canadian Space Agency and NHS pages are Crown copyright; several peer-reviewed papers are CC BY 4.0 (for example the DGLRM/ESAM-SMG CPR guideline and the OPQRST and SAMPLE papers), some are CC BY-NC or CC BY-NC-ND (cited and paraphrased only); the UK MCA guide is under the Open Government Licence; others are publisher copyright (paraphrased and cited only).
- **MedlinePlus Medical Encyclopedia (A.D.A.M.)** text is copyrighted: the app only shows its own paraphrase and links to the original article.
- **Project licence: not yet defined.** There is no LICENSE file in the repository yet.
