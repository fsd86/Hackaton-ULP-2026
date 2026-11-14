import { useContent } from "../content/ContentContext";
import { isPlaceholderText, placeholderTopic } from "../logic/placeholder";

/** Nota apagada con ícono + texto (no solo color): "No verified source yet". Opcionalmente dice qué falta. */
export function UnverifiedNote({ topic, className = "" }: { topic?: string; className?: string }) {
  const { t } = useContent();
  return (
    <span data-unverified="" className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[var(--color-muted)] ${className}`}>
      <span className="inline-flex items-center gap-1.5 font-semibold italic">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 self-center fill-none stroke-current stroke-2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v6M12 16.5h.01" strokeLinecap="round" />
        </svg>
        {t("unverified.note")}
      </span>
      {topic && <span className="text-[0.9em]">{t("unverified.topic", { topic })}</span>}
    </span>
  );
}

/**
 * Punto único para mostrar un texto de data/*.json: si es un placeholder (empieza con "PLACEHOLDER") muestra
 * UnverifiedNote en lugar del marcador crudo. withTopic: además dice qué falta (útil en pasos de protocolo,
 * donde el paso sin texto no se entendería).
 */
export function DataText({ text, withTopic = false, className }: { text: string; withTopic?: boolean; className?: string }) {
  if (!isPlaceholderText(text)) return <>{text}</>;
  const topic = withTopic ? placeholderTopic(text) : undefined;
  return <UnverifiedNote topic={topic || undefined} className={className} />;
}
