import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useContent } from "../content/ContentContext";
import { getEnvironmentId, setEnvironmentId as persistEnvironmentId } from "../storage/local";
import { EnvironmentCtx, type EnvironmentValue } from "./environmentContext";

/** Entorno actual: guardado en localStorage; si no existe o es inválido, config.default_environment. */
export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const { content } = useContent();
  const { environments, app } = content;

  const resolve = useCallback(
    (id: string | null) => environments.find((e) => e.id === id) ?? environments.find((e) => e.id === app.default_environment) ?? environments[0],
    [environments, app.default_environment],
  );

  const [currentId, setCurrentId] = useState<string>(() => resolve(getEnvironmentId()).id);

  const setEnvironmentId = useCallback(
    (id: string) => {
      const env = resolve(id);
      persistEnvironmentId(env.id);
      setCurrentId(env.id);
    },
    [resolve],
  );

  const value = useMemo<EnvironmentValue>(
    () => ({ environments, environment: resolve(currentId), setEnvironmentId }),
    [environments, currentId, resolve, setEnvironmentId],
  );

  return <EnvironmentCtx.Provider value={value}>{children}</EnvironmentCtx.Provider>;
}
