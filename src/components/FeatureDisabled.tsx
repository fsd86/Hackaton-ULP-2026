import { useContent } from "../content/ContentContext";

/** Aviso de ruta desactivada por config.features. */
export function FeatureDisabled({ titleKey }: { titleKey: string }) {
  const { t } = useContent();
  return (
    <section>
      <h1 className="text-3xl font-extrabold">{t(titleKey)}</h1>
      <p role="status" className="mt-4 rounded-md border-2 border-dashed border-[var(--color-line)] p-4 font-semibold">
        {t("feature.disabled")}
      </p>
    </section>
  );
}
