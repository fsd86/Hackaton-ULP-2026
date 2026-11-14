import { useContent } from "../../content/ContentContext";
import { GD_START_ATTR, useGuidedDemo } from "./guidedDemoContext";

/** Boton "Guided demo" del tablero (solo con features.guided_demo y el guion cargado). */
export function GuidedDemoButton() {
  const { t } = useContent();
  const { available, active, start } = useGuidedDemo();
  if (!available) return null;
  const attrs = { [GD_START_ATTR]: "" };
  return (
    <button
      type="button"
      {...attrs}
      disabled={active}
      onClick={start}
      title={t("guided_demo.button.help")}
      className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-[var(--color-accent)] px-3 font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] hover:bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] disabled:opacity-50"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M8 5v14l11-7z" />
      </svg>
      {t("guided_demo.button")}
    </button>
  );
}
