import { useState } from "react";
import { useContent } from "../content/ContentContext";
import { clearAll, isPersistent } from "../storage/local";
import { ConfirmDialog } from "./ConfirmDialog";

export function Footer() {
  const { t, content } = useContent();
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <footer className="mt-8 border-t border-[var(--glass-border)] px-4 py-6 pb-[calc(7rem+var(--notice-h))] lg:pb-[calc(1.5rem+var(--notice-h))]">
      <div className="mx-auto flex max-w-[1760px] flex-col gap-3 text-sm text-[var(--color-muted)] md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          {!isPersistent() && (
            <p role="alert" className="font-semibold text-[var(--color-text)]">
              {t("storage.unavailable")}
            </p>
          )}
          <p className="max-w-3xl">
            <strong className="eyebrow !text-[var(--color-text)]">{t("disclaimer.label")}:</strong> {content.app.disclaimer}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="inline-flex min-h-11 shrink-0 items-center rounded-sm border border-[var(--color-line)] px-4 font-semibold text-[var(--color-text)] hover:border-[var(--color-accent)]"
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
