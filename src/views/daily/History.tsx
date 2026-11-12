import { useContent } from "../../content/ContentContext";
import type { Environment, Indicator } from "../../content/schemas";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime, formatValue, readingsFor, statusOfReading } from "../../logic/daily";
import type { Reading } from "../../storage/local";
import { panel } from "./ui";

const LIMIT = 8;

export function History({
  indicator,
  readings,
  environments,
  env,
}: {
  indicator: Indicator;
  readings: Reading[];
  environments: Environment[];
  env: Environment;
}) {
  const { t } = useContent();
  const list = readingsFor(readings, indicator.id).slice(0, LIMIT);
  return (
    <section aria-labelledby={`hist-${indicator.id}`} className={panel}>
      <h3 id={`hist-${indicator.id}`} className="mb-2 text-xl font-bold">
        {t("daily.history")}
      </h3>
      {list.length === 0 ? (
        <p role="status" className="text-[var(--color-muted)]">
          {t("daily.history.empty")}
        </p>
      ) : (
        <ul data-testid="history-list" className="divide-y divide-[var(--color-line)]">
          {list.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>
                <span className="font-mono text-lg font-bold">
                  {formatValue(r.value)} {indicator.unit}
                </span>
                <span className="ml-3 text-sm text-[var(--color-muted)]">
                  <time dateTime={new Date(r.timestamp).toISOString()}>{formatDateTime(r.timestamp)}</time>
                </span>
              </span>
              <StatusBadge status={statusOfReading(indicator, r, environments, env)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
