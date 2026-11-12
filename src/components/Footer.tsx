import { useContent } from "../content/ContentContext";
import { isPersistent } from "../storage/local";

export function Footer() {
  const { t, content } = useContent();
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
      </div>
    </footer>
  );
}
