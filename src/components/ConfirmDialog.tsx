import { useEffect, useId, useRef } from "react";

interface Props {
  open: boolean;
  title: string;
  body: string;
  stayLabel: string;
  leaveLabel: string;
  onStay: () => void;
  onLeave: () => void;
}

/** Diálogo modal accesible (elemento <dialog> nativo: foco atrapado, Esc cierra). El foco inicial va al botón seguro. */
export function ConfirmDialog({ open, title, body, stayLabel, leaveLabel, onStay, onLeave }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const titleId = `${uid}-title`;
  const bodyId = `${uid}-body`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onCancel={(e) => {
        e.preventDefault();
        onStay();
      }}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-md border-4 border-[var(--status-critical)] bg-[var(--color-panel)] p-6 text-[var(--color-text)] backdrop:bg-black/75"
    >
      <h2 id={titleId} className="text-2xl font-extrabold">
        {title}
      </h2>
      <p id={bodyId} className="mt-3 text-lg">
        {body}
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          autoFocus
          onClick={onStay}
          className="min-h-14 rounded-md bg-[var(--color-accent)] px-5 text-lg font-bold text-[#070b14]"
        >
          {stayLabel}
        </button>
        <button
          type="button"
          onClick={onLeave}
          className="min-h-14 rounded-md border-2 border-[var(--color-line)] bg-[var(--color-panel-2)] px-5 text-lg font-bold text-[var(--color-text)]"
        >
          {leaveLabel}
        </button>
      </div>
    </dialog>
  );
}
