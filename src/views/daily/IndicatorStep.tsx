import { useEffect, useRef } from "react";
import { useContent } from "../../content/ContentContext";
import type { Environment, Indicator } from "../../content/schemas";
import { PlaceholderBadge } from "../../components/PlaceholderBadge";
import { SourceLinks } from "../../components/SourceLinks";
import { effectiveFrequency } from "../../logic/daily";
import type { ReadingValue } from "../../logic/evaluate";
import { renderIndicatorText } from "../../logic/indicatorText";
import { labelFor } from "../../logic/labels";
import type { Reading } from "../../storage/local";
import { History } from "./History";
import { ReadingInput } from "./ReadingInput";
import { ResultPanel, type StepResult } from "./ResultPanel";
import { btnPrimary, btnSecondary, panel } from "./ui";

export interface StepProps {
  indicator: Indicator;
  /** null en modo indicador suelto (sin "X of N"). */
  position: { current: number; total: number } | null;
  isFirst: boolean;
  isLast: boolean;
  result: StepResult | undefined;
  readings: Reading[];
  environments: Environment[];
  env: Environment;
  onSave: (v: ReadingValue) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onExit: () => void;
}

export function IndicatorStep(p: StepProps) {
  const { t, content } = useContent();
  const { indicator: ind } = p;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const prev = useRef<{ id: string; hasResult: boolean } | null>(null);
  const placeholder = ind.status === "PLACEHOLDER";
  const freq = effectiveFrequency(ind, p.env);
  const hasResult = p.result !== undefined;

  // Foco: al cambiar de paso va al título; al guardar la lectura (mismo paso) va al heading "Result".
  useEffect(() => {
    const before = prev.current;
    prev.current = { id: ind.id, hasResult };
    if (before && before.id === ind.id && !before.hasResult && hasResult) resultRef.current?.focus();
    else if (!before || before.id !== ind.id) titleRef.current?.focus();
  }, [ind.id, hasResult]);

  return (
    <article aria-label={ind.name} className="space-y-4">
      {p.position && (
        <p className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-accent)]">
          {t("daily.step_of", { current: p.position.current, total: p.position.total })}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <h2 ref={titleRef} tabIndex={-1} className="text-3xl font-extrabold outline-none">
          {ind.name} <span className="text-xl font-normal text-[var(--color-muted)]">({ind.unit})</span>
        </h2>
        {placeholder && <PlaceholderBadge />}
      </div>
      {ind.hazards.length > 0 && (
        <ul aria-label={t("hazard.label")} className="flex flex-wrap gap-2">
          {ind.hazards.map((h) => (
            <li key={h} className="rounded border border-[var(--color-line)] px-2 py-0.5 text-sm font-semibold">
              {labelFor(content.strings, "hazard", h)}
            </li>
          ))}
        </ul>
      )}

      <section aria-labelledby={`how-${ind.id}`} className={panel}>
        <h3 id={`how-${ind.id}`} className="mb-2 text-xl font-bold">
          {t("daily.how_to_measure")}
        </h3>
        <ol className="list-decimal space-y-1 pl-6">
          {ind.how_to_measure.map((s, i) => (
            <li key={i}>{renderIndicatorText(s, ind, p.env)}</li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section aria-labelledby={`why-${ind.id}`} className={panel}>
          <h3 id={`why-${ind.id}`} className="mb-2 text-xl font-bold">
            {t("daily.why_it_matters")}
          </h3>
          <p>{renderIndicatorText(ind.why_it_matters, ind, p.env)}</p>
          <SourceLinks ids={ind.source_ids} className="mt-3" />
        </section>
        <section aria-labelledby={`freq-${ind.id}`} className={panel}>
          <h3 id={`freq-${ind.id}`} className="mb-2 text-xl font-bold">
            {t("daily.frequency")}
          </h3>
          <p>{freq.label}</p>
        </section>
      </div>

      {p.result ? <ResultPanel indicator={ind} result={p.result} headingRef={resultRef} /> : <div className={panel}><ReadingInput key={ind.id} indicator={ind} onSubmit={p.onSave} /></div>}

      <div className="flex flex-wrap gap-3">
        {p.position ? (
          <>
            <button type="button" onClick={p.onBack} disabled={p.isFirst} className={btnSecondary}>
              {t("common.back")}
            </button>
            {!p.result && (
              <button type="button" onClick={p.onSkip} className={btnSecondary}>
                {t("daily.skip")}
              </button>
            )}
            {p.result && (
              <button type="button" onClick={p.onNext} className={btnPrimary}>
                {p.isLast ? t("daily.finish") : t("common.next")}
              </button>
            )}
          </>
        ) : (
          <button type="button" onClick={p.onExit} className={p.result ? btnPrimary : btnSecondary}>
            {t("daily.back_to_list")}
          </button>
        )}
      </div>

      <History indicator={ind} readings={p.readings} environments={p.environments} env={p.env} />
    </article>
  );
}
