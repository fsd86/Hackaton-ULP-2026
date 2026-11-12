import { useState } from "react";
import { useContent } from "../content/ContentContext";
import { EmptyState } from "../components/EmptyState";
import { useEnvironment } from "../hooks/useEnvironment";
import { escalate } from "../logic/escalation";
import { evaluate, type ReadingValue } from "../logic/evaluate";
import { addReading, getReadings, isPersistent, type Reading } from "../storage/local";
import { IndicatorList } from "./daily/IndicatorList";
import { IndicatorStep } from "./daily/IndicatorStep";
import { escalationVars, type StepResult } from "./daily/ResultPanel";
import { Summary } from "./daily/Summary";

type View =
  | { mode: "list" }
  | { mode: "run"; ids: string[]; index: number; single: boolean }
  | { mode: "done"; ids: string[] };

/** Vista Daily check: lista → asistente (o indicador suelto) → resumen. Todo el contenido sale de data/ y config/. */
export function DailyCheck() {
  const { t, content } = useContent();
  const { environment, environments } = useEnvironment();
  const [readings, setReadings] = useState<Reading[]>(() => getReadings());
  const [view, setView] = useState<View>({ mode: "list" });
  const [results, setResults] = useState<Record<string, StepResult>>({});
  const [skipped, setSkipped] = useState(0);
  const [announce, setAnnounce] = useState("");
  const indicators = content.indicators;

  if (indicators.length === 0) {
    return (
      <section>
        <h1 className="mb-4 text-3xl font-extrabold">{t("daily.title")}</h1>
        <EmptyState title={t("daily.no_indicators")} help={t("daily.no_indicators.help")} />
      </section>
    );
  }

  function start(ids: string[], single: boolean) {
    setResults({});
    setSkipped(0);
    setAnnounce("");
    setView({ mode: "run", ids, index: 0, single });
  }

  function backToList() {
    setAnnounce("");
    setView({ mode: "list" });
  }

  function save(indicatorId: string, value: ReadingValue) {
    const ind = indicators.find((i) => i.id === indicatorId);
    if (!ind) return;
    const reading = addReading({ indicatorId, value, environmentId: environment.id });
    const status = evaluate(ind, value, environment);
    const escalation = escalate(status, ind.actions, environment, content.app);
    setReadings(getReadings());
    setResults((r) => ({ ...r, [indicatorId]: { reading, status, escalation } }));
    setAnnounce(
      t("daily.announce", {
        name: ind.name,
        status: t(`status.${status}`),
        message: t(escalation.messageKey, escalationVars(escalation)),
      }),
    );
  }

  let body;
  if (view.mode === "list") {
    body = (
      <IndicatorList
        indicators={indicators}
        readings={readings}
        environments={environments}
        env={environment}
        onStartAll={() => start(indicators.map((i) => i.id), false)}
        onOpen={(id) => start([id], true)}
      />
    );
  } else if (view.mode === "run") {
    const ind = indicators.find((i) => i.id === view.ids[view.index]);
    const isLast = view.index >= view.ids.length - 1;
    const go = (index: number) => {
      setAnnounce("");
      setView({ ...view, index });
    };
    const finish = () => setView({ mode: "done", ids: view.ids });
    body = ind ? (
      <>
        {Object.keys(results).length > 0 && !isPersistent() && (
          <p role="status" className="mb-4 rounded-md border-2 border-[var(--status-attention)] p-3 font-semibold">
            ⚠ {t("storage.unavailable")}
          </p>
        )}
        <IndicatorStep
          indicator={ind}
          position={view.single ? null : { current: view.index + 1, total: view.ids.length }}
          isFirst={view.index === 0}
          isLast={isLast}
          result={results[ind.id]}
          readings={readings}
          environments={environments}
          env={environment}
          onSave={(v) => save(ind.id, v)}
          onBack={() => go(Math.max(0, view.index - 1))}
          onNext={() => (isLast ? finish() : go(view.index + 1))}
          onSkip={() => {
            setSkipped((n) => n + 1);
            if (isLast) finish();
            else go(view.index + 1);
          }}
          onExit={backToList}
        />
      </>
    ) : null;
  } else {
    body = (
      <Summary
        indicators={indicators.filter((i) => view.ids.includes(i.id))}
        results={results}
        skipped={skipped}
        onBackToList={backToList}
      />
    );
  }

  return (
    <section aria-label={t("daily.wizard_label")} className="pb-20 md:pb-0">
      <div aria-live="polite" className="sr-only">
        {announce}
      </div>
      {body}
    </section>
  );
}
