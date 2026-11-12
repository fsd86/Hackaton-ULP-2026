import { useContent } from "../content/ContentContext";
import { ROUTES, type RouteId } from "../hooks/useHashRoute";

/** Navegación principal: barra inferior fija en móvil, inline bajo el banner en escritorio. El Emergency va en el header. */
export function MainNav({ current }: { current: RouteId }) {
  const { t } = useContent();
  const items = ROUTES.filter((r) => r.id !== "emergency");
  return (
    <nav
      aria-label={t("nav.main_label")}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-line)] bg-[var(--color-panel)] md:static md:border-t-0 md:border-b"
    >
      <ul className="mx-auto flex max-w-5xl">
        {items.map((r) => {
          const active = r.id === current;
          return (
            <li key={r.id} className="min-w-0 flex-1 md:flex-none">
              <a
                href={r.path}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 items-center justify-center border-t-4 px-2 text-center text-sm font-bold leading-tight md:min-h-12 md:border-t-0 md:border-b-4 md:px-5 md:text-base ${
                  active
                    ? "border-[var(--color-accent)] bg-[var(--color-panel-2)] text-[var(--color-text)]"
                    : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {t(r.navKey)}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
