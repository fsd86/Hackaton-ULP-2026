import { useEffect, useRef } from "react";
import { useContent } from "../../content/ContentContext";
import { formatAgo } from "../../logic/emergency";
import type { EmergencySession } from "../../storage/local";

const primary =
  "inline-flex min-h-16 w-full items-center justify-center rounded-md bg-[var(--color-accent)] px-6 text-xl font-extrabold text-[#070b14] hover:brightness-110";
const secondary =
  "inline-flex min-h-14 w-full items-center justify-center rounded-md border-2 border-[var(--color-line)] bg-[var(--color-panel-2)] px-6 text-lg font-bold text-[var(--color-text)] hover:border-[var(--color-accent)]";

/** Sesión de emergencia vieja: no se reanuda sola; se pregunta si continuar, reiniciar o volver a la lista. */
export function StaleSessionPrompt({
  session,
  protocolTitle,
  now,
  onContinue,
  onStartOver,
  onBack,
}: {
  session: EmergencySession;
  protocolTitle: string;
  now: number;
  onContinue: () => void;
  onStartOver: () => void;
  onBack: () => void;
}) {
  const { t, content } = useContent();
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  const validPast = Number.isFinite(session.startedAt) && session.startedAt <= now;
  const ago = validPast
    ? formatAgo(now - session.startedAt, {
        day: t("time.day_abbr"),
        hour: t("time.hour_abbr"),
        minute: t("time.minute_abbr"),
      })
    : t("emergency.stale.unknown_time");
  const date = validPast
    ? new Date(session.startedAt).toLocaleString(content.app.default_language, {
        dateStyle: "medium",
        timeStyle: "short",
        hourCycle: "h23",
      })
    : t("emergency.stale.unknown_date");

  return (
    <section
      role="group"
      aria-labelledby="stale-title"
      aria-describedby="stale-body"
      className="rounded-md border-2 border-l-8 border-[var(--color-line)] border-l-[var(--status-attention)] bg-[var(--color-panel)] p-5"
    >
      <h1 id="stale-title" ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold outline-none md:text-3xl">
        <span aria-hidden="true">⚠ </span>
        {t("emergency.stale.title")}
      </h1>
      <p className="mt-1 font-bold text-[var(--color-muted)]">{protocolTitle}</p>
      <p id="stale-body" className="mt-3 text-lg">
        {t("emergency.stale.body", { ago, date })}
      </p>
      <div className="mt-5 flex flex-col gap-3">
        <button type="button" onClick={onContinue} className={primary}>
          {t("emergency.stale.continue")}
        </button>
        <button type="button" onClick={onStartOver} className={secondary}>
          {t("emergency.stale.start_over")}
        </button>
        <button type="button" onClick={onBack} className={secondary}>
          {t("emergency.stale.back")}
        </button>
      </div>
    </section>
  );
}
