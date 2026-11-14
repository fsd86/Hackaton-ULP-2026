import { useContent } from "../content/ContentContext";
import { useStorageState } from "../hooks/useStorageState";
import { dismissStorageIssues } from "../storage/local";

/** Aviso no bloqueante y cerrable cuando se descartaron datos guardados corruptos. */
export function StorageNotice() {
  const { t } = useContent();
  const { issues } = useStorageState();
  // El contenedor role="status" queda siempre montado para que los lectores de pantalla anuncien el cambio.
  return (
    <div role="status" className="mx-auto max-w-[1760px] px-4">
      {issues.total > 0 && (
        <div className="glass mt-3 flex items-center justify-between gap-3 rounded-sm border-l-4 border-l-[var(--status-attention)] p-3">
          <p className="font-semibold">
            <span aria-hidden="true">⚠ </span>
            {t("storage.corrupt", { count: issues.total })}
          </p>
          <button
            type="button"
            onClick={dismissStorageIssues}
            className="inline-flex min-h-11 shrink-0 items-center rounded-sm border border-[var(--color-line)] px-4 font-bold hover:border-[var(--color-accent)]"
          >
            {t("storage.corrupt.dismiss")}
          </button>
        </div>
      )}
    </div>
  );
}
