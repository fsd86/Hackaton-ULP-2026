// Clases compartidas (solo estilo, sin contenido). Targets >= 44px (min-h-11).
const base =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded px-5 py-2 text-base font-bold disabled:opacity-50";

export const btnPrimary = `${base} bg-[var(--color-accent)] text-[#05080f] hover:brightness-110`;
export const btnSecondary = `${base} border border-[var(--color-line)] bg-[var(--color-panel-2)] text-[var(--color-text)] hover:border-[var(--color-accent)]`;
export const panel = "glass rounded p-4";
export const inputClass =
  "min-h-11 w-full rounded border-2 border-[var(--color-line)] bg-[var(--color-ink)] px-3 py-2 text-lg text-[var(--color-text)]";
