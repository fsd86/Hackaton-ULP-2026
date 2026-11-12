import { test, expect, type Page } from "@playwright/test";
import { indicators, must, pairIndicator, protocols, seedStorage, strings, watchPage, type IndicatorJson } from "./helpers";

// Seguridad basica y robustez de entradas (desktop). Los resultados se loguean con prefijos
// INPUT / STORAGE / XSS / HEADERS; los expect.soft marcan lo que deberia rechazarse o no romper.

const SAVE = () => ({ name: strings["daily.save"], exact: true as const });

async function submitNumber(page: Page, ind: IndicatorJson, raw: string): Promise<{ accepted: boolean; text: string }> {
  await page.goto(`/#/check/${ind.id}`);
  await page.reload();
  await page.getByRole("spinbutton").fill(raw);
  await page.getByRole("button", SAVE()).click();
  return readOutcome(page, ind);
}

async function submitPair(page: Page, ind: IndicatorJson, a: string, b: string): Promise<{ accepted: boolean; text: string }> {
  await page.goto(`/#/check/${ind.id}`);
  await page.reload();
  await page.getByRole("spinbutton").nth(0).fill(a);
  await page.getByRole("spinbutton").nth(1).fill(b);
  await page.getByRole("button", SAVE()).click();
  return readOutcome(page, ind);
}

async function readOutcome(page: Page, ind: IndicatorJson): Promise<{ accepted: boolean; text: string }> {
  const res = page.locator(`section[aria-labelledby="res-${ind.id}"]`);
  const err = page.locator("form p[role=alert]");
  await Promise.race([res.waitFor({ timeout: 2000 }).catch(() => undefined), err.waitFor({ timeout: 2000 }).catch(() => undefined)]);
  if (await res.count()) {
    const badge = (await res.locator("[role=status]").first().innerText()).replace(/\s+/g, " ").trim();
    return { accepted: true, text: badge };
  }
  return { accepted: false, text: ((await err.count()) ? await err.first().innerText() : "no feedback").replace(/\s+/g, " ").trim() };
}

test("inputs: number indicators with negative, absurd, exponent and gap values", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  test.setTimeout(180_000);
  const BAD = ["-5", "99999", "1e5", "0"];
  for (const ind of indicators.filter((i) => i.input.kind === "number")) {
    for (const raw of BAD) {
      const r = await submitNumber(page, ind, raw);
      console.log("INPUT", ind.id, raw, r.accepted ? "ACCEPTED" : "REJECTED", r.text);
      if (raw === "-5" || raw === "99999" || raw === "1e5") {
        expect.soft(r.accepted, `${ind.id}: "${raw}" ${ind.unit} should be rejected as implausible (accepted -> ${r.text})`).toBe(false);
      }
    }
    // hueco de 0.01 entre rangos: un valor intermedio no deberia quedar "Unknown"
    const edges = ind.ranges.filter((r) => r.max !== null).map((r) => (r.max as number) + 0.005);
    for (const e of edges) {
      const r = await submitNumber(page, ind, String(e));
      console.log("INPUT-GAP", ind.id, e, r.accepted ? "ACCEPTED" : "REJECTED", r.text);
      if (r.accepted && ind.ranges.some((x) => x.min !== null && x.min - (e - 0.005) < 0.02 && x.min > e - 0.005)) {
        expect.soft(r.text, `${ind.id}: value ${e} falls in a range gap and must not be Unknown`).not.toContain(strings["status.unknown"]);
      }
    }
  }
  const empty = await submitNumber(page, must(indicators.find((i) => i.input.kind === "number"), "number indicator"), "");
  expect.soft(empty.accepted, "empty value is rejected").toBe(false);
});

test("inputs: pair indicator (blood pressure) with negative, absurd, inverted and gap values", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  test.setTimeout(120_000);
  const ind = pairIndicator();
  const cases: Array<{ a: string; b: string; shouldReject: boolean; why: string }> = [
    { a: "-1", b: "-1", shouldReject: true, why: "negative pressure" },
    { a: "99999", b: "99999", shouldReject: true, why: "absurd value" },
    { a: "0", b: "0", shouldReject: true, why: "zero pressure" },
    { a: "80", b: "120", shouldReject: true, why: "diastolic higher than systolic" },
    { a: "1e5", b: "80", shouldReject: true, why: "exponent notation" },
    { a: "119.995", b: "79", shouldReject: false, why: "gap between ranges (must not be Unknown)" },
    { a: "180.005", b: "100", shouldReject: false, why: "gap between ranges (must not be Unknown)" },
  ];
  for (const c of cases) {
    const r = await submitPair(page, ind, c.a, c.b);
    console.log("INPUT", ind.id, `${c.a}/${c.b}`, r.accepted ? "ACCEPTED" : "REJECTED", c.why, "=>", r.text);
    if (c.shouldReject) expect.soft(r.accepted, `${ind.id} ${c.a}/${c.b}: ${c.why} should be rejected (got ${r.text})`).toBe(false);
    else if (r.accepted) expect.soft(r.text, `${ind.id} ${c.a}/${c.b}: ${c.why}`).not.toContain(strings["status.unknown"]);
  }
  await page.goto(`/#/check/${ind.id}`);
  await page.reload();
  await page.getByRole("spinbutton").nth(0).fill("120");
  await page.getByRole("button", SAVE()).click();
  await expect.soft(page.locator("form p[role=alert]"), "one value missing -> error").toBeVisible();
});

const CORRUPT: Array<{ name: string; store: Record<string, string> }> = [
  { name: "readings-is-object", store: { "eif.readings": '{"a":1}' } },
  { name: "readings-is-string", store: { "eif.readings": '"abc"' } },
  { name: "readings-has-null", store: { "eif.readings": "[null]" } },
  { name: "readings-bad-fields", store: { "eif.readings": JSON.stringify([{ id: "x", indicatorId: indicators[0]?.id, value: "abc", environmentId: "nope", timestamp: "yesterday" }]) } },
  { name: "readings-invalid-json", store: { "eif.readings": "{not json" } },
  { name: "emergency-log-is-object", store: { "eif.emergency_log": '{"a":1}' } },
  { name: "emergency-session-unknown-protocol", store: { "eif.emergency_session": JSON.stringify({ sessionId: "s", protocolId: "nope", startedAt: 0 }) } },
  { name: "emergency-session-bad-start", store: { "eif.emergency_session": JSON.stringify({ sessionId: "s", protocolId: protocols[0]?.id, startedAt: "x" }) } },
  { name: "emergency-session-stale-3-days", store: { "eif.emergency_session": JSON.stringify({ sessionId: "s", protocolId: protocols[0]?.id, startedAt: Date.now() - 3 * 86_400_000 }) } },
  { name: "environment-unknown-id", store: { "eif.environment": '"zzz"' } },
  { name: "environment-is-object", store: { "eif.environment": "{}" } },
];

for (const c of CORRUPT) {
  test(`storage: corrupted localStorage (${c.name}) does not blank the app`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    const issues = watchPage(page);
    await seedStorage(page, c.store);
    for (const hash of ["#/", "#/check", "#/emergency", "#/report", "#/sources"]) {
      await page.goto(`/${hash}`);
      await page.reload();
      await page.waitForTimeout(250);
      const textLen = await page.evaluate(() => (document.getElementById("root")?.innerText ?? "").trim().length);
      const errs = issues.filter((i) => i.startsWith("pageerror")).length;
      console.log("STORAGE", c.name, hash, textLen > 200 && errs === 0 ? "OK" : `BROKEN (textLen=${textLen}, pageerrors=${errs})`);
      expect.soft(textLen, `${c.name} ${hash}: app still renders`).toBeGreaterThan(200);
    }
    expect.soft(issues.filter((i) => i.startsWith("pageerror")), `${c.name}: uncaught exceptions`).toEqual([]);
    if (c.name === "emergency-session-stale-3-days") {
      await page.goto("/#/emergency");
      const timer = await page.getByRole("timer").first().innerText().catch(() => "no timer");
      console.log("STORAGE stale-session timer shows", JSON.stringify(timer));
      expect.soft(timer, "a 3-day-old session should not silently resume as if it were a live emergency").toBe("no timer");
    }
  });
}

test("xss: hash parameters are rendered inert", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  let fired = false;
  page.on("dialog", (d) => {
    fired = true;
    void d.dismiss();
  });
  const payloads = [
    "#/emergency/%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E",
    '#/sources/%22%3E%3Cscript%3Ealert(1)%3C%2Fscript%3E',
    "#/check/%3Csvg%20onload%3Dalert(1)%3E",
    "#/sources/%E0%A4%A",
  ];
  for (const p of payloads) {
    await page.goto(`/${p}`);
    await page.reload();
    await page.waitForTimeout(300);
    const injected = await page.locator("img[src='x'], svg[onload], main script").count();
    console.log("XSS", p, injected === 0 && !fired ? "inert" : "INJECTED");
    expect.soft(injected, `${p}: no injected nodes`).toBe(0);
  }
  expect.soft(fired, "no alert dialog fired").toBe(false);
  await expect.soft(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
});

test("headers: security headers of the served app (preview server; production headers live in vercel.json)", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  const resp = must(await page.goto("/"), "response");
  const h = resp.headers();
  const keys = ["content-security-policy", "x-content-type-options", "x-frame-options", "referrer-policy", "strict-transport-security", "permissions-policy", "cache-control"];
  console.log("HEADERS", JSON.stringify(Object.fromEntries(keys.map((k) => [k, h[k] ?? null]))));
  expect.soft(h["content-security-policy"], "Content-Security-Policy present").toBeTruthy();
  expect.soft(h["x-content-type-options"], "X-Content-Type-Options: nosniff").toBe("nosniff");
  expect.soft(h["referrer-policy"], "Referrer-Policy present").toBeTruthy();
  // secretos obvios en el bundle servido
  const html = await resp.text();
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  for (const src of scripts) {
    const body = await (await page.request.get(src)).text();
    const hit = /(sk-[A-Za-z0-9]{20,}|eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{10,}|AKIA[0-9A-Z]{16}|supabase\.co)/.exec(body);
    console.log("SECRETS-SCAN", src, hit ? `MATCH ${hit[0].slice(0, 12)}...` : "clean");
    expect.soft(hit, `possible secret in ${src}`).toBeNull();
  }
});
