import { useContent } from "../content/ContentContext";
import type { DueState } from "../logic/daily";
import { PlaceholderBadge } from "./PlaceholderBadge";

/** Estado de vencimiento con texto + ícono (no solo color). Oculto si config.features.reminders es false. */
export function DueBadge({ state }: { state: DueState }) {
  const { t, content } = useContent();
  if (!content.app.features.reminders) return null;

  const base = "inline-flex min-h-6 w-fit items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider";

  if (state === "no_frequency") {
    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span className={`${base} border-dashed border-[var(--color-line)] text-[var(--color-muted)]`}>
          <span aria-hidden="true">–</span> {t("board.no_frequency")}
        </span>
        <PlaceholderBadge short />
      </span>
    );
  }
  return (
    <span
      className={`${base} ${
        state === "due"
          ? "border-[var(--status-attention)] bg-[color-mix(in_srgb,var(--status-attention)_14%,var(--color-panel))] text-[var(--color-text)]"
          : "border-[var(--color-line)] text-[var(--color-muted)]"
      }`}
    >
      <span aria-hidden="true">{state === "due" ? "⏱" : "✓"}</span> {state === "due" ? t("board.due_now") : t("board.up_to_date")}
    </span>
  );
}
