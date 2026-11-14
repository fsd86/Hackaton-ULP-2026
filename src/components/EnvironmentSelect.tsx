import { useId } from "react";
import { useContent } from "../content/ContentContext";
import { useEnvironment } from "../hooks/useEnvironment";

export function EnvironmentSelect({ className = "" }: { className?: string }) {
  const { t } = useContent();
  const { environments, environment, setEnvironmentId } = useEnvironment();
  const id = useId();
  return (
    <div data-gd="environment" className={`flex min-w-0 flex-col gap-0.5 ${className}`}>
      <label htmlFor={id} className="eyebrow !text-[0.62rem]">
        {t("environment.label")}
      </label>
      <select
        id={id}
        value={environment.id}
        onChange={(e) => setEnvironmentId(e.target.value)}
        className="min-h-10 w-full min-w-0 rounded-sm border border-[var(--color-line)] bg-[var(--color-panel-2)] px-2.5 text-sm font-semibold text-[var(--color-text)]"
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
