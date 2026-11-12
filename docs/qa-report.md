# QA report: MVP S0–S6

## Update 2026-11-12: status after the fixes (G1–G4)
**Result:** 9/9 major fixed · 11/12 minor fixed (1 partial) · 13/13 tickets closed or with a documented remainder.

| Suite | Before | After |
|---|---|---|
| Unit (Vitest) | 60/60 | **98/98** |
| Regular e2e | 25 + 1 skip | **39 + 3 skips** (intentional skips per device) |
| QA (`-c tests/qa/playwright.qa.config.ts --workers=2`) | 45 ok · 18 failed | **62 ok · 1 failed · 17 skips** |
| axe (20 views, desktop + mobile) | color-contrast `serious` on every route | **0 violations** |
| Perf (desktop) | LCP 160 ms, JS 90 KB gz | LCP 112 ms, JS 95 KB gz |

The only remaining QA failure is `cdc_bp` → **403** to Playwright's automated client (CDC anti-bot block). The page opens in a browser and was verified by hand on 2026-11-12. It is not a broken link.
Run with `--workers=2`: with the default workers, Edge saturates this machine and 30 s timeouts appear that are not app bugs.

### Status by ticket
| Ticket | Status | What was done | Commit |
|---|---|---|---|
| T1 (M1) | ✅ fixed | Input plausibility limits in each `input` of `indicators.json` (pulse 20–250, BP 40–300, glucose 10–1000, temperature 30–45, sleep 0–24; documented as **design parameters, not medical thresholds**). Pure `validateReading` rejects empty, NaN, `1e5`, out-of-range values and values off the step; BP requires diastolic < systolic (`second_lower_than_first`). | `be858dc` |
| T2 (M2) | ✅ fixed | `min_exclusive` / `max_exclusive` on `Range`; the 69.99 / 119.99 workarounds are gone. **The loader rejects** gaps and overlaps between consecutive ranges (with path and instructions) unless the indicator declares `allow_gaps`. 119.995 is now rejected by the step check, and the real cut-offs (<70, <120…) evaluate correctly. | `be858dc` |
| T3 (M3) | ✅ fixed | zod validation of everything in localStorage: invalid items are discarded, valid ones kept, and a visible notice shows how many were discarded. Error boundaries per view and at the root (header and Emergency stay usable). QA: 0 blank screens across the 20 combinations. | `4a55936` |
| T4 (M4) | ✅ fixed | `theme.emergency_button` in config (`#B3261E` / white ≈ 6.5:1). axe: 0 violations. | `4ffe37d` |
| T5 (M5) | ✅ fixed | After saving, focus goes to the "Result" heading (wizard and single indicator). | `4ffe37d` |
| T6 (M6) | ✅ fixed | Design parameter `emergency_session_max_age_hours` (12 h). An older session no longer resumes: the app asks Continue / Start over / Back to list. The timer formats `h:mm:ss` and `Xd hh:mm`. | `4a55936` |
| T7 (M7, M8) | ✅ fixed | `dueState` → `due` / `ok` / `no_frequency`; without a frequency the app shows "No frequency defined" + PLACEHOLDER (no more "Up to date" without a basis). Flags: `charts`, `reminders`, `emergency_guide`, `downlink_report` are wired (they hide routes, nav and CTAs); `offline`, `body_map`, `reaction_test`, `gamification` were **removed**. | `4ffe37d` |
| T8 (M9) | ✅ fixed | `protocol_id` removed from critical BP (no source). The CDC text with what to do stays. | `be858dc` |
| T9 (m1, m2) | ✅ fixed | `scroll-margin-top` / `scroll-padding-top` on the step title + `scrollIntoView` after focus; compact card on desktop. e2e: title not covered, and "Mark as done" visible on 1280×720 and Pixel 7. | `4ffe37d` |
| T10 (m3) | ✅ fixed | `{range.<status>.min|max}`, `{range2…}`, `{unit}` templates in the texts, rendered from the effective ranges. The loader fails if a template does not resolve. Figures that are not range edges (15 g, 15 min, athletes 40–60) stay literal with their source. | `be858dc` |
| T11 (m4, m6, m7, m8) | ✅ fixed | One `h1` per view; categories with labels from strings; "About this environment" with description and equipment; "Clear saved data" button with confirmation. | `4ffe37d`, `4a55936` |
| T12 (m5, m6, m12) | 🟡 partial | ✅ Mars transit description clarified (3–22 min is the delay *at* Mars). ✅ Sleep frequency → PLACEHOLDER. ⏳ **Pending:** fill `hazards` with a source (the UI already shows them as chips when present) and update the 5 source URLs that now redirect. | `be858dc` |
| T13 (m9, m10) | ✅ fixed | CSP + `nosniff` + `Referrer-Policy` + `X-Frame-Options` + `Permissions-Policy` in `vercel.json`, applied to `vite preview` as well (the e2e confirm the CSP breaks nothing). `.env.example` updated. **The README in English stays for S11.** | `17d889d` |

### QA tests adjusted (they were testing the old behavior, not app bugs)
- The keyboard test typed "1" in every field: that value is now **correctly** rejected (T1). It now uses values inside the limits.
- Action texts are compared after rendering the templates (T10).
- The demo flow enters the protocol through the header's Emergency button when the action has no `protocol_id` (T8).
- Selectors made exact or excluding the `<pre>` preview; the clipboard check is tolerant of CRLF; the "hardcode" detector recognizes "Normal / Normal" (pairs) as composed text. Commit `13d5cfc`.

---

## Original report (before the fixes)

**Date:** 2026-11-12 · **Build:** commit `3ae0559` (S6) · **Browser:** Microsoft Edge (Playwright `channel: "msedge"`), projects `desktop` (Desktop Edge) and `mobile` (Pixel 7).
**Authorship:** the `qa-auditor` subagent wrote the suite (`tests/qa/`) and the static audit. The main session ran the tests, ran the manual no-hardcode check and wrote this report (the auditor has no shell and cannot write report files).

## Executive summary
- The demo flow works end to end: daily check → critical value → delay-aware escalation with ETA (+6 / +44 min on Mars) → emergency protocol → downlink report → sources. All 25 regular e2e tests are green.
- **No blockers.** **9 major** bugs, mainly **input validation** (impossible values are accepted and classified as "Normal"), **corrupted localStorage** that leaves screens blank, and **contrast** on the Emergency button.
- "Nothing hardcoded" is **confirmed**: changing 4 JSON files changed the UI and the classification without touching code. One gap: the action prose repeats the thresholds.
- Performance is excellent (LCP 160 ms, 90 KB JS gzip). Basic security is OK: no secrets, no `innerHTML`.
- Every visible scientific claim has a source or is marked PLACEHOLDER. 11/12 sources are VERIFIED; all indicators still carry PLACEHOLDER parts.

## Results by suite
| Suite | Result |
|---|---|
| Unit (Vitest) | 60/60 ✅ |
| Regular e2e (`tests/e2e`) | 25 passed, 1 intentional skip ✅ |
| QA (`tests/qa`, `-c tests/qa/playwright.qa.config.ts`) | 45 passed · 18 failed · 17 skipped (1.5 min) |

The QA suite is **designed to fail on findings** (soft asserts). Breakdown of the 18 failures:
- **Real bugs (13):** inputs number + pair (desktop), corrupted storage ×6 cases (desktop), missing security headers, focus lost after saving ×2, "Mark as done" below the fold on desktop 1280×720 (demo-flow desktop).
- **Test false positives (5):** detector "UNMAPPED" ×2 (composed strings such as `"⏱ " + t("board.due_now")` and `"Normal / Normal"` for pairs: they do come from JSON); demo-flow mobile (strict-mode selector: the placeholder warning appears in the banner **and** in the text preview); tab-order ×2 (the final "BODY" stop is from tabbing past the last element). Plus `cdc_bp` 403 in the link test (see Sources).

## Bugs by priority

### Blockers
None.

### Major
| # | Bug | Reproduction | Evidence |
|---|---|---|---|
| M1 | **Impossible values accepted and classified.** No indicator defines `input.min/max`, and the form is `noValidate`. | Daily check → Blood pressure `-1/-1` → **Normal**. Sleep `99999` → **Normal**. Pressure `80/120` (diastolic > systolic) accepted. `1e5` accepted. Glucose `-5` → Critical. | `INPUT …` lines (security.spec) |
| M2 | **Reachable 0.01 gaps between ranges** (exclusive cutoffs written as 69.99 / 119.99). The UI does not enforce `step`, and pairs use `step="any"`. | Pressure `119.995/79` → **Unknown**. Pulse `100.005`, glucose `69.995`, sleep `6.995` → Unknown. | `INPUT-GAP …` |
| M3 | **Corrupted localStorage blanks screens.** There is no runtime validation of stored data and no ErrorBoundary. | Set `eif.readings` to a string / object / array with `null` / items with wrong fields → `#/`, `#/check` and `#/report` show a blank page. Invalid JSON, a stale session and a broken environment are handled fine. | `STORAGE … BROKEN` (20 combinations) |
| M4 | **Contrast of the Emergency button** (white on `#D64545` ≈ 4.38:1, below AA 4.5:1), plus one more element (`.gap-2` in wizard/emergency). It is the main CTA and shows on every route. | axe on all routes, desktop + mobile | `AXE … color-contrast serious` |
| M5 | **Focus lost to `<body>` after saving a reading.** The form unmounts. Keyboard and screen-reader users lose their place. | Daily check by keyboard → Save → `document.activeElement` = BODY (all 6 indicators) | `KBD focus-after-save … BODY` |
| M6 | **Stale emergency session resumes on its own.** | Session started 3 days ago → opening the app resumes the protocol with timer **"4320:03"**. | `STORAGE stale-session timer` |
| M7 | **Reminders / "due" with no basis.** Every `frequency.every_hours` is `null` (no source), so after the first reading every indicator shows "Up to date" forever. | Status board after 1 reading | static |
| M8 | **Uncabled flags in `config.features`.** Only `charts` works. `reminders`, `emergency_guide`, `downlink_report`, `offline` do nothing; `body_map: true` points to something that does not exist. | Change a flag → no effect | static |
| M9 | **Critical blood pressure → CPR protocol.** `blood_pressure.critical.protocol_id = crew_collapse_chest_pain` is a design mapping with no source. The CDC source talks about a hypertensive emergency *with symptoms*, not cardiac arrest. Validity risk with the judges. | Pressure 190/125 → "Open emergency protocol" → CPR | static + demo |

### Minor
| # | Bug | Note |
|---|---|---|
| m1 | On desktop 1280×720, "Mark as done" for step 1 sits below the fold (bottom 798 > 720). | `EMSTEP desktop step1-initial` |
| m2 | On mobile, one capture showed the step title **covered by the sticky bar** after arriving at `#/emergency/<id>` from `#/report`. The QA flow (from Daily check) did not reproduce it (EMSTEP mobile ok). | Add `scroll-margin-top` to `#em-step-title` as a precaution |
| m3 | **Thresholds duplicated in prose** ("60 to 100", "<120/80", "38 °C"): changing the range in JSON leaves the text stale. | Confirmed in the manual check |
| m4 | The wizard and result views have no `h1` (axe best-practice `page-has-heading-one`). | |
| m5 | "Mars transit vehicle" shows 3–22 min, which is the delay **at** Mars (Perseverance source). During transit the delay grows from ~0. The description should say so. | content |
| m6 | `hazards` is empty in every indicator, so challenge question 3 ("how hazards affect each indicator") has no visible answer. `environment.description` and `available_equipment` are not shown either. | content / UI |
| m7 | Categories are shown as raw keys ("cardiovascular"). | |
| m8 | No button to clear data (health data in localStorage in plain text); `storage.clear` exists in strings but is unused. | privacy |
| m9 | `vercel.json` does not define security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`). | `HEADERS` |
| m10 | `.env.example` mentions Supabase / `NEXT_PUBLIC_*` (stale for Vite). README is in Spanish and stale (expected, S11). | |
| m11 | Fixed values in code that could live in config: 24 h / 7 d periods, ETA formula 2× delay, "critical" in the emergency bar, `locale "en"`. | design parameters, not medical |
| m12 | The sleep frequency "Daily" has no source and is not marked PLACEHOLDER. The `why_it_matters` "helps you notice changes" hangs off `nasa_hrp_hazards`, which does not say that literally. | content |

## Accessibility
- **axe (WCAG 2.0/2.1 A + AA)** on 10 states × 2 devices: the only `serious` violation is **color-contrast** (M4). The exit dialog has 0 violations. Best practice: `page-has-heading-one` in wizard/result (m4).
- **Keyboard:** correct order (skip link → environment → Emergency → delay sources → nav → content), visible focus. Gap: focus lost after saving (M5).
- Color is never the only signal: badges carry icon + text, and chart markers use a shape per status. Verified in captures.

## Performance (desktop, preview build, 3 runs)
| Metric | Value |
|---|---|
| `main` visible | 77 ms |
| FCP / LCP | 160 ms |
| CLS | 0 |
| JS / CSS (gzip) | 90 KB / 6 KB |
| Throttled (slow CPU + network) | LCP 1.16 s |
Lighthouse is not installed; these are Performance API measurements.

## Accuracy and sources
- Every number, threshold or claim in `data/*.json` has valid `source_ids` or is marked `PLACEHOLDER`. No medical figures hardcoded in `src/` (only design parameters, m11).
- Link check (automated GET): 10/11 respond 200 (some with redirects to the new CDC/NASA/ESA URL, worth updating). `cdc_bp` answers **403** to the automated client; it opened fine during manual verification (probable anti-bot block, **not a broken link**).
- Unsourced content (honest PLACEHOLDER): frequencies, measurement steps (except pulse), several actions, all of mood, protocol steps 1–2 (recognition and alert), ISS delay, remote clinic.

## Security
- ✅ No secrets in the repo (`.env` ignored). ✅ No `dangerouslySetInnerHTML` / `innerHTML` / `eval`. ✅ The only `target="_blank"` has `rel="noopener noreferrer"`. ✅ Script in the hash does not execute (XSS test OK). No database.
- Gaps: M1 (inputs), M3 (stored data without validation), m8, m9.

## No-hardcode check
- **Manual (run against the dev server, then reverted with git):** `app_name` → "QA Probe App", `tagline`, `heart_rate.name` → "Pulse QA", normal pulse threshold 100 → 90, Mars delay max 1320 → 600 s, `nav.sources` → "References". **Everything showed up** without touching code: header, nav, banner "Earth is 3–10 min away", and pulse 95 → **Attention** (previously Normal). Exception: m3.
- **Automated detector:** only false positives (composed strings).

## Tickets
| # | For | Ticket | Covers |
|---|---|---|---|
| T1 | backend-data | Add `input.min/max` from **physical/design** limits to `indicators.json` (not medical: e.g. pressure 0–300 marked as an input limit) and validate in the UI. Pairs: reject diastolic ≥ systolic. | M1 |
| T2 | backend-data | Add `min_exclusive` / `max_exclusive` to `Range` and update `evaluate`. Drop the 69.99 / 119.99 workarounds. | M2 |
| T3 | backend-data | Validate stored data with zod when reading (discard invalid items) + a global ErrorBoundary that shows a "reset data" screen. | M3 |
| T4 | frontend | Darken `status_colors.critical` in config, or use dark text on it, so the Emergency button reaches AA; fix `.gap-2`. | M4 |
| T5 | frontend | After saving, move focus to the "Result" heading. | M5 |
| T6 | backend-data | Expire an emergency session after N hours (parameter in config) and offer "resume / start over". | M6 |
| T7 | frontend + data | Wire `features.*` (hide routes / nav entries) and drop `body_map` or set it to `false`. Show "Frequency not verified" instead of "Up to date" when `every_hours` is null. | M7, M8 |
| T8 | backend-data | Remove `protocol_id` from critical blood pressure (or link a "hypertensive emergency" protocol with its own source). | M9 |
| T9 | frontend | `scroll-margin-top` on the step title, and the emergency card more compact on desktop 720 px. | m1, m2 |
| T10 | backend-data | Templates `{min}` / `{max}` in action texts, generated from the ranges. | m3 |
| T11 | frontend | `h1` in every view, human-readable category labels (strings), show `hazards` / description / equipment, and a "Clear saved data" button. | m4, m6, m7, m8 |
| T12 | data | Clarify the Mars transit delay; update redirected URLs; fill in `hazards` with a source. | m5, m6, m12 |
| T13 | devops | Security headers in `vercel.json`; update `.env.example`; README in English (S11). | m9, m10 |
