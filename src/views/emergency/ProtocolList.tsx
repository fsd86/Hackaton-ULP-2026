import { useState } from "react";
import { useContent } from "../../content/ContentContext";
import type { Protocol } from "../../content/schemas";
import { EmptyState } from "../../components/EmptyState";
import { ReferenceNote } from "../../components/EarthReferenceNote";
import { PlaceholderBadge } from "../../components/PlaceholderBadge";
import { filterProtocols } from "../../logic/emergency";
import { inputClass } from "../daily/ui";

export function ProtocolList({
  protocols,
  invalidId,
  onStart,
}: {
  protocols: Protocol[];
  invalidId: boolean;
  onStart: (id: string) => void;
}) {
  const { t } = useContent();
  const [query, setQuery] = useState("");
  const shown = filterProtocols(protocols, query);

  return (
    <section aria-labelledby="em-list-title">
      <h1 className="text-3xl font-extrabold">{t("emergency.title")}</h1>
      <h2 id="em-list-title" className="mb-4 mt-1 text-xl font-bold text-[var(--color-muted)]">
        {t("emergency.choose_protocol")}
      </h2>

      {invalidId && (
        <p role="alert" className="mb-4 rounded-md border-2 border-[var(--status-attention)] p-3 font-semibold">
          ⚠ {t("emergency.invalid_protocol")}
        </p>
      )}

      {protocols.length === 0 ? (
        <EmptyState title={t("emergency.no_protocols")} help={t("emergency.no_protocols.help")} />
      ) : (
        <>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("emergency.search_placeholder")}
            aria-label={t("emergency.search_placeholder")}
            className={`${inputClass} mb-4`}
          />
          {shown.length === 0 ? (
            <EmptyState title={t("emergency.no_results")} />
          ) : (
            <ul className="space-y-4">
              {shown.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onStart(p.id)}
                    aria-label={`${t("emergency.start")}: ${p.title}`}
                    className="block w-full rounded-md border-2 border-l-8 border-[var(--color-line)] border-l-[var(--status-critical)] bg-[var(--color-panel)] p-5 text-left hover:border-[var(--color-accent)] hover:border-l-[var(--status-critical)]"
                  >
                    <span className="block text-2xl font-extrabold">{p.title}</span>
                    <span className="mt-2 block text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">
                      {t("emergency.trigger_label")}
                    </span>
                    {p.trigger.map((line, i) => (
                      <span key={i} className="block text-lg">
                        {line}
                      </span>
                    ))}
                    {p.trigger_earth_reference && <ReferenceNote inline compact earth className="mt-2" />}
                    <span className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="rounded border border-[var(--color-line)] px-2 py-0.5 text-sm font-semibold">
                        {t("emergency.escalation_label")}: {t(`escalation.level.${p.escalation}`)}
                      </span>
                      {p.status === "PLACEHOLDER" && <PlaceholderBadge short />}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
