import { useId, useState } from "react";
import { useContent } from "../../content/ContentContext";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ReferenceNote } from "../../components/EarthReferenceNote";
import { SourceLinks } from "../../components/SourceLinks";
import type { Consult, ConsultHelp, ConsultQuestion, Environment } from "../../content/schemas";
import { activeSets, answeredSetIds, computeCounter, counterAssumption, counterText, isAnswered, roundTripText, visibleQuestions, type ConsultJson } from "../../logic/consult";
import type { ConsultAnswerValue, ConsultDraft } from "../../storage/local";
import { btnPrimary, btnSecondary, inputClass, panel } from "../daily/ui";

// One-shot consult del Downlink report: elegir el síntoma principal y responder de antemano, por módulo, las
// preguntas habituales del médico. Un solo formulario largo (fieldset por módulo). Sin diagnóstico ni tratamiento.

interface Props {
  consult: Consult;
  draft: ConsultDraft | null;
  /** Sección ya armada por buildReport (campos automáticos y contador), null sin síntoma. */
  section: ConsultJson | null;
  environment: Environment;
  now: Date;
  onChange: (draft: ConsultDraft | null) => void;
}

const textareaClass = `${inputClass} min-h-20 text-base`;

function HelpText({ help, className = "" }: { help: ConsultHelp; className?: string }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <p>{help.text}</p>
      <ReferenceNote earth={help.earth_reference === true} compact />
      <SourceLinks ids={help.source_ids} compact />
    </div>
  );
}

export function ConsultSection({ consult, draft, section, environment, now, onChange }: Props) {
  const { t, content } = useContent();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const notice = consult.help.filter((h) => h.placement === "notice");
  const top = consult.help.filter((h) => h.placement === "top");
  const why = consult.help.filter((h) => h.placement === "why");
  const after = consult.help.filter((h) => h.placement === "after");

  const setAnswer = (qid: string, patch: Partial<ConsultAnswerValue> | null) => {
    if (!draft) return;
    const answers = { ...draft.answers };
    const next = patch === null ? {} : { ...answers[qid], ...patch };
    if (next.value === undefined || next.value === "") delete next.value;
    if (next.text === undefined || next.text === "") delete next.text;
    if (Object.keys(next).length === 0) delete answers[qid];
    else answers[qid] = next;
    onChange({ ...draft, answers });
  };

  return (
    <section aria-labelledby="consult-title" data-testid="consult" className={`${panel} space-y-4`}>
      <h2 id="consult-title" className="text-xl font-bold">
        {t("consult.title")}
      </h2>
      {notice.map((h) => (
        <p key={h.id} role="note" className="rounded border-2 border-[var(--color-accent)] px-3 py-2 font-semibold">
          {h.text}
        </p>
      ))}

      {!draft ? (
        <div className="space-y-3">
          <p className="text-[var(--color-muted)]">{t("consult.start_hint")}</p>
          <button type="button" className={btnPrimary} onClick={() => onChange({ symptomId: null, answers: {}, updatedAt: Date.now() })}>
            {t("consult.start")}
          </button>
        </div>
      ) : (
        <>
          {top.map((h) => (
            <HelpText key={h.id} help={h} />
          ))}
          {why.length > 0 && (
            <details className="rounded border border-[var(--color-line)] px-3 py-2">
              <summary className="min-h-11 cursor-pointer content-center font-semibold">{t("consult.why")}</summary>
              <div className="mt-2 space-y-3">
                {why.map((h) => (
                  <HelpText key={h.id} help={h} />
                ))}
              </div>
            </details>
          )}

          <SymptomPicker consult={consult} draft={draft} onChange={onChange} />

          {draft.symptomId !== null && (
            <ConsultForm consult={consult} draft={draft} section={section} now={now} setAnswer={setAnswer} protocolsEnabled={content.app.features.emergency_guide} />
          )}

          <Counter consult={consult} draft={draft} environment={environment} />
          {after.map((h) => (
            <HelpText key={h.id} help={h} className="text-sm" />
          ))}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--color-muted)]">{t("consult.saved")}</p>
            <button type="button" className={btnSecondary} onClick={() => setConfirmDiscard(true)}>
              {t("consult.discard")}
            </button>
          </div>
          <ConfirmDialog
            open={confirmDiscard}
            title={t("consult.discard.title")}
            body={t("consult.discard.body")}
            stayLabel={t("consult.discard.stay")}
            leaveLabel={t("consult.discard.confirm")}
            onStay={() => setConfirmDiscard(false)}
            onLeave={() => {
              setConfirmDiscard(false);
              onChange(null);
            }}
          />
        </>
      )}
    </section>
  );
}

function SymptomPicker({ consult, draft, onChange }: { consult: Consult; draft: ConsultDraft; onChange: (d: ConsultDraft) => void }) {
  const { t } = useContent();
  const selected = consult.symptoms.find((s) => s.id === draft.symptomId);
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-lg font-bold">{t("consult.symptom.legend")}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {consult.symptoms.map((s) => (
          <label
            key={s.id}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded border border-[var(--color-line)] px-3 py-2 has-[:checked]:border-[var(--color-accent)] has-[:checked]:bg-[var(--color-panel-2)]"
          >
            <input
              type="radio"
              name="consult-symptom"
              value={s.id}
              checked={draft.symptomId === s.id}
              onChange={() => onChange({ ...draft, symptomId: s.id })}
              className="h-5 w-5 shrink-0 accent-[var(--color-accent)]"
            />
            <span>{s.label}</span>
          </label>
        ))}
      </div>
      {selected && (
        <div className="space-y-1">
          <ReferenceNote earth={selected.earth_reference === true} compact />
          <SourceLinks ids={selected.source_ids} compact />
        </div>
      )}
    </fieldset>
  );
}

function ConsultForm({
  consult,
  draft,
  section,
  now,
  setAnswer,
  protocolsEnabled,
}: {
  consult: Consult;
  draft: ConsultDraft;
  section: ConsultJson | null;
  now: Date;
  setAnswer: (qid: string, patch: Partial<ConsultAnswerValue> | null) => void;
  protocolsEnabled: boolean;
}) {
  const { t, content } = useContent();
  const symptom = consult.symptoms.find((s) => s.id === draft.symptomId);
  const sets = activeSets(consult, draft.symptomId);
  const setIds = new Set(sets.map((s) => s.id));
  const protocol = symptom?.open_protocol_id ? content.protocols.find((p) => p.id === symptom.open_protocol_id) : undefined;

  return (
    <div className="space-y-5">
      {protocol && protocolsEnabled && (
        <div role="note" data-testid="consult-protocol-first" className="rounded border-2 border-[var(--status-critical)] p-4">
          <p className="text-lg font-extrabold">{t("consult.protocol_first.title")}</p>
          <p className="mt-1">{t("consult.protocol_first.body")}</p>
          <a href={`#/emergency/${encodeURIComponent(protocol.id)}`} className={`${btnPrimary} mt-3`}>
            {t("consult.protocol_first.link", { title: protocol.title })}
          </a>
        </div>
      )}
      {sets.map((set) => {
        const qs = visibleQuestions(set, setIds, draft.answers);
        const userQs = qs.filter((q) => q.answer.type !== "auto");
        const done = userQs.filter((q) => isAnswered(draft.answers[q.id])).length;
        const help = set.help_id ? consult.help.find((h) => h.id === set.help_id) : undefined;
        const moduleJson = section?.modules.find((m) => m.id === set.id);
        return (
          <fieldset key={set.id} data-module={set.id} className="rounded border border-[var(--color-line)] p-3 sm:p-4">
            <legend className="px-1 text-lg font-bold">{set.title}</legend>
            {/* space-y en un contenedor propio: aplicado al fieldset separaba de más la legend. */}
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-muted)]">{t("consult.module.progress", { n: done, m: userQs.length })}</p>
              {help && <HelpText help={help} className="text-sm" />}
              {qs.map((q) => (
                <QuestionField
                  key={q.id}
                  q={q}
                  value={draft.answers[q.id]}
                  autoLines={moduleJson?.questions.find((x) => x.id === q.id)?.auto}
                  now={now}
                  onChange={(patch) => setAnswer(q.id, patch)}
                />
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

function QuestionField({
  q,
  value,
  autoLines,
  now,
  onChange,
}: {
  q: ConsultQuestion;
  value: ConsultAnswerValue | undefined;
  autoLines: string[] | undefined;
  now: Date;
  onChange: (patch: Partial<ConsultAnswerValue> | null) => void;
}) {
  const { t } = useContent();
  const uid = useId();
  const labelId = `${uid}-label`;
  const errId = `${uid}-err`;
  const detailsId = `${uid}-details`;
  const a = q.answer;
  const meta = (
    <div className="mt-1 space-y-1">
      <ReferenceNote earth={q.earth_reference === true} compact />
      <SourceLinks ids={q.source_ids} compact />
    </div>
  );
  const details = (
    <div className="mt-2">
      <label htmlFor={detailsId} className="mb-1 block text-sm font-semibold">
        <span className="sr-only">{q.text} — </span>
        {a.type === "auto" ? t("consult.auto.add") : t("consult.details")}
      </label>
      <textarea id={detailsId} value={value?.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} rows={2} maxLength={5000} className={textareaClass} />
    </div>
  );
  const clear = (
    <button type="button" onClick={() => onChange(null)} className="mt-2 min-h-11 text-sm font-semibold underline underline-offset-2">
      {t("consult.clear_answer")}
      <span className="sr-only"> — {q.text}</span>
    </button>
  );

  if (a.type === "free_text") {
    return (
      <div data-question={q.id}>
        <label id={labelId} htmlFor={`${uid}-text`} className="block font-semibold">
          {q.text}
        </label>
        <textarea
          id={`${uid}-text`}
          value={value?.text ?? ""}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={2}
          maxLength={5000}
          className={`${textareaClass} mt-1`}
        />
        {meta}
      </div>
    );
  }

  if (a.type === "auto") {
    return (
      <div data-question={q.id}>
        <p id={labelId} className="font-semibold">
          {q.text}
        </p>
        <div aria-labelledby={labelId} role="group" className="mt-1 rounded border border-dashed border-[var(--color-line)] bg-[var(--color-ink)] p-3">
          <p className="mb-1 font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">{t("consult.auto.badge")}</p>
          <ul className="space-y-0.5 text-sm">
            {(autoLines ?? []).map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
        {a.with_text && details}
        {meta}
      </div>
    );
  }

  if (a.type === "time") {
    const v = typeof value?.value === "string" ? value.value : "";
    const parsed = v ? new Date(v) : null;
    const future = parsed !== null && !Number.isNaN(parsed.getTime()) && parsed.getTime() > now.getTime() + 60_000;
    return (
      <div data-question={q.id}>
        <label id={labelId} htmlFor={`${uid}-time`} className="block font-semibold">
          {q.text}
        </label>
        <p id={`${uid}-hint`} className="text-sm text-[var(--color-muted)]">
          {t("consult.time.hint")}
        </p>
        <input
          id={`${uid}-time`}
          type="datetime-local"
          value={v}
          onChange={(e) => onChange({ value: e.target.value })}
          aria-invalid={future || undefined}
          aria-describedby={`${uid}-hint${future ? ` ${errId}` : ""}`}
          className={`${inputClass} mt-1 sm:max-w-xs`}
        />
        <p id={errId} role="alert" className="min-h-0 font-semibold text-[var(--status-attention)]">
          {future ? t("consult.time.future") : ""}
        </p>
        {a.with_text && details}
        {v !== "" && clear}
        {meta}
      </div>
    );
  }

  if (a.type === "choice") {
    return (
      <fieldset data-question={q.id}>
        <legend className="font-semibold">{q.text}</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {a.options.map((opt) => (
            <label
              key={opt}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded border border-[var(--color-line)] px-3 py-1 has-[:checked]:border-[var(--color-accent)] has-[:checked]:bg-[var(--color-panel-2)]"
            >
              <input
                type="radio"
                name={`${uid}-choice`}
                value={opt}
                checked={value?.value === opt}
                onChange={() => onChange({ value: opt })}
                className="h-5 w-5 accent-[var(--color-accent)]"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {a.with_text && details}
        {value?.value !== undefined && clear}
        {meta}
      </fieldset>
    );
  }

  // scale_0_10: 11 opciones (radio nativo: flechas del teclado), anclas visibles en 0 y 10.
  const anchorsId = `${uid}-anchors`;
  return (
    <fieldset data-question={q.id} aria-describedby={anchorsId}>
      <legend className="font-semibold">{q.text}</legend>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {Array.from({ length: 11 }, (_, n) => (
          <label
            key={n}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded border border-[var(--color-line)] font-mono text-lg font-bold has-[:checked]:border-[var(--color-accent)] has-[:checked]:bg-[var(--color-accent)] has-[:checked]:text-[#05080f] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-accent)]"
          >
            <input
              type="radio"
              name={`${uid}-scale`}
              value={n}
              checked={value?.value === n}
              onChange={() => onChange({ value: n })}
              className="sr-only"
            />
            {n}
          </label>
        ))}
      </div>
      <p id={anchorsId} className="mt-1 flex flex-wrap justify-between gap-2 text-sm text-[var(--color-muted)] sm:max-w-[34rem]">
        <span>{t("consult.scale.anchor_min", { label: a.anchors.min_label })}</span>
        <span>{t("consult.scale.anchor_max", { label: a.anchors.max_label })}</span>
      </p>
      {value?.value !== undefined && clear}
      {meta}
    </fieldset>
  );
}

function Counter({ consult, draft, environment }: { consult: Consult; draft: ConsultDraft; environment: Environment }) {
  const { t, content } = useContent();
  const perSet = content.app.consult.round_trips_per_answered_set;
  const c = computeCounter(answeredSetIds(consult, draft).length, perSet, environment.comm_delay_one_way_s);
  const text = counterText(c, t);
  return (
    <section aria-labelledby="consult-counter-title" data-testid="consult-counter" className="rounded border-2 border-[var(--color-accent)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="consult-counter-title" className="text-lg font-bold">
          {t("consult.counter.title")}
        </h3>
        <span className="rounded-sm border border-[var(--color-line)] px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-widest">
          {t("consult.counter.badge")}
        </span>
      </div>
      <div aria-live="polite" aria-atomic="true">
        <p data-testid="consult-counter-headline" className="mt-2 font-mono text-2xl font-extrabold text-[var(--color-accent)] sm:text-3xl">
          {text.headline}
        </p>
        {text.detail && <p className="mt-1 font-semibold">{text.detail}</p>}
      </div>
      <p className="mt-2 text-sm">{counterAssumption(perSet, t)}</p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{roundTripText(environment.comm_delay_one_way_s, t)}</p>
      <SourceLinks ids={environment.comm_delay_one_way_s.source_ids} label={t("sources.delay_sources")} compact className="mt-1" />
    </section>
  );
}
