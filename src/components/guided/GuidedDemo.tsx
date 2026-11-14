import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type MutableRefObject, type ReactNode } from "react";
import { useContent } from "../../content/ContentContext";
import type { GuidedDemoAction } from "../../content/schemas";
import { useEnvironment } from "../../hooks/useEnvironment";
import { useStorageState } from "../../hooks/useStorageState";
import { buildBoard } from "../../logic/board";
import { isRouteEnabled } from "../../logic/features";
import { parseStepRoute, stepTarget } from "../../logic/guidedDemo";
import {
  addGuidedDemoReadings,
  beginGuidedDemoSandbox,
  clearEmergencySession,
  endGuidedDemoSandbox,
  getReadings,
  hasDemoReadings,
} from "../../storage/local";
import { GD_START_ATTR, GuidedDemoCtx, type GuidedDemoValue } from "./guidedDemoContext";

// ---- prefers-reduced-motion (se sigue en vivo) ----
const RM_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeRM(cb: () => void): () => void {
  const mq = globalThis.matchMedia?.(RM_QUERY);
  mq?.addEventListener("change", cb);
  return () => mq?.removeEventListener("change", cb);
}
const getRM = (): boolean => globalThis.matchMedia?.(RM_QUERY).matches ?? false;
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeRM, getRM, () => false);
}

/** Espera un elemento (la vista puede estar montandose); null si no aparece a tiempo o se cancela. */
function waitFor(selector: string, cancelled: () => boolean, timeoutMs = 3000): Promise<Element | null> {
  const t0 = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      if (cancelled()) return resolve(null);
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      if (Date.now() - t0 > timeoutMs) return resolve(null);
      setTimeout(tick, 50);
    };
    tick();
  });
}

interface Run {
  index: number;
  paused: boolean;
  /** Entorno elegido antes de la demo (se restaura al salir). */
  prevEnvId: string;
  /** La demo cargo las lecturas DEMO (no habia ninguna). */
  loadedDemo: boolean;
  /** No hay lecturas DEMO en el contenido: el tablero puede verse vacio. */
  missingDemo: boolean;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Modo "Guided demo": recorre el guion de data/guided-demo.json (escenario de emergencia en Marte) para grabar el
 * video. Todo lo que toca (entorno, sesion y log de emergencia, lecturas DEMO) se restaura al salir
 * (storage/local.ts → caja de arena). El overlay es un hermano fijo del contenido: nunca un ancestro de .hero-img.
 * Reduced motion: la demo arranca en pausa (sin avance automatico; se avanza con Next) y sin transiciones ni scroll animado.
 */
export function GuidedDemoProvider({ children }: { children: ReactNode }) {
  const { content } = useContent();
  const { environment, setEnvironmentId } = useEnvironment();
  const demo = content.guidedDemo;
  const features = content.app.features;
  const reduced = usePrefersReducedMotion();
  const [run, setRun] = useState<Run | null>(null);
  const executed = useRef(new Set<number>());

  const available =
    demo !== null &&
    features.guided_demo &&
    demo.steps.every((s) => {
      const r = parseStepRoute(s.route);
      return r !== null && isRouteEnabled(r.id, features);
    });

  const start = useCallback(() => {
    if (!demo || run) return;
    beginGuidedDemoSandbox();
    executed.current = new Set();
    let loadedDemo = false;
    let missingDemo = false;
    if (!hasDemoReadings()) {
      if (content.demoReadings.length > 0) {
        const at = Date.now();
        addGuidedDemoReadings(
          content.demoReadings.map((r) => ({
            indicatorId: r.indicator_id,
            value: r.value,
            environmentId: demo.scenario.environment_id,
            timestamp: at - r.minutes_ago * 60_000,
          })),
        );
        loadedDemo = true;
      } else {
        missingDemo = true;
      }
    }
    setRun({ index: 0, paused: reduced, prevEnvId: environment.id, loadedDemo, missingDemo });
  }, [demo, run, content.demoReadings, reduced, environment.id]);

  const exit = useCallback(() => {
    if (!run) return;
    setRun(null);
    if (window.location.hash !== "#/") window.location.hash = "#/";
    setEnvironmentId(run.prevEnvId);
    endGuidedDemoSandbox();
    // El foco vuelve al boton "Guided demo" (despues de que el tablero se monte y el shell enfoque <main>).
    const t0 = Date.now();
    const tick = () => {
      const btn = document.querySelector<HTMLElement>(`[${GD_START_ATTR}]`);
      if (btn && !btn.hasAttribute("disabled")) btn.focus();
      else if (Date.now() - t0 < 2000) setTimeout(tick, 50);
    };
    setTimeout(tick, 50);
  }, [run, setEnvironmentId]);

  const value = useMemo<GuidedDemoValue>(() => ({ available, active: run !== null, start }), [available, run, start]);

  return (
    <GuidedDemoCtx.Provider value={value}>
      {children}
      {run && demo && <GuidedDemoOverlay run={run} setRun={setRun} exit={exit} executed={executed} reduced={reduced} />}
    </GuidedDemoCtx.Provider>
  );
}

function GuidedDemoOverlay({
  run,
  setRun,
  exit,
  executed,
  reduced,
}: {
  run: Run;
  setRun: (fn: (r: Run | null) => Run | null) => void;
  exit: () => void;
  executed: MutableRefObject<Set<number>>;
  reduced: boolean;
}) {
  const { t, content } = useContent();
  const { setEnvironmentId } = useEnvironment();
  const { readingsRev } = useStorageState();
  const demo = content.guidedDemo!;
  const { scenario } = demo;
  const total = demo.steps.length;
  const step = demo.steps[run.index]!;
  const last = run.index === total - 1;
  const panelRef = useRef<HTMLElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);

  // Variables del escenario para captions y selectores. El estado de la alerta se evalua con las lecturas guardadas.
  const vars = useMemo(() => {
    const ind = content.indicators.find((i) => i.id === scenario.alert_indicator_id);
    const env = content.environments.find((e) => e.id === scenario.environment_id);
    const protocol = content.protocols.find((p) => p.id === scenario.protocol_id);
    const board = buildBoard({
      content: { indicators: content.indicators, environments: content.environments },
      environmentId: scenario.environment_id,
      readings: getReadings(),
      now: Date.now(),
    });
    const status = board.entries.find((e) => e.indicatorId === scenario.alert_indicator_id)?.status ?? "unknown";
    const zoneId = ind?.body_zone ?? "body";
    return {
      zoneId,
      indicatorId: scenario.alert_indicator_id,
      text: {
        environment: env?.name ?? scenario.environment_id,
        indicator: ind?.name ?? scenario.alert_indicator_id,
        status: t(`status.${status}`),
        zone: t(`zone.${zoneId}`),
        protocol: protocol?.title ?? scenario.protocol_id,
      },
    };
    // readingsRev: se recalcula al cargar/quitar las lecturas DEMO.
  }, [content, scenario, t, readingsRev]); // eslint-disable-line react-hooks/exhaustive-deps

  const selector = stepTarget(step, { zone: vars.zoneId, indicator: vars.indicatorId });

  // Entrar a un paso: ruta + accion (una sola vez por paso; volver con Previous no la repite).
  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;
    const action: GuidedDemoAction | undefined = executed.current.has(run.index) ? undefined : step.action;
    // open_protocol: sesion de emergencia nueva (la anterior quedo guardada en la caja de arena).
    if (action?.type === "open_protocol") {
      clearEmergencySession();
      executed.current.add(run.index);
    }
    if (window.location.hash !== step.route) window.location.hash = step.route;
    const runAction = async () => {
      if (!action) return;
      if (action.type === "set_environment") {
        setEnvironmentId(scenario.environment_id);
      } else if (action.type === "select_alert_zone") {
        const el = await waitFor(`[data-zone="${vars.zoneId}"]`, isCancelled);
        if (!(el instanceof HTMLElement)) return;
        if (el.getAttribute("aria-pressed") !== "true") el.click();
      } else if (action.type === "mark_step_done") {
        const el = await waitFor('[data-gd="mark-done"]', isCancelled);
        if (!(el instanceof HTMLElement)) return;
        el.click();
      } else {
        return; // open_protocol ya se hizo arriba
      }
      executed.current.add(run.index);
    };
    void runAction();
    return () => {
      cancelled = true;
    };
    // Solo al cambiar de paso.
  }, [run.index]); // eslint-disable-line react-hooks/exhaustive-deps

  // Destacado: sigue al elemento (scroll, cambios de layout). Se lleva a la vista una vez, despues de que la vista
  // haga su propio foco/scroll (ProtocolRun enfoca el titulo del paso).
  useEffect(() => {
    setRect(null);
    if (!selector) return;
    let raf = 0;
    let el: Element | null = null;
    let scrolled = false;
    const t0 = performance.now();
    const tick = () => {
      if (!el || !el.isConnected) el = document.querySelector(selector);
      if (el) {
        if (!scrolled && performance.now() - t0 > 200) {
          scrolled = true;
          // Movil: el panel ocupa la parte de abajo, asi que el objetivo va arriba (respeta scroll-padding-top).
          const narrow = !(globalThis.matchMedia?.("(min-width: 1024px)").matches ?? true);
          el.scrollIntoView({ block: narrow ? "start" : "center", inline: "nearest", behavior: reduced ? "auto" : "smooth" });
        }
        const r = el.getBoundingClientRect();
        setRect((p) =>
          p && p.top === r.top && p.left === r.left && p.width === r.width && p.height === r.height
            ? p
            : { top: r.top, left: r.left, width: r.width, height: r.height },
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [selector, run.index, reduced]);

  // Avance automatico: duration_ms por paso; Pause guarda lo que falta. En el ultimo paso se detiene (no sale sola).
  const remaining = useRef({ index: -1, ms: 0 });
  useEffect(() => {
    if (remaining.current.index !== run.index) remaining.current = { index: run.index, ms: step.duration_ms };
    if (run.paused) return;
    const t0 = Date.now();
    const id = setTimeout(() => {
      remaining.current.ms = 0;
      setRun((r) => (r ? (r.index < total - 1 ? { ...r, index: r.index + 1 } : { ...r, paused: true }) : r));
    }, remaining.current.ms);
    return () => {
      clearTimeout(id);
      remaining.current.ms = Math.max(0, remaining.current.ms - (Date.now() - t0));
    };
  }, [run.index, run.paused, step.duration_ms, total, setRun]);

  // Foco: al empezar va al panel; al cambiar de paso, si la vista se lo llevo (el shell enfoca <main>, la emergencia
  // enfoca el titulo del paso), vuelve al ultimo control usado del panel.
  useEffect(() => {
    const id = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel || panel.contains(document.activeElement)) return;
      const target = lastFocused.current;
      if (target && panel.contains(target) && !target.hasAttribute("disabled")) target.focus({ preventScroll: true });
      else panel.focus({ preventScroll: true });
    }, 250);
    return () => clearTimeout(id);
  }, [run.index]);

  // Esc sale desde cualquier lugar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        exit();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [exit]);

  const go = (delta: number) => setRun((r) => (r ? { ...r, index: Math.min(total - 1, Math.max(0, r.index + delta)) } : r));
  const pad = 6;
  const btn =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border px-3 text-sm font-bold disabled:opacity-50";

  return (
    <>
      {rect && (
        <div
          aria-hidden="true"
          data-gd-spotlight
          className="gd-spotlight"
          style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
        />
      )}
      <section
        ref={panelRef}
        tabIndex={-1}
        aria-labelledby="gd-title"
        data-gd-panel
        className="gd-panel"
        onFocus={(e) => {
          if (e.target !== panelRef.current) lastFocused.current = e.target as HTMLElement;
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="gd-title" className="eyebrow flex items-center gap-2 !text-[var(--color-accent)]">
            {t("guided_demo.title")}
            <span className="rounded-sm border border-dashed border-[var(--status-attention)] px-1.5 font-mono text-[0.62rem] text-[var(--color-text)]">
              {t("demo.title")}
            </span>
          </h2>
          {run.paused && <span className="font-mono text-xs font-semibold uppercase text-[var(--color-muted)]">{t("guided_demo.paused")}</span>}
        </div>
        <div aria-live="polite" aria-atomic="true" data-gd-caption className="mt-1.5">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]" data-gd-step={step.id}>
            {t("guided_demo.step_of", { current: run.index + 1, total })}
          </p>
          <p className="mt-1 text-base leading-snug text-[var(--color-text)]">{t(step.caption_key, vars.text)}</p>
        </div>
        {(run.loadedDemo || run.missingDemo || reduced) && (
          <ul className="mt-2 space-y-1 text-xs text-[var(--color-muted)]">
            {run.loadedDemo && <li>{t("guided_demo.demo_loaded")}</li>}
            {run.missingDemo && <li>{t("guided_demo.demo_missing")}</li>}
            {reduced && <li>{t("guided_demo.reduced_motion")}</li>}
          </ul>
        )}
        <div role="group" aria-label={t("guided_demo.controls")} className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={`${btn} border-[var(--color-line)] bg-[var(--color-panel-2)] text-[var(--color-text)]`} disabled={run.index === 0} onClick={() => go(-1)}>
            {t("guided_demo.previous")}
          </button>
          <button
            type="button"
            className={`${btn} border-[var(--color-line)] bg-[var(--color-panel-2)] text-[var(--color-text)]`}
            onClick={() => setRun((r) => (r ? { ...r, paused: !r.paused } : r))}
          >
            {run.paused ? t("guided_demo.resume") : t("guided_demo.pause")}
          </button>
          <button
            type="button"
            className={`${btn} border-[var(--color-accent)] bg-[var(--color-accent)] text-[#05080f]`}
            onClick={() => (last ? exit() : go(1))}
          >
            {last ? t("guided_demo.finish") : t("guided_demo.next")}
          </button>
          <button type="button" className={`${btn} border-[var(--color-line)] bg-transparent text-[var(--color-text)]`} onClick={exit}>
            {t("guided_demo.exit")}
          </button>
        </div>
      </section>
    </>
  );
}
