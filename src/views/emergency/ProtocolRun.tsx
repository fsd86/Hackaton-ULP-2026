import { useEffect, useMemo, useRef, useState } from "react";
import { useContent } from "../../content/ContentContext";
import type { Protocol } from "../../content/schemas";
import { PlaceholderBadge } from "../../components/PlaceholderBadge";
import { StatusIcon } from "../../components/StatusIcon";
import { useEnvironment } from "../../hooks/useEnvironment";
import { formatTime } from "../../logic/daily";
import { escalate } from "../../logic/escalation";
import { firstUndoneIndex, formatElapsed } from "../../logic/emergency";
import {
  addEmergencyLogEntry,
  getEmergencyLog,
  isPersistent,
  type EmergencyLogEntry,
  type EmergencySession,
} from "../../storage/local";
import { escalationVars } from "../daily/ResultPanel";
import { ConfirmDialog } from "./ConfirmDialog";
import { StepTimer } from "./StepTimer";

const secondary =
  "inline-flex min-h-14 min-w-14 items-center justify-center rounded-md border-2 border-[var(--color-line)] bg-[var(--color-panel-2)] px-5 text-lg font-bold text-[var(--color-text)] hover:border-[var(--color-accent)] disabled:opacity-50";

function sessionEntries(session: EmergencySession): EmergencyLogEntry[] {
  return getEmergencyLog().filter((e) => e.sessionId === session.sessionId && e.protocolId === session.protocolId);
}

export function ProtocolRun({
  protocol,
  session,
  onRestart,
  onExit,
}: {
  protocol: Protocol;
  session: EmergencySession;
  onRestart: () => void;
  onExit: () => void;
}) {
  const { t, content } = useContent();
  const { environment } = useEnvironment();
  const locale = content.app.default_language;
  const total = protocol.steps.length;

  const [entries, setEntries] = useState<EmergencyLogEntry[]>(() => sessionEntries(session));
  const doneAt = useMemo(() => {
    const map = new Map<number, number>();
    for (const e of entries) if (!map.has(e.stepIndex)) map.set(e.stepIndex, e.timestamp);
    return map;
  }, [entries]);
  const [index, setIndex] = useState(() => firstUndoneIndex(total, doneAt.keys()));
  const [now, setNow] = useState(() => Date.now());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Al cambiar de paso, el foco va al título del paso (teclado / lector de pantalla).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [index]);

  // Anclado al inicio de la sesión: la ventana de respuesta de tierra no se mueve cada segundo.
  const escalation = useMemo(
    () =>
      escalate(
        "critical",
        { critical: { text: [], escalation: protocol.escalation, protocol_id: protocol.id } },
        environment,
        content.app,
        new Date(session.startedAt),
      ),
    [protocol, environment, content.app, session.startedAt],
  );

  const completed = doneAt.size >= total;
  const step = protocol.steps[Math.min(index, total - 1)];
  const stepDoneAt = doneAt.get(index);

  function markDone() {
    if (!doneAt.has(index)) {
      addEmergencyLogEntry({ protocolId: protocol.id, stepIndex: index, sessionId: session.sessionId });
      setEntries(sessionEntries(session));
    }
    if (index < total - 1) setIndex(index + 1);
  }

  function requestExit() {
    if (!completed) setConfirmOpen(true);
    else onExit();
  }

  const sourceTitles = step.source_ids
    .map((id) => content.sources.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  const log = (
    <section aria-labelledby="em-log-title" className="mt-8">
      <h2 id="em-log-title" className="mb-2 text-xl font-bold">
        {t("emergency.log_title")}
      </h2>
      {entries.length === 0 ? (
        <p className="text-[var(--color-muted)]">{t("emergency.log_empty")}</p>
      ) : (
        <ol data-testid="emergency-log" className="space-y-2">
          {entries.map((e, i) => (
            <li
              key={i}
              className="flex items-baseline justify-between gap-4 rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] p-3"
            >
              <span>
                <span className="font-bold">{t("emergency.step_label", { n: e.stepIndex + 1 })}</span>
                {" — "}
                {protocol.steps[e.stepIndex]?.text}
              </span>
              <time dateTime={new Date(e.timestamp).toISOString()} className="shrink-0 font-mono font-bold">
                {formatTime(e.timestamp, locale)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );

  return (
    <section aria-label={protocol.title}>
      <div
        role="region"
        aria-label={t("emergency.status_bar")}
        className="sticky top-0 z-30 -mx-4 mb-6 border-b-4 border-[var(--status-critical)] bg-[var(--color-ink)] px-4 py-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <p className="flex items-center gap-2 text-lg font-extrabold">
            <StatusIcon name={content.app.theme.status_icons.critical} className="h-6 w-6 text-[var(--status-critical)]" />
            {protocol.title}
          </p>
          <p className="flex items-baseline gap-2">
            <span className="text-sm text-[var(--color-muted)]">{t("emergency.elapsed")}</span>
            <span role="timer" aria-label={t("emergency.elapsed")} className="font-mono text-3xl font-extrabold">
              {formatElapsed((now - session.startedAt) / 1000)}
            </span>
          </p>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          {t("environment.label")}: <span className="font-bold text-[var(--color-text)]">{environment.name}</span>
        </p>
        <p className="mt-1 text-lg font-semibold">
          {t(`escalation.level.${escalation.level}`)}: {t(escalation.messageKey, escalationVars(escalation))}
        </p>
      </div>

      {!isPersistent() && entries.length > 0 && (
        <p role="status" className="mb-4 rounded-md border-2 border-[var(--status-attention)] p-3 font-semibold">
          ⚠ {t("storage.unavailable")}
        </p>
      )}

      {completed ? (
        <div role="status" className="rounded-md border-2 border-l-8 border-[var(--status-normal)] bg-[var(--color-panel)] p-5">
          <h1 className="text-3xl font-extrabold">{t("emergency.completed")}</h1>
          <p className="mt-2 text-lg">{t("emergency.completed.help")}</p>
          <a
            href="#/report"
            className="mt-4 inline-flex min-h-16 w-full items-center justify-center rounded-md bg-[var(--color-accent)] px-6 text-2xl font-extrabold text-[#070b14] hover:brightness-110"
          >
            {t("emergency.report_now")}
          </a>
        </div>
      ) : (
        <article
          aria-labelledby="em-step-title"
          className="rounded-md border-2 border-l-8 border-[var(--color-line)] border-l-[var(--status-critical)] bg-[var(--color-panel)] p-5"
        >
          <p className="text-base font-bold uppercase tracking-wider text-[var(--color-muted)]">
            {t("emergency.step_of", { current: index + 1, total })}
            {stepDoneAt !== undefined && (
              <span className="ml-3 rounded border-2 border-[var(--status-normal)] px-2 py-0.5 normal-case tracking-normal text-[var(--color-text)]">
                ✓ {t("emergency.step_done_badge")} — {t("emergency.done_at", { time: formatTime(stepDoneAt, locale) })}
              </span>
            )}
          </p>
          <h1 id="em-step-title" ref={headingRef} tabIndex={-1} className="mt-2 text-3xl font-extrabold leading-snug outline-none">
            {step.text}
          </h1>
          {step.detail && <p className="mt-3 text-xl leading-relaxed text-[var(--color-muted)]">{step.detail}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-base">
            {sourceTitles.length > 0 ? (
              <>
                <span className="font-bold">{t("emergency.step_sources")}:</span>
                {sourceTitles.map((s) => (
                  <a key={s.id} href="#/sources" className="underline underline-offset-2 hover:text-[var(--color-accent)]">
                    {s.publisher}
                  </a>
                ))}
              </>
            ) : (
              <PlaceholderBadge />
            )}
          </div>

          {step.timer_s !== undefined && <StepTimer key={index} seconds={step.timer_s} />}

          <button
            type="button"
            onClick={markDone}
            className="mt-6 inline-flex min-h-20 w-full items-center justify-center rounded-md bg-[var(--color-accent)] px-6 text-3xl font-extrabold text-[#070b14] hover:brightness-110"
          >
            {t("emergency.mark_done")}
          </button>

          <div role="group" aria-label={t("emergency.steps_nav")} className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className={secondary} disabled={index === 0} onClick={() => setIndex(index - 1)}>
              {t("common.back")}
            </button>
            <button type="button" className={secondary} disabled={index >= total - 1} onClick={() => setIndex(index + 1)}>
              {t("common.next")}
            </button>
          </div>
        </article>
      )}

      {log}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href="#/report"
          className="inline-flex min-h-14 items-center justify-center rounded-md border-2 border-[var(--color-accent)] px-6 text-lg font-bold hover:bg-[var(--color-panel-2)]"
        >
          {t("emergency.report_now")}
        </a>
        <button type="button" className={secondary} onClick={onRestart}>
          {t("emergency.restart")}
        </button>
        <button type="button" className={secondary} onClick={requestExit}>
          {t("emergency.exit")}
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={t("emergency.exit_confirm.title")}
        body={t("emergency.exit_confirm.body")}
        stayLabel={t("emergency.exit_confirm.stay")}
        leaveLabel={t("emergency.exit_confirm.leave")}
        onStay={() => setConfirmOpen(false)}
        onLeave={() => {
          setConfirmOpen(false);
          onExit();
        }}
      />
    </section>
  );
}
