import { useContext } from "react";
import { EnvironmentCtx, type EnvironmentValue } from "../environment/environmentContext";

export function useEnvironment(): EnvironmentValue {
  const ctx = useContext(EnvironmentCtx);
  if (!ctx) throw new Error("useEnvironment must be used inside <EnvironmentProvider>");
  return ctx;
}
