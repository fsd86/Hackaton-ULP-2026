import { createContext, useContext } from "react";

export interface GuidedDemoValue {
  /** Flag features.guided_demo activo, hay guion y todas sus vistas estan habilitadas. */
  available: boolean;
  active: boolean;
  start: () => void;
}

export const GuidedDemoCtx = createContext<GuidedDemoValue>({ available: false, active: false, start: () => {} });

export function useGuidedDemo(): GuidedDemoValue {
  return useContext(GuidedDemoCtx);
}

/** Atributo del boton que inicia la demo: el foco vuelve ahi al salir. */
export const GD_START_ATTR = "data-gd-start";
