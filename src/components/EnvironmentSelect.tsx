import { useId } from "react";
import { useContent } from "../content/ContentContext";
import { useEnvironment } from "../hooks/useEnvironment";

export function EnvironmentSelect() {
  const { t } = useContent();
  const { environments, environment, setEnvironmentId } = useEnvironment();
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-[var(--color-muted)]">
        {t("environment.label")}
      </label>
      <select
        id={id}
        value={environment.id}
        onChange={(e) => setEnvironmentId(e.target.value)}
        className="min-h-11 w-full min-w-0 rounded-md border-2 border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 text-base font-semibold text-[var(--color-text)]"
      >
        {environments.map((env) => (
          <option key={env.id} value={env.id}>
            {env.name}
          </option>
        ))}
      </select>
    </div>
  );
}
