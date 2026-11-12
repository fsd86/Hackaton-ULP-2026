import { useContent } from "../content/ContentContext";

/** Vista aún no implementada (S2–S6 la reemplazan). */
export function ViewPlaceholder({ titleKey }: { titleKey: string }) {
  const { t } = useContent();
  return (
    <section>
      <h1 className="text-3xl font-extrabold">{t(titleKey)}</h1>
      <p className="mt-3 rounded-md border border-dashed border-[var(--color-line)] p-4 text-[var(--color-muted)]">
        {t("view.placeholder")}
      </p>
    </section>
  );
}
