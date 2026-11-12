import { useContent } from "../content/ContentContext";
import { useStorageState } from "../hooks/useStorageState";
import { dismissStorageIssues } from "../storage/local";

/** Aviso no bloqueante y cerrable cuando se descartaron datos guardados corruptos. */
export function StorageNotice() {
  const { t } = useContent();
  const { issues } = useStorageState();
  // El contenedor role="status" queda siempre montado para que los lectores de pantalla anuncien el cambio.
  return (
    <div role="status" className="mx-auto max-w-5xl px-4">
      {issues.total > 0 && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-md border-2 border-[var(--status-attention)] bg-[var(--color-panel)] p-3">
          <p className="font-semibold">
            <span aria-hidden="true">⚠ </span>
            {t("storage.corrupt", { count: issues.total })}
          </p>
          <button
            type="button"
            onClick={dismissStorageIssues}
            className="inline-flex min-h-11 shrink-0 items-center rounded-md border-2 border-[var(--color-line)] px-4 font-bold hover:border-[var(--color-accent)]"
          >
            {t("storage.corrupt.dismiss")}
          </button>
        </div>
      )}
    </div>
  );
}
