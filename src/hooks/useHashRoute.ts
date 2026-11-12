import { useCallback, useSyncExternalStore } from "react";

export type RouteId = "home" | "check" | "emergency" | "report" | "sources";

export interface RouteDef {
  id: RouteId;
  path: string;
  navKey: string;
}

/** Estructura de ruteo (no es contenido): el texto visible sale de navKey en strings. */
export const ROUTES: readonly RouteDef[] = [
  { id: "home", path: "#/", navKey: "nav.home" },
  { id: "check", path: "#/check", navKey: "nav.daily_check" },
  { id: "emergency", path: "#/emergency", navKey: "nav.emergency" },
  { id: "report", path: "#/report", navKey: "nav.report" },
  { id: "sources", path: "#/sources", navKey: "nav.sources" },
];

function segments(hash: string): string[] {
  return hash.replace(/^#/, "").split("/").filter((s) => s.length > 0);
}

/** "#/emergency/<id>" → ruta emergency (el parámetro se ignora aquí). Retrocompatible. */
export function parseHash(hash: string): RouteDef {
  const [first] = segments(hash);
  const normalized = first ? `/${first}` : "/";
  return ROUTES.find((r) => r.path.replace(/^#/, "") === normalized) ?? ROUTES[0];
}

/** "#/emergency/<id>" → "<id>" (decodificado); undefined si no hay segundo segmento. */
export function parseHashParam(hash: string): string | undefined {
  const [, second] = segments(hash);
  if (second === undefined) return undefined;
  try {
    return decodeURIComponent(second);
  } catch {
    return second;
  }
}

function subscribe(cb: () => void): () => void {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

const getSnapshot = (): string => window.location.hash;
const getServerSnapshot = (): string => "";

export function useHashRoute(): {
  route: RouteDef;
  param: string | undefined;
  navigate: (id: RouteId, param?: string) => void;
} {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const navigate = useCallback((id: RouteId, param?: string) => {
    const target = ROUTES.find((r) => r.id === id);
    if (target) window.location.hash = param ? `${target.path}/${encodeURIComponent(param)}` : target.path;
  }, []);
  return { route: parseHash(hash), param: parseHashParam(hash), navigate };
}
