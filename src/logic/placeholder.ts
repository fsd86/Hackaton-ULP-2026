// Textos de data/*.json que todavía no tienen fuente verificada empiezan con el marcador "PLACEHOLDER"
// (p. ej. "PLACEHOLDER: how often to measure."). La UI nunca muestra ese marcador crudo: pasa todo texto
// de datos por estas funciones y, si es un placeholder, muestra la nota "No verified source yet" (strings).

/** Marcador de texto sin fuente usado en data/*.json (mismo token que status "PLACEHOLDER"). */
export const PLACEHOLDER_MARK = "PLACEHOLDER";

const PREFIX_RE = new RegExp(`^\\s*${PLACEHOLDER_MARK}\\b[\\s:.-]*`);

/** true si el texto es un hueco sin fuente verificada (empieza con el marcador). */
export function isPlaceholderText(text: string | undefined | null): boolean {
  return typeof text === "string" && PREFIX_RE.test(text);
}

/**
 * Tema del hueco, sin el marcador ni el punto final: "PLACEHOLDER: medication step." → "medication step".
 * Sirve para decir QUÉ falta sin mostrar el marcador. Vacío si no queda nada.
 */
export function placeholderTopic(text: string): string {
  return text.replace(PREFIX_RE, "").trim().replace(/[.\s]+$/, "");
}

type T = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Versión en texto plano (reportes, logs, aria): un texto con fuente se devuelve igual; un placeholder
 * se reemplaza por "unverified.inline" (o "unverified.note" si no hay tema).
 */
export function plainDataText(text: string, t: T): string {
  if (!isPlaceholderText(text)) return text;
  const topic = placeholderTopic(text);
  return topic ? t("unverified.inline", { topic }) : t("unverified.note");
}
