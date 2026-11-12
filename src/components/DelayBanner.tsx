import { useContent } from "../content/ContentContext";
import { useEnvironment } from "../hooks/useEnvironment";
import { classifyDelay, formatDelay } from "../logic/delay";
import { PlaceholderBadge } from "./PlaceholderBadge";
import { SourceLinks } from "./SourceLinks";

/** Elemento-firma: demora de comunicación solo ida del entorno actual, siempre visible bajo el header. */
export function DelayBanner() {
  const { t } = useContent();
  const { environment } = useEnvironment();
  const delay = environment.comm_delay_one_way_s;
  const text = formatDelay(delay, t);
  const kind = classifyDelay(delay);
  const isPlaceholder = environment.status === "PLACEHOLDER" || kind === "unknown";

  return (
    <section
      aria-label={t("environment.delay.label")}
      className="mission-grid border-b border-[var(--color-line)] bg-[var(--color-panel)]"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-2 md:flex-row md:py-4 md:items-center md:gap-8">
        <div className="min-w-0 md:flex-1">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            {t("environment.delay.label")}
          </p>
          <p aria-live="polite" className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">
            <span className="sr-only">{t("environment.delay.sr_prefix")} </span>
            {text}
          </p>
          {isPlaceholder && <PlaceholderBadge className="mt-2" />}
          <SourceLinks ids={delay.source_ids} label={t("sources.delay_sources")} className="mt-2 block" />
        </div>
        {/* Enlace visual nave—Tierra: decorativo, el dato está en el texto. */}
        <div aria-hidden="true" className="flex items-center gap-3 md:w-72">
          <span className="h-4 w-4 shrink-0 rounded-sm border-2 border-[var(--color-muted)]" />
          <span className="relative h-0.5 flex-1 bg-[var(--color-line)]">
            <span className="signal-dot" />
          </span>
          <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[var(--color-accent)]" />
        </div>
      </div>
    </section>
  );
}
