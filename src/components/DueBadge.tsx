import { useContent } from "../content/ContentContext";
import type { DueState } from "../logic/daily";
import { PlaceholderBadge } from "./PlaceholderBadge";

/** Estado de vencimiento con texto + ícono (no solo color). Oculto si config.features.reminders es false. */
export function DueBadge({ state }: { state: DueState }) {
  const { t, content } = useContent();
  if (!content.app.features.reminders) return null;

  if (state === "no_frequency") {
    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span className="inline-flex min-h-7 items-center rounded border border-dashed border-[var(--color-line)] px-2 text-sm font-bold text-[var(--color-muted)]">
          – {t("board.no_frequency")}
        </span>
        <PlaceholderBadge short />
      </span>
    );
  }
  return (
    <span
      className={`inline-flex min-h-7 w-fit items-center rounded border px-2 text-sm font-bold ${
        state === "due"
          ? "border-[var(--status-attention)] bg-[color-mix(in_srgb,var(--status-attention)_16%,var(--color-panel))]"
          : "border-[var(--color-line)] text-[var(--color-muted)]"
      }`}
    >
      {state === "due" ? `⏱ ${t("board.due_now")}` : `✓ ${t("board.up_to_date")}`}
    </span>
  );
}
