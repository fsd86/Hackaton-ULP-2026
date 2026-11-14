import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import {
  app,
  buildSeed,
  criticalValueFor,
  enterReading,
  environments,
  evalIndicator,
  expectedDelayText,
  fill,
  fmtHM,
  indicators,
  mainProtocol,
  must,
  noHorizontalOverflow,
  openIndicator,
  pairIndicator,
  protocols,
  SEED_KEY,
  seedStorage,
  shot,
  sources,
  strings,
  templateRegex,
  watchPage,
  type Health,
} from "./helpers";
import { renderIndicatorText } from "../../src/logic/indicatorText";
import type { Indicator } from "../../src/content/schemas";

// Guion de demo completo (desktop y mobile). Usa expect.soft: el flujo sigue aunque un paso falle,
// asi un solo run lista todos los bugs. Lo que el oracle necesita sale de data/*.json y config/*.json.

test("demo flow: a-f (empty home, environments, critical check, emergency, report, sources)", async ({ page, context }, testInfo) => {
  test.setTimeout(180_000);
  const issues = watchPage(page);
  const project = testInfo.project.name;

  const defaultEnv = must(environments.find((e) => e.id === app.default_environment), "default environment");
  const otherEnv = must(
    environments.find((e) => e.id !== defaultEnv.id && (e.comm_delay_one_way_s.min !== null || e.comm_delay_one_way_s.max !== null)),
    "a second environment with a verified delay",
  );
  const bp = pairIndicator();
  const bpValue = must(criticalValueFor(bp), "a critical value for the pair indicator");
  const critAction = must(bp.actions.critical, "critical action of the pair indicator");
  const protocol = must(protocols.find((p) => p.id === critAction.protocol_id) ?? mainProtocol(), "protocol");

  // ---------------------------------------------------------------- a. home vacio
  await test.step("a. empty home", async () => {
    await page.goto("/#/");
    await expect(page.getByRole("heading", { level: 1, name: strings["board.title"] })).toBeVisible();
    await expect.soft(page.getByRole("link", { name: strings["board.go_to_check"], exact: true })).toBeVisible();
    await expect.soft(page.locator("header")).toContainText(app.app_name);
    await expect.soft(page.locator("header")).toContainText(app.tagline);
    await expect.soft(page.locator("footer")).toContainText(app.disclaimer);
    const ov = await noHorizontalOverflow(page);
    expect.soft(ov.ok, `horizontal overflow on home: ${JSON.stringify(ov)}`).toBe(true);
    await shot(page, testInfo, "01-home-empty", true);
  });

  // ---------------------------------------------------------------- b. cambio de entorno
  await test.step("b. switch environment and back", async () => {
    // Rediseño: selector y demora viven en el header; las fuentes de la demora, en el panel "Ground answer" del tablero.
    const select = page.getByRole("combobox", { name: strings["environment.label"], exact: true });
    const bannerText = page.locator("header p[aria-live]");
    const delaySources = page.getByRole("region", { name: strings["hud.ground_answer"], exact: true });
    const defText = expectedDelayText(defaultEnv.comm_delay_one_way_s);
    const otherText = expectedDelayText(otherEnv.comm_delay_one_way_s);

    await expect(bannerText).toContainText(defText);
    await shot(page, testInfo, "02a-env-default");

    await select.selectOption({ label: otherEnv.name });
    await expect(bannerText).toContainText(otherText);
    if (otherText !== defText) await expect.soft(bannerText).not.toContainText(defText);
    await shot(page, testInfo, "02b-env-other");

    await page.reload();
    await expect.soft(select, "selected environment persists after reload").toHaveValue(otherEnv.id);

    await select.selectOption({ label: defaultEnv.name });
    await expect(bannerText).toContainText(defText);
    await shot(page, testInfo, "02c-env-back");

    // La demora debe citar sus fuentes (links a #/sources/<id>) o marcarse como PLACEHOLDER.
    const ids = new Set(defaultEnv.comm_delay_one_way_s.source_ids);
    await expect.soft(delaySources.locator('a[href^="#/sources/"]')).toHaveCount(ids.size);
  });

  // ---------------------------------------------------------------- c. Daily check critico
  await test.step("c. daily check: critical reading + escalation with ETA", async () => {
    await openIndicator(page, bp);
    const t0 = Date.now();
    await enterReading(page, bp, bpValue);
    await expect(page.getByRole("heading", { name: strings["daily.result"], exact: true })).toBeVisible();
    const t1 = Date.now();

    const res = page.locator(`section[aria-labelledby="res-${bp.id}"]`);
    const esc = page.locator(`section[aria-labelledby="esc-${bp.id}"]`);
    await expect(res).toContainText(strings["status.critical"]);
    await expect.soft(esc).toContainText(strings[`escalation.level.${critAction.escalation}`]);

    // Fuentes del rango critico visibles
    const crit = must(bp.ranges.find((r) => r.status === "critical"), "critical range");
    for (const id of crit.source_ids) {
      await expect.soft(res.locator(`a[href="#/sources/${id}"]`), `source link ${id} on result`).toHaveCount(1);
    }
    // Acciones del JSON
    // Los textos usan plantillas {range...} (QA T10): se comparan ya renderizados, como los muestra la app.
    for (const line of critAction.text)
      await expect.soft(page.getByText(renderIndicatorText(line, bp as unknown as Indicator), { exact: true })).toBeVisible();

    const { min, max } = defaultEnv.comm_delay_one_way_s;
    const hi = max ?? min;
    if (hi !== null && hi > app.realtime_threshold_s) {
      await expect.soft(esc).toContainText(strings["escalation.ground.act_now"].split("{earliest}")[0]);
      const stamps = await esc.locator("time").evaluateAll((els) => els.map((e) => e.getAttribute("datetime") ?? ""));
      expect.soft(stamps.length, "ETA shows two <time> values (earliest/latest)").toBe(2);
      if (stamps.length === 2) {
        const earliest = Date.parse(stamps[0]);
        const latest = Date.parse(stamps[1]);
        const lo = (min ?? hi) * 2000;
        expect.soft(earliest - t0, "earliest = now + 2 x min delay").toBeGreaterThanOrEqual(lo - 1000);
        expect.soft(earliest - t1, "earliest = now + 2 x min delay").toBeLessThanOrEqual(lo + 1000);
        expect.soft(latest - t0, "latest = now + 2 x max delay").toBeGreaterThanOrEqual(hi * 2000 - 1000);
        expect.soft(latest - t1, "latest = now + 2 x max delay").toBeLessThanOrEqual(hi * 2000 + 1000);
        console.log("ETA", project, `earliest=+${Math.round((earliest - t0) / 60000)}min`, `latest=+${Math.round((latest - t0) / 60000)}min`);
      }
    }
    // El link al protocolo solo existe si la acción declara protocol_id (QA T8 lo quitó de la presión: sin fuente).
    const openProtocol = page.getByRole("link", { name: strings["escalation.open_protocol"], exact: true });
    await expect.soft(openProtocol).toHaveCount(critAction.protocol_id ? 1 : 0);
    await shot(page, testInfo, "03-check-critical", true);
  });

  // ---------------------------------------------------------------- d. protocolo de emergencia
  await test.step("d. emergency protocol: mark 3 steps, current step must be visible and not covered", async () => {
    if (critAction.protocol_id) {
      await page.getByRole("link", { name: strings["escalation.open_protocol"], exact: true }).click();
    } else {
      // Camino real del astronauta: botón Emergency del header → elegir el protocolo.
      await page.getByRole("link", { name: strings["emergency.button"], exact: true }).first().click();
      await page.getByRole("button", { name: new RegExp(protocol.title.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")) }).first().click();
    }
    await expect(page).toHaveURL(new RegExp(`#/emergency(/${protocol.id})?$`));
    const heading = page.locator("#em-step-title");
    await expect(heading).toHaveText(protocol.steps[0].text);

    const inspect = async (stepIndex: number, label: string): Promise<void> => {
      await expect(heading).toHaveText(protocol.steps[stepIndex].text);
      await page.waitForTimeout(400); // deja terminar el scroll que dispara focus()
      const info = await page.evaluate(
        (a: { mark: string; bar: string }) => {
          const where = (el: Element | null) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            return {
              ok: hit !== null && (hit === el || el.contains(hit)),
              hit: hit ? `${hit.tagName}${hit.id ? "#" + hit.id : ""}[${(hit.getAttribute("aria-label") ?? "").slice(0, 30)}]` : null,
              top: Math.round(r.top),
              bottom: Math.round(r.bottom),
            };
          };
          const h = document.getElementById("em-step-title");
          const btn = Array.from(document.querySelectorAll("button")).find((b) => (b.textContent ?? "").trim() === a.mark) ?? null;
          const bar = document.querySelector(`[role="region"][aria-label="${a.bar}"]`);
          const nav = document.querySelector("nav");
          const navFixed = nav ? getComputedStyle(nav).position === "fixed" : false;
          return {
            vh: window.innerHeight,
            scrollY: Math.round(window.scrollY),
            heading: where(h),
            button: where(btn),
            barBottom: bar ? Math.round(bar.getBoundingClientRect().bottom) : 0,
            navTop: nav && navFixed ? Math.round(nav.getBoundingClientRect().top) : window.innerHeight,
          };
        },
        { mark: strings["emergency.mark_done"], bar: strings["emergency.status_bar"] },
      );
      console.log("EMSTEP", project, label, JSON.stringify(info));
      await expect.soft(heading, `${label}: step heading in viewport`).toBeInViewport();
      expect.soft(info.heading?.ok, `${label}: elementFromPoint at heading center is the heading (hit=${info.heading?.hit})`).toBe(true);
      if (info.heading) {
        expect.soft(info.heading.top, `${label}: heading top (${info.heading.top}) is below the sticky bar (${info.barBottom})`).toBeGreaterThanOrEqual(info.barBottom - 1);
        expect.soft(info.heading.bottom, `${label}: heading bottom (${info.heading.bottom}) is above the fixed nav (${info.navTop})`).toBeLessThanOrEqual(info.navTop + 1);
      }
      expect.soft(info.button?.ok, `${label}: 'Mark as done' button is not covered (hit=${info.button?.hit})`).toBe(true);
    };

    await inspect(0, "step1-initial");
    await shot(page, testInfo, "04a-emergency-step1");
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: strings["emergency.mark_done"], exact: true }).click();
      const next = Math.min(i + 1, protocol.steps.length - 1);
      await inspect(next, `after-mark-${i + 1}`);
      await shot(page, testInfo, `04b-emergency-after-mark-${i + 1}`);
    }
    await expect.soft(page.getByTestId("emergency-log").getByRole("listitem")).toHaveCount(3);
    await shot(page, testInfo, "04c-emergency-log", true);
  });

  // ---------------------------------------------------------------- e. reporte de bajada
  await test.step("e. downlink report: readings, actions, answer window, .txt and .json", async () => {
    await page.getByRole("link", { name: strings["emergency.report_now"], exact: true }).last().click();
    await expect(page.getByRole("heading", { level: 1, name: strings["report.title"] })).toBeVisible();

    const eta = page.getByTestId("report-eta");
    await expect(eta).toHaveText(templateRegex(strings["report.eta_window"], "\\d{2}:\\d{2}"));
    await expect.soft(page.getByRole("heading", { level: 3, name: bp.name })).toBeVisible();
    await expect.soft(page.getByRole("region", { name: strings["report.eta"] })).toContainText(expectedDelayText(defaultEnv.comm_delay_one_way_s));
    // exact: el aviso aparece en el banner y también dentro de la vista previa <pre> del texto.
    await expect.soft(page.getByText(strings["report.placeholder_warning"], { exact: true })).toBeVisible();
    await expect.soft(page.locator("#report-emergency + ol li")).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      // El paso también aparece dentro de la vista previa <pre> del texto del reporte: se excluye la vista previa.
      const stepText = fill(strings["report.step"], { n: i + 1, text: protocol.steps[i].text });
      await expect.soft(page.getByText(stepText).and(page.locator(":not(pre)"))).toBeVisible();
    }
    const ov = await noHorizontalOverflow(page);
    expect.soft(ov.ok, `horizontal overflow on report: ${JSON.stringify(ov)}`).toBe(true);
    await shot(page, testInfo, "05a-report", true);

    // ---- .txt
    const [txtDl] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: strings["report.download_txt"], exact: true }).click(),
    ]);
    expect.soft(txtDl.suggestedFilename()).toMatch(/^[a-z0-9-]+-report-\d{8}-\d{4}\.txt$/);
    const txt = readFileSync(await txtDl.path(), "utf8");
    // ---- .json
    const [jsonDl] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: strings["report.download_json"], exact: true }).click(),
    ]);
    expect.soft(jsonDl.suggestedFilename()).toMatch(/^[a-z0-9-]+-report-\d{8}-\d{4}\.json$/);
    const json = JSON.parse(readFileSync(await jsonDl.path(), "utf8")) as {
      app_name: string;
      generated_at: { timestamp: number; iso: string; text: string };
      environment: { id: string; name: string };
      delay: { one_way_s: { min: number | null; max: number | null }; text: string };
      expected_answer_window: { from: string; to: string; text: string } | null;
      readings: Array<{ indicator_id: string; readings: Array<{ value: number | [number, number]; status: string; value_text: string; unit: string }> }>;
      emergency_actions: Array<{ protocol_id: string; step_index: number; step_text: string; timestamp: number }>;
      information_to_include: Array<{ protocol_id: string; fields: string[] }>;
      has_placeholders: boolean;
      disclaimer: string;
    };

    // contenido .txt
    expect.soft(txt).toContain(app.app_name);
    expect.soft(txt).toContain(`${strings["report.environment"]}: ${defaultEnv.name}`);
    expect.soft(txt).toContain(`${strings["report.delay"]}: ${expectedDelayText(defaultEnv.comm_delay_one_way_s)}`);
    expect.soft(txt).toContain(`${Array.isArray(bpValue) ? bpValue.join(" / ") : bpValue} ${bp.unit} — ${strings["status.critical"]}`);
    for (let i = 0; i < 3; i++) expect.soft(txt).toContain(fill(strings["report.step"], { n: i + 1, text: protocol.steps[i].text }));
    for (const f of protocol.report_fields) expect.soft(txt).toContain(`[ ] ${f}`);
    expect.soft(txt).toContain(strings["report.placeholder_warning"]);
    expect.soft(txt).toContain(app.disclaimer);
    expect.soft(/undefined|NaN|\{\w+\}|\[object/.test(txt), "no leaked template/undefined text in .txt").toBe(false);

    // contenido .json
    expect.soft(json.app_name).toBe(app.app_name);
    expect.soft(json.environment.id).toBe(defaultEnv.id);
    expect.soft(json.delay.one_way_s).toEqual({ min: defaultEnv.comm_delay_one_way_s.min, max: defaultEnv.comm_delay_one_way_s.max });
    const group = json.readings.find((g) => g.indicator_id === bp.id);
    expect.soft(group?.readings[0]?.value).toEqual(bpValue);
    expect.soft(group?.readings[0]?.status).toBe("critical");
    expect.soft(json.emergency_actions.map((e) => e.step_index)).toEqual([0, 1, 2]);
    expect.soft(json.emergency_actions.every((e) => e.protocol_id === protocol.id)).toBe(true);
    expect.soft(json.information_to_include[0]?.fields).toEqual(protocol.report_fields);
    expect.soft(json.has_placeholders).toBe(true);
    expect.soft(json.disclaimer).toBe(app.disclaimer);
    expect.soft(Number.isNaN(Date.parse(json.generated_at.iso))).toBe(false);
    const { min, max } = defaultEnv.comm_delay_one_way_s;
    if (min !== null || max !== null) {
      const lo = (min ?? max) as number;
      const hi = (max ?? min) as number;
      const ts = json.generated_at.timestamp;
      expect.soft(json.expected_answer_window?.from, "answer window start = generated + 2 x min delay").toBe(fmtHM(ts + 2 * lo * 1000));
      expect.soft(json.expected_answer_window?.to, "answer window end = generated + 2 x max delay").toBe(fmtHM(ts + 2 * hi * 1000));
      expect.soft(txt).toContain(`${strings["report.eta"]}: ${json.expected_answer_window?.text}`);
    }

    // ---- copiar al portapapeles (si el navegador lo permite)
    try {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    } catch {
      /* permisos no soportados: se prueba el fallback manual */
    }
    await page.getByRole("button", { name: strings["report.copy"], exact: true }).click();
    // Buscar el feedback por su texto: hay otras regiones role="status" en la página (p. ej. el aviso de storage).
    const fbLocator = page
      .getByText(strings["report.copied"], { exact: true })
      .or(page.getByText(strings["report.copy_manual"], { exact: true }))
      .first();
    await fbLocator.waitFor();
    const feedback = (await fbLocator.innerText()).trim();
    console.log("COPY", project, JSON.stringify(feedback));
    expect.soft([strings["report.copied"], strings["report.copy_manual"]]).toContain(feedback);
    if (feedback === strings["report.copied"]) {
      const clip = await page.evaluate(() => navigator.clipboard.readText());
      // El portapapeles de Windows convierte \n en \r\n: comparar con saltos de línea normalizados.
      const norm = (s: string) => s.replace(/\r\n/g, "\n").trim();
      expect.soft(norm(clip)).toBe(norm(txt));
    }
    await shot(page, testInfo, "05b-report-after-copy");
  });

  // ---------------------------------------------------------------- f. fuentes
  await test.step("f. sources: every JSON source is listed, external links are safe", async () => {
    await page.getByRole("navigation", { name: strings["nav.main_label"] }).getByRole("link", { name: strings["nav.sources"], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: strings["sources.title"] })).toBeVisible();

    for (const s of sources) {
      const card = page.locator(`#source-${s.id}`);
      await expect.soft(card, `source ${s.id} listed`).toContainText(s.title);
      await expect.soft(card).toContainText(s.publisher);
      await expect.soft(card).toContainText(s.status === "VERIFIED" ? strings["badge.verified"] : strings["badge.placeholder"]);
      const link = card.locator(`a[href="${s.url}"]`);
      if (s.status === "VERIFIED") {
        await expect.soft(link, `source ${s.id} has an external link`).toHaveCount(1);
        await expect.soft(link).toHaveAttribute("target", "_blank");
        await expect.soft(link).toHaveAttribute("rel", /noopener/);
      } else {
        await expect.soft(card.locator('a[href^="http"]'), `PLACEHOLDER source ${s.id} must not be a live link`).toHaveCount(0);
      }
    }
    const verified = sources.filter((s) => s.status === "VERIFIED");
    const unsafe = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[target="_blank"]'))
        .filter((a) => !/noopener/.test(a.getAttribute("rel") ?? ""))
        .map((a) => a.getAttribute("href")),
    );
    expect.soft(unsafe, "target=_blank links without rel=noopener").toEqual([]);
    await expect.soft(page.locator('a[href^="http"]')).toHaveCount(verified.length);
    await expect.soft(page.getByTestId("summary-sources")).toContainText(fill(strings["sources.summary.verified"], { n: verified.length }));

    for (const s of verified) {
      const uncited = await page.locator(`#source-${s.id}`).getByText(strings["sources.none_cited"]).count();
      if (uncited > 0) console.log("SOURCE-UNCITED", project, s.id);
    }

    // ancla directa a una fuente
    const first = must(sources[0], "a source");
    await page.goto(`/#/sources/${first.id}`);
    await page.waitForTimeout(300);
    const activeId = await page.evaluate(() => document.activeElement?.id ?? "");
    expect.soft(activeId, "deep link focuses the source card").toBe(`source-${first.id}`);
    await shot(page, testInfo, "06-sources", true);
  });

  console.log("ISSUES", project, issues.length, JSON.stringify(issues));
  expect.soft(issues, "console errors / page errors / failed requests during the demo").toEqual([]);
});

test("demo flow: escalation message changes with the environment (fast link: contact now, no ETA)", async ({ page }, testInfo) => {
  const bp = pairIndicator();
  const value = must(criticalValueFor(bp), "critical value");
  const fast = environments.find((e) => {
    const hi = e.comm_delay_one_way_s.max ?? e.comm_delay_one_way_s.min;
    return hi !== null && hi <= app.realtime_threshold_s;
  });
  test.skip(!fast, "no environment with a verified delay under realtime_threshold_s");
  await page.goto("/#/");
  await page.getByRole("combobox", { name: strings["environment.label"], exact: true }).selectOption({ label: must(fast, "fast env").name });
  await openIndicator(page, bp);
  await enterReading(page, bp, value);
  const esc = page.locator(`section[aria-labelledby="esc-${bp.id}"]`);
  await expect(esc).toContainText(strings["escalation.ground.contact"]);
  await expect.soft(esc.locator("time")).toHaveCount(0);
  await shot(page, testInfo, "03b-check-critical-fast-env");
});

test("demo flow: g. status board with seeded readings has role=img charts", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const seed = buildSeed();
  await seedStorage(page, { [SEED_KEY]: JSON.stringify(seed) });
  await page.goto("/#/");
  await expect(page.getByRole("heading", { level: 1, name: strings["board.title"] })).toBeVisible();

  // un grafico por indicador en la seccion Trends, con nombre accesible que incluye el indicador
  // (el HUD suma una tendencia destacada del indicador elegido, fuera de esta seccion)
  const trends = page.getByRole("region", { name: strings["hud.trends"], exact: true });
  for (const ind of indicators) {
    const chart = trends.getByRole("img", { name: new RegExp(ind.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
    await expect.soft(chart, `chart role=img for ${ind.name}`).toHaveCount(1);
  }
  await expect.soft(trends.getByRole("img", { name: / trend: / })).toHaveCount(indicators.length);

  // contadores = estado de la ultima lectura sembrada, calculado con el oracle independiente
  const counts: Record<Health | "unknown", number> = { normal: 0, attention: 0, critical: 0, unknown: 0 };
  for (const ind of indicators) {
    const last = seed.filter((r) => r.indicatorId === ind.id).sort((a, b) => b.timestamp - a.timestamp)[0];
    counts[evalIndicator(ind, last.value)] += 1;
  }
  console.log("BOARD-COUNTS", testInfo.project.name, JSON.stringify(counts));
  const list = page.getByRole("list", { name: strings["board.counts_label"] });
  for (const s of ["critical", "attention", "normal", "unknown"] as const) {
    await expect.soft(list, `count of ${s}`).toContainText(new RegExp(`${counts[s]}\\s*${strings[`status.${s}`]}`));
  }

  // tabla alternativa y selector de periodo (la tarjeta se busca por nombre: el tablero ordena por estado)
  const target = must(indicators[0], "an indicator");
  const card = page.getByTestId("board-card").filter({ hasText: target.name }).first();
  await card.getByText(strings["board.chart_table"]).click();
  await expect.soft(card.getByRole("table").locator("tbody tr")).toHaveCount(5);
  await shot(page, testInfo, "07a-board-seeded", true);

  await page.getByRole("button", { name: strings["board.period.24h"], exact: true }).click();
  await expect.soft(page.getByRole("button", { name: strings["board.period.24h"], exact: true })).toHaveAttribute("aria-pressed", "true");
  const within24 = seed.filter((r) => r.indicatorId === target.id && r.timestamp >= Date.now() - 24 * 3_600_000).length;
  const label = await card.getByRole("img").first().getAttribute("aria-label");
  console.log("BOARD-24H", testInfo.project.name, label);
  expect.soft(label ?? "", "24 h chart reflects fewer readings").toMatch(new RegExp(`${within24} readings`));
  await shot(page, testInfo, "07b-board-24h");

  // "Needs attention" enlaza al chequeo del indicador
  const link = page.locator('a[href^="#/check/"]').first();
  if (await link.count()) {
    await link.click();
    await expect.soft(page).toHaveURL(/#\/check\/.+/);
  }
  await page.goto("/#/");
  const ov = await noHorizontalOverflow(page);
  expect.soft(ov.ok, `horizontal overflow: ${JSON.stringify(ov)}`).toBe(true);
});

test("demo flow: source URLs respond (network permitting, desktop only)", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "run once");
  test.setTimeout(120_000);
  for (const s of sources.filter((x) => x.status === "VERIFIED")) {
    try {
      const r = await request.get(s.url, { timeout: 15_000, maxRedirects: 5 });
      console.log("LINK", s.id, r.status(), r.url() === s.url ? "" : `redirected -> ${r.url()}`);
      expect.soft(r.status(), `source ${s.id} (${s.url}) status`).toBeLessThan(400);
    } catch (e) {
      console.log("LINK", s.id, "UNREACHABLE (network blocked?)", (e as Error).message.split("\n")[0]);
    }
  }
});
