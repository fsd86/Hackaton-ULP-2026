import { useMemo } from "react";
import { useContent } from "../content/ContentContext";
import type { Baseline } from "../logic/baseline";
import { getBaseline } from "../storage/local";
import { useStorageState } from "./useStorageState";

/** Linea de base guardada (validada); null si no hay o si la funcion baseline esta apagada en config. */
export function useBaseline(): Baseline | null {
  const { content } = useContent();
  const { baselineRev, version } = useStorageState();
  const on = content.app.features.baseline;
  // baselineRev / version cambian al guardar, quitar o borrar todo: se relee el almacenamiento.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => (on ? getBaseline() : null), [on, baselineRev, version]);
}
