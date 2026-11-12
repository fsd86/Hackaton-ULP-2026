// Clases compartidas (solo estilo, sin contenido). Targets >= 44px (min-h-11).
const base =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-5 py-2 text-base font-bold disabled:opacity-50";

export const btnPrimary = `${base} bg-[var(--color-accent)] text-[#070b14] hover:brightness-110`;
export const btnSecondary = `${base} border-2 border-[var(--color-line)] bg-[var(--color-panel-2)] text-[var(--color-text)] hover:border-[var(--color-accent)]`;
export const panel = "rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] p-4";
export const inputClass =
  "min-h-11 w-full rounded-md border-2 border-[var(--color-line)] bg-[var(--color-ink)] px-3 py-2 text-lg text-[var(--color-text)]";
