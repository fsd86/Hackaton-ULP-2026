import { useEffect, useMemo, useRef, useState } from "react";
import { useContent } from "../content/ContentContext";
import { EmptyState } from "../components/EmptyState";
import { PlaceholderBadge } from "../components/PlaceholderBadge";
import { StatusBadge } from "../components/StatusBadge";
import { useEnvironment } from "../hooks/useEnvironment";
import { downloadFile, reportFilename } from "../logic/export";
import { buildReport } from "../logic/report";
import { getEmergencyLog, getReadings, type EmergencyLogEntry, type Reading } from "../storage/local";
import { btnPrimary, btnSecondary, panel } from "./daily/ui";

type Period = "24h" | "all";
const PERIOD_MS: Record<Period, number | undefined> = { "24h": undefined, all: Number.MAX_SAFE_INTEGER }; // undefined = default de buildReport (24 h)

interface Snapshot {
  now: Date;
  readings: Reading[];
  emergencyLog: EmergencyLogEntry[];
}

function takeSnapshot(): Snapshot {
  return { now: new Date(), readings: getReadings(), emergencyLog: getEmergencyLog() };
}

/** Vista Downlink report: arma el informe con buildReport y permite copiarlo o descargarlo. */
export function ReportView() {
  const { environment } = useEnvironment();
  // key: al cambiar de entorno se recalcula la demora y la ventana de respuesta desde cero.
  return <ReportBody key={environment.id} />;
}

function ReportBody() {
  const { t, content } = useContent();
  const { environment } = useEnvironment();
  const [period, setPeriod] = useState<Period>("24h");
  const [snap, setSnap] = useState<Snapshot>(takeSnapshot);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState("");
  const [manualCopy, setManualCopy] = useState(false);
  const manualRef = useRef<HTMLTextAreaElement>(null);

  const report = useMemo(() => {
    const sinceMs = PERIOD_MS[period];
    const since = sinceMs === undefined ? snap.now.getTime() - 24 * 3_600_000 : snap.now.getTime() - sinceMs;
    return buildReport({
      content,
      environmentId: environment.id,
      readings: snap.readings,
      emergencyLog: snap.emergencyLog.filter((e) => e.timestamp >= since),
      now: snap.now,
      t,
      locale: "en",
      sinceMs,
    });
  }, [content, environment.id, period, snap, t]);

  const { json } = report;

  useEffect(() => {
    if (manualCopy) {
      manualRef.current?.focus();
      manualRef.current?.select();
    }
  }, [manualCopy]);

  function refresh() {
    setSnap(takeSnapshot());
    setFeedback("");
    setManualCopy(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(report.text);
      setManualCopy(false);
      setFeedback(t("report.copied"));
    } catch {
      // Sin permiso o sin API: mostramos un textarea readonly con el texto seleccionado.
      setManualCopy(true);
      setFeedback(t("report.copy_manual"));
    }
  }

  const stamp = snap.now;
  const appName = content.app.app_name;
  const hasReadings = json.readings.length > 0;
  const hasActions = json.emergency_actions.length > 0;

  return (
    <section aria-labelledby="report-title" className="space-y-6">
      <header>
        <h1 id="report-title" className="text-3xl font-extrabold">
          {t("report.title")}
        </h1>
        <p className="mt-1 text-[var(--color-muted)]">{t("report.intro")}</p>
      </header>

      {/* Encabezado del informe: el punto del producto es la ventana de respuesta esperada. */}
      <section aria-label={t("report.eta")} className={`${panel} mission-grid space-y-4`}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-muted)]">{t("report.eta")}</p>
          <p className="mt-1 font-mono text-3xl font-extrabold text-[var(--color-accent)] sm:text-4xl" data-testid="report-eta">
            {json.expected_answer_window ? json.expected_answer_window.text : t("report.eta_unknown")}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{t("report.eta_caption")}</p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-[var(--color-muted)]">{t("report.environment")}</dt>
            <dd className="text-lg font-bold">{json.environment.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--color-muted)]">{t("report.delay")}</dt>
            <dd className="text-lg font-bold">{json.delay.text}</dd>
          </div>
        </dl>
        <p className="text-sm text-[var(--color-muted)]">{json.generated_at.text}</p>
      </section>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="report-period" className="mb-1 block text-sm font-semibold">
            {t("report.period.label")}
          </label>
          <select
            id="report-period"
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value as Period);
              setFeedback("");
            }}
            className="min-h-11 rounded-md border-2 border-[var(--color-line)] bg-[var(--color-ink)] px-3 text-base text-[var(--color-text)]"
          >
            <option value="24h">{t("report.period.24h")}</option>
            <option value="all">{t("report.period.all")}</option>
          </select>
        </div>
        <button type="button" onClick={refresh} className={btnSecondary}>
          {t("report.refresh")}
        </button>
      </div>

      {report.hasPlaceholders && (
        <div role="note" className="flex flex-wrap items-center gap-3 rounded-md border-2 border-dashed border-[var(--status-attention)] p-3">
          <PlaceholderBadge />
          <p className="font-semibold">{t("report.placeholder_warning")}</p>
        </div>
      )}

      {!hasReadings && !hasActions && (
        <EmptyState title={t("report.readings.empty")} help={t("report.empty.hint")}>
          <p className="mt-1 text-[var(--color-muted)]">{t("report.emergency_log.empty")}</p>
        </EmptyState>
      )}

      <section aria-labelledby="report-readings" className={panel}>
        <h2 id="report-readings" className="mb-3 text-xl font-bold">
          {t("report.readings")}
        </h2>
        {!hasReadings ? (
          <p className="text-[var(--color-muted)]">{t("report.readings.empty")}</p>
        ) : (
          <div className="space-y-4">
            {json.readings.map((g) => (
              <div key={g.indicator_id}>
                <h3 className="font-bold">{g.name}</h3>
                <ul className="divide-y divide-[var(--color-line)]">
                  {g.readings.map((r) => (
                    <li key={r.timestamp} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <span>
                        <span className="font-mono text-lg font-bold">
                          {r.value_text} {r.unit}
                        </span>
                        <span className="ml-3 text-sm text-[var(--color-muted)]">{t("report.reading_at", { time: r.time })}</span>
                      </span>
                      <StatusBadge status={r.status} live={false} />
                    </li>
                  ))}
                </ul>
                {g.trend && <p className="mt-1 text-sm text-[var(--color-muted)]">{g.trend.text}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="report-emergency" className={panel}>
        <h2 id="report-emergency" className="mb-3 text-xl font-bold">
          {t("report.emergency_log")}
        </h2>
        {!hasActions ? (
          <p className="text-[var(--color-muted)]">{t("report.emergency_log.empty")}</p>
        ) : (
          <ol className="space-y-2">
            {json.emergency_actions.map((e, i) => (
              <li key={i} className="flex flex-wrap items-baseline justify-between gap-2">
                <span>
                  <span className="font-bold">{e.protocol_title}</span>
                  {" — "}
                  {t("report.step", { n: e.step_index + 1, text: e.step_text })}
                </span>
                <span className="font-mono font-bold">{e.time}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="report-fields" className={panel}>
        <h2 id="report-fields" className="mb-1 text-xl font-bold">
          {t("report.fields")}
        </h2>
        <p className="mb-3 text-sm text-[var(--color-muted)]">{t("report.fields.hint")}</p>
        {json.information_to_include.length === 0 ? (
          <p className="text-[var(--color-muted)]">{t("report.fields.empty")}</p>
        ) : (
          <div className="space-y-4">
            {json.information_to_include.map((p) => (
              <fieldset key={p.protocol_id}>
                <legend className="mb-1 font-bold">{p.protocol_title}</legend>
                <ul>
                  {p.fields.map((f, i) => {
                    const key = `${p.protocol_id}:${i}`;
                    const id = `rf-${p.protocol_id}-${i}`;
                    return (
                      <li key={key}>
                        <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3 py-1">
                          <input
                            id={id}
                            type="checkbox"
                            checked={checked[key] ?? false}
                            onChange={(e) => setChecked((c) => ({ ...c, [key]: e.target.checked }))}
                            className="h-6 w-6 shrink-0 accent-[var(--color-accent)]"
                          />
                          <span>{f}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="report-export" className={panel}>
        <h2 id="report-export" className="mb-3 text-xl font-bold">
          {t("report.export")}
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={() => void copy()} className={btnPrimary}>
            {t("report.copy")}
          </button>
          <button
            type="button"
            onClick={() => downloadFile(reportFilename(appName, stamp, "txt"), "text/plain;charset=utf-8", report.text)}
            className={btnSecondary}
          >
            {t("report.download_txt")}
          </button>
          <button
            type="button"
            onClick={() =>
              downloadFile(reportFilename(appName, stamp, "json"), "application/json", JSON.stringify(report.json, null, 2))
            }
            className={btnSecondary}
          >
            {t("report.download_json")}
          </button>
        </div>
        <p role="status" aria-live="polite" className="mt-3 min-h-6 font-semibold">
          {feedback}
        </p>
        {manualCopy && (
          <textarea
            ref={manualRef}
            readOnly
            value={report.text}
            aria-label={t("report.copy_manual.label")}
            rows={8}
            className="mt-2 w-full rounded-md border-2 border-[var(--color-line)] bg-[var(--color-ink)] p-3 font-mono text-sm text-[var(--color-text)]"
          />
        )}
      </section>

      <section aria-labelledby="report-preview">
        <h2 id="report-preview" className="text-xl font-bold">
          {t("report.preview")}
        </h2>
        <p className="mb-2 text-sm text-[var(--color-muted)]">{t("report.preview.hint")}</p>
        <pre
          tabIndex={0}
          aria-labelledby="report-preview"
          className="max-h-96 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] p-4 font-mono text-sm leading-relaxed"
        >
          {report.text}
        </pre>
      </section>
    </section>
  );
}
