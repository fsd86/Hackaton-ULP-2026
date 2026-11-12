import { useId, useState, type FormEvent } from "react";
import { useContent } from "../../content/ContentContext";
import type { Indicator } from "../../content/schemas";
import type { ReadingValue } from "../../logic/evaluate";
import { validateReading } from "../../logic/validateInput";
import { btnPrimary, inputClass } from "./ui";

/** Entrada según input.kind (number | pair | scale). Valida y devuelve el valor tipado. */
export function ReadingInput({ indicator, onSubmit }: { indicator: Indicator; onSubmit: (v: ReadingValue) => void }) {
  const { t } = useContent();
  const uid = useId();
  const errId = `${uid}-err`;
  const [single, setSingle] = useState("");
  const [pair, setPair] = useState<[string, string]>(["", ""]);
  const [scale, setScale] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const input = indicator.input;

  function submit(e: FormEvent) {
    e.preventDefault();
    const raw = input.kind === "number" ? single : input.kind === "pair" ? pair : scale;
    const res = validateReading(indicator, raw);
    if (!res.ok) return setError(t(res.errorKey, res.vars));
    setError(null);
    onSubmit(res.value);
  }

  const describedBy = error ? errId : undefined;
  const invalid = error ? true : undefined;

  let body;
  if (input.kind === "number") {
    body = (
      <div>
        <label htmlFor={`${uid}-n`} className="mb-1 block font-semibold">
          {t("daily.value_label", { unit: indicator.unit })}
        </label>
        <input
          id={`${uid}-n`}
          type="number"
          inputMode="decimal"
          step={input.step}
          min={input.min}
          max={input.max}
          value={single}
          onChange={(e) => setSingle(e.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`${inputClass} sm:max-w-xs`}
        />
      </div>
    );
  } else if (input.kind === "pair") {
    body = (
      <div className="grid gap-3 sm:grid-cols-2">
        {([0, 1] as const).map((i) => (
          <div key={i}>
            <label htmlFor={`${uid}-p${i}`} className="mb-1 block font-semibold">
              {input.labels[i]} ({indicator.unit})
            </label>
            <input
              id={`${uid}-p${i}`}
              type="number"
              inputMode="decimal"
              step={input.step ?? "any"}
              min={input.min}
              max={input.max}
              value={pair[i]}
              onChange={(e) => setPair((p) => (i === 0 ? [e.target.value, p[1]] : [p[0], e.target.value]))}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={inputClass}
            />
          </div>
        ))}
      </div>
    );
  } else {
    const options: number[] = [];
    for (let n = input.min; n <= input.max && options.length < 100; n++) options.push(n);
    body = (
      <fieldset role="radiogroup" aria-describedby={describedBy} aria-invalid={invalid} className="min-w-0">
        <legend className="mb-2 font-semibold">{t("daily.scale_pick")}</legend>
        <div className="grid gap-2">
          {options.map((n) => {
            const label = input.labels[String(n)];
            const checked = scale === n;
            return (
              <label
                key={n}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border-2 px-3 py-2 ${
                  checked ? "border-[var(--color-accent)] bg-[var(--color-panel-2)]" : "border-[var(--color-line)]"
                }`}
              >
                <input
                  type="radio"
                  name={`${uid}-scale`}
                  value={n}
                  checked={checked}
                  onChange={() => setScale(n)}
                  className="h-5 w-5 accent-[var(--color-accent)]"
                />
                <span>{label ? `${n} — ${label}` : String(n)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <h3 className="text-xl font-bold">{t("daily.enter_value")}</h3>
      {body}
      {error && (
        <p id={errId} role="alert" className="font-semibold text-[var(--color-text)]">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
      <button type="submit" className={btnPrimary}>
        {t("daily.save")}
      </button>
    </form>
  );
}
