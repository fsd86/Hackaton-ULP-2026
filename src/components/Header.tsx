import { useContent } from "../content/ContentContext";
import type { RouteId } from "../hooks/useHashRoute";
import { DelayBanner } from "./DelayBanner";
import { EnvironmentSelect } from "./EnvironmentSelect";
import { MainNav } from "./MainNav";
import { StatusIcon } from "./StatusIcon";

/** Glifo propio: anillo (orbita) con una linea de pulso y un punto lejano (la Tierra). Decorativo. */
function BrandGlyph() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 32 32" className="h-8 w-8 shrink-0 fill-none stroke-[var(--color-accent)]" strokeWidth="1.6">
      <circle cx="16" cy="16" r="13" strokeOpacity="0.55" strokeDasharray="2.5 3" />
      <path d="M5 17h5l2.2-5 3.3 10 2.4-7 1.6 2H27" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24.5" cy="7.5" r="2.6" className="fill-[var(--color-accent)]" stroke="none" />
    </svg>
  );
}

/** Barra superior: marca, pestañas (MainNav), entorno + demora a la Tierra siempre visible, y el boton Emergency. */
export function Header({
  current,
  onEmergency,
  emergencyActive = false,
}: {
  current: RouteId;
  onEmergency: () => void;
  emergencyActive?: boolean;
}) {
  const { t, content } = useContent();
  const { app_name, tagline, theme } = content.app;
  return (
    <header className="border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--color-ink)_86%,transparent)]">
      <div className="mx-auto grid max-w-[1760px] grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 px-4 py-2.5 lg:flex lg:flex-wrap lg:gap-x-6 lg:gap-y-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandGlyph />
          <div className="min-w-0">
            <p className="font-mono text-base font-bold uppercase leading-tight tracking-[0.14em] sm:text-lg">{app_name}</p>
            <p className="hidden text-xs leading-tight text-[var(--color-muted)] xl:block">{tagline}</p>
          </div>
        </div>

        <MainNav current={current} />

        <div className="col-span-2 row-start-2 grid grid-cols-2 items-end gap-2 lg:ml-auto lg:flex lg:items-end lg:gap-3">
          <EnvironmentSelect className="lg:w-44" />
          <DelayBanner className="self-end lg:min-h-10" />
        </div>

        {content.app.features.emergency_guide && (
          <a
            href="#/emergency"
            aria-current={emergencyActive ? "page" : undefined}
            onClick={(e) => {
              e.preventDefault();
              onEmergency();
            }}
            className="col-start-2 row-start-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[var(--emergency-bg)] px-4 font-bold text-[var(--emergency-text)] shadow-[0_0_20px_color-mix(in_srgb,var(--emergency-bg)_55%,transparent)] hover:brightness-110 lg:self-end"
          >
            <StatusIcon name={theme.status_icons.critical} className="h-5 w-5" />
            {t("emergency.button")}
          </a>
        )}
      </div>
    </header>
  );
}
