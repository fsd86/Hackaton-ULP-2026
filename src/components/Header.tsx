import { useContent } from "../content/ContentContext";
import { EnvironmentSelect } from "./EnvironmentSelect";
import { StatusIcon } from "./StatusIcon";

export function Header({ onEmergency, emergencyActive = false }: { onEmergency: () => void; emergencyActive?: boolean }) {
  const { t, content } = useContent();
  const { app_name, tagline, theme } = content.app;
  return (
    <header className="border-b border-[var(--color-line)] bg-[var(--color-ink)]">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="min-w-0">
          <p className="text-xl font-extrabold tracking-wide sm:text-2xl">{app_name}</p>
          <p className="text-sm text-[var(--color-muted)]">{tagline}</p>
        </div>
        <div className="grid grid-cols-[1fr_auto] items-end gap-3 sm:w-[28rem]">
          <EnvironmentSelect />
          <a
            href="#/emergency"
            aria-current={emergencyActive ? "page" : undefined}
            onClick={(e) => {
              e.preventDefault();
              onEmergency();
            }}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-[var(--status-critical)] px-5 text-lg font-extrabold text-white shadow-[0_0_0_2px_var(--color-ink),0_0_0_4px_var(--status-critical)] hover:brightness-110"
          >
            <StatusIcon name={theme.status_icons.critical} className="h-6 w-6" />
            {t("emergency.button")}
          </a>
        </div>
      </div>
    </header>
  );
}
