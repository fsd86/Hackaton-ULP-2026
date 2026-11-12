import type { ReactNode } from "react";

/** Estado vacío / error genérico reutilizable. */
export function EmptyState({ title, help, children }: { title: string; help?: string; children?: ReactNode }) {
  return (
    <div role="status" className="rounded-md border-2 border-dashed border-[var(--color-line)] p-6 text-center">
      <p className="text-xl font-bold">{title}</p>
      {help && <p className="mt-2 text-[var(--color-muted)]">{help}</p>}
      {children}
    </div>
  );
}
