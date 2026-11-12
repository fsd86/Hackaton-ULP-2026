import { gzipSync } from "node:zlib";
import { test, expect, type Browser } from "@playwright/test";
import { writeOut } from "./helpers";

// Medicion de carga con la Performance API (Lighthouse no esta instalado). Solo desktop.
// Loguea PERF por corrida y PERF-SUMMARY con la mediana. No falla por presupuesto: los numeros van al reporte.

interface QaMarks {
  mainVisibleAt?: number;
  lcp?: number;
  cls: number;
}

interface RunResult {
  ttfb: number;
  mainVisible: number | null;
  fcp: number | null;
  lcp: number | null;
  cls: number;
  domContentLoaded: number;
  load: number;
  jsTransfer: number;
  cssTransfer: number;
  jsDecoded: number;
  cssDecoded: number;
  jsGzip: number;
  cssGzip: number;
  files: string[];
}

async function measure(browser: Browser, url: string, throttled: boolean): Promise<RunResult> {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => {
    const w = window as unknown as { __qa: QaMarks };
    w.__qa = { cls: 0 };
    const mo = new MutationObserver(() => {
      const m = document.querySelector("main");
      if (m && (m.textContent ?? "").trim().length > 0 && w.__qa.mainVisibleAt === undefined) {
        w.__qa.mainVisibleAt = performance.now();
        mo.disconnect();
      }
    });
    mo.observe(document, { childList: true, subtree: true, characterData: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) w.__qa.lcp = e.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as Array<{ hadRecentInput: boolean; value: number }>) {
        if (!e.hadRecentInput) w.__qa.cls += e.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  const page = await ctx.newPage();
  if (throttled) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  }
  await page.goto(url, { waitUntil: "load" });
  await page.locator("main").waitFor();
  await page.waitForTimeout(1000); // deja asentar LCP / CLS

  const data = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const res = (performance.getEntriesByType("resource") as PerformanceResourceTiming[]).map((r) => ({
      name: r.name,
      transfer: r.transferSize,
      decoded: r.decodedBodySize,
    }));
    const fcp = performance.getEntriesByName("first-contentful-paint")[0];
    const w = window as unknown as { __qa: QaMarks };
    return {
      ttfb: nav.responseStart,
      dcl: nav.domContentLoadedEventEnd,
      load: nav.loadEventEnd,
      fcp: fcp ? fcp.startTime : null,
      qa: w.__qa,
      res,
    };
  });

  const js = data.res.filter((r) => /\.js(\?|$)/.test(r.name));
  const css = data.res.filter((r) => /\.css(\?|$)/.test(r.name));
  const gz = async (list: Array<{ name: string }>): Promise<number> => {
    let total = 0;
    for (const r of list) {
      const body = await page.request.get(r.name).then((x) => x.body());
      total += gzipSync(body).length; // estimacion de lo que sirve Vercel (gzip/brotli)
    }
    return total;
  };
  const sum = (list: Array<{ transfer: number; decoded: number }>, k: "transfer" | "decoded") => list.reduce((a, r) => a + r[k], 0);
  const result: RunResult = {
    ttfb: Math.round(data.ttfb),
    mainVisible: data.qa.mainVisibleAt === undefined ? null : Math.round(data.qa.mainVisibleAt),
    fcp: data.fcp === null ? null : Math.round(data.fcp),
    lcp: data.qa.lcp === undefined ? null : Math.round(data.qa.lcp),
    cls: Number(data.qa.cls.toFixed(4)),
    domContentLoaded: Math.round(data.dcl),
    load: Math.round(data.load),
    jsTransfer: sum(js, "transfer"),
    cssTransfer: sum(css, "transfer"),
    jsDecoded: sum(js, "decoded"),
    cssDecoded: sum(css, "decoded"),
    jsGzip: await gz(js),
    cssGzip: await gz(css),
    files: data.res.map((r) => `${r.name.split("/").pop()} ${r.decoded}B`),
  };
  await ctx.close();
  return result;
}

const median = (xs: number[]): number => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

test("perf: cold load of the status board (desktop)", async ({ browser, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  test.setTimeout(120_000);
  const url = `${baseURL ?? "http://localhost:4173"}/`;
  const runs: RunResult[] = [];
  for (let i = 1; i <= 3; i++) {
    const r = await measure(browser, url, false);
    runs.push(r);
    console.log("PERF", `run=${i}`, JSON.stringify(r));
  }
  const field = (k: "mainVisible" | "fcp" | "lcp" | "domContentLoaded" | "load") =>
    median(runs.map((r) => r[k]).filter((v): v is number => v !== null));
  const summary = {
    mainVisible_ms: field("mainVisible"),
    fcp_ms: field("fcp"),
    lcp_ms: field("lcp"),
    domContentLoaded_ms: field("domContentLoaded"),
    load_ms: field("load"),
    js_transfer_B: runs[0].jsTransfer,
    css_transfer_B: runs[0].cssTransfer,
    js_decoded_B: runs[0].jsDecoded,
    css_decoded_B: runs[0].cssDecoded,
    js_gzip_B: runs[0].jsGzip,
    css_gzip_B: runs[0].cssGzip,
    cls: runs[0].cls,
  };
  console.log("PERF-SUMMARY", JSON.stringify(summary));
  writeOut("perf-desktop.json", JSON.stringify({ runs, summary }, null, 2));
  expect.soft(summary.mainVisible_ms, "main visible with content (ms)").toBeGreaterThan(0);

  // Perfil lento: CPU x4 + red ~1.6 Mbps / 150 ms (aprox. "Slow 4G" de Lighthouse movil)
  const slow = await measure(browser, url, true);
  console.log("PERF-THROTTLED", JSON.stringify(slow));
  writeOut("perf-desktop-throttled.json", JSON.stringify(slow, null, 2));
});
