import { useEffect, useMemo } from "react";
import { useContent } from "../content/ContentContext";
import { CoverageSection } from "../components/CoverageSection";
import { DataText } from "../components/DataText";
import { EmptyState } from "../components/EmptyState";
import { PlaceholderBadge } from "../components/PlaceholderBadge";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { buildCitations, summarizeVerification, type Citation } from "../logic/citations";
import { buildCoverage } from "../logic/coverage";
import { panel } from "./daily/ui";

/** Vista Sources. Ruta #/sources[/<sourceId>]: la fuente indicada recibe scroll y foco. */
export function SourcesView({ param }: { param: string | undefined }) {
  const { t, content } = useContent();
  const { sources, indicators, protocols, environments, hazards, consult } = content;
  const citations = useMemo(
    () => buildCitations({ sources, indicators, environments, protocols, hazards, consult, baselineSourceIds: content.app.features.baseline ? content.app.baseline.source_ids : [] }),
    [sources, indicators, environments, protocols, hazards, consult, content.app],
  );
  const summary = summarizeVerification({ sources, indicators, protocols, environments });
  // Cobertura por dato: el status global PLACEHOLDER de un indicador escondía cuánto SÍ tiene fuente.
  const coverage = useMemo(() => buildCoverage({ indicators, protocols, environments }), [indicators, protocols, environments]);
  const target = param !== undefined ? sources.find((s) => s.id === param) : undefined;

  // setTimeout: el Shell enfoca <main> en su propio efecto (corre después de los hijos); esperamos un tick.
  useEffect(() => {
    if (!target) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`source-${target.id}`);
      el?.scrollIntoView({ block: "start" });
      el?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [target]);

  const citeText = (c: Citation): string => {
    const vars = { name: c.kind === "hazard" ? t(`hazard.${c.ownerId}`) : c.ownerName, status: c.rangeStatus ?? "", n: (c.stepIndex ?? 0) + 1, environment: c.environmentName ?? "" };
    return t(`sources.cite.${c.kind}`, vars);
  };

  // Fuentes: el status por fuente sí es por dato (cada fuente es un registro). El resto se muestra por dato abajo.
  const rows: Array<{ key: string; label: string; v: { verified: number; placeholder: number } }> = [
    { key: "sources", label: t("sources.summary.sources"), v: summary.sources },
  ];

  return (
    <section aria-labelledby="sources-title" className="space-y-6">
      <header>
        <h1 id="sources-title" className="text-3xl font-extrabold">
          {t("sources.title")}
        </h1>
        <p className="mt-1 text-[var(--color-muted)]">{t("sources.intro")}</p>
      </header>

      <section aria-labelledby="sources-summary" className={panel}>
        <h2 id="sources-summary" className="text-xl font-bold">
          {t("sources.summary.title")}
        </h2>
        <p className="mb-3 text-sm text-[var(--color-muted)]">{t("sources.summary.intro")}</p>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div data-testid="summary-total" className="rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] p-3 sm:col-span-1 lg:col-span-3">
            <dt className="font-bold">{t("coverage.title")}</dt>
            <dd className="mt-1 text-2xl font-extrabold">{t("coverage.total", { ...coverage.totals.all })}</dd>
          </div>
          {rows.map((r) => (
            <div key={r.key} data-testid={`summary-${r.key}`} className="rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] p-3">
              <dt className="font-bold">{r.label}</dt>
              <dd className="mt-1 space-y-1 text-sm">
                <p>{t("sources.summary.verified", { n: r.v.verified })}</p>
                <p>{t("sources.summary.placeholder", { n: r.v.placeholder })}</p>
              </dd>
            </div>
          ))}
        </dl>
        <CoverageSection coverage={coverage} />
      </section>

      {param !== undefined && !target && (
        <p role="alert" className="rounded-md border-2 border-[var(--status-attention)] p-3 font-semibold">
          {t("sources.not_found", { id: param })}
        </p>
      )}

      {sources.length === 0 ? (
        <EmptyState title={t("sources.empty")} help={t("sources.empty.help")} />
      ) : (
        <ul className="space-y-4">
          {sources.map((s) => {
            const cited = citations[s.id] ?? [];
            const isTarget = target?.id === s.id;
            return (
              <li key={s.id}>
                <article
                  id={`source-${s.id}`}
                  tabIndex={-1}
                  aria-labelledby={`source-title-${s.id}`}
                  className={`${panel} scroll-mt-4 outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-accent)] ${
                    isTarget ? "border-2 border-[var(--color-accent)]" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 id={`source-title-${s.id}`} className="min-w-0 break-words text-xl font-bold">
                      {s.title}
                    </h2>
                    {s.status === "VERIFIED" ? <VerifiedBadge /> : <PlaceholderBadge />}
                  </div>
                  <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-[max-content_1fr]">
                    <dt className="font-semibold text-[var(--color-muted)]">{t("sources.publisher")}</dt>
                    <dd>{s.publisher}</dd>
                    <dt className="font-semibold text-[var(--color-muted)]">{t("sources.url")}</dt>
                    <dd className="min-w-0 break-words">
                      {s.status === "VERIFIED" ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-[var(--color-accent)]"
                        >
                          {s.url}
                          <span className="sr-only"> {t("sources.open_new_tab")}</span>
                        </a>
                      ) : (
                        <span>{s.url}</span>
                      )}
                    </dd>
                    <dt className="font-semibold text-[var(--color-muted)]">{t("sources.accessed")}</dt>
                    <dd>
                      <DataText text={s.accessed} />
                    </dd>
                    {s.license && (
                      <>
                        <dt className="font-semibold text-[var(--color-muted)]">{t("sources.license")}</dt>
                        <dd>
                          <DataText text={s.license} />
                        </dd>
                      </>
                    )}
                    {s.notes && (
                      <>
                        <dt className="font-semibold text-[var(--color-muted)]">{t("sources.notes")}</dt>
                        <dd>{s.notes}</dd>
                      </>
                    )}
                  </dl>
                  <div className="mt-3">
                    <h3 className="font-semibold text-[var(--color-muted)]">{t("sources.cited_by")}</h3>
                    {cited.length === 0 ? (
                      <p>{t("sources.none_cited")}</p>
                    ) : (
                      <ul className="list-disc pl-6">
                        {/* Únicos: varias preguntas de un mismo módulo del consult citan la misma fuente. */}
                        {[...new Set(cited.map(citeText))].map((text) => (
                          <li key={text}>{text}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
