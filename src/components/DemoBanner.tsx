import { useContent } from "../content/ContentContext";
import { useStorageState } from "../hooks/useStorageState";
import { hasDemoReadings, removeDemoReadings } from "../storage/local";

/**
 * Cartel fijo "DEMO DATA": visible en todas las vistas mientras haya lecturas de demostracion guardadas.
 * Texto + icono + borde discontinuo (no solo color). El contenedor role="status" queda montado para anunciar el cambio.
 */
export function DemoBanner() {
  const { t } = useContent();
  useStorageState(); // se suscribe: readingsRev cambia al cargar/quitar la demo
  const active = hasDemoReadings();
  return (
    <div role="status" className="sticky top-0 z-20">
      {active && (
        <div className="border-b border-dashed border-[var(--status-attention)] bg-[var(--color-panel)]">
          <div className="mx-auto flex max-w-[1760px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5">
            <p className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="inline-flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.16em]">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-[var(--status-attention)] stroke-2">
                  <path d="M9 3h6M10 3v6l-5.5 9.5A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2.5L14 9V3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7.5 15h9" strokeLinecap="round" />
                </svg>
                {t("demo.title")}
              </span>
              <span className="text-sm text-[var(--color-muted)]">{t("demo.text")}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                removeDemoReadings();
                document.getElementById("main")?.focus();
              }}
              className="inline-flex min-h-11 items-center rounded-sm border border-[var(--color-line)] px-3 text-sm font-semibold hover:border-[var(--color-accent)]"
            >
              {t("demo.remove")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
