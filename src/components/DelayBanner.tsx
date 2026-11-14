import { useContent } from "../content/ContentContext";
import { useEnvironment } from "../hooks/useEnvironment";
import { classifyDelay, formatDelay } from "../logic/delay";
import { PlaceholderBadge } from "./PlaceholderBadge";
import { SourceLinks } from "./SourceLinks";

/** Elemento-firma: demora de comunicación (solo ida) del entorno actual, compacta y siempre visible en la barra superior. */
export function DelayBanner({ className = "" }: { className?: string }) {
  const { t } = useContent();
  const { environment } = useEnvironment();
  const delay = environment.comm_delay_one_way_s;
  const text = formatDelay(delay, t);
  const kind = classifyDelay(delay);
  const isPlaceholder = environment.status === "PLACEHOLDER" || kind === "unknown";

  return (
    <div className={`glass flex min-w-0 items-center gap-3 rounded-sm px-3 py-1.5 ${className}`}>
      {/* Enlace visual nave—Tierra: decorativo, el dato está en el texto. */}
      <div aria-hidden="true" className="hidden w-14 shrink-0 items-center gap-1.5 sm:flex">
        <span className="h-2.5 w-2.5 shrink-0 rounded-[1px] border border-[var(--color-muted)]" />
        <span className="relative h-px flex-1 bg-[var(--color-line)]">
          <span className="signal-dot" />
        </span>
        <span className="h-3 w-3 shrink-0 rounded-full border border-[var(--color-accent)]" />
      </div>
      <div className="min-w-0">
        <p className="eyebrow !text-[0.62rem] leading-tight">{t("environment.delay.label")}</p>
        <p aria-live="polite" className="text-sm font-semibold leading-tight">
          <span className="sr-only">{t("environment.delay.sr_prefix")} </span>
          {text}
        </p>
        {/* La demora es una afirmación científica: su fuente se enlaza aquí, visible en todas las vistas. */}
        <SourceLinks compact ids={delay.source_ids} className="mt-1" />
      </div>
      {isPlaceholder && <PlaceholderBadge short className="shrink-0" />}
    </div>
  );
}
