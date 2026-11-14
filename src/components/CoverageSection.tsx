import { useContent } from "../content/ContentContext";
import type { CoverageReport, DatumState, Tally } from "../logic/coverage";

type Level = "full" | "partial" | "none";

const levelOf = (t: Tally): Level => (t.total > 0 && t.sourced === t.total ? "full" : t.sourced > 0 ? "partial" : "none");

const COLOR: Record<Level, string> = {
  full: "var(--status-normal)",
  partial: "var(--status-attention)",
  none: "var(--color-muted)",
};

/** Ícono por nivel (forma distinta para cada uno, no solo color): ✓ círculo, ◐ medio, – guion punteado. */
function LevelIcon({ level }: { level: Level }) {
  const stroke = COLOR[level];
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-2" style={{ stroke }}>
      {level === "full" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12.5 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {level === "partial" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 0 18Z" style={{ fill: stroke }} />
        </>
      )}
      {level === "none" && (
        <>
          <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
          <path d="M8 12h8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function Cell({ level, text }: { level: Level; text: string }) {
  return (
    <span data-coverage={level} className={`inline-flex items-center gap-1.5 ${level === "none" ? "text-[var(--color-muted)]" : ""}`}>
      <LevelIcon level={level} />
      {text}
    </span>
  );
}

const th = "border-b border-[var(--color-line)] px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]";
const td = "border-b border-[var(--color-line)] px-2 py-2 align-top";

/** Tablas de cobertura por dato (indicadores, pasos de protocolo, demora por entorno). Datos de logic/coverage. */
export function CoverageSection({ coverage }: { coverage: CoverageReport }) {
  const { t } = useContent();
  const single = (s: DatumState) => (
    <Cell level={s === "sourced" ? "full" : "none"} text={t(s === "sourced" ? "coverage.state.sourced" : "coverage.state.unsourced")} />
  );
  const counted = (x: Tally) => <Cell level={levelOf(x)} text={t("coverage.count", { sourced: x.sourced, total: x.total })} />;

  return (
    <div className="mt-4 space-y-5">
      <p className="text-sm text-[var(--color-muted)]">{t("coverage.intro")}</p>

      <section aria-labelledby="coverage-indicators" data-testid="coverage-indicators">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="coverage-indicators" className="text-lg font-bold">
            {t("coverage.indicators.title")}
          </h3>
          <p className="font-semibold">{t("coverage.total", { ...coverage.totals.indicators })}</p>
        </div>
        {/* Tabla con scroll horizontal en movil: enfocable con teclado y con nombre (axe scrollable-region-focusable). */}
        <div tabIndex={0} role="region" aria-labelledby="coverage-indicators" className="mt-2 overflow-x-auto focus-visible:outline-offset-2">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <thead>
              <tr>
                <th scope="col" className={th}>{t("coverage.col.indicator")}</th>
                <th scope="col" className={th}>{t("coverage.col.how_to_measure")}</th>
                <th scope="col" className={th}>{t("coverage.col.why_it_matters")}</th>
                <th scope="col" className={th}>{t("coverage.col.frequency")}</th>
                <th scope="col" className={th}>{t("coverage.col.ranges")}</th>
                <th scope="col" className={th}>{t("coverage.col.actions")}</th>
                <th scope="col" className={th}>{t("coverage.col.total")}</th>
              </tr>
            </thead>
            <tbody>
              {coverage.indicators.map((c) => (
                <tr key={c.id} data-testid={`coverage-row-${c.id}`}>
                  <th scope="row" className={`${td} text-left font-semibold`}>{c.name}</th>
                  <td className={td}>{single(c.how_to_measure)}</td>
                  <td className={td}>{single(c.why_it_matters)}</td>
                  <td className={td}>{single(c.frequency)}</td>
                  <td className={td}>{counted(c.ranges)}</td>
                  <td className={td}>{counted(c.actions)}</td>
                  <td className={`${td} font-semibold`}>{counted(c.tally)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section aria-labelledby="coverage-protocols" data-testid="coverage-protocols">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 id="coverage-protocols" className="text-lg font-bold">
              {t("coverage.protocols.title")}
            </h3>
            <p className="font-semibold">{t("coverage.total", { ...coverage.totals.protocols })}</p>
          </div>
          <div tabIndex={0} role="region" aria-labelledby="coverage-protocols" className="mt-2 overflow-x-auto focus-visible:outline-offset-2">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th scope="col" className={th}>{t("coverage.col.protocol")}</th>
                  <th scope="col" className={th}>{t("coverage.col.steps")}</th>
                </tr>
              </thead>
              <tbody>
                {coverage.protocols.map((p) => (
                  <tr key={p.id}>
                    <th scope="row" className={`${td} text-left font-semibold`}>{p.title}</th>
                    <td className={td}>{counted(p.steps)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="coverage-environments" data-testid="coverage-environments">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 id="coverage-environments" className="text-lg font-bold">
              {t("coverage.environments.title")}
            </h3>
            <p className="font-semibold">{t("coverage.total", { ...coverage.totals.environments })}</p>
          </div>
          <div tabIndex={0} role="region" aria-labelledby="coverage-environments" className="mt-2 overflow-x-auto focus-visible:outline-offset-2">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th scope="col" className={th}>{t("coverage.col.environment")}</th>
                  <th scope="col" className={th}>{t("coverage.col.delay")}</th>
                </tr>
              </thead>
              <tbody>
                {coverage.environments.map((e) => (
                  <tr key={e.id}>
                    <th scope="row" className={`${td} text-left font-semibold`}>{e.name}</th>
                    <td className={td}>{single(e.delay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
