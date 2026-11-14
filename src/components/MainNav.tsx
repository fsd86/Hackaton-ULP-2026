import { useContent } from "../content/ContentContext";
import type { RouteId } from "../hooks/useHashRoute";
import { visibleNav } from "../logic/features";

/**
 * Navegación principal. Una sola <nav>: pestañas monoespaciadas enmarcadas en la barra superior (lg+) y
 * barra inferior fija de píldoras en móvil. El Emergency va aparte, en el header. El activo se distingue por
 * marco + marcador + aria-current (no solo por color).
 */
export function MainNav({ current }: { current: RouteId }) {
  const { t, content } = useContent();
  const items = visibleNav(content.app.features);
  return (
    <nav
      aria-label={t("nav.main_label")}
      className="glass fixed inset-x-2 bottom-2 z-40 rounded-full p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.55)] lg:static lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none"
    >
      <ul className="flex gap-1 lg:gap-2">
        {items.map((r) => {
          const active = r.id === current;
          return (
            <li key={r.id} className="min-w-0 flex-1 lg:flex-none">
              <a
                href={r.path}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center justify-center gap-1.5 rounded-full border px-2 text-center font-mono text-[0.68rem] font-semibold uppercase leading-tight tracking-wide lg:min-h-10 lg:rounded-sm lg:px-3.5 lg:text-xs lg:tracking-[0.14em] ${
                  active
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[#05080f] lg:bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] lg:text-[var(--color-accent)] lg:shadow-[inset_0_0_12px_color-mix(in_srgb,var(--color-accent)_18%,transparent)]"
                    : "border-transparent text-[var(--color-text)] hover:border-[var(--glass-border)]"
                }`}
              >
                {active && <span aria-hidden="true" className="hidden h-1.5 w-1.5 bg-current lg:block" />}
                {t(r.navKey)}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
