import { useEffect, useState } from "react";
import { useContent } from "../../content/ContentContext";
import { formatElapsed } from "../../logic/emergency";

const btn =
  "inline-flex min-h-12 min-w-12 items-center justify-center rounded-md border-2 border-[var(--color-line)] bg-[var(--color-panel-2)] px-4 text-base font-bold text-[var(--color-text)] hover:border-[var(--color-accent)] disabled:opacity-50";

/** Temporizador de un paso. Anuncia (aria-live) solo al iniciar, a la mitad y al terminar. */
export function StepTimer({ seconds }: { seconds: number }) {
  const { t } = useContent();
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (remaining === 0) {
      setRunning(false);
      setMessage(t("emergency.timer.done"));
    } else if (seconds > 1 && remaining === Math.ceil(seconds / 2) && remaining < seconds) {
      setMessage(t("emergency.timer.half", { time: formatElapsed(remaining) }));
    }
  }, [remaining, running, seconds, t]);

  function start() {
    const from = remaining === 0 ? seconds : remaining;
    setRemaining(from);
    setRunning(true);
    setMessage(t("emergency.timer.started", { time: formatElapsed(from) }));
  }

  function reset() {
    setRunning(false);
    setRemaining(seconds);
    setMessage("");
  }

  return (
    <section aria-label={t("emergency.timer.label")} className="mt-4 rounded-md border-2 border-[var(--color-line)] p-4">
      <p className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">{t("emergency.timer.remaining")}</p>
      <p className="font-mono text-5xl font-extrabold">{formatElapsed(remaining)}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {running ? (
          <button type="button" className={btn} onClick={() => setRunning(false)}>
            {t("emergency.timer.pause")}
          </button>
        ) : (
          <button type="button" className={btn} onClick={start}>
            {t("emergency.timer.start")}
          </button>
        )}
        <button type="button" className={btn} onClick={reset}>
          {t("emergency.timer.reset")}
        </button>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {message}
      </p>
    </section>
  );
}
