import type { AppConfig } from "../content/schemas";
import { ROUTES, type RouteDef, type RouteId } from "../hooks/useHashRoute";

export type Features = AppConfig["features"];

/** Ruta → flag que la habilita (las rutas ausentes siempre están activas). */
const ROUTE_FLAG: Partial<Record<RouteId, keyof Omit<Features, "_comment">>> = {
  emergency: "emergency_guide",
  report: "downlink_report",
};

export function isRouteEnabled(id: RouteId, features: Features): boolean {
  const flag = ROUTE_FLAG[id];
  return flag === undefined ? true : features[flag];
}

/** Entradas de la navegación principal: sin Emergency (va en el header) y sin rutas desactivadas. */
export function visibleNav(features: Features): RouteDef[] {
  return ROUTES.filter((r) => r.id !== "emergency" && isRouteEnabled(r.id, features));
}
