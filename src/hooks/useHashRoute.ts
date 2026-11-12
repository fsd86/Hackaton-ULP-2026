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

export function parseHash(hash: string): RouteDef {
  const normalized = hash.replace(/^#/, "").replace(/\/+$/, "") || "/";
  return ROUTES.find((r) => r.path.replace(/^#/, "") === normalized) ?? ROUTES[0];
}

function subscribe(cb: () => void): () => void {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

const getSnapshot = (): string => window.location.hash;
const getServerSnapshot = (): string => "";

export function useHashRoute(): { route: RouteDef; navigate: (id: RouteId) => void } {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const navigate = useCallback((id: RouteId) => {
    const target = ROUTES.find((r) => r.id === id);
    if (target) window.location.hash = target.path;
  }, []);
  return { route: parseHash(hash), navigate };
}
