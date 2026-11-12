/** Etiqueta legible `<prefix>.<id>` desde strings; si falta la clave devuelve el id (sin romper en dev). */
export function labelFor(strings: Record<string, string>, prefix: string, id: string): string {
  return strings[`${prefix}.${id}`] ?? id;
}
