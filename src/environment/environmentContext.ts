import { createContext } from "react";
import type { Environment } from "../content/schemas";

export interface EnvironmentValue {
  environments: Environment[];
  environment: Environment;
  setEnvironmentId: (id: string) => void;
}

export const EnvironmentCtx = createContext<EnvironmentValue | null>(null);
