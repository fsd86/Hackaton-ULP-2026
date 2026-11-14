import { useContent } from "../content/ContentContext";

/**
 * Marca DEMO una sola vez por panel (en lugar de una por valor): texto + borde discontinuo + icono, nunca solo color.
 * El texto accesible aclara que los valores del panel son sinteticos.
 */
export function DemoChip() {
  const { t } = useContent();
  return (
    <span className="demo-chip" title={t("demo.text")}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3 w-3 shrink-0 fill-none stroke-current stroke-2">
        <path d="M9 3h6M10 3v6l-5.5 9.5A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2.5L14 9V3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span aria-hidden="true">{t("demo.tag")}</span>
      <span className="sr-only">{t("demo.panel_tag")}</span>
    </span>
  );
}
