import type { Strings } from "./schemas";

export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Crea el helper t(key, vars) sobre config/strings.en.json. Interpola {var}.
 * strict=true (dev): lanza error si falta la clave. strict=false: avisa en consola y devuelve la clave.
 */
export function createT(strings: Strings, opts: { strict: boolean }): TFunction {
  return (key, vars) => {
    const raw = strings[key];
    if (raw === undefined) {
      const msg = `Missing string key "${key}" in config/strings.en.json`;
      if (opts.strict) throw new Error(msg);
      console.warn(msg);
      return key;
    }
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, (match, name: string) =>
      Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
    );
  };
}
