import { useContent } from "../content/ContentContext";

/**
 * Aviso fijo y siempre visible en todas las vistas: prototipo educativo, no es consejo medico.
 * Movil: justo encima de la barra de pestanas fija (MainNav); lg+: franja al pie de la ventana.
 * El alto reservado vive en index.css (--notice-h): padding inferior del footer, scroll-padding y --hero-top.
 * Es position: fixed y hermano de <main>, asi que no crea contexto de apilamiento sobre .hero-img.
 */
export function PrototypeNotice() {
  const { t } = useContent();
  return (
    <p role="note" data-prototype-notice className="prototype-notice">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-[var(--status-attention)] stroke-2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.5h.01" strokeLinecap="round" />
      </svg>
      <span>{t("notice.prototype")}</span>
    </p>
  );
}
