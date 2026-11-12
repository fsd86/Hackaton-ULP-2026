import { useState } from "react";
import { useContent } from "../content/ContentContext";
import { clearAll, isPersistent } from "../storage/local";
import { ConfirmDialog } from "./ConfirmDialog";

export function Footer() {
  const { t, content } = useContent();
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <footer className="border-t border-[var(--color-line)] px-4 py-6 pb-28 md:pb-6">
      <div className="mx-auto max-w-5xl space-y-2 text-sm text-[var(--color-muted)]">
        {!isPersistent() && (
          <p role="alert" className="font-semibold text-[var(--color-text)]">
            {t("storage.unavailable")}
          </p>
        )}
        <p>
          <strong className="text-[var(--color-text)]">{t("disclaimer.label")}:</strong> {content.app.disclaimer}
        </p>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="inline-flex min-h-11 items-center rounded-md border-2 border-[var(--color-line)] px-4 font-bold text-[var(--color-text)] hover:border-[var(--color-accent)]"
        >
          {t("storage.clear")}
        </button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={t("storage.clear.title")}
        body={t("storage.clear.body")}
        stayLabel={t("storage.clear.cancel")}
        leaveLabel={t("storage.clear.confirm")}
        onStay={() => setConfirmOpen(false)}
        onLeave={() => {
          clearAll();
          setConfirmOpen(false);
        }}
      />
    </footer>
  );
}
