import type { CSSProperties, Ref } from "react";
import { useContent } from "../../content/ContentContext";
import type { Indicator } from "../../content/schemas";
import { SourceLinks } from "../../components/SourceLinks";
import { StatusBadge } from "../../components/StatusBadge";
import { useEnvironment } from "../../hooks/useEnvironment";
import type { EvalStatus } from "../../logic/evaluate";
import type { EscalationResult } from "../../logic/escalation";
import { formatTime } from "../../logic/daily";
import { renderIndicatorText } from "../../logic/indicatorText";
import type { Reading } from "../../storage/local";
import { btnSecondary, panel } from "./ui";

export interface StepResult {
  reading: Reading;
  status: EvalStatus;
  escalation: EscalationResult;
}

const LEVEL_COLOR: Record<string, string> = {
  self: "var(--status-normal)",
  crew: "var(--status-attention)",
  ground: "var(--status-critical)",
};

export function escalationVars(esc: EscalationResult): Record<string, string> {
  return esc.eta ? { earliest: formatTime(esc.eta.earliest), latest: formatTime(esc.eta.latest) } : {};
}

/** Resultado + qué hacer + escalamiento (el diferencial: quién y cuándo podría responder). */
export function ResultPanel({
  indicator,
  result,
  headingRef,
}: {
  indicator: Indicator;
  result: StepResult;
  /** Para mover el foco al heading "Result" tras guardar. */
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  const { t, content } = useContent();
  const emergencyOn = content.app.features.emergency_guide;
  const { environment } = useEnvironment();
  const { status, escalation, reading } = result;
  const actions = status === "unknown" ? undefined : indicator.actions[status];
  const style = { "--lc": LEVEL_COLOR[escalation.level] } as CSSProperties;
  // Fuentes de los rangos que definen este estado (base, secundarios y override del entorno actual).
  const overrideRanges = environment.indicator_overrides[indicator.id]?.ranges ?? [];
  const rangeSourceIds =
    status === "unknown"
      ? []
      : [...indicator.ranges, ...(indicator.ranges_secondary ?? []), ...overrideRanges]
          .filter((r) => r.status === status)
          .flatMap((r) => r.source_ids);

  return (
    <div className="space-y-4">
      <section aria-labelledby={`res-${indicator.id}`} className={panel}>
        <h3 ref={headingRef} tabIndex={-1} id={`res-${indicator.id}`} className="mb-2 text-xl font-bold outline-none">
          {t("daily.result")}
        </h3>
        <StatusBadge status={status} />
        <p className="mt-2 text-sm text-[var(--color-muted)]">{t("daily.saved_at", { time: formatTime(reading.timestamp) })}</p>
        <SourceLinks ids={rangeSourceIds} className="mt-2" />
      </section>

      <section aria-labelledby={`todo-${indicator.id}`} className={panel}>
        <h3 id={`todo-${indicator.id}`} className="mb-2 text-xl font-bold">
          {t("daily.what_to_do")}
        </h3>
        {actions && actions.text.length > 0 ? (
          <ul className="list-disc space-y-1 pl-6">
            {actions.text.map((line, i) => (
              <li key={i}>{renderIndicatorText(line, indicator, environment)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-[var(--color-muted)]">{t("daily.no_actions")}</p>
        )}
      </section>

      <section
        aria-labelledby={`esc-${indicator.id}`}
        style={style}
        className="rounded-md border-2 border-l-8 border-[var(--lc)] bg-[color-mix(in_srgb,var(--lc)_12%,var(--color-panel))] p-4"
      >
        <h3 id={`esc-${indicator.id}`} className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">
          {t("escalation.label")}
        </h3>
        <p className="mt-1 text-2xl font-extrabold">{t(`escalation.level.${escalation.level}`)}</p>
        <p className="mt-2 text-lg">{t(escalation.messageKey, escalationVars(escalation))}</p>
        {escalation.eta && (
          <dl className="mt-3 grid grid-cols-2 gap-3 font-mono">
            <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] p-3">
              <dt className="font-sans text-sm text-[var(--color-muted)]">{t("escalation.eta.earliest")}</dt>
              <dd className="text-2xl font-bold">
                <time dateTime={escalation.eta.earliest.toISOString()}>{formatTime(escalation.eta.earliest)}</time>
              </dd>
            </div>
            <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] p-3">
              <dt className="font-sans text-sm text-[var(--color-muted)]">{t("escalation.eta.latest")}</dt>
              <dd className="text-2xl font-bold">
                <time dateTime={escalation.eta.latest.toISOString()}>{formatTime(escalation.eta.latest)}</time>
              </dd>
            </div>
          </dl>
        )}
        {escalation.protocolId && emergencyOn && (
          <a href={`#/emergency/${encodeURIComponent(escalation.protocolId)}`} className={`${btnSecondary} mt-4`}>
            {t("escalation.open_protocol")}
          </a>
        )}
      </section>
    </div>
  );
}
